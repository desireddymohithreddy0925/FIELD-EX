package com.fieldex.admin.controllers;

import com.fieldex.quotation.QuotationService;
import com.fieldex.quotation.QuotationStatus;
import com.fieldex.quotation.dto.AdminQuotationUpdate;
import com.fieldex.quotation.dto.QuotationDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/quotations")
@RequiredArgsConstructor
@Tag(name = "Admin Quotation API", description = "Endpoints for admins and managers to manage and price quotations")
public class AdminQuotationController {

    private final QuotationService quotationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get all quotations for Admin and Manager review & pricing")
    public ResponseEntity<Page<QuotationDto>> getAllQuotations(
            @RequestParam(required = false) QuotationStatus status,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(quotationService.getAllQuotations(status, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get quotation details by ID")
    public ResponseEntity<QuotationDto> getQuotationById(@PathVariable UUID id) {
        return ResponseEntity.ok(quotationService.getQuotationById(id));
    }

    @PutMapping("/{id}/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update and send quotation to buyer")
    public ResponseEntity<QuotationDto> updateAndSendQuotation(
            @PathVariable UUID id,
            @Valid @RequestBody AdminQuotationUpdate update) {
        return ResponseEntity.ok(quotationService.updateAndSendQuotation(id, update));
    }
}
