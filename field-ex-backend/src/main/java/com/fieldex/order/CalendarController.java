package com.fieldex.order;

import com.fieldex.order.dto.CalendarEventDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
@Tag(name = "Calendar Operations API", description = "Endpoints for tracking order dates, milestones, dispatch and receipt")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'LOGISTICS', 'BUYER')")
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/events")
    @Operation(summary = "Get calendar operational events for orders and shipments")
    public ResponseEntity<List<CalendarEventDto>> getCalendarEvents() {
        return ResponseEntity.ok(calendarService.getCalendarEvents());
    }
}
