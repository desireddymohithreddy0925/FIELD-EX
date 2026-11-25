package com.fieldex.customs;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customs")
@RequiredArgsConstructor
@Tag(name = "Customs API", description = "Endpoints for managing customs clearance")
public class CustomsController {

    private final CustomsClearanceService clearanceService;

    @GetMapping("/orders/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'BUYER', 'MANAGER')")
    @Operation(summary = "Get customs clearance for an order")
    public ResponseEntity<CustomsClearance> getClearanceByOrder(@PathVariable UUID orderId) {
        return clearanceService.getClearanceByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/clearance/{clearanceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'BUYER', 'MANAGER')")
    @Operation(summary = "Get customs clearance details")
    public ResponseEntity<CustomsClearance> getClearanceById(@PathVariable UUID clearanceId) {
        return ResponseEntity.ok(clearanceService.getClearanceById(clearanceId));
    }

    @PostMapping("/orders/{orderId}/initiate")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'MANAGER')")
    @Operation(summary = "Initiate customs clearance for an order")
    public ResponseEntity<CustomsClearance> initiateClearance(@PathVariable UUID orderId) {
        return ResponseEntity.ok(clearanceService.initiateClearance(orderId));
    }

    @PostMapping("/clearance/{clearanceId}/submit")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'MANAGER')")
    @Operation(summary = "Submit customs declaration")
    public ResponseEntity<CustomsClearance> submitDeclaration(
            @PathVariable UUID clearanceId,
            @RequestBody CustomsDeclaration declaration) {
        return ResponseEntity.ok(clearanceService.submitDeclaration(clearanceId, declaration));
    }

    @PatchMapping("/clearance/{clearanceId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'MANAGER')")
    @Operation(summary = "Update customs clearance status")
    public ResponseEntity<CustomsClearance> updateStatus(
            @PathVariable UUID clearanceId,
            @RequestParam CustomsStatus status,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(clearanceService.updateStatus(clearanceId, status, remarks));
    }
}
