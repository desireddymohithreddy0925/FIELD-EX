package com.fieldex.warehouse.dto;

import com.fieldex.warehouse.WarehouseType;
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
public class WarehouseDto {
    private UUID id;
    private String name;
    private String location;
    private WarehouseType type;
    private Double capacity;
    private Double minTemperature;
    private Double maxTemperature;
    private Double minHumidity;
    private Double maxHumidity;
    private Boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
