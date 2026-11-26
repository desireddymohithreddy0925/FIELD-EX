package com.fieldex.buyer.catalog;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog")
@RequiredArgsConstructor
@Tag(name = "Produce Catalog API", description = "Endpoints for viewing and managing fruit cultivars and varieties")
public class CatalogController {

    private final CatalogService catalogService;

    @GetMapping("/fruits")
    @PreAuthorize("hasAnyRole('BUYER', 'ADMIN', 'MANAGER', 'QC_INSPECTOR', 'LOGISTICS') or permitAll()")
    @Operation(summary = "Get paginated and filtered catalog of fruits")
    public ResponseEntity<Page<CatalogFruitDto>> getCatalog(
            com.fieldex.fruit.dto.FruitFilter filter,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(catalogService.getAvailableFruits(filter, pageable));
    }

    @GetMapping("/fruits/{id}")
    @PreAuthorize("hasAnyRole('BUYER', 'ADMIN', 'MANAGER', 'QC_INSPECTOR', 'LOGISTICS') or permitAll()")
    @Operation(summary = "Get detailed fruit specifications by id")
    public ResponseEntity<CatalogFruitDto> getFruitById(@PathVariable UUID id) {
        return ResponseEntity.ok(catalogService.getFruitById(id));
    }

    @PostMapping("/fruits")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create a new fruit cultivar")
    public ResponseEntity<CatalogFruitDto> createFruit(@Valid @RequestBody FruitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogService.createFruit(request));
    }

    @PutMapping("/fruits/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update an existing fruit cultivar")
    public ResponseEntity<CatalogFruitDto> updateFruit(@PathVariable UUID id, @Valid @RequestBody FruitRequest request) {
        return ResponseEntity.ok(catalogService.updateFruit(id, request));
    }

    @DeleteMapping("/fruits/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Soft delete / deactivate a fruit cultivar")
    public ResponseEntity<Void> deleteFruit(@PathVariable UUID id) {
        catalogService.deleteFruit(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/fruits/{fruitId}/varieties")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Add a new export variety to a fruit")
    public ResponseEntity<CatalogVarietyDto> createVariety(
            @PathVariable UUID fruitId,
            @Valid @RequestBody VarietyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogService.createVariety(fruitId, request));
    }

    @PutMapping("/varieties/{varietyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update an export variety")
    public ResponseEntity<CatalogVarietyDto> updateVariety(
            @PathVariable UUID varietyId,
            @Valid @RequestBody VarietyRequest request) {
        return ResponseEntity.ok(catalogService.updateVariety(varietyId, request));
    }

    @DeleteMapping("/varieties/{varietyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Soft delete / deactivate an export variety")
    public ResponseEntity<Void> deleteVariety(@PathVariable UUID varietyId) {
        catalogService.deleteVariety(varietyId);
        return ResponseEntity.noContent().build();
    }
}
