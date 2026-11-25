package com.fieldex.buyer.controllers;

import com.fieldex.buyer.Buyer;
import com.fieldex.buyer.BuyerRepository;
import com.fieldex.security.CustomUserDetails;
import com.fieldex.security.JwtService;
import com.fieldex.user.Role;
import com.fieldex.user.User;
import com.fieldex.user.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
public class BuyerShipmentAndDocumentControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BuyerRepository buyerRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private WebApplicationContext context;

    private User buyerUser;
    private String buyerToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        buyerUser = User.builder()
                .name("Consignment Buyer")
                .email("buyer-shipment@field-ex.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.BUYER)
                .build();
        userRepository.save(buyerUser);

        Buyer buyer = Buyer.builder()
                .user(buyerUser)
                .companyName("Buyer Consignments LLC")
                .contactEmail("buyer-shipment@field-ex.com")
                .build();
        buyerRepository.save(buyer);

        buyerToken = jwtService.generateToken(new CustomUserDetails(buyerUser));
    }

    @AfterEach
    void tearDown() {
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY FALSE");
        jdbcTemplate.execute("TRUNCATE TABLE export_documents");
        jdbcTemplate.execute("TRUNCATE TABLE shipment_status_history");
        jdbcTemplate.execute("TRUNCATE TABLE shipment_items");
        jdbcTemplate.execute("TRUNCATE TABLE shipments");
        jdbcTemplate.execute("TRUNCATE TABLE notification_log");
        jdbcTemplate.execute("TRUNCATE TABLE buyers");
        jdbcTemplate.execute("TRUNCATE TABLE users");
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY TRUE");
    }

    @Test
    void testGetMyShipments_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/v1/shipments/me")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testGetMyDocuments_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/v1/documents/me")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testGetMyNotifications_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/me")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
