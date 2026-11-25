package com.fieldex.jobs;

import com.fieldex.batch.BatchStatus;
import com.fieldex.batch.FruitBatch;
import com.fieldex.batch.FruitBatchRepository;
import com.fieldex.common.event.EventPublisher;
import com.fieldex.inventory.Inventory;
import com.fieldex.inventory.InventoryRepository;
import com.fieldex.inventory.event.InventoryLowEvent;
import com.fieldex.notification.MailService;
import com.fieldex.notification.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryJobService {

    private final FruitBatchRepository fruitBatchRepository;
    private final InventoryRepository inventoryRepository;
    private final EventPublisher eventPublisher;
    private final MailService mailService;

    @Scheduled(cron = "0 0 1 * * *") // Every day at 1 AM
    @Transactional
    public void detectNearExpiryAndExpiredBatches() {
        log.info("Running job to detect near-expiry and expired batches...");
        Instant now = Instant.now();
        Instant nextWeek = now.plus(7, ChronoUnit.DAYS);

        // Expired
        List<FruitBatch> expiredBatches = fruitBatchRepository.findByStatusAndExpirationDateBefore(
                BatchStatus.IN_COLD_STORAGE, now
        );
        for (FruitBatch batch : expiredBatches) {
            batch.setStatus(BatchStatus.EXPIRED);
            log.info("Batch {} has expired.", batch.getId());
        }
        fruitBatchRepository.saveAll(expiredBatches);

        // Near Expiry
        List<FruitBatch> nearExpiryBatches = fruitBatchRepository.findByStatusAndExpirationDateBetween(
                BatchStatus.IN_COLD_STORAGE, now, nextWeek
        );
        for (FruitBatch batch : nearExpiryBatches) {
            String key = "near_expiry_" + batch.getId();
            mailService.sendEmailIdempotent(
                    key,
                    "admin@field-ex.com",
                    "Batch Near Expiry Alert",
                    "Batch " + batch.getBatchNumber() + " is nearing expiration.",
                    NotificationType.NEAR_EXPIRY
            );
        }
    }

    @Scheduled(cron = "0 0 * * * *") // Every hour
    @Transactional(readOnly = true)
    public void detectLowStock() {
        log.info("Running job to detect low stock...");
        BigDecimal threshold = new BigDecimal("100");
        List<Inventory> lowStockItems = inventoryRepository.findByAvailableQuantityLessThanAndActiveTrue(threshold);

        for (Inventory inventory : lowStockItems) {
            eventPublisher.publish(new InventoryLowEvent(this, inventory.getBatch().getFruit().getId(), inventory.getBatch().getVariety().getId()));
        }
    }
}
