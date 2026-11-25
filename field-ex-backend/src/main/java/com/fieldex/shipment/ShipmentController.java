package com.fieldex.shipment;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
@Tag(name = "Shipment API", description = "Endpoints for managing logistics shipments")
public class ShipmentController {

    private final ShipmentStateMachineService shipmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'MANAGER')")
    @Operation(summary = "Get all shipments with filtering and pagination")
    public ResponseEntity<org.springframework.data.domain.Page<Shipment>> getAllShipments(
            com.fieldex.shipment.dto.ShipmentFilter filter,
            @org.springframework.data.web.PageableDefault(size = 20) org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(shipmentService.getAllShipments(filter, pageable));
    }

    @GetMapping("/orders/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'BUYER', 'ENGINEER', 'MANAGER')")
    @Operation(summary = "Get shipment for an order")
    public ResponseEntity<Shipment> getShipmentByOrder(@PathVariable UUID orderId) {
        return shipmentService.getShipmentByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/orders/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'MANAGER')")
    @Operation(summary = "Create shipment for an order")
    public ResponseEntity<Shipment> createShipment(@PathVariable UUID orderId) {
        return ResponseEntity.ok(shipmentService.createShipment(orderId));
    }

    @PatchMapping("/{shipmentId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'MANAGER')")
    @Operation(summary = "Update shipment status")
    public ResponseEntity<Shipment> updateStatus(
            @PathVariable UUID shipmentId,
            @RequestParam ShipmentStatus status,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(shipmentService.transitionState(shipmentId, status, remarks));
    }
}
