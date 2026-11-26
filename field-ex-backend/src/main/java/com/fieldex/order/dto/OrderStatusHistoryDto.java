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
public class OrderStatusHistoryDto {
    private UUID id;
    private UUID orderId;
    private String orderNumber;
    private String status;
    private String actorName;
    private String actorEmail;
    private String actorRole;
    private String notes;
    private Instant timestamp;
}
