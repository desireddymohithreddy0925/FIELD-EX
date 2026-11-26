package com.fieldex.buyer.catalog;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VarietyRequest {

    @NotBlank(message = "Variety name is required")
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
    private Boolean active;
}
