package com.fieldex.config;

import com.fieldex.buyer.Buyer;
import com.fieldex.buyer.BuyerRepository;
import com.fieldex.fruit.Fruit;
import com.fieldex.fruit.FruitRepository;
import com.fieldex.fruit.FruitVariety;
import com.fieldex.fruit.FruitVarietyRepository;
import com.fieldex.user.Role;
import com.fieldex.user.User;
import com.fieldex.user.UserRepository;
import com.fieldex.warehouse.Warehouse;
import com.fieldex.warehouse.WarehouseRepository;
import com.fieldex.warehouse.WarehouseType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedProduceCatalog();
        seedWarehouses();
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
                .build();
        alphonso.setActive(true);
        fruitVarietyRepository.save(alphonso);

        FruitVariety kesar = FruitVariety.builder()
                .name("Kesar")
                .fruit(mango)
                .shelfLifeDays(21)
                .minStorageTemperature(11.0)
                .maxStorageTemperature(13.0)
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
}
