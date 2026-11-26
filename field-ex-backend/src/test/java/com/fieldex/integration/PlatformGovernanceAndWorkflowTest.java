package com.fieldex.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fieldex.auth.dto.ChangePasswordRequest;
import com.fieldex.auth.dto.LoginRequest;
import com.fieldex.auth.dto.RegisterRequest;
import com.fieldex.buyer.Buyer;
import com.fieldex.buyer.BuyerRepository;
import com.fieldex.buyer.catalog.PricingUpdateRequest;
import com.fieldex.fruit.Fruit;
import com.fieldex.fruit.FruitRepository;
import com.fieldex.fruit.FruitVariety;
import com.fieldex.fruit.FruitVarietyRepository;
import com.fieldex.order.Order;
import com.fieldex.order.OrderItem;
import com.fieldex.order.OrderRepository;
import com.fieldex.order.OrderStatus;
import com.fieldex.quotation.Quotation;
import com.fieldex.quotation.QuotationItem;
import com.fieldex.quotation.QuotationRepository;
import com.fieldex.quotation.QuotationStatus;
import com.fieldex.security.CustomUserDetails;
import com.fieldex.security.JwtService;
import com.fieldex.shipment.Shipment;
import com.fieldex.shipment.ShipmentRepository;
import com.fieldex.shipment.ShipmentStatus;
import com.fieldex.user.Role;
import com.fieldex.user.User;
import com.fieldex.user.UserRepository;
import com.fieldex.user.dto.RoleAssignRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class PlatformGovernanceAndWorkflowTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private WebApplicationContext context;
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BuyerRepository buyerRepository;
    @Autowired
    private FruitRepository fruitRepository;
    @Autowired
    private FruitVarietyRepository varietyRepository;
    @Autowired
    private QuotationRepository quotationRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ShipmentRepository shipmentRepository;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private User adminUser;
    private User managerUser;
    private User buyerUser;
    private Buyer buyer;
    private Fruit fruit;
    private FruitVariety variety;

    private String adminToken;
    private String managerToken;
    private String buyerToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();

        adminUser = User.builder()
                .name("Mohith Reddy")
                .email("desireddymohithreddy@gmail.com")
                .passwordHash(passwordEncoder.encode("mohith@0217"))
                .role(Role.ADMIN)
                .build();
        adminUser.setActive(true);
        adminUser = userRepository.save(adminUser);

        managerUser = User.builder()
                .name("Ops Manager")
                .email("manager-test@field-ex.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.MANAGER)
                .build();
        managerUser.setActive(true);
        managerUser = userRepository.save(managerUser);

        buyerUser = User.builder()
                .name("Global Buyer")
                .email("buyer-test@field-ex.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.BUYER)
                .build();
        buyerUser.setActive(true);
        buyerUser = userRepository.save(buyerUser);

        buyer = Buyer.builder()
                .user(buyerUser)
                .companyName("Global Exports Test Ltd")
                .contactEmail("buyer-test@field-ex.com")
                .country("United Kingdom")
                .destinationCity("London")
                .destinationPort("Port of Felixstowe")
                .address("1 Market Way")
                .build();
        buyer.setActive(true);
        buyer = buyerRepository.save(buyer);

        fruit = Fruit.builder()
                .name("Mango Test")
                .category("Tropical")
                .origin("Ratnagiri")
                .season("Summer")
                .build();
        fruit.setActive(true);
        fruit = fruitRepository.save(fruit);

        variety = FruitVariety.builder()
                .fruit(fruit)
                .name("Alphonso Test")
                .grade("Export Grade A")
                .pricePerKg(new BigDecimal("3.50"))
                .currency("USD")
                .availableQuantity(25000.0)
                .minOrderQuantity(500.0)
                .unit("KG")
                .build();
        variety.setActive(true);
        variety = varietyRepository.save(variety);

        adminToken = jwtService.generateToken(new CustomUserDetails(adminUser));
        managerToken = jwtService.generateToken(new CustomUserDetails(managerUser));
        buyerToken = jwtService.generateToken(new CustomUserDetails(buyerUser));
    }

    @AfterEach
    void tearDown() {
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY FALSE");
        jdbcTemplate.execute("TRUNCATE TABLE export_documents");
        jdbcTemplate.execute("TRUNCATE TABLE shipment_status_history");
        jdbcTemplate.execute("TRUNCATE TABLE shipment_items");
        jdbcTemplate.execute("TRUNCATE TABLE shipments");
        jdbcTemplate.execute("TRUNCATE TABLE order_status_history");
        jdbcTemplate.execute("TRUNCATE TABLE order_item_allocations");
        jdbcTemplate.execute("TRUNCATE TABLE order_items");
        jdbcTemplate.execute("TRUNCATE TABLE orders");
        jdbcTemplate.execute("TRUNCATE TABLE quotation_status_history");
        jdbcTemplate.execute("TRUNCATE TABLE quotation_items");
        jdbcTemplate.execute("TRUNCATE TABLE quotations");
        jdbcTemplate.execute("TRUNCATE TABLE fruit_varieties");
        jdbcTemplate.execute("TRUNCATE TABLE fruits");
        jdbcTemplate.execute("TRUNCATE TABLE notification_log");
        jdbcTemplate.execute("TRUNCATE TABLE audit_logs");
        jdbcTemplate.execute("TRUNCATE TABLE buyers");
        jdbcTemplate.execute("TRUNCATE TABLE users");
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY TRUE");
    }

    @Test
    void singleAdminGovernanceAndChangePasswordFlow() throws Exception {
        // 1. Registration strictly creates BUYER
        RegisterRequest registerReq = RegisterRequest.builder()
                .name("New Registered User")
                .email("newbuyer@field-ex.com")
                .password("secret123")
                .build();
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("BUYER"));

        User registered = userRepository.findByEmail("newbuyer@field-ex.com").orElseThrow();

        // 2. Manager cannot assign roles (403)
        RoleAssignRequest promoteToQc = new RoleAssignRequest();
        promoteToQc.setRole(Role.QC_INSPECTOR);
        mockMvc.perform(put("/api/v1/admin/users/" + registered.getId() + "/role")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(promoteToQc)))
                .andExpect(status().isForbidden());

        // 3. Admin cannot assign ADMIN to anyone else
        RoleAssignRequest promoteToAdmin = new RoleAssignRequest();
        promoteToAdmin.setRole(Role.ADMIN);
        mockMvc.perform(put("/api/v1/admin/users/" + registered.getId() + "/role")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(promoteToAdmin)))
                .andExpect(status().isBadRequest());

        // 4. Admin can assign QC_INSPECTOR / LOGISTICS / MANAGER
        mockMvc.perform(put("/api/v1/admin/users/" + registered.getId() + "/role")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(promoteToQc)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("QC_INSPECTOR"));

        // 5. Admin can change password & login with new password
        ChangePasswordRequest changePwd = new ChangePasswordRequest("mohith@0217", "mohith@2027");
        mockMvc.perform(post("/api/v1/auth/change-password")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changePwd)))
                .andExpect(status().isOk());

        LoginRequest loginWithNew = LoginRequest.builder()
                .email("desireddymohithreddy@gmail.com")
                .password("mohith@2027")
                .build();
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginWithNew)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void orderAcceptAutoCreatesShipmentAndOnlyBuyerConfirmsDelivery() throws Exception {
        Quotation acceptedQuote = Quotation.builder()
                .buyer(buyer)
                .status(QuotationStatus.ACCEPTED)
                .currencyCode("USD")
                .totalAmount(new BigDecimal("3500.00"))
                .build();
        acceptedQuote.setActive(true);
        acceptedQuote = quotationRepository.save(acceptedQuote);

        Order order = Order.builder()
                .orderNumber("ORD-TEST-5001")
                .buyer(buyer)
                .quotation(acceptedQuote)
                .status(OrderStatus.QUOTE_ACCEPTED)
                .currencyCode("USD")
                .totalAmount(new BigDecimal("3500.00"))
                .build();
        order.setActive(true);
        order.addItem(OrderItem.builder()
                .fruit(fruit)
                .variety(variety)
                .quantity(new BigDecimal("1000"))
                .unitPrice(new BigDecimal("3.50"))
                .lineTotal(new BigDecimal("3500.00"))
                .build());
        order = orderRepository.save(order);

        // 1. Manager accepts order -> transitions to PROCESSING & auto-creates PREPARING Shipment
        mockMvc.perform(post("/api/v1/admin/orders/" + order.getId() + "/transition")
                        .header("Authorization", "Bearer " + managerToken)
                        .param("targetStatus", "PROCESSING")
                        .param("notes", "Accepted order"))
                .andExpect(status().isOk());

        Shipment createdShipment = shipmentRepository.findByOrderId(order.getId()).orElse(null);
        assertNotNull(createdShipment, "Shipment must be initialized when order is accepted");
        assertEquals(ShipmentStatus.PREPARING, createdShipment.getStatus());
        assertEquals("GB", createdShipment.getDestinationCountry());

        // Advance order through PACKED -> DISPATCHED (listener automatically moves DISPATCHED -> IN_TRANSIT)
        mockMvc.perform(post("/api/v1/admin/orders/" + order.getId() + "/transition")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("targetStatus", "PACKED"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/admin/orders/" + order.getId() + "/transition")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("targetStatus", "DISPATCHED"))
                .andExpect(status().isOk());
        assertEquals(OrderStatus.IN_TRANSIT, orderRepository.findById(order.getId()).orElseThrow().getStatus());

        // 2. Admin / Manager CANNOT bypass buyer and set DELIVERED directly
        mockMvc.perform(post("/api/v1/admin/orders/" + order.getId() + "/transition")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("targetStatus", "DELIVERED"))
                .andExpect(status().isForbidden());

        // 3. Buyer clicks Confirm Order Delivered -> Order + Shipment transition to DELIVERED
        mockMvc.perform(post("/api/v1/orders/" + order.getId() + "/confirm-delivery")
                        .header("Authorization", "Bearer " + buyerToken)
                        .param("notes", "Signed off at Felixstowe cold terminal"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"));

        Order refreshedOrder = orderRepository.findById(order.getId()).orElseThrow();
        Shipment refreshedShipment = shipmentRepository.findById(createdShipment.getId()).orElseThrow();
        assertEquals(OrderStatus.DELIVERED, refreshedOrder.getStatus());
        assertEquals(ShipmentStatus.DELIVERED, refreshedShipment.getStatus());
    }

    @Test
    void perTonnePricingRecalculatesOpenQuotationsAndDocumentDownloadWorks() throws Exception {
        // 1. Create open REQUESTED quotation via buyer with MT quantity (2 MT = 2000 KG)
        String quoteReqJson = objectMapper.writeValueAsString(Map.of(
                "items", new Object[]{
                        Map.of(
                                "fruitId", fruit.getId().toString(),
                                "varietyId", variety.getId().toString(),
                                "quantity", 2,
                                "unit", "MT"
                        )
                }
        ));
        MvcResult quoteRes = mockMvc.perform(post("/api/v1/quotations/request")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(quoteReqJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(2000))
                .andExpect(jsonPath("$.totalAmount").value(7000.0))
                .andReturn();

        String quotationId = objectMapper.readTree(quoteRes.getResponse().getContentAsString()).get("id").asText();

        // 2. Manager updates price per tonne to $4,200/MT ($4.20/kg) -> open quotation recalculates to $8,400
        PricingUpdateRequest priceUpdate = PricingUpdateRequest.builder()
                .pricePerTonne(new BigDecimal("4200.00"))
                .currency("USD")
                .build();
        mockMvc.perform(patch("/api/v1/catalog/varieties/" + variety.getId() + "/pricing")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(priceUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pricePerKg").value(4.2));

        Quotation recalculated = quotationRepository.findById(java.util.UUID.fromString(quotationId)).orElseThrow();
        assertEquals(0, new BigDecimal("8400.00").compareTo(recalculated.getTotalAmount()));
        QuotationItem qItem = recalculated.getItems().get(0);
        assertEquals(0, new BigDecimal("4.20").compareTo(qItem.getUnitPrice().setScale(2)));

        // 3. Test Document Generation (COMMERCIAL_INVOICE) + direct PDF download without MinIO + admin module list endpoints
        Quotation docQuote = Quotation.builder()
                .buyer(buyer)
                .status(QuotationStatus.ACCEPTED)
                .currencyCode("USD")
                .totalAmount(new BigDecimal("4200.00"))
                .build();
        docQuote.setActive(true);
        docQuote = quotationRepository.save(docQuote);

        Order docOrder = Order.builder()
                .orderNumber("ORD-DOC-1001")
                .buyer(buyer)
                .quotation(docQuote)
                .status(OrderStatus.PROCESSING)
                .currencyCode("USD")
                .totalAmount(new BigDecimal("4200.00"))
                .build();
        docOrder.setActive(true);
        docOrder.addItem(OrderItem.builder()
                .fruit(fruit)
                .variety(variety)
                .quantity(new BigDecimal("1000"))
                .unitPrice(new BigDecimal("4.20"))
                .lineTotal(new BigDecimal("4200.00"))
                .build());
        docOrder = orderRepository.save(docOrder);

        MvcResult docRes = mockMvc.perform(post("/api/v1/documents/generate/" + docOrder.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .param("type", "COMMERCIAL_INVOICE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").value("ORD-DOC-1001"))
                .andReturn();

        String docId = objectMapper.readTree(docRes.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/v1/documents/" + docId + "/download")
                        .header("Authorization", "Bearer " + buyerToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));

        mockMvc.perform(get("/api/v1/documents").header("Authorization", "Bearer " + adminToken)).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/packaging").header("Authorization", "Bearer " + adminToken)).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/customs").header("Authorization", "Bearer " + adminToken)).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/cold-chain/readings").header("Authorization", "Bearer " + adminToken)).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/analytics/overview").header("Authorization", "Bearer " + adminToken)).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/buyers").header("Authorization", "Bearer " + adminToken)).andExpect(status().isOk());
    }
}
