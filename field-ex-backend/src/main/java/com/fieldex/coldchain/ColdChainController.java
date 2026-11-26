package com.fieldex.coldchain;

import com.fieldex.coldchain.dto.ColdChainEventDto;
import com.fieldex.coldchain.dto.TemperatureReadingDto;
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

@RestController
@RequestMapping("/api/v1/cold-chain")
@RequiredArgsConstructor
@Tag(name = "Cold Chain API", description = "Real-time temperature telemetry and excursion tracking")
@SecurityRequirement(name = "bearerAuth")
public class ColdChainController {

    private final ColdChainService coldChainService;

    @GetMapping("/readings")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'LOGISTICS', 'QC_INSPECTOR')")
    @Operation(summary = "Get all cold-chain temperature readings")
    public ResponseEntity<List<TemperatureReadingDto>> getAllReadings() {
        return ResponseEntity.ok(coldChainService.getAllReadings());
    }

    @GetMapping("/events")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'LOGISTICS', 'QC_INSPECTOR')")
    @Operation(summary = "Get all cold-chain excursion events")
    public ResponseEntity<List<ColdChainEventDto>> getAllEvents() {
        return ResponseEntity.ok(coldChainService.getAllEvents());
    }

    @PostMapping("/readings")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'LOGISTICS', 'QC_INSPECTOR')")
    @Operation(summary = "Record a new IoT/manual temperature reading")
    public ResponseEntity<TemperatureReadingDto> recordReading(@Valid @RequestBody TemperatureReadingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(coldChainService.recordReadingDto(request));
    }
}
