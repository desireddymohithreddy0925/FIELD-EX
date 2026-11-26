package com.fieldex.coldchain.dto;

import com.fieldex.coldchain.ColdChainEventType;
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
public class ColdChainEventDto {
    private UUID id;
    private UUID batchId;
    private String batchNumber;
    private UUID warehouseId;
    private String warehouseName;
    private ColdChainEventType eventType;
    private Instant eventTimestamp;
    private String notes;
}
