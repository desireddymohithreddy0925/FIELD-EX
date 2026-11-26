package com.fieldex.config;

import com.fieldex.audit.AuditLog;
import com.fieldex.audit.AuditLogRepository;
import com.fieldex.batch.BatchStatus;
import com.fieldex.batch.FruitBatch;
import com.fieldex.batch.FruitBatchRepository;
import com.fieldex.buyer.Buyer;
import com.fieldex.buyer.BuyerRepository;
import com.fieldex.fruit.Fruit;
import com.fieldex.fruit.FruitRepository;
import com.fieldex.fruit.FruitVariety;
import com.fieldex.fruit.FruitVarietyRepository;
import com.fieldex.inventory.Inventory;
import com.fieldex.inventory.InventoryRepository;
import com.fieldex.order.Order;
import com.fieldex.order.OrderItem;
import com.fieldex.order.OrderRepository;
import com.fieldex.order.OrderStatus;
import com.fieldex.order.OrderStatusHistory;
import com.fieldex.order.OrderStatusHistoryRepository;
import com.fieldex.procurement.PaymentStatus;
import com.fieldex.procurement.ProcurementItem;
import com.fieldex.procurement.ProcurementItemRepository;
import com.fieldex.procurement.ProcurementOrder;
import com.fieldex.procurement.ProcurementOrderRepository;
import com.fieldex.procurement.ProcurementStatus;
import com.fieldex.quality.InspectionStatus;
import com.fieldex.quality.QualityGrade;
import com.fieldex.quality.QualityInspection;
import com.fieldex.quality.QualityInspectionRepository;
import com.fieldex.quotation.Quotation;
import com.fieldex.quotation.QuotationItem;
import com.fieldex.quotation.QuotationRepository;
import com.fieldex.quotation.QuotationStatus;
import com.fieldex.shipment.Shipment;
import com.fieldex.shipment.ShipmentRepository;
import com.fieldex.shipment.ShipmentStatus;
import com.fieldex.supplier.Supplier;
import com.fieldex.supplier.SupplierRepository;
import com.fieldex.user.Role;
import com.fieldex.user.User;
import com.fieldex.user.UserRepository;
import com.fieldex.warehouse.Warehouse;
import com.fieldex.warehouse.WarehouseRepository;
import com.fieldex.warehouse.WarehouseType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Component
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BuyerRepository buyerRepository;
    private final FruitRepository fruitRepository;
    private final FruitVarietyRepository fruitVarietyRepository;
    private final WarehouseRepository warehouseRepository;
    private final OrderRepository orderRepository;
    private final QuotationRepository quotationRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final AuditLogRepository auditLogRepository;
    private final SupplierRepository supplierRepository;
    private final ProcurementOrderRepository procurementOrderRepository;
    private final ProcurementItemRepository procurementItemRepository;
    private final QualityInspectionRepository qualityInspectionRepository;
    private final FruitBatchRepository fruitBatchRepository;
    private final InventoryRepository inventoryRepository;
    private final ShipmentRepository shipmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedProduceCatalog();
        seedWarehouses();
        seedSuppliersAndInventory();
        seedOrders();
        seedPendingQuotations();
        seedShipments();
        seedAuditLogs();
    }

    private User upsertUser(String email, String name, Role role, String defaultPasswordHash) {
        User user = userRepository.findByEmail(email).orElseGet(() -> User.builder()
                .name(name)
                .email(email)
                .build());
        user.setName(name);
        user.setPasswordHash(defaultPasswordHash);
        user.setRole(role);
        user.setActive(true);
        return userRepository.save(user);
    }

    private void seedUsers() {
        String defaultPasswordHash = passwordEncoder.encode("password123");

        // Admin
        upsertUser("admin@field-ex.com", "System Administrator", Role.ADMIN, defaultPasswordHash);
        log.info("Seeded/Updated Admin user: admin@field-ex.com");

        // Buyer
        User buyerUser = upsertUser("buyer@field-ex.com", "Global Fresh Imports", Role.BUYER, defaultPasswordHash);

        if (buyerRepository.findByUserId(buyerUser.getId()).isEmpty()) {
            Buyer buyer = Buyer.builder()
                    .companyName("Global Fresh Imports Ltd")
                    .contactPerson("John Doe")
                    .contactEmail("buyer@field-ex.com")
                    .contactNumber("+44 20 7946 0912")
                    .country("United Kingdom")
                    .address("24 Covent Garden Market")
                    .destinationCity("London")
                    .destinationPort("Port of Felixstowe")
                    .registrationInformation("VAT: GB987654321, EORI: GB987654321000")
                    .user(buyerUser)
                    .build();
            buyer.setActive(true);
            buyerRepository.save(buyer);
            log.info("Seeded Buyer profile for buyer@field-ex.com");
        }

        // QC Inspector
        upsertUser("qc@field-ex.com", "Senior QC Inspector", Role.QC_INSPECTOR, defaultPasswordHash);
        log.info("Seeded/Updated QC Inspector: qc@field-ex.com");

        // Logistics
        upsertUser("logistics@field-ex.com", "Logistics Director", Role.LOGISTICS, defaultPasswordHash);
        log.info("Seeded/Updated Logistics: logistics@field-ex.com");

        // Manager
        upsertUser("manager@field-ex.com", "Operations General Manager", Role.MANAGER, defaultPasswordHash);
        log.info("Seeded/Updated Manager: manager@field-ex.com");

        // Clean up deprecated roles if present
        userRepository.findByEmail("eng@field-ex.com").ifPresent(userRepository::delete);
        userRepository.findByEmail("editor@field-ex.com").ifPresent(userRepository::delete);
    }

    private void seedProduceCatalog() {
        if (fruitRepository.count() > 0) {
            return;
        }

        // Mango
        Fruit mango = Fruit.builder()
                .name("Mango")
                .category("Tropical")
                .origin("Ratnagiri & Devgad, Maharashtra")
                .season("March - June")
                .description("Export-grade premium Indian mangoes known for rich aroma, sweetness, and vibrant golden pulp.")
                .build();
        mango.setActive(true);
        fruitRepository.save(mango);

        FruitVariety alphonso = FruitVariety.builder()
                .name("Alphonso (Hapus)")
                .fruit(mango)
                .shelfLifeDays(18)
                .minStorageTemperature(10.0)
                .maxStorageTemperature(13.0)
                .pricePerKg(new BigDecimal("4.80"))
                .currency("USD")
                .availableQuantity(25000.0)
                .minOrderQuantity(500.0)
                .unit("KG")
                .grade("Export Grade A")
                .brixLevel("18° - 22° Bx")
                .build();
        alphonso.setActive(true);
        fruitVarietyRepository.save(alphonso);

        FruitVariety kesar = FruitVariety.builder()
                .name("Kesar")
                .fruit(mango)
                .shelfLifeDays(21)
                .minStorageTemperature(11.0)
                .maxStorageTemperature(13.0)
                .pricePerKg(new BigDecimal("3.75"))
                .currency("USD")
                .availableQuantity(18000.0)
                .minOrderQuantity(500.0)
                .unit("KG")
                .grade("Export Grade A")
                .brixLevel("17° - 20° Bx")
                .build();
        kesar.setActive(true);
        fruitVarietyRepository.save(kesar);

        // Pomegranate
        Fruit pomegranate = Fruit.builder()
                .name("Pomegranate")
                .category("Exotic")
                .origin("Solapur & Nashik, Maharashtra")
                .season("August - February")
                .description("GlobalGAP certified ruby-red Bhagwa pomegranates with soft seeds and high juice content.")
                .build();
        pomegranate.setActive(true);
        fruitRepository.save(pomegranate);

        FruitVariety bhagwa = FruitVariety.builder()
                .name("Bhagwa")
                .fruit(pomegranate)
                .shelfLifeDays(60)
                .minStorageTemperature(5.0)
                .maxStorageTemperature(7.0)
                .pricePerKg(new BigDecimal("3.20"))
                .currency("USD")
                .availableQuantity(40000.0)
                .minOrderQuantity(1000.0)
                .unit("KG")
                .grade("Super Grade Extra")
                .brixLevel("15° - 17° Bx")
                .build();
        bhagwa.setActive(true);
        fruitVarietyRepository.save(bhagwa);

        // Banana
        Fruit banana = Fruit.builder()
                .name("Banana")
                .category("Tropical")
                .origin("Jalgaon & Theni")
                .season("Year-round")
                .description("Premium Cavendish green bananas harvested at optimum maturity for overseas sea-freight transit.")
                .build();
        banana.setActive(true);
        fruitRepository.save(banana);

        FruitVariety cavendish = FruitVariety.builder()
                .name("Grand Naine (G9)")
                .fruit(banana)
                .shelfLifeDays(28)
                .minStorageTemperature(13.0)
                .maxStorageTemperature(14.0)
                .pricePerKg(new BigDecimal("0.90"))
                .currency("USD")
                .availableQuantity(60000.0)
                .minOrderQuantity(2000.0)
                .unit("KG")
                .grade("Class 1 Premium")
                .brixLevel("20° - 23° Bx")
                .build();
        cavendish.setActive(true);
        fruitVarietyRepository.save(cavendish);

        log.info("Seeded default produce catalog: Mango, Pomegranate, Banana with export varieties.");
    }

    private void seedWarehouses() {
        if (warehouseRepository.count() > 0) {
            return;
        }

        Warehouse hub = Warehouse.builder()
                .name("Gateway Export Cold Hub")
                .location("JNPT Port Special Freight Zone, Navi Mumbai")
                .type(WarehouseType.COLD_STORAGE)
                .capacity(5000.0)
                .minTemperature(2.0)
                .maxTemperature(12.0)
                .minHumidity(85.0)
                .maxHumidity(95.0)
                .build();
        hub.setActive(true);
        warehouseRepository.save(hub);

        log.info("Seeded primary export cold storage facility.");
    }

    private void seedOrders() {
        if (orderRepository.count() > 0) {
            return;
        }

        Buyer buyer = buyerRepository.findByContactEmail("buyer@field-ex.com")
                .or(() -> buyerRepository.findAll().stream().findFirst())
                .orElse(null);
        if (buyer == null) return;

        List<FruitVariety> varieties = fruitVarietyRepository.findAll();
        if (varieties.isEmpty()) return;

        FruitVariety alphonso = varieties.stream().filter(v -> v.getName().contains("Alphonso")).findFirst().orElse(varieties.get(0));
        FruitVariety bhagwa = varieties.stream().filter(v -> v.getName().contains("Bhagwa")).findFirst().orElse(varieties.get(0));
        FruitVariety banana = varieties.stream().filter(v -> v.getName().contains("Grand Naine")).findFirst().orElse(varieties.get(0));

        // Order 1: QUOTE_ACCEPTED (Awaiting Acceptance by Admin/Manager)
        Quotation q1 = Quotation.builder()
                .buyer(buyer)
                .status(QuotationStatus.ACCEPTED)
                .currencyCode("USD")
                .totalAmount(new BigDecimal("24000.00"))
                .validityDate(OffsetDateTime.now().plusDays(15))
                .build();
        q1.setActive(true);
        q1 = quotationRepository.save(q1);

        Order ord1 = Order.builder()
                .orderNumber("ORD-2026-1001")
                .buyer(buyer)
                .quotation(q1)
                .status(OrderStatus.QUOTE_ACCEPTED)
                .currencyCode("USD")
                .totalAmount(new BigDecimal("24000.00"))
                .build();
        ord1.addItem(OrderItem.builder()
                .fruit(alphonso.getFruit())
                .variety(alphonso)
                .quantity(new BigDecimal("5000.00"))
                .unitPrice(new BigDecimal("4.80"))
                .lineTotal(new BigDecimal("24000.00"))
                .build());
        ord1.setActive(true);
        ord1 = orderRepository.save(ord1);

        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(ord1)
                .status(OrderStatus.QUOTE_ACCEPTED)
                .notes("Order placed by buyer from accepted quotation Q-1001; awaiting Admin or Manager operational acceptance")
                .build());

        // Order 2: PROCESSING (Accepted by Manager)
        Quotation q2 = Quotation.builder()
                .buyer(buyer)
                .status(QuotationStatus.ACCEPTED)
                .currencyCode("USD")
                .totalAmount(new BigDecimal("32000.00"))
                .validityDate(OffsetDateTime.now().plusDays(15))
                .build();
        q2.setActive(true);
        q2 = quotationRepository.save(q2);

        Order ord2 = Order.builder()
                .orderNumber("ORD-2026-1002")
                .buyer(buyer)
                .quotation(q2)
                .status(OrderStatus.PROCESSING)
                .currencyCode("USD")
                .totalAmount(new BigDecimal("32000.00"))
                .build();
        ord2.addItem(OrderItem.builder()
                .fruit(bhagwa.getFruit())
                .variety(bhagwa)
                .quantity(new BigDecimal("10000.00"))
                .unitPrice(new BigDecimal("3.20"))
                .lineTotal(new BigDecimal("32000.00"))
                .build());
        ord2.setActive(true);
        ord2 = orderRepository.save(ord2);

        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(ord2)
                .status(OrderStatus.QUOTE_ACCEPTED)
                .notes("Order submitted by buyer")
                .build());
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(ord2)
                .status(OrderStatus.PROCESSING)
                .notes("Order accepted by Operations Manager; pallet staging and packhouse allocation initiated")
                .build());

        // Order 3: IN_TRANSIT
        Quotation q3 = Quotation.builder()
                .buyer(buyer)
                .status(QuotationStatus.ACCEPTED)
                .currencyCode("USD")
                .totalAmount(new BigDecimal("18000.00"))
                .validityDate(OffsetDateTime.now().plusDays(15))
                .build();
        q3.setActive(true);
        q3 = quotationRepository.save(q3);

        Order ord3 = Order.builder()
                .orderNumber("ORD-2026-1003")
                .buyer(buyer)
                .quotation(q3)
                .status(OrderStatus.IN_TRANSIT)
                .currencyCode("USD")
                .totalAmount(new BigDecimal("18000.00"))
                .build();
        ord3.addItem(OrderItem.builder()
                .fruit(banana.getFruit())
                .variety(banana)
                .quantity(new BigDecimal("20000.00"))
                .unitPrice(new BigDecimal("0.90"))
                .lineTotal(new BigDecimal("18000.00"))
                .build());
        ord3.setActive(true);
        ord3.setCreatedAt(Instant.now().minus(3, ChronoUnit.DAYS));
        ord3.setUpdatedAt(Instant.now().minus(1, ChronoUnit.DAYS));
        ord3 = orderRepository.save(ord3);

        OrderStatusHistory h3_1 = OrderStatusHistory.builder()
                .order(ord3)
                .status(OrderStatus.QUOTE_ACCEPTED)
                .notes("Order created from quotation")
                .build();
        h3_1.setCreatedAt(Instant.now().minus(3, ChronoUnit.DAYS));
        h3_1.setUpdatedAt(Instant.now().minus(3, ChronoUnit.DAYS));
        orderStatusHistoryRepository.save(h3_1);

        OrderStatusHistory h3_2 = OrderStatusHistory.builder()
                .order(ord3)
                .status(OrderStatus.PROCESSING)
                .notes("Order accepted by Operations Admin")
                .build();
        h3_2.setCreatedAt(Instant.now().minus(2, ChronoUnit.DAYS));
        h3_2.setUpdatedAt(Instant.now().minus(2, ChronoUnit.DAYS));
        orderStatusHistoryRepository.save(h3_2);

        OrderStatusHistory h3_3 = OrderStatusHistory.builder()
                .order(ord3)
                .status(OrderStatus.PACKED)
                .notes("Packed in standard 18.14kg reefer cartons")
                .build();
        h3_3.setCreatedAt(Instant.now().minus(36, ChronoUnit.HOURS));
        h3_3.setUpdatedAt(Instant.now().minus(36, ChronoUnit.HOURS));
        orderStatusHistoryRepository.save(h3_3);

        OrderStatusHistory h3_4 = OrderStatusHistory.builder()
                .order(ord3)
                .status(OrderStatus.DISPATCHED)
                .notes("Dispatched to Gateway Cold Hub JNPT")
                .build();
        h3_4.setCreatedAt(Instant.now().minus(24, ChronoUnit.HOURS));
        h3_4.setUpdatedAt(Instant.now().minus(24, ChronoUnit.HOURS));
        orderStatusHistoryRepository.save(h3_4);

        OrderStatusHistory h3_5 = OrderStatusHistory.builder()
                .order(ord3)
                .status(OrderStatus.IN_TRANSIT)
                .notes("Ocean transit on vessel CMA CGM TITAN; container temp nominal at +13.2°C")
                .build();
        h3_5.setCreatedAt(Instant.now().minus(12, ChronoUnit.HOURS));
        h3_5.setUpdatedAt(Instant.now().minus(12, ChronoUnit.HOURS));
        orderStatusHistoryRepository.save(h3_5);

        log.info("Seeded live commercial orders in QUOTE_ACCEPTED, PROCESSING, and IN_TRANSIT states.");
    }

    private void seedSuppliersAndInventory() {
        if (inventoryRepository.count() > 0) {
            return;
        }

        Warehouse warehouse = warehouseRepository.findAll().stream().findFirst().orElse(null);
        User inspector = userRepository.findByEmail("qc@field-ex.com")
                .or(() -> userRepository.findByEmail("admin@field-ex.com"))
                .orElse(null);
        List<FruitVariety> varieties = fruitVarietyRepository.findAll();
        if (warehouse == null || inspector == null || varieties.isEmpty()) {
            return;
        }

        Supplier supplier = supplierRepository.findBySupplierCode("SUP-MH-01").orElseGet(() -> {
            Supplier s = Supplier.builder()
                    .supplierCode("SUP-MH-01")
                    .name("Sahyadri Agro Growers Collective")
                    .contactPerson("Rajesh Deshmukh")
                    .phone("+91 98220 11223")
                    .contactEmail("growers@sahyadriexports.in")
                    .region("Maharashtra")
                    .farmLocation("Ratnagiri & Nashik Cluster")
                    .build();
            s.setActive(true);
            return supplierRepository.save(s);
        });

        ProcurementOrder po = procurementOrderRepository.save(ProcurementOrder.builder()
                .orderNumber("PO-2026-001")
                .supplier(supplier)
                .warehouse(warehouse)
                .purchaseDate(Instant.now().minus(5, ChronoUnit.DAYS))
                .harvestDate(Instant.now().minus(3, ChronoUnit.DAYS))
                .status(ProcurementStatus.RECEIVED)
                .paymentStatus(PaymentStatus.COMPLETED)
                .totalAmount(new BigDecimal("185000.00"))
                .currency("USD")
                .notes("Peak export harvest procurement")
                .build());

        int batchSeq = 1;
        for (FruitVariety v : varieties) {
            BigDecimal qty = BigDecimal.valueOf(v.getAvailableQuantity() != null ? v.getAvailableQuantity() : 25000.0);
            BigDecimal price = v.getPricePerKg() != null ? v.getPricePerKg() : new BigDecimal("2.50");

            ProcurementItem pItem = procurementItemRepository.save(ProcurementItem.builder()
                    .procurementOrder(po)
                    .fruit(v.getFruit())
                    .variety(v)
                    .quantity(qty)
                    .unitPrice(price)
                    .totalPrice(price.multiply(qty))
                    .build());

            QualityInspection insp = QualityInspection.builder()
                    .inspectionNumber("QC-2026-0" + batchSeq)
                    .procurementItem(pItem)
                    .inspector(inspector)
                    .inspectedQuantity(qty)
                    .acceptedQuantity(qty)
                    .rejectedQuantity(BigDecimal.ZERO)
                    .grade(QualityGrade.GRADE_A)
                    .size(v.getSizeProfile() != null ? v.getSizeProfile() : "Export Standard")
                    .color(v.getColorProfile() != null ? v.getColorProfile() : "Natural Mature")
                    .inspectionDate(Instant.now().minus(2, ChronoUnit.DAYS))
                    .status(InspectionStatus.PASSED)
                    .notes("GlobalGAP & MRL lab certified pass for " + v.getName())
                    .build();
            insp.setActive(true);
            insp = qualityInspectionRepository.save(insp);

            FruitBatch batch = FruitBatch.builder()
                    .batchNumber("B-2026-0" + batchSeq)
                    .procurementItem(pItem)
                    .supplier(supplier)
                    .fruit(v.getFruit())
                    .variety(v)
                    .qualityInspection(insp)
                    .qualityGrade(QualityGrade.GRADE_A)
                    .approvedQuantity(qty)
                    .warehouse(warehouse)
                    .harvestDate(Instant.now().minus(3, ChronoUnit.DAYS))
                    .packingDate(Instant.now().minus(2, ChronoUnit.DAYS))
                    .shelfLifeDays(v.getShelfLifeDays() != null ? v.getShelfLifeDays() : 21)
                    .expirationDate(Instant.now().plus(v.getShelfLifeDays() != null ? v.getShelfLifeDays() : 21, ChronoUnit.DAYS))
                    .status(BatchStatus.IN_COLD_STORAGE)
                    .build();
            batch.setActive(true);
            batch = fruitBatchRepository.save(batch);

            Inventory inv = Inventory.builder()
                    .batch(batch)
                    .warehouse(warehouse)
                    .totalQuantity(qty)
                    .availableQuantity(qty)
                    .reservedQuantity(BigDecimal.ZERO)
                    .packedQuantity(BigDecimal.ZERO)
                    .dispatchedQuantity(BigDecimal.ZERO)
                    .damagedQuantity(BigDecimal.ZERO)
                    .expiredQuantity(BigDecimal.ZERO)
                    .build();
            inv.setActive(true);
            inventoryRepository.save(inv);
            batchSeq++;
        }

        // Also seed 1 pending QC inspection for live lab queue metrics
        FruitVariety firstVar = varieties.get(0);
        ProcurementItem pendingItem = procurementItemRepository.save(ProcurementItem.builder()
                .procurementOrder(po)
                .fruit(firstVar.getFruit())
                .variety(firstVar)
                .quantity(new BigDecimal("3500.00"))
                .unitPrice(firstVar.getPricePerKg() != null ? firstVar.getPricePerKg() : new BigDecimal("4.80"))
                .totalPrice(new BigDecimal("16800.00"))
                .build());
        QualityInspection pendingInsp = QualityInspection.builder()
                .inspectionNumber("QC-2026-PENDING")
                .procurementItem(pendingItem)
                .inspector(inspector)
                .inspectedQuantity(new BigDecimal("3500.00"))
                .acceptedQuantity(BigDecimal.ZERO)
                .rejectedQuantity(BigDecimal.ZERO)
                .grade(QualityGrade.PREMIUM)
                .inspectionDate(Instant.now())
                .status(InspectionStatus.PENDING)
                .notes("Incoming farm lot awaiting Brix refraction check")
                .build();
        pendingInsp.setActive(true);
        qualityInspectionRepository.save(pendingInsp);

        log.info("Seeded verified supplier, QC inspections, fruit batches, and warehouse inventories.");
    }

    private void seedPendingQuotations() {
        boolean hasRequestedQuote = quotationRepository.findAll().stream()
                .anyMatch(q -> q.getStatus() == QuotationStatus.REQUESTED);
        if (hasRequestedQuote) {
            return;
        }

        Buyer buyer = buyerRepository.findByContactEmail("buyer@field-ex.com")
                .or(() -> buyerRepository.findAll().stream().findFirst())
                .orElse(null);
        List<FruitVariety> varieties = fruitVarietyRepository.findAll();
        if (buyer == null || varieties.isEmpty()) {
            return;
        }

        FruitVariety alphonso = varieties.stream().filter(v -> v.getName().contains("Alphonso")).findFirst().orElse(varieties.get(0));
        FruitVariety kesar = varieties.stream().filter(v -> v.getName().contains("Kesar")).findFirst().orElse(alphonso);

        BigDecimal q1Qty = new BigDecimal("2500.00");
        BigDecimal q1Price = alphonso.getPricePerKg() != null ? alphonso.getPricePerKg() : new BigDecimal("4.80");
        BigDecimal q2Qty = new BigDecimal("1500.00");
        BigDecimal q2Price = kesar.getPricePerKg() != null ? kesar.getPricePerKg() : new BigDecimal("3.75");

        BigDecimal totalAmt = q1Qty.multiply(q1Price).add(q2Qty.multiply(q2Price));

        Quotation requestedQuote = Quotation.builder()
                .buyer(buyer)
                .status(QuotationStatus.REQUESTED)
                .currencyCode("USD")
                .totalAmount(totalAmt)
                .build();
        requestedQuote.setActive(true);

        requestedQuote.addItem(QuotationItem.builder()
                .fruit(alphonso.getFruit())
                .variety(alphonso)
                .quantity(q1Qty)
                .unitPrice(q1Price)
                .lineTotal(q1Qty.multiply(q1Price))
                .build());
        if (!kesar.getId().equals(alphonso.getId())) {
            requestedQuote.addItem(QuotationItem.builder()
                    .fruit(kesar.getFruit())
                    .variety(kesar)
                    .quantity(q2Qty)
                    .unitPrice(q2Price)
                    .lineTotal(q2Qty.multiply(q2Price))
                    .build());
        }

        quotationRepository.save(requestedQuote);
        log.info("Seeded live pending buyer quotation request for Admin/Manager present amount review.");
    }

    private void seedShipments() {
        if (shipmentRepository.count() > 0) {
            return;
        }

        Order inTransitOrder = orderRepository.findByOrderNumber("ORD-2026-1003").orElse(null);
        if (inTransitOrder != null) {
            Shipment s1 = Shipment.builder()
                    .order(inTransitOrder)
                    .status(ShipmentStatus.IN_TRANSIT)
                    .containerNumber("CMAU4829104")
                    .shippingCompany("CMA CGM")
                    .trackingNumber("CMA-TITAN-1003")
                    .originPort("JNPT Port, Mumbai")
                    .destinationPort("Port of Rotterdam")
                    .destinationCountry("NL")
                    .shipmentDate(OffsetDateTime.now().minusDays(1))
                    .expectedDelivery(OffsetDateTime.now().plusDays(4))
                    .build();
            s1.setActive(true);
            shipmentRepository.save(s1);
            log.info("Seeded live vessel transit shipment for ORD-2026-1003.");
        }
    }

    private void seedAuditLogs() {
        if (auditLogRepository.count() > 0) {
            return;
        }

        auditLogRepository.save(AuditLog.builder()
                .actor("system@field-ex.com")
                .action("SYSTEM_BOOTSTRAP")
                .resourceType("PLATFORM")
                .resourceId("FIELD-EX-CORE")
                .metadata("FIELD-EX B2B Agricultural Export Operating System initialized successfully")
                .correlationId(UUID.randomUUID().toString())
                .timestamp(Instant.now().minusSeconds(3600))
                .build());

        auditLogRepository.save(AuditLog.builder()
                .actor("admin@field-ex.com")
                .action("ROLE_ASSIGNMENT")
                .resourceType("USER")
                .resourceId("manager@field-ex.com")
                .metadata("Granted Operations Manager delegated administration privileges")
                .correlationId(UUID.randomUUID().toString())
                .timestamp(Instant.now().minusSeconds(1800))
                .build());

        auditLogRepository.save(AuditLog.builder()
                .actor("manager@field-ex.com")
                .action("PRICE_UPDATE")
                .resourceType("CATALOG")
                .resourceId("Alphonso (Hapus)")
                .metadata("Set price to $4.80/KG with minimum order quantity 500 KG")
                .correlationId(UUID.randomUUID().toString())
                .timestamp(Instant.now().minusSeconds(900))
                .build());

        auditLogRepository.save(AuditLog.builder()
                .actor("buyer@field-ex.com")
                .action("ORDER_PLACED")
                .resourceType("ORDER")
                .resourceId("ORD-2026-1001")
                .metadata("Buyer submitted order for 5,000 KG Alphonso Mango; awaiting Admin/Manager acceptance")
                .correlationId(UUID.randomUUID().toString())
                .timestamp(Instant.now().minusSeconds(300))
                .build());

        log.info("Seeded initial executive audit watchdog log stream.");
    }
}
