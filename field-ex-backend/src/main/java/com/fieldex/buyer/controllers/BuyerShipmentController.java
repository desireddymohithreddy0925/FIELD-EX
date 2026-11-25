package com.fieldex.buyer.controllers;

import com.fieldex.buyer.Buyer;
import com.fieldex.buyer.BuyerRepository;
import com.fieldex.buyer.dto.BuyerShipmentDto;
import com.fieldex.order.Order;
import com.fieldex.order.OrderRepository;
import com.fieldex.shipment.Shipment;
import com.fieldex.shipment.ShipmentRepository;
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
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
@Tag(name = "Buyer Shipment API", description = "Endpoints for buyers to track their shipments")
public class BuyerShipmentController {

    private final ShipmentRepository shipmentRepository;
    private final BuyerRepository buyerRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Get all shipments for current buyer")
    public ResponseEntity<List<BuyerShipmentDto>> getMyShipments() {
        Buyer buyer = getCurrentBuyer();
        if (buyer == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<Shipment> shipments = shipmentRepository.findByOrderBuyerId(buyer.getId());
        List<BuyerShipmentDto> dtos = shipments.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('BUYER', 'ADMIN', 'LOGISTICS', 'MANAGER')")
    @Operation(summary = "Get shipment details for a specific order")
    public ResponseEntity<BuyerShipmentDto> getShipmentByOrder(@PathVariable UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderId));

        Buyer currentBuyer = getCurrentBuyer();
        if (currentBuyer != null && !order.getBuyer().getId().equals(currentBuyer.getId())) {
            throw new AccessDeniedException("You are not authorized to view this shipment");
        }

        return shipmentRepository.findByOrderId(orderId)
                .map(s -> ResponseEntity.ok(mapToDto(s)))
                .orElse(ResponseEntity.noContent().build());
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

    private BuyerShipmentDto mapToDto(Shipment shipment) {
        Order order = shipment.getOrder();
        return BuyerShipmentDto.builder()
                .id(shipment.getId())
                .orderId(order != null ? order.getId() : null)
                .orderNumber(order != null ? order.getOrderNumber() : null)
                .status(shipment.getStatus())
                .containerNumber(shipment.getContainerNumber())
                .shippingCompany(shipment.getShippingCompany())
                .trackingNumber(shipment.getTrackingNumber())
                .originPort(shipment.getOriginPort())
                .destinationPort(shipment.getDestinationPort())
                .destinationCountry(shipment.getDestinationCountry())
                .shipmentDate(shipment.getShipmentDate())
                .expectedDelivery(shipment.getExpectedDelivery())
                .actualDelivery(shipment.getActualDelivery())
                .createdAt(shipment.getCreatedAt() != null ? shipment.getCreatedAt().atOffset(java.time.ZoneOffset.UTC) : null)
                .build();
    }
}
