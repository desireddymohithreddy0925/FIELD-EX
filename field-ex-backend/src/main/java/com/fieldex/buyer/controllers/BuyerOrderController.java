package com.fieldex.buyer.controllers;

import com.fieldex.order.OrderService;
import com.fieldex.order.OrderStateMachineService;
import com.fieldex.order.dto.OrderDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Buyer Order API", description = "Endpoints for buyers to manage their orders")
public class BuyerOrderController {

    private final OrderService orderService;
    private final OrderStateMachineService orderStateMachineService;

    @PostMapping("/from-quotation/{quotationId}")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Create an order from an accepted quotation")
    public ResponseEntity<OrderDto> createOrder(@PathVariable UUID quotationId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrderFromQuotation(quotationId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Get order details")
    public ResponseEntity<OrderDto> getOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }
    
    @GetMapping("/me")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Get current buyer's orders")
    public ResponseEntity<org.springframework.data.domain.Page<OrderDto>> getMyOrders(
            @RequestParam(required = false) String status,
            @org.springframework.data.web.PageableDefault(size = 20) org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(orderService.getMyOrders(status, pageable));
    }

    @PostMapping("/{id}/confirm-delivery")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Confirm order delivery by buyer")
    public ResponseEntity<OrderDto> confirmDelivery(
            @PathVariable UUID id,
            @RequestParam(required = false) String notes) {
        orderStateMachineService.confirmDeliveryByBuyer(id, notes);
        return ResponseEntity.ok(orderService.getOrderById(id));
    }
}
