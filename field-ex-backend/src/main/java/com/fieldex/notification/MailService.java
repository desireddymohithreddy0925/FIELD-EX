package com.fieldex.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender javaMailSender;
    private final NotificationLogRepository notificationLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendEmailIdempotent(String idempotencyKey, String to, String subject, String text, NotificationType type) {
        if (notificationLogRepository.existsByIdempotencyKey(idempotencyKey)) {
            log.info("Email with idempotency key {} already sent. Skipping.", idempotencyKey);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@field-ex.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            javaMailSender.send(message);

            NotificationLog logEntry = NotificationLog.builder()
                    .idempotencyKey(idempotencyKey)
                    .recipient(to)
                    .subject(subject)
                    .type(type)
                    .build();
            notificationLogRepository.save(logEntry);
            
            log.info("Sent email successfully to {} with subject: {}", to, subject);
        } catch (Exception e) {
            log.warn("Could not dispatch live SMTP email to {} (mail server offline or unavailable: {}). Logging notification for tracking.", to, e.getMessage());
            NotificationLog logEntry = NotificationLog.builder()
                    .idempotencyKey(idempotencyKey)
                    .recipient(to)
                    .subject(subject + " [DISPATCH PENDING]")
                    .type(type)
                    .build();
            notificationLogRepository.save(logEntry);
        }
    }
}
