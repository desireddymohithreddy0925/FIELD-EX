package com.fieldex.buyer.dto;

import com.fieldex.shipment.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuyerShipmentDto {
    private UUID id;
    private UUID orderId;
    private String orderNumber;
    private ShipmentStatus status;
    private String containerNumber;
    private String shippingCompany;
    private String trackingNumber;
    private String originPort;
    private String destinationPort;
    private String destinationCountry;
    private OffsetDateTime shipmentDate;
    private OffsetDateTime expectedDelivery;
    private OffsetDateTime actualDelivery;
    private OffsetDateTime createdAt;
}
