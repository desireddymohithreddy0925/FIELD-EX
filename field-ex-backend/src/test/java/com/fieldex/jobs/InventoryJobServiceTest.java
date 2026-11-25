package com.fieldex.jobs;

import com.fieldex.batch.BatchStatus;
import com.fieldex.batch.FruitBatch;
import com.fieldex.batch.FruitBatchRepository;
import com.fieldex.fruit.Fruit;
import com.fieldex.fruit.FruitVariety;
import com.fieldex.common.event.EventPublisher;
import com.fieldex.inventory.Inventory;
import com.fieldex.inventory.InventoryRepository;
import com.fieldex.inventory.event.InventoryLowEvent;
import com.fieldex.notification.MailService;
import com.fieldex.notification.NotificationType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryJobServiceTest {

    @Mock
    private FruitBatchRepository fruitBatchRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private EventPublisher eventPublisher;

    @Mock
    private MailService mailService;

    @InjectMocks
    private InventoryJobService inventoryJobService;

    @Test
    void detectNearExpiryAndExpiredBatches_ExpiresBatchesAndSendsNotifications() {
        FruitBatch expiredBatch = new FruitBatch();
        expiredBatch.setId(UUID.randomUUID());
        expiredBatch.setStatus(BatchStatus.IN_COLD_STORAGE);

        FruitBatch nearExpiryBatch = new FruitBatch();
        nearExpiryBatch.setId(UUID.randomUUID());
        nearExpiryBatch.setBatchNumber("B123");
        nearExpiryBatch.setStatus(BatchStatus.IN_COLD_STORAGE);

        when(fruitBatchRepository.findByStatusAndExpirationDateBefore(eq(BatchStatus.IN_COLD_STORAGE), any(Instant.class)))
                .thenReturn(List.of(expiredBatch));
        when(fruitBatchRepository.findByStatusAndExpirationDateBetween(eq(BatchStatus.IN_COLD_STORAGE), any(Instant.class), any(Instant.class)))
                .thenReturn(List.of(nearExpiryBatch));

        inventoryJobService.detectNearExpiryAndExpiredBatches();

        assertThat(expiredBatch.getStatus()).isEqualTo(BatchStatus.EXPIRED);
        verify(fruitBatchRepository).saveAll(List.of(expiredBatch));

        verify(mailService).sendEmailIdempotent(
                eq("near_expiry_" + nearExpiryBatch.getId()),
                eq("admin@field-ex.com"),
                eq("Batch Near Expiry Alert"),
                eq("Batch B123 is nearing expiration."),
                eq(NotificationType.NEAR_EXPIRY)
        );
    }

    @Test
    void detectLowStock_PublishesInventoryLowEvent() {
        Fruit fruit = new Fruit();
        fruit.setId(UUID.randomUUID());
        
        FruitVariety variety = new FruitVariety();
        variety.setId(UUID.randomUUID());
        
        FruitBatch batch = new FruitBatch();
        batch.setFruit(fruit);
        batch.setVariety(variety);

        Inventory inventory = new Inventory();
        inventory.setId(UUID.randomUUID());
        inventory.setBatch(batch);

        when(inventoryRepository.findByAvailableQuantityLessThanAndActiveTrue(any(BigDecimal.class)))
                .thenReturn(List.of(inventory));

        inventoryJobService.detectLowStock();

        ArgumentCaptor<InventoryLowEvent> eventCaptor = ArgumentCaptor.forClass(InventoryLowEvent.class);
        verify(eventPublisher).publish(eventCaptor.capture());

        InventoryLowEvent event = eventCaptor.getValue();
        assertThat(event.getFruitId()).isEqualTo(fruit.getId());
        assertThat(event.getVarietyId()).isEqualTo(variety.getId());
    }
}
