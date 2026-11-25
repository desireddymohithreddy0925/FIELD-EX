package com.fieldex.buyer.controllers;

import com.fieldex.quotation.QuotationService;
import com.fieldex.quotation.QuotationStatus;
import com.fieldex.quotation.dto.QuotationDto;
import com.fieldex.quotation.dto.QuotationRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quotations")
@RequiredArgsConstructor
@Tag(name = "Buyer Quotation API", description = "Endpoints for buyers to request and manage quotations")
public class BuyerQuotationController {

    private final QuotationService quotationService;

    @PostMapping("/request")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Request a new quotation")
    public ResponseEntity<QuotationDto> requestQuotation(@Valid @RequestBody QuotationRequest request) {
        return ResponseEntity.ok(quotationService.requestQuotation(request));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Get current buyer's quotations")
    public ResponseEntity<Page<QuotationDto>> getMyQuotations(
            @RequestParam(required = false) QuotationStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(quotationService.getMyQuotations(status, pageable));
    }

    @GetMapping("/me/{id}")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Get details of a specific quotation")
    public ResponseEntity<QuotationDto> getMyQuotation(@PathVariable UUID id) {
        return ResponseEntity.ok(quotationService.getMyQuotation(id));
    }

    @PostMapping("/me/{id}/accept")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Accept a quotation")
    public ResponseEntity<QuotationDto> acceptQuotation(@PathVariable UUID id) {
        return ResponseEntity.ok(quotationService.acceptQuotation(id));
    }

    @PostMapping("/me/{id}/reject")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Reject a quotation")
    public ResponseEntity<QuotationDto> rejectQuotation(@PathVariable UUID id) {
        return ResponseEntity.ok(quotationService.rejectQuotation(id));
    }
}
