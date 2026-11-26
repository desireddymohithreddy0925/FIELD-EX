package com.fieldex.buyer.catalog;

import com.fieldex.audit.AuditLogService;
import com.fieldex.fruit.Fruit;
import com.fieldex.fruit.FruitRepository;
import com.fieldex.fruit.FruitVariety;
import com.fieldex.fruit.FruitVarietyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final FruitRepository fruitRepository;
    private final FruitVarietyRepository varietyRepository;

    @Autowired(required = false)
    private AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<CatalogFruitDto> getAvailableFruits(com.fieldex.fruit.dto.FruitFilter filter, Pageable pageable) {
        Specification<Fruit> spec = Specification.where(com.fieldex.fruit.FruitSpecification.build(filter))
                .and((root, query, cb) -> cb.isTrue(root.get("active")));
                
        Page<Fruit> fruitPage = fruitRepository.findAll(spec, pageable);
        if (fruitPage.isEmpty()) {
            return Page.empty(pageable);
        }

        List<UUID> fruitIds = fruitPage.getContent().stream()
                .map(Fruit::getId)
                .collect(Collectors.toList());

        Map<UUID, List<FruitVariety>> varietiesByFruitId = varietyRepository.findByFruitIdIn(fruitIds).stream()
                .filter(FruitVariety::isActive)
                .collect(Collectors.groupingBy(v -> v.getFruit().getId()));

        return fruitPage.map(fruit -> mapToDto(fruit, varietiesByFruitId.getOrDefault(fruit.getId(), List.of())));
    }

    @Transactional(readOnly = true)
    public CatalogFruitDto getFruitById(UUID id) {
        Fruit fruit = fruitRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Fruit not found with id: " + id));
        List<FruitVariety> varieties = varietyRepository.findByFruitId(id).stream()
                .filter(FruitVariety::isActive)
                .collect(Collectors.toList());
        return mapToDto(fruit, varieties);
    }

    @Transactional
    public CatalogFruitDto createFruit(FruitRequest request) {
        Fruit fruit = Fruit.builder()
                .name(request.getName().trim())
                .category(request.getCategory() != null ? request.getCategory().trim() : "Tropical")
                .origin(request.getOrigin() != null ? request.getOrigin().trim() : "India")
                .season(request.getSeason() != null ? request.getSeason().trim() : "Seasonal")
                .description(request.getDescription())
                .build();
        fruit.setActive(request.getActive() != null ? request.getActive() : true);
        Fruit saved = fruitRepository.save(fruit);
        return mapToDto(saved, List.of());
    }

    @Transactional
    public CatalogFruitDto updateFruit(UUID id, FruitRequest request) {
        Fruit fruit = fruitRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Fruit not found with id: " + id));
        fruit.setName(request.getName().trim());
        if (request.getCategory() != null) fruit.setCategory(request.getCategory().trim());
        if (request.getOrigin() != null) fruit.setOrigin(request.getOrigin().trim());
        if (request.getSeason() != null) fruit.setSeason(request.getSeason().trim());
        if (request.getDescription() != null) fruit.setDescription(request.getDescription());
        if (request.getActive() != null) fruit.setActive(request.getActive());
        Fruit updated = fruitRepository.save(fruit);
        List<FruitVariety> varieties = varietyRepository.findByFruitId(id);
        return mapToDto(updated, varieties);
    }

    @Transactional
    public CatalogVarietyDto createVariety(UUID fruitId, VarietyRequest request) {
        Fruit fruit = fruitRepository.findById(fruitId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Fruit not found with id: " + fruitId));
        FruitVariety variety = FruitVariety.builder()
                .fruit(fruit)
                .name(request.getName().trim())
                .shelfLifeDays(request.getShelfLifeDays() != null ? request.getShelfLifeDays() : 30)
                .minStorageTemperature(request.getMinStorageTemperature() != null ? request.getMinStorageTemperature() : 4.0)
                .maxStorageTemperature(request.getMaxStorageTemperature() != null ? request.getMaxStorageTemperature() : 8.0)
                .grade(request.getGrade() != null ? request.getGrade() : "Grade A Export")
                .brixLevel(request.getBrixLevel() != null ? request.getBrixLevel() : "14-16° Brix")
                .sizeProfile(request.getSizeProfile() != null ? request.getSizeProfile() : "Standard Export Caliber")
                .colorProfile(request.getColorProfile() != null ? request.getColorProfile() : "Standard")
                .description(request.getDescription())
                .pricePerKg(request.getPricePerKg() != null ? request.getPricePerKg() : java.math.BigDecimal.valueOf(2.50))
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .availableQuantity(request.getAvailableQuantity() != null ? request.getAvailableQuantity() : 10000.0)
                .minOrderQuantity(request.getMinOrderQuantity() != null ? request.getMinOrderQuantity() : 500.0)
                .unit(request.getUnit() != null ? request.getUnit() : "KG")
                .build();
        variety.setActive(request.getActive() != null ? request.getActive() : true);
        FruitVariety saved = varietyRepository.save(variety);
        logAudit("VARIETY_CREATED", saved.getName(), String.format("Added variety %s (%s %s/kg, Stock: %s %s)",
                saved.getName(), saved.getCurrency(), saved.getPricePerKg(), saved.getAvailableQuantity(), saved.getUnit()));
        return mapVarietyToDto(saved);
    }

    @Transactional
    public CatalogVarietyDto updateVariety(UUID varietyId, VarietyRequest request) {
        FruitVariety variety = varietyRepository.findById(varietyId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Variety not found with id: " + varietyId));
        variety.setName(request.getName().trim());
        if (request.getShelfLifeDays() != null) variety.setShelfLifeDays(request.getShelfLifeDays());
        if (request.getMinStorageTemperature() != null) variety.setMinStorageTemperature(request.getMinStorageTemperature());
        if (request.getMaxStorageTemperature() != null) variety.setMaxStorageTemperature(request.getMaxStorageTemperature());
        if (request.getGrade() != null) variety.setGrade(request.getGrade());
        if (request.getBrixLevel() != null) variety.setBrixLevel(request.getBrixLevel());
        if (request.getSizeProfile() != null) variety.setSizeProfile(request.getSizeProfile());
        if (request.getColorProfile() != null) variety.setColorProfile(request.getColorProfile());
        if (request.getDescription() != null) variety.setDescription(request.getDescription());
        if (request.getPricePerKg() != null) variety.setPricePerKg(request.getPricePerKg());
        if (request.getCurrency() != null) variety.setCurrency(request.getCurrency());
        if (request.getAvailableQuantity() != null) variety.setAvailableQuantity(request.getAvailableQuantity());
        if (request.getMinOrderQuantity() != null) variety.setMinOrderQuantity(request.getMinOrderQuantity());
        if (request.getUnit() != null) variety.setUnit(request.getUnit());
        if (request.getActive() != null) variety.setActive(request.getActive());
        FruitVariety updated = varietyRepository.save(variety);
        logAudit("VARIETY_UPDATED", updated.getName(), String.format("Updated specs/catalog for %s (Grade: %s, Brix: %s)",
                updated.getName(), updated.getGrade(), updated.getBrixLevel()));
        return mapVarietyToDto(updated);
    }

    @Transactional
    public CatalogVarietyDto updateVarietyPricing(UUID varietyId, PricingUpdateRequest request) {
        FruitVariety variety = varietyRepository.findById(varietyId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Variety not found with id: " + varietyId));
        variety.setPricePerKg(request.getPricePerKg());
        if (request.getCurrency() != null) variety.setCurrency(request.getCurrency());
        if (request.getAvailableQuantity() != null) variety.setAvailableQuantity(request.getAvailableQuantity());
        if (request.getMinOrderQuantity() != null) variety.setMinOrderQuantity(request.getMinOrderQuantity());
        if (request.getUnit() != null) variety.setUnit(request.getUnit());
        FruitVariety updated = varietyRepository.save(variety);
        logAudit("PRICE_UPDATE", updated.getName(), String.format("Fixed price %s %s/kg | Available Stock: %s %s | MOQ: %s",
                updated.getCurrency(), updated.getPricePerKg(), updated.getAvailableQuantity(), updated.getUnit(), updated.getMinOrderQuantity()));
        return mapVarietyToDto(updated);
    }

    private void logAudit(String action, String resourceId, String metadata) {
        if (auditLogService != null) {
            try {
                auditLogService.logEvent(action, "CATALOG", resourceId, metadata);
            } catch (Exception ignored) {
            }
        }
    }

    @Transactional
    public void deleteVariety(UUID varietyId) {
        FruitVariety variety = varietyRepository.findById(varietyId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Variety not found with id: " + varietyId));
        variety.setActive(false);
        varietyRepository.save(variety);
    }

    @Transactional
    public void deleteFruit(UUID fruitId) {
        Fruit fruit = fruitRepository.findById(fruitId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Fruit not found with id: " + fruitId));
        fruit.setActive(false);
        fruitRepository.save(fruit);
    }

    private CatalogFruitDto mapToDto(Fruit fruit, List<FruitVariety> varieties) {
        return CatalogFruitDto.builder()
                .id(fruit.getId())
                .name(fruit.getName())
                .description(fruit.getDescription())
                .category(fruit.getCategory())
                .origin(fruit.getOrigin())
                .season(fruit.getSeason())
                .active(fruit.isActive())
                .varieties(varieties.stream().map(this::mapVarietyToDto).collect(Collectors.toList()))
                .build();
    }

    private CatalogVarietyDto mapVarietyToDto(FruitVariety v) {
        return CatalogVarietyDto.builder()
                .id(v.getId())
                .name(v.getName())
                .shelfLifeDays(v.getShelfLifeDays())
                .minStorageTemperature(v.getMinStorageTemperature())
                .maxStorageTemperature(v.getMaxStorageTemperature())
                .grade(v.getGrade())
                .brixLevel(v.getBrixLevel())
                .sizeProfile(v.getSizeProfile())
                .colorProfile(v.getColorProfile())
                .description(v.getDescription())
                .pricePerKg(v.getPricePerKg())
                .currency(v.getCurrency() != null ? v.getCurrency() : "USD")
                .availableQuantity(v.getAvailableQuantity() != null ? v.getAvailableQuantity() : 10000.0)
                .minOrderQuantity(v.getMinOrderQuantity() != null ? v.getMinOrderQuantity() : 500.0)
                .unit(v.getUnit() != null ? v.getUnit() : "KG")
                .active(v.isActive())
                .build();
    }
}
