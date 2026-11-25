package com.fieldex.warehouse;

import com.fieldex.warehouse.dto.StorageLocationCreateRequest;
import com.fieldex.warehouse.dto.StorageLocationDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/warehouses/{warehouseId}/locations")
@RequiredArgsConstructor
@Tag(name = "Storage Location API", description = "Operations related to storage locations in warehouses")
@SecurityRequirement(name = "bearerAuth")
public class StorageLocationController {

    private final StorageLocationService storageLocationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER', 'LOGISTICS', 'MANAGER')")
    @Operation(summary = "Get storage locations for a warehouse")
    public ResponseEntity<List<StorageLocationDto>> getLocations(@PathVariable UUID warehouseId) {
        return ResponseEntity.ok(storageLocationService.getLocationsForWarehouse(warehouseId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ENGINEER', 'MANAGER')")
    @Operation(summary = "Create storage location in a warehouse")
    public ResponseEntity<StorageLocationDto> createLocation(
            @PathVariable UUID warehouseId,
            @Valid @RequestBody StorageLocationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storageLocationService.createLocation(warehouseId, request));
    }
}
