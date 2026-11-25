package com.fieldex.buyer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fieldex.buyer.dto.BuyerDto;
import com.fieldex.buyer.dto.BuyerUpdateRequest;
import com.fieldex.security.CustomUserDetails;
import com.fieldex.security.JwtService;
import com.fieldex.user.Role;
import com.fieldex.user.User;
import com.fieldex.user.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest

@ActiveProfiles("test")
public class BuyerControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BuyerRepository buyerRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    private User buyerUser;
    private String buyerToken;

    @Autowired
    private WebApplicationContext context;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        buyerRepository.deleteAll();
        userRepository.deleteAll();

        buyerUser = User.builder()
                .name("Test Buyer")
                .email("testbuyer@field-ex.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.BUYER)
                .build();
        buyerUser.setActive(true);
        userRepository.save(buyerUser);

        Buyer buyer = Buyer.builder()
                .companyName("Test Buyer Co")
                .contactEmail("testbuyer@field-ex.com")
                .user(buyerUser)
                .build();
        buyerRepository.save(buyer);

        buyerToken = jwtService.generateToken(new CustomUserDetails(buyerUser));
    }

    @AfterEach
    void tearDown() {
        buyerRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void shouldGetMyProfile() throws Exception {
        mockMvc.perform(get("/api/v1/buyers/me")
                        .header("Authorization", "Bearer " + buyerToken))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Test Buyer Co"))
                .andExpect(jsonPath("$.email").value("testbuyer@field-ex.com"));
    }

    @Test
    void shouldUpdateMyProfile() throws Exception {
        BuyerUpdateRequest request = new BuyerUpdateRequest(
                "Updated Buyer Co",
                "John Doe",
                "newemail@field-ex.com",
                "1234567890",
                "USA",
                "123 Apple St",
                "New York",
                "NY Port",
                "Reg-1234"
        );

        mockMvc.perform(put("/api/v1/buyers/me")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Updated Buyer Co"))
                .andExpect(jsonPath("$.destinationCity").value("New York"));
    }
}
