package com.fieldex.document;

import com.fieldex.order.Order;
import com.fieldex.order.OrderRepository;
import com.fieldex.storage.FileStorageService;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.ITemplateEngine;
import org.thymeleaf.context.Context;

import com.fieldex.user.User;
import com.fieldex.user.UserRepository;
import com.fieldex.buyer.Buyer;
import com.fieldex.buyer.BuyerRepository;
import com.fieldex.document.dto.ExportDocumentDto;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentGenerationService {

    private final ITemplateEngine templateEngine;
    private final FileStorageService fileStorageService;
    private final ExportDocumentRepository exportDocumentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final BuyerRepository buyerRepository;

    @Transactional
    public ExportDocument generateDocument(UUID orderId, DocumentType type) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderId));

        if (order.getItems() != null) {
            order.getItems().forEach(item -> {
                if (item.getFruit() != null) item.getFruit().getName();
                if (item.getVariety() != null) item.getVariety().getName();
            });
        }
        if (order.getBuyer() != null) {
            order.getBuyer().getCompanyName();
        }

        Context context = new Context();
        context.setVariable("order", order);
        context.setVariable("buyer", order.getBuyer());
        context.setVariable("quotation", order.getQuotation());
        context.setVariable("generatedDate", OffsetDateTime.now());
        context.setVariable("docType", type.name());
        context.setVariable("docTitle", type.name().replace('_', ' '));

        String templateName = getTemplateNameForType(type);
        String htmlContent = templateEngine.process(templateName, context);

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(htmlContent, null);
            builder.toStream(os);
            builder.run();

            byte[] pdfBytes = os.toByteArray();
            
            String filename = generateFilename(order, type);
            String storageKey = "docs/" + order.getId() + "/" + filename;

            try (ByteArrayInputStream is = new ByteArrayInputStream(pdfBytes)) {
                fileStorageService.upload(storageKey, is, "application/pdf", pdfBytes.length);
            }

            String username = SecurityContextHolder.getContext().getAuthentication() != null 
                    ? SecurityContextHolder.getContext().getAuthentication().getName() 
                    : "system";

            ExportDocument doc = ExportDocument.builder()
                    .order(order)
                    .type(type)
                    .storageKey(storageKey)
                    .filename(filename)
                    .contentType("application/pdf")
                    .sizeBytes((long) pdfBytes.length)
                    .generatedBy(username)
                    .generatedAt(OffsetDateTime.now())
                    .version(1)
                    .build();

            doc.setActive(true);
            return exportDocumentRepository.save(doc);

        } catch (Exception e) {
            log.error("Failed to generate document", e);
            throw new RuntimeException("Failed to generate document", e);
        }
    }

    @Transactional(readOnly = true)
    public List<ExportDocumentDto> getAllDocuments() {
        return exportDocumentRepository.findAll().stream()
                .filter(ExportDocument::isActive)
                .sorted(Comparator.comparing(ExportDocument::getGeneratedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExportDocumentDto> getDocumentsByOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderId));
        enforceBuyerAccess(order);
        return exportDocumentRepository.findByOrderId(orderId).stream()
                .filter(ExportDocument::isActive)
                .sorted(Comparator.comparing(ExportDocument::getGeneratedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExportDocumentDto getDocumentDto(UUID documentId) {
        ExportDocument doc = exportDocumentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));
        return mapToDto(doc);
    }

    @Transactional(readOnly = true)
    public byte[] downloadDocumentContent(UUID documentId) {
        ExportDocument doc = exportDocumentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));
        enforceBuyerAccess(doc.getOrder());
        try (InputStream is = fileStorageService.download(doc.getStorageKey())) {
            return is.readAllBytes();
        } catch (Exception e) {
            throw new RuntimeException("Failed to download document content", e);
        }
    }

    public String getPresignedUrl(UUID documentId) {
        ExportDocument doc = exportDocumentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));
        enforceBuyerAccess(doc.getOrder());

        String url = fileStorageService.getPresignedUrl(doc.getStorageKey(), 3600);
        if (url == null || url.startsWith("local://")) {
            return "/api/v1/documents/" + doc.getId() + "/download";
        }
        return url;
    }

    private void enforceBuyerAccess(Order order) {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User currentUser = userRepository.findByEmail(email).orElse(null);
            if (currentUser != null && currentUser.getRole() == com.fieldex.user.Role.BUYER) {
                Buyer buyer = buyerRepository.findByUserId(currentUser.getId()).orElse(null);
                if (buyer == null || order == null || order.getBuyer() == null
                        || !buyer.getId().equals(order.getBuyer().getId())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied");
                }
            }
        }
    }

    public ExportDocumentDto mapToDto(ExportDocument doc) {
        return ExportDocumentDto.builder()
                .id(doc.getId())
                .orderId(doc.getOrder() != null ? doc.getOrder().getId() : null)
                .orderNumber(doc.getOrder() != null ? doc.getOrder().getOrderNumber() : null)
                .buyerCompany(doc.getOrder() != null && doc.getOrder().getBuyer() != null ? doc.getOrder().getBuyer().getCompanyName() : null)
                .type(doc.getType())
                .filename(doc.getFilename())
                .contentType(doc.getContentType())
                .sizeBytes(doc.getSizeBytes())
                .generatedBy(doc.getGeneratedBy())
                .generatedAt(doc.getGeneratedAt())
                .version(doc.getVersion())
                .downloadUrl("/api/v1/documents/" + doc.getId() + "/download")
                .build();
    }

    private String getTemplateNameForType(DocumentType type) {
        switch (type) {
            case PROFORMA_INVOICE:
                return "documents/proforma-invoice";
            case COMMERCIAL_INVOICE:
                return "documents/commercial-invoice";
            case PACKING_LIST:
                return "documents/packing-list";
            // Other templates can be mapped here as they are created
            default:
                return "documents/default";
        }
    }

    private String generateFilename(Order order, DocumentType type) {
        return order.getOrderNumber() + "_" + type.name() + ".pdf";
    }
}
