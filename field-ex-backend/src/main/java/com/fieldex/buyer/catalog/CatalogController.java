package com.fieldex.buyer.catalog;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog")
@RequiredArgsConstructor
@Tag(name = "Buyer Catalog API", description = "Endpoints for buyers to view the available fruit catalog")
public class CatalogController {

    private final CatalogService catalogService;

    @GetMapping("/fruits")
    @PreAuthorize("hasAnyRole('BUYER', 'ADMIN', 'MANAGER', 'EDITOR')")
    @Operation(summary = "Get paginated and filtered catalog of fruits")
    public ResponseEntity<org.springframework.data.domain.Page<CatalogFruitDto>> getCatalog(
            com.fieldex.fruit.dto.FruitFilter filter,
            @org.springframework.data.web.PageableDefault(size = 20) org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(catalogService.getAvailableFruits(filter, pageable));
    }

    @GetMapping("/fruits/{id}")
    @PreAuthorize("hasAnyRole('BUYER', 'ADMIN', 'MANAGER', 'EDITOR')")
    @Operation(summary = "Get detailed fruit specifications by id")
    public ResponseEntity<CatalogFruitDto> getFruitById(@org.springframework.web.bind.annotation.PathVariable java.util.UUID id) {
        return ResponseEntity.ok(catalogService.getFruitById(id));
    }
}
