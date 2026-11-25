package com.fieldex.inventory;

import com.fieldex.batch.BatchStatus;
import com.fieldex.batch.FruitBatch;
import com.fieldex.batch.FruitBatchRepository;
import com.fieldex.fruit.Fruit;
import com.fieldex.fruit.FruitRepository;
import com.fieldex.fruit.FruitVariety;
import com.fieldex.fruit.FruitVarietyRepository;
import com.fieldex.inventory.dto.InventoryOperationRequest;
import com.fieldex.procurement.ProcurementOrder;
import com.fieldex.procurement.ProcurementOrderRepository;
import com.fieldex.procurement.ProcurementStatus;
import com.fieldex.quality.QualityGrade;
import com.fieldex.quality.QualityInspection;
import com.fieldex.quality.QualityInspectionRepository;
import com.fieldex.supplier.Supplier;
import com.fieldex.supplier.SupplierRepository;
import com.fieldex.warehouse.Warehouse;
import com.fieldex.warehouse.WarehouseRepository;
import com.fieldex.warehouse.WarehouseType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
class InventoryConcurrencyTest {



    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private FruitBatchRepository batchRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;
    
    @Autowired
    private SupplierRepository supplierRepository;
    
    @Autowired
    private FruitRepository fruitRepository;
    
    @Autowired
    private FruitVarietyRepository varietyRepository;
    
    @Autowired
    private ProcurementOrderRepository procurementRepository;
    
    @Autowired
    private com.fieldex.procurement.ProcurementItemRepository itemRepo;
    
    @Autowired
    private QualityInspectionRepository inspectionRepository;
    
    @Autowired
    private com.fieldex.user.UserRepository userRepository;

    private UUID inventoryId;

    @BeforeEach
    void setUp() {
        inventoryRepository.deleteAll();
        batchRepository.deleteAll();
        inspectionRepository.deleteAll();
        procurementRepository.deleteAll();
        varietyRepository.deleteAll();
        fruitRepository.deleteAll();
        warehouseRepository.deleteAll();
        supplierRepository.deleteAll();

        Supplier supplier = supplierRepository.save(Supplier.builder().supplierCode("SUP-INV").name("Supplier").build());
        Warehouse warehouse = warehouseRepository.save(Warehouse.builder().name("WH-INV").type(WarehouseType.GENERAL).capacity(100.0).build());
        Fruit fruit = fruitRepository.save(Fruit.builder().name("INV-Fruit").build());
        FruitVariety variety = varietyRepository.save(FruitVariety.builder().name("INV-Var").fruit(fruit).build());
        
        com.fieldex.user.User user = userRepository.save(com.fieldex.user.User.builder()
                .email("test@field-ex.com").passwordHash("pass").name("Test User")
                .role(com.fieldex.user.Role.QC_INSPECTOR).build());

        ProcurementOrder proc = procurementRepository.save(ProcurementOrder.builder()
                .orderNumber("PO-INV-1")
                .supplier(supplier).warehouse(warehouse)
                .status(ProcurementStatus.RECEIVED)
                .purchaseDate(Instant.now())
                .currency("USD")
                .paymentStatus(com.fieldex.procurement.PaymentStatus.COMPLETED)
                .totalAmount(BigDecimal.valueOf(1000))
                .build());
                
        com.fieldex.procurement.ProcurementItem item = itemRepo.save(com.fieldex.procurement.ProcurementItem.builder()
                .procurementOrder(proc).fruit(fruit).variety(variety)
                .quantity(BigDecimal.valueOf(100)).unitPrice(BigDecimal.TEN)
                .totalPrice(BigDecimal.valueOf(1000))
                .build());
                
        QualityInspection insp = inspectionRepository.save(QualityInspection.builder()
                .inspectionNumber("INSP-INV-1")
                .procurementItem(item)
                .inspector(user)
                .inspectedQuantity(BigDecimal.valueOf(100))
                .inspectionDate(Instant.now())
                .status(com.fieldex.quality.InspectionStatus.PASSED)
                .acceptedQuantity(BigDecimal.valueOf(100)).rejectedQuantity(BigDecimal.ZERO).grade(QualityGrade.PREMIUM)
                .build());
                
        FruitBatch batch = batchRepository.save(FruitBatch.builder()
                .batchNumber("B-INV-001").procurementItem(item).supplier(supplier).fruit(fruit).variety(variety)
                .qualityInspection(insp).qualityGrade(QualityGrade.PREMIUM).approvedQuantity(BigDecimal.valueOf(100))
                .harvestDate(Instant.now()).packingDate(Instant.now()).shelfLifeDays(7).expirationDate(Instant.now().plusSeconds(86400 * 7))
                .warehouse(warehouse).status(BatchStatus.CREATED).build());

        Inventory inventory = Inventory.builder()
                .batch(batch)
                .warehouse(warehouse)
                .totalQuantity(BigDecimal.valueOf(100))
                .availableQuantity(BigDecimal.valueOf(100))
                .reservedQuantity(BigDecimal.ZERO)
                .packedQuantity(BigDecimal.ZERO)
                .dispatchedQuantity(BigDecimal.ZERO)
                .damagedQuantity(BigDecimal.ZERO)
                .expiredQuantity(BigDecimal.ZERO)
                .build();
        inventory.setActive(true);
        inventory = inventoryRepository.save(inventory);
        inventoryId = inventory.getId();
    }

    @Test
    void testConcurrentReservations_ShouldNotOversell() throws InterruptedException {
        int numberOfThreads = 10;
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(numberOfThreads);
        
        AtomicInteger successfulReservations = new AtomicInteger(0);
        AtomicInteger failedReservations = new AtomicInteger(0);

        for (int i = 0; i < numberOfThreads; i++) {
            executorService.submit(() -> {
                try {
                    InventoryOperationRequest req = new InventoryOperationRequest();
                    req.setQuantity(BigDecimal.valueOf(20)); // Each tries to reserve 20
                    req.setReason("Concurrent test");
                    
                    inventoryService.reserve(inventoryId, req);
                    successfulReservations.incrementAndGet();
                } catch (Exception e) {
                    failedReservations.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        
        // Total available is 100. Each tries 20. Exactly 5 should succeed, 5 should fail.
        assertEquals(5, successfulReservations.get());
        assertEquals(5, failedReservations.get());

        Inventory result = inventoryRepository.findById(inventoryId).get();
        
        assertEquals(0, result.getAvailableQuantity().compareTo(BigDecimal.ZERO));
        assertEquals(0, result.getReservedQuantity().compareTo(BigDecimal.valueOf(100)));
    }
}
