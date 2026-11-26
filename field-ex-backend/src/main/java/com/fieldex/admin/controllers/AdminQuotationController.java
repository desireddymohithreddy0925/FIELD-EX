package com.fieldex.admin.controllers;

import com.fieldex.quotation.QuotationService;
import com.fieldex.quotation.dto.AdminQuotationUpdate;
import com.fieldex.quotation.dto.QuotationDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/quotations")
@RequiredArgsConstructor
@Tag(name = "Admin Quotation API", description = "Endpoints for admins to manage quotations")
public class AdminQuotationController {

    private final QuotationService quotationService;

    @PutMapping("/{id}/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update and send quotation to buyer")
    public ResponseEntity<QuotationDto> updateAndSendQuotation(
            @PathVariable UUID id,
            @Valid @RequestBody AdminQuotationUpdate update) {
        return ResponseEntity.ok(quotationService.updateAndSendQuotation(id, update));
    }
}
