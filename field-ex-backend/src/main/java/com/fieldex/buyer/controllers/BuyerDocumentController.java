package com.fieldex.buyer.controllers;

import com.fieldex.buyer.Buyer;
import com.fieldex.buyer.BuyerRepository;
import com.fieldex.buyer.dto.BuyerDocumentDto;
import com.fieldex.document.DocumentGenerationService;
import com.fieldex.document.ExportDocument;
import com.fieldex.document.ExportDocumentRepository;
import com.fieldex.order.Order;
import com.fieldex.order.OrderRepository;
import com.fieldex.user.User;
import com.fieldex.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Tag(name = "Buyer Document API", description = "Endpoints for buyers to access documents")
public class BuyerDocumentController {

    private final ExportDocumentRepository exportDocumentRepository;
    private final DocumentGenerationService documentGenerationService;
    private final BuyerRepository buyerRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Get all documents for current buyer")
    public ResponseEntity<List<BuyerDocumentDto>> getMyDocuments() {
        Buyer buyer = getCurrentBuyer();
        if (buyer == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<ExportDocument> documents = exportDocumentRepository.findByOrderBuyerId(buyer.getId());
        List<BuyerDocumentDto> dtos = documents.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('BUYER', 'ADMIN', 'LOGISTICS', 'ENGINEER', 'MANAGER')")
    @Operation(summary = "Get all export documents for a specific order")
    public ResponseEntity<List<BuyerDocumentDto>> getDocumentsByOrder(@PathVariable UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderId));

        Buyer currentBuyer = getCurrentBuyer();
        if (currentBuyer != null && !order.getBuyer().getId().equals(currentBuyer.getId())) {
            throw new AccessDeniedException("You are not authorized to view documents for this order");
        }

        List<ExportDocument> documents = exportDocumentRepository.findByOrderId(orderId);
        List<BuyerDocumentDto> dtos = documents.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    private Buyer getCurrentBuyer() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            return null;
        }
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return null;
        }
        return buyerRepository.findByUserId(user.getId()).orElse(null);
    }

    private BuyerDocumentDto mapToDto(ExportDocument doc) {
        Order order = doc.getOrder();
        String downloadUrl = null;
        try {
            downloadUrl = documentGenerationService.getPresignedUrl(doc.getId());
        } catch (Exception ignored) {
            // Presigned url generation fallback
        }

        return BuyerDocumentDto.builder()
                .id(doc.getId())
                .orderId(order != null ? order.getId() : null)
                .orderNumber(order != null ? order.getOrderNumber() : null)
                .type(doc.getType())
                .filename(doc.getFilename())
                .contentType(doc.getContentType())
                .sizeBytes(doc.getSizeBytes())
                .generatedBy(doc.getGeneratedBy())
                .generatedAt(doc.getGeneratedAt())
                .downloadUrl(downloadUrl)
                .build();
    }
}
