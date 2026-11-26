package com.fieldex.publicapi;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
@Tag(name = "Public Overview API", description = "Anonymous live platform overview metrics and produce highlights for the public landing page")
public class PublicOverviewController {

    private final PublicOverviewService publicOverviewService;

    @GetMapping("/landing-overview")
    @Operation(summary = "Get real-time landing page metrics, facilities, active freight lanes, and live catalog produce")
    public ResponseEntity<LandingOverviewDto> getLandingOverview() {
        return ResponseEntity.ok(publicOverviewService.getLandingOverview());
    }
}
