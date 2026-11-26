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
public class FruitRequest {

    @NotBlank(message = "Fruit name is required")
    private String name;

    private String category;
    private String origin;
    private String season;
    private String description;
    private Boolean active;
}
