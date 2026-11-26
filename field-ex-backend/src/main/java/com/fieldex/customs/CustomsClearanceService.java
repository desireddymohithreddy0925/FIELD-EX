package com.fieldex.customs;

import com.fieldex.customs.dto.CustomsClearanceDto;
import com.fieldex.customs.rules.ComplianceEngine;
import com.fieldex.order.Order;
import com.fieldex.order.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomsClearanceService {

    private final CustomsClearanceRepository clearanceRepository;
    private final CustomsDeclarationRepository declarationRepository;
    private final CustomsStatusHistoryRepository historyRepository;
    private final OrderRepository orderRepository;
    private final ComplianceEngine complianceEngine;

    @Transactional(readOnly = true)
    public List<CustomsClearanceDto> getAllClearances() {
        return clearanceRepository.findAll().stream()
                .filter(CustomsClearance::isActive)
                .sorted(Comparator.comparing(CustomsClearance::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CustomsClearanceDto mapToDto(CustomsClearance c) {
        CustomsDeclaration dec = c.getDeclaration();
        return CustomsClearanceDto.builder()
                .id(c.getId())
                .orderId(c.getOrder() != null ? c.getOrder().getId() : null)
                .orderNumber(c.getOrder() != null ? c.getOrder().getOrderNumber() : null)
                .buyerCompany(c.getOrder() != null && c.getOrder().getBuyer() != null ? c.getOrder().getBuyer().getCompanyName() : null)
                .status(c.getStatus())
                .inspectionStatus(c.getInspectionStatus())
                .remarks(c.getRemarks())
                .clearanceDate(c.getClearanceDate())
                .declarationReference(dec != null ? dec.getReference() : null)
                .exportCountry(dec != null ? dec.getExportCountry() : null)
                .destinationCountry(dec != null ? dec.getDestinationCountry() : null)
                .exportPort(dec != null ? dec.getExportPort() : null)
                .destinationPort(dec != null ? dec.getDestinationPort() : null)
                .customsBroker(dec != null ? dec.getCustomsBroker() : null)
                .dutiesAndTaxes(dec != null ? dec.getDutiesAndTaxes() : null)
                .declarationDate(dec != null ? dec.getDeclarationDate() : null)
                .createdAt(c.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public java.util.Optional<CustomsClearance> getClearanceByOrderId(UUID orderId) {
        return clearanceRepository.findByOrderId(orderId);
    }

    @Transactional(readOnly = true)
    public CustomsClearance getClearanceById(UUID clearanceId) {
        return clearanceRepository.findById(clearanceId)
                .orElseThrow(() -> new EntityNotFoundException("Clearance not found: " + clearanceId));
    }

    @Transactional
    public CustomsClearance initiateClearance(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderId));
        
        if (clearanceRepository.findByOrderId(orderId).isPresent()) {
            throw new IllegalStateException("Clearance already initiated for order: " + orderId);
        }

        CustomsClearance clearance = CustomsClearance.builder()
                .order(order)
                .status(CustomsStatus.NOT_STARTED)
                .build();
        clearance.setActive(true);
        
        clearance = clearanceRepository.save(clearance);
        recordHistory(clearance, CustomsStatus.NOT_STARTED, "Clearance initiated");
        return clearance;
    }

    @Transactional
    public CustomsClearance submitDeclaration(UUID clearanceId, CustomsDeclaration declarationData) {
        CustomsClearance clearance = clearanceRepository.findById(clearanceId)
                .orElseThrow(() -> new EntityNotFoundException("Clearance not found: " + clearanceId));

        if (clearance.getStatus() != CustomsStatus.NOT_STARTED && clearance.getStatus() != CustomsStatus.DOCUMENTS_PENDING) {
            throw new IllegalStateException("Cannot submit declaration from current state: " + clearance.getStatus());
        }

        declarationData.setActive(true);
        CustomsDeclaration declaration = declarationRepository.save(declarationData);
        clearance.setDeclaration(declaration);
        
        List<String> complianceErrors = complianceEngine.validateClearance(clearance);
        if (!complianceErrors.isEmpty()) {
            clearance.setStatus(CustomsStatus.DOCUMENTS_PENDING);
            clearanceRepository.save(clearance);
            recordHistory(clearance, CustomsStatus.DOCUMENTS_PENDING, "Submission blocked: " + String.join(", ", complianceErrors));
            throw new IllegalStateException("Compliance checks failed: " + complianceErrors);
        }

        clearance.setStatus(CustomsStatus.SUBMITTED);
        clearance = clearanceRepository.save(clearance);
        recordHistory(clearance, CustomsStatus.SUBMITTED, "Declaration submitted");
        return clearance;
    }

    @Transactional
    public CustomsClearance updateStatus(UUID clearanceId, CustomsStatus newStatus, String remarks) {
        CustomsClearance clearance = clearanceRepository.findById(clearanceId)
                .orElseThrow(() -> new EntityNotFoundException("Clearance not found: " + clearanceId));

        // Basic transition logic
        if (newStatus == CustomsStatus.CLEARED && clearance.getStatus() != CustomsStatus.INSPECTION && clearance.getStatus() != CustomsStatus.UNDER_REVIEW && clearance.getStatus() != CustomsStatus.HELD) {
            throw new IllegalStateException("Cannot clear from status: " + clearance.getStatus());
        }
        
        clearance.setStatus(newStatus);
        clearance.setRemarks(remarks);
        if (newStatus == CustomsStatus.CLEARED) {
            clearance.setClearanceDate(java.time.OffsetDateTime.now());
            clearance.setInspectionStatus("CLEARED");
        }
        clearance = clearanceRepository.save(clearance);
        recordHistory(clearance, newStatus, remarks);
        
        return clearance;
    }

    private void recordHistory(CustomsClearance clearance, CustomsStatus status, String notes) {
        String actor = "system";
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            actor = SecurityContextHolder.getContext().getAuthentication().getName();
        }

        CustomsStatusHistory history = CustomsStatusHistory.builder()
                .clearance(clearance)
                .status(status)
                .notes(notes)
                .actor(actor)
                .build();
        historyRepository.save(history);
    }
}
