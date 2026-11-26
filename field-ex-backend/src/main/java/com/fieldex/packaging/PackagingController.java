package com.fieldex.packaging;

import com.fieldex.packaging.dto.PackagingCreateRequest;
import com.fieldex.packaging.dto.PackagingRecordDto;
import com.fieldex.packaging.dto.PackagingStatusUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/packaging")
@RequiredArgsConstructor
@Tag(name = "Packaging API", description = "Endpoints for managing packaging records")
public class PackagingController {

    private final PackagingService packagingService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'MANAGER')")
    @Operation(summary = "Get all packaging records")
    public List<PackagingRecordDto> getAllPackagingRecords() {
        return packagingService.getAllPackagingRecords();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'MANAGER')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a packaging record")
    public PackagingRecordDto createPackagingRecord(@Valid @RequestBody PackagingCreateRequest request) {
        return packagingService.createPackagingRecord(request);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'MANAGER')")
    @Operation(summary = "Update packaging status")
    public PackagingRecordDto updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody PackagingStatusUpdateRequest request) {
        return packagingService.updateStatus(id, request);
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'BUYER', 'MANAGER')")
    @Operation(summary = "Get packaging records by order ID")
    public List<PackagingRecordDto> getPackagingRecordsByOrder(@PathVariable UUID orderId) {
        // IDOR checking would ideally be handled in service to ensure Buyer can only see their own order's packaging
        return packagingService.getPackagingRecordsByOrder(orderId);
    }
}
