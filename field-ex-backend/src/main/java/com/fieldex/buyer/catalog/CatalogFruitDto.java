package com.fieldex.buyer.catalog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CatalogFruitDto {
    private UUID id;
    private String name;
    private String description;
    private String category;
    private String origin;
    private String season;
    private boolean active;
    private List<CatalogVarietyDto> varieties;

    // Backward compatibility constructor for existing tests
    public CatalogFruitDto(UUID id, String name, String description, List<CatalogVarietyDto> varieties) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.varieties = varieties;
        this.active = true;
    }
}
