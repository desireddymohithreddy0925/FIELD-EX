package com.fieldex.buyer;

import com.fieldex.buyer.dto.BuyerDto;
import com.fieldex.buyer.dto.BuyerUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;

@RestController
@RequestMapping("/api/v1/buyers")
@RequiredArgsConstructor
@Tag(name = "Buyer Profile API", description = "Endpoints for buyers to manage their profile")
public class BuyerController {

    private final BuyerService buyerService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'LOGISTICS')")
    @Operation(summary = "List all registered buyer companies")
    public ResponseEntity<List<BuyerDto>> getAllBuyers() {
        return ResponseEntity.ok(buyerService.getAllBuyers());
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Get current buyer profile")
    public ResponseEntity<BuyerDto> getMyProfile() {
        return ResponseEntity.ok(buyerService.getMyProfile());
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Update current buyer profile")
    public ResponseEntity<BuyerDto> updateMyProfile(@Valid @RequestBody BuyerUpdateRequest request) {
        return ResponseEntity.ok(buyerService.updateMyProfile(request));
    }
}
