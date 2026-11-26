package com.fieldex.config;

import com.fieldex.audit.AuditLog;
import com.fieldex.audit.AuditLogRepository;
import com.fieldex.buyer.Buyer;
import com.fieldex.buyer.BuyerRepository;
import com.fieldex.fruit.Fruit;
import com.fieldex.fruit.FruitRepository;
import com.fieldex.fruit.FruitVariety;
import com.fieldex.fruit.FruitVarietyRepository;
import com.fieldex.order.Order;
import com.fieldex.order.OrderItem;
import com.fieldex.order.OrderRepository;
import com.fieldex.order.OrderStatus;
import com.fieldex.order.OrderStatusHistory;
import com.fieldex.order.OrderStatusHistoryRepository;
import com.fieldex.quotation.Quotation;
import com.fieldex.quotation.QuotationRepository;
import com.fieldex.quotation.QuotationStatus;
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
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedProduceCatalog();
        seedWarehouses();
        seedOrders();
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

        Buyer buyer = buyerRepository.findByContactEmail("buyer@field-ex.com").orElse(null);
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
        ord3 = orderRepository.save(ord3);

        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(ord3)
                .status(OrderStatus.QUOTE_ACCEPTED)
                .notes("Order created from quotation")
                .build());
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(ord3)
                .status(OrderStatus.PROCESSING)
                .notes("Order accepted by Operations Admin")
                .build());
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(ord3)
                .status(OrderStatus.PACKED)
                .notes("Packed in standard 18.14kg reefer cartons")
                .build());
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(ord3)
                .status(OrderStatus.DISPATCHED)
                .notes("Dispatched to Gateway Cold Hub JNPT")
                .build());
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(ord3)
                .status(OrderStatus.IN_TRANSIT)
                .notes("Ocean transit on vessel CMA CGM TITAN; container temp nominal at +13.2°C")
                .build());

        log.info("Seeded live commercial orders in QUOTE_ACCEPTED, PROCESSING, and IN_TRANSIT states.");
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
