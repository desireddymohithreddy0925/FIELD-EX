package com.fieldex;

import com.fieldex.buyer.Buyer;
import com.fieldex.buyer.BuyerRepository;
import com.fieldex.fruit.Fruit;
import com.fieldex.fruit.FruitRepository;
import com.fieldex.supplier.Supplier;
import com.fieldex.supplier.SupplierRepository;
import com.fieldex.user.Role;
import com.fieldex.user.User;
import com.fieldex.user.UserRepository;
import com.fieldex.warehouse.Warehouse;
import com.fieldex.warehouse.WarehouseRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class DomainRepositoryTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private BuyerRepository buyerRepository;

    @Autowired
    private FruitRepository fruitRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Test
    void testUserSaveAndAudit() {
        User user = User.builder()
                .name("Test Engineer")
                .email("engineer@field-ex.com")
                .passwordHash("hashed")
                .role(Role.ENGINEER)
                .build();
        
        User saved = userRepository.saveAndFlush(user);
        assertNotNull(saved.getId());
        assertNotNull(saved.getCreatedAt());
        assertNotNull(saved.getUpdatedAt());
        assertTrue(saved.isActive());
    }

    @Test
    void testSupplierSave() {
        Supplier supplier = Supplier.builder()
                .supplierCode("SUP-TEST-123")
                .name("Farm India Co")
                .region("Maharashtra")
                .build();
        Supplier saved = supplierRepository.saveAndFlush(supplier);
        assertNotNull(saved.getId());
    }

    @Test
    void testFruitSave() {
        Fruit fruit = Fruit.builder()
                .name("Alphonso Mango")
                .description("Premium quality mango")
                .build();
        Fruit saved = fruitRepository.saveAndFlush(fruit);
        assertNotNull(saved.getId());
    }
}
