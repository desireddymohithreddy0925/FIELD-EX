package com.fieldex.coldchain.dto;

import com.fieldex.coldchain.ReadingSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemperatureReadingDto {
    private UUID id;
    private UUID batchId;
    private String batchNumber;
    private UUID warehouseId;
    private String warehouseName;
    private BigDecimal temperature;
    private BigDecimal humidity;
    private Instant timestamp;
    private ReadingSource source;
    private String notes;
    private boolean excursion;
}
