package com.fieldex.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, UUID> {
    boolean existsByIdempotencyKey(String idempotencyKey);
    List<NotificationLog> findByRecipientOrderByCreatedAtDesc(String recipient);
}
