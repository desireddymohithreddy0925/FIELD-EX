package com.fieldex.buyer.catalog;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingUpdateRequest {

    @PositiveOrZero(message = "Price per kg cannot be negative")
    private BigDecimal pricePerKg;

    @PositiveOrZero(message = "Price per tonne cannot be negative")
    private BigDecimal pricePerTonne;

    private String currency;

    @PositiveOrZero(message = "Available quantity cannot be negative")
    private Double availableQuantity;

    @PositiveOrZero(message = "Minimum order quantity cannot be negative")
    private Double minOrderQuantity;

    private String unit;
}
