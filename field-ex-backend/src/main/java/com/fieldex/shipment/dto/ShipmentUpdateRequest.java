package com.fieldex.shipment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentUpdateRequest {
    private String containerNumber;
    private String shippingCompany;
    private String trackingNumber;
    private String originPort;
    private String destinationPort;
    private String destinationCountry;
    private OffsetDateTime expectedDelivery;
}
