package com.fieldex.publicapi;

import com.fieldex.buyer.Buyer;
import com.fieldex.buyer.BuyerRepository;
import com.fieldex.fruit.Fruit;
import com.fieldex.fruit.FruitRepository;
import com.fieldex.fruit.FruitVariety;
import com.fieldex.fruit.FruitVarietyRepository;
import com.fieldex.order.Order;
import com.fieldex.order.OrderRepository;
import com.fieldex.order.OrderStatus;
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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class PublicOverviewControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private FruitRepository fruitRepository;

    @Autowired
    private FruitVarietyRepository varietyRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BuyerRepository buyerRepository;

    @Autowired
    private QuotationRepository quotationRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private ProcurementOrderRepository procurementOrderRepository;

    @Autowired
    private ProcurementItemRepository procurementItemRepository;

    @Autowired
    private QualityInspectionRepository qualityInspectionRepository;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        cleanTables();
    }

    @AfterEach
    void tearDown() {
        cleanTables();
    }

    private void cleanTables() {
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY FALSE");
        jdbcTemplate.execute("TRUNCATE TABLE shipment_items");
        jdbcTemplate.execute("TRUNCATE TABLE shipment_status_history");
        jdbcTemplate.execute("TRUNCATE TABLE shipments");
        jdbcTemplate.execute("TRUNCATE TABLE order_items");
        jdbcTemplate.execute("TRUNCATE TABLE order_status_history");
        jdbcTemplate.execute("TRUNCATE TABLE orders");
        jdbcTemplate.execute("TRUNCATE TABLE quotation_items");
        jdbcTemplate.execute("TRUNCATE TABLE quotations");
        jdbcTemplate.execute("TRUNCATE TABLE inventories");
        jdbcTemplate.execute("TRUNCATE TABLE fruit_batches");
        jdbcTemplate.execute("TRUNCATE TABLE quality_inspections");
        jdbcTemplate.execute("TRUNCATE TABLE procurement_items");
        jdbcTemplate.execute("TRUNCATE TABLE procurement_orders");
        jdbcTemplate.execute("TRUNCATE TABLE suppliers");
        jdbcTemplate.execute("TRUNCATE TABLE warehouses");
        jdbcTemplate.execute("TRUNCATE TABLE fruit_varieties");
        jdbcTemplate.execute("TRUNCATE TABLE fruits");
        jdbcTemplate.execute("TRUNCATE TABLE buyers");
        jdbcTemplate.execute("TRUNCATE TABLE users");
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY TRUE");
    }

    @Test
    void emptyDatabaseReturnsZeroMetricsSafelyWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/v1/public/landing-overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeFruitCount").value(0))
                .andExpect(jsonPath("$.activeVarietyCount").value(0))
                .andExpect(jsonPath("$.totalCatalogStockKg").value(0.0))
                .andExpect(jsonPath("$.qcPassRatePercent").value(0.0))
                .andExpect(jsonPath("$.featuredProduce", hasSize(0)))
                .andExpect(jsonPath("$.warehouses", hasSize(0)));
    }

    @Test
    void returnsRealTimeDatabaseMetricsWithoutExposingPii() throws Exception {
        Fruit fruit = Fruit.builder()
                .name("Pomegranate")
                .category("Exotic")
                .origin("Solapur, Maharashtra")
                .season("August - February")
                .build();
        fruit.setActive(true);
        fruit = fruitRepository.save(fruit);

        FruitVariety bhagwa = FruitVariety.builder()
                .fruit(fruit)
                .name("Bhagwa")
                .pricePerKg(new BigDecimal("3.20"))
                .currency("USD")
                .availableQuantity(12.5)
                .minOrderQuantity(1.0)
                .unit("MT")
                .grade("Super Grade Extra")
                .brixLevel("16° Bx")
                .minStorageTemperature(5.0)
                .maxStorageTemperature(7.0)
                .shelfLifeDays(60)
                .build();
        bhagwa.setActive(true);
        varietyRepository.save(bhagwa);

        Warehouse warehouse = Warehouse.builder()
                .name("JNPT Cold Storage Hub")
                .location("Navi Mumbai")
                .type(WarehouseType.COLD_STORAGE)
                .capacity(2500.0)
                .minTemperature(4.0)
                .maxTemperature(8.0)
                .minHumidity(85.0)
                .maxHumidity(92.0)
                .build();
        warehouse.setActive(true);
        warehouseRepository.save(warehouse);

        Supplier supplier = Supplier.builder()
                .supplierCode("SUP-1")
                .name("Private Grower Co")
                .contactEmail("secret-supplier@example.com")
                .region("Maharashtra")
                .farmLocation("Solapur Belt")
                .build();
        supplier.setActive(true);
        supplierRepository.save(supplier);

        User buyerUser = User.builder()
                .name("Buyer One")
                .email("buyer@example.com")
                .passwordHash("hash")
                .role(Role.BUYER)
                .build();
        buyerUser.setActive(true);
        buyerUser = userRepository.save(buyerUser);

        Buyer buyer = Buyer.builder()
                .user(buyerUser)
                .companyName("Private Importer Ltd")
                .contactEmail("private-buyer@example.com")
                .country("Netherlands")
                .destinationPort("Port of Rotterdam")
                .build();
        buyer.setActive(true);
        buyer = buyerRepository.save(buyer);

        Quotation quote = Quotation.builder()
                .buyer(buyer)
                .status(QuotationStatus.ACCEPTED)
                .currencyCode("USD")
                .totalAmount(new BigDecimal("16000.00"))
                .validityDate(OffsetDateTime.now().plusDays(10))
                .build();
        quote.setActive(true);
        quote = quotationRepository.save(quote);

        Order order = Order.builder()
                .orderNumber("ORD-LIVE-01")
                .buyer(buyer)
                .quotation(quote)
                .status(OrderStatus.PROCESSING)
                .currencyCode("USD")
                .totalAmount(new BigDecimal("16000.00"))
                .build();
        order.setActive(true);
        order = orderRepository.save(order);

        Shipment shipment = Shipment.builder()
                .order(order)
                .status(ShipmentStatus.IN_TRANSIT)
                .containerNumber("SECRET-CONT-1")
                .shippingCompany("Maersk")
                .originPort("JNPT Port, Mumbai")
                .destinationPort("Port of Rotterdam")
                .destinationCountry("NL")
                .build();
        shipment.setActive(true);
        shipmentRepository.save(shipment);

        ProcurementOrder po = procurementOrderRepository.save(ProcurementOrder.builder()
                .orderNumber("PO-TEST-01")
                .supplier(supplier)
                .warehouse(warehouse)
                .purchaseDate(Instant.now())
                .status(ProcurementStatus.RECEIVED)
                .paymentStatus(PaymentStatus.COMPLETED)
                .totalAmount(new BigDecimal("10000.00"))
                .currency("USD")
                .build());

        ProcurementItem poItem = procurementItemRepository.save(ProcurementItem.builder()
                .procurementOrder(po)
                .fruit(fruit)
                .variety(bhagwa)
                .quantity(new BigDecimal("1000.00"))
                .unitPrice(new BigDecimal("3.20"))
                .totalPrice(new BigDecimal("3200.00"))
                .build());

        QualityInspection passedQc = QualityInspection.builder()
                .inspectionNumber("QC-PASS-1")
                .procurementItem(poItem)
                .inspector(buyerUser)
                .inspectedQuantity(new BigDecimal("500.00"))
                .acceptedQuantity(new BigDecimal("500.00"))
                .rejectedQuantity(BigDecimal.ZERO)
                .grade(QualityGrade.GRADE_A)
                .inspectionDate(Instant.now())
                .status(InspectionStatus.PASSED)
                .build();
        passedQc.setActive(true);
        qualityInspectionRepository.save(passedQc);

        QualityInspection failedQc = QualityInspection.builder()
                .inspectionNumber("QC-FAIL-1")
                .procurementItem(poItem)
                .inspector(buyerUser)
                .inspectedQuantity(new BigDecimal("500.00"))
                .acceptedQuantity(BigDecimal.ZERO)
                .rejectedQuantity(new BigDecimal("500.00"))
                .grade(QualityGrade.GRADE_B)
                .inspectionDate(Instant.now())
                .status(InspectionStatus.FAILED)
                .build();
        failedQc.setActive(true);
        qualityInspectionRepository.save(failedQc);

        mockMvc.perform(get("/api/v1/public/landing-overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeFruitCount").value(1))
                .andExpect(jsonPath("$.activeVarietyCount").value(1))
                .andExpect(jsonPath("$.totalCatalogStockKg").value(12500.0))
                .andExpect(jsonPath("$.activeWarehouseCount").value(1))
                .andExpect(jsonPath("$.totalWarehouseCapacityMt").value(2500.0))
                .andExpect(jsonPath("$.activeSupplierCount").value(1))
                .andExpect(jsonPath("$.activeBuyerCount").value(1))
                .andExpect(jsonPath("$.activeOrdersCount").value(1))
                .andExpect(jsonPath("$.activeOrderPipelineUsd").value(16000.0))
                .andExpect(jsonPath("$.activeShipmentCount").value(1))
                .andExpect(jsonPath("$.passedInspectionsCount").value(1))
                .andExpect(jsonPath("$.qcPassRatePercent").value(50.0))
                .andExpect(jsonPath("$.featuredProduce[0].name").value("Pomegranate"))
                .andExpect(jsonPath("$.featuredProduce[0].varieties[0].name").value("Bhagwa"))
                .andExpect(jsonPath("$.warehouses[0].name").value("JNPT Cold Storage Hub"))
                .andExpect(jsonPath("$.activeLanes[0].destinationPort").value("Port of Rotterdam"))
                .andExpect(content().string(not(containsString("secret-supplier@example.com"))))
                .andExpect(content().string(not(containsString("private-buyer@example.com"))))
                .andExpect(content().string(not(containsString("Private Importer Ltd"))))
                .andExpect(content().string(not(containsString("SECRET-CONT-1"))))
                .andExpect(content().string(not(containsString("ORD-LIVE-01"))));
    }
}
