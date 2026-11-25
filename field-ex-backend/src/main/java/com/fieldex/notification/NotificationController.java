package com.fieldex.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification API", description = "Endpoints for viewing user notifications")
public class NotificationController {

    private final NotificationLogRepository notificationLogRepository;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all notifications for currently authenticated user")
    public ResponseEntity<List<NotificationDto>> getMyNotifications() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<NotificationLog> logs = notificationLogRepository.findByRecipientOrderByCreatedAtDesc(email);

        List<NotificationDto> dtos = logs.stream()
                .map(log -> NotificationDto.builder()
                        .id(log.getId())
                        .subject(log.getSubject())
                        .type(log.getType())
                        .recipient(log.getRecipient())
                        .createdAt(log.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationDto {
        private UUID id;
        private String subject;
        private NotificationType type;
        private String recipient;
        private Instant createdAt;
    }
}
