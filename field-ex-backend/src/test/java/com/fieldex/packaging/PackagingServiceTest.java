package com.fieldex.packaging;

import com.fieldex.batch.FruitBatch;
import com.fieldex.batch.FruitBatchRepository;
import com.fieldex.common.event.EventPublisher;
import com.fieldex.inventory.InventoryService;
import com.fieldex.inventory.dto.InventoryDto;
import com.fieldex.order.Order;
import com.fieldex.order.OrderItem;
import com.fieldex.order.OrderItemAllocation;
import com.fieldex.order.OrderRepository;
import com.fieldex.packaging.dto.PackagingCreateRequest;
import com.fieldex.packaging.dto.PackagingItemRequest;
import com.fieldex.packaging.dto.PackagingRecordDto;
import com.fieldex.packaging.dto.PackagingStatusUpdateRequest;
import com.fieldex.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PackagingServiceTest {

    @Mock
    private PackagingRecordRepository packagingRepository;
    
    @Mock
    private PackagingStatusHistoryRepository historyRepository;
    
    @Mock
    private OrderRepository orderRepository;
    
    @Mock
    private FruitBatchRepository batchRepository;
    
    @Mock
    private InventoryService inventoryService;
    
    @Mock
    private EventPublisher eventPublisher;
    
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PackagingService packagingService;

    private Order order;
    private FruitBatch batch;
    private UUID orderId = UUID.randomUUID();
    private UUID batchId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        batch = new FruitBatch();
        batch.setId(batchId);
        batch.setBatchNumber("BATCH-123");

        order = new Order();
        order.setId(orderId);
        order.setOrderNumber("ORD-123");

        OrderItem item = new OrderItem();
        item.setId(UUID.randomUUID());
        item.setQuantity(new BigDecimal("100"));

        OrderItemAllocation alloc = new OrderItemAllocation();
        alloc.setFruitBatch(batch);
        alloc.setQuantity(new BigDecimal("100"));
        
        item.setAllocations(new ArrayList<>(List.of(alloc)));
        order.setItems(new ArrayList<>(List.of(item)));
    }

    @Test
    void testCreatePackagingRecord_Success() {
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(packagingRepository.findByOrderId(orderId)).thenReturn(new ArrayList<>());
        when(batchRepository.findById(batchId)).thenReturn(Optional.of(batch));
        when(packagingRepository.save(any(PackagingRecord.class))).thenAnswer(i -> {
            PackagingRecord pr = i.getArgument(0);
            pr.setId(UUID.randomUUID());
            return pr;
        });

        PackagingCreateRequest request = new PackagingCreateRequest();
        request.setOrderId(orderId);
        request.setPackingDate(OffsetDateTime.now());
        
        PackagingItemRequest itemRequest = new PackagingItemRequest();
        itemRequest.setFruitBatchId(batchId);
        itemRequest.setQuantity(new BigDecimal("50"));
        itemRequest.setPackagingType("BOX");
        itemRequest.setPackageCount(10);
        request.setItems(List.of(itemRequest));

        PackagingRecordDto dto = packagingService.createPackagingRecord(request);

        assertNotNull(dto.getId());
        assertEquals(PackagingStatus.PENDING, dto.getStatus());
        assertEquals(1, dto.getItems().size());
        assertEquals(new BigDecimal("50"), dto.getItems().get(0).getQuantity());
        verify(packagingRepository).save(any());
        verify(historyRepository).save(any());
    }

    @Test
    void testCreatePackagingRecord_ExceedsAllocation_ThrowsException() {
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(packagingRepository.findByOrderId(orderId)).thenReturn(new ArrayList<>());

        PackagingCreateRequest request = new PackagingCreateRequest();
        request.setOrderId(orderId);
        request.setPackingDate(OffsetDateTime.now());
        
        PackagingItemRequest itemRequest = new PackagingItemRequest();
        itemRequest.setFruitBatchId(batchId);
        itemRequest.setQuantity(new BigDecimal("150")); // Exceeds 100 allocation
        itemRequest.setPackagingType("BOX");
        itemRequest.setPackageCount(30);
        request.setItems(List.of(itemRequest));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            packagingService.createPackagingRecord(request);
        });
        
        assertTrue(exception.getMessage().contains("Cannot pack more than allocated"));
    }

    @Test
    void testUpdateStatus_ToCompleted_TriggersInventoryAndEvent() {
        UUID recordId = UUID.randomUUID();
        PackagingRecord record = new PackagingRecord();
        record.setId(recordId);
        record.setOrder(order);
        record.setStatus(PackagingStatus.IN_PROGRESS);

        PackagingItem pItem = new PackagingItem();
        pItem.setId(UUID.randomUUID());
        pItem.setFruitBatch(batch);
        pItem.setQuantity(new BigDecimal("50"));
        record.setItems(List.of(pItem));

        when(packagingRepository.findById(recordId)).thenReturn(Optional.of(record));
        when(packagingRepository.save(any(PackagingRecord.class))).thenReturn(record);
        
        InventoryDto mockInventory = InventoryDto.builder().id(UUID.randomUUID()).build();
        when(inventoryService.getInventoryByBatchId(batchId)).thenReturn(mockInventory);

        PackagingStatusUpdateRequest request = new PackagingStatusUpdateRequest(PackagingStatus.COMPLETED, "Done");
        PackagingRecordDto dto = packagingService.updateStatus(recordId, request);

        assertEquals(PackagingStatus.COMPLETED, dto.getStatus());
        verify(inventoryService).pack(eq(mockInventory.getId()), any());
        verify(eventPublisher).publish(any());
    }
}
