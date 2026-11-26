package com.fieldex.buyer.catalog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CatalogVarietyDto {
    private UUID id;
    private String name;
    private Integer shelfLifeDays;
    private Double minStorageTemperature;
    private Double maxStorageTemperature;
    private String grade;
    private String brixLevel;
    private String sizeProfile;
    private String colorProfile;
    private String description;
    private java.math.BigDecimal pricePerKg;
    private String currency;
    private Double availableQuantity;
    private Double minOrderQuantity;
    private String unit;
    private boolean active;

    // Backward compatibility constructor for existing tests
    public CatalogVarietyDto(UUID id, String name, Integer shelfLifeDays, Double minStorageTemperature, Double maxStorageTemperature) {
        this.id = id;
        this.name = name;
        this.shelfLifeDays = shelfLifeDays;
        this.minStorageTemperature = minStorageTemperature;
        this.maxStorageTemperature = maxStorageTemperature;
        this.active = true;
    }
}
