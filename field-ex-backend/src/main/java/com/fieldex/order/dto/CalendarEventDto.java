package com.fieldex.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEventDto {
    private String id;
    private String title;
    private String eventType; // ORDER_PLACED, PAYMENT_CONFIRMED, PACKING_COMPLETE, SHIPMENT_DISPATCHED, CUSTOMS_CLEARED, ORDER_DELIVERED, EXPECTED_DELIVERY
    private Instant date;
    private UUID orderId;
    private String orderNumber;
    private String buyerName;
    private String status;
    private String details;
    private String badgeColor; // emerald, blue, indigo, amber, purple, rose, cyan
}
