package com.fieldex.customs.dto;

import com.fieldex.customs.CustomsStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomsClearanceDto {
    private UUID id;
    private UUID orderId;
    private String orderNumber;
    private String buyerCompany;
    private CustomsStatus status;
    private String inspectionStatus;
    private String remarks;
    private OffsetDateTime clearanceDate;
    private String declarationReference;
    private String exportCountry;
    private String destinationCountry;
    private String exportPort;
    private String destinationPort;
    private String customsBroker;
    private BigDecimal dutiesAndTaxes;
    private OffsetDateTime declarationDate;
    private Instant createdAt;
}
