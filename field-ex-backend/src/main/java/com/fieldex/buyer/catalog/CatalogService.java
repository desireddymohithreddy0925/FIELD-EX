package com.fieldex.buyer.catalog;

import com.fieldex.fruit.Fruit;
import com.fieldex.fruit.FruitRepository;
import com.fieldex.fruit.FruitVariety;
import com.fieldex.fruit.FruitVarietyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final FruitRepository fruitRepository;
    private final FruitVarietyRepository varietyRepository;

    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable(value = "catalog", key = "{#filter, #pageable}")
    public org.springframework.data.domain.Page<CatalogFruitDto> getAvailableFruits(com.fieldex.fruit.dto.FruitFilter filter, org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Fruit> spec = org.springframework.data.jpa.domain.Specification.where(com.fieldex.fruit.FruitSpecification.build(filter))
                .and((root, query, cb) -> cb.isTrue(root.get("active")));
                
        org.springframework.data.domain.Page<Fruit> fruitPage = fruitRepository.findAll(spec, pageable);

        List<java.util.UUID> fruitIds = fruitPage.getContent().stream()
                .map(Fruit::getId)
                .collect(Collectors.toList());

        Map<java.util.UUID, List<FruitVariety>> varietiesByFruitId = varietyRepository.findByFruitIdIn(fruitIds).stream()
                .filter(FruitVariety::isActive)
                .collect(Collectors.groupingBy(v -> v.getFruit().getId()));

        return fruitPage.map(fruit -> {
            List<FruitVariety> varieties = varietiesByFruitId.getOrDefault(fruit.getId(), List.of());
            return new CatalogFruitDto(
                    fruit.getId(),
                    fruit.getName(),
                    fruit.getDescription(),
                    varieties.stream().map(v -> new CatalogVarietyDto(
                            v.getId(),
                            v.getName(),
                            v.getShelfLifeDays(),
                            v.getMinStorageTemperature(),
                            v.getMaxStorageTemperature()
                    )).collect(Collectors.toList())
            );
        });
    }

    @Transactional(readOnly = true)
    public CatalogFruitDto getFruitById(java.util.UUID id) {
        Fruit fruit = fruitRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Fruit not found with id: " + id));
        List<FruitVariety> varieties = varietyRepository.findByFruitId(id).stream()
                .filter(FruitVariety::isActive)
                .collect(Collectors.toList());
        return new CatalogFruitDto(
                fruit.getId(),
                fruit.getName(),
                fruit.getDescription(),
                varieties.stream().map(v -> new CatalogVarietyDto(
                        v.getId(),
                        v.getName(),
                        v.getShelfLifeDays(),
                        v.getMinStorageTemperature(),
                        v.getMaxStorageTemperature()
                )).collect(Collectors.toList())
        );
    }
}
