package com.fieldex.publicapi;

import com.fieldex.batch.BatchStatus;
import com.fieldex.batch.FruitBatch;
import com.fieldex.batch.FruitBatchRepository;
import com.fieldex.buyer.Buyer;
import com.fieldex.buyer.BuyerRepository;
import com.fieldex.buyer.catalog.CatalogFruitDto;
import com.fieldex.buyer.catalog.CatalogService;
import com.fieldex.buyer.catalog.CatalogVarietyDto;
import com.fieldex.coldchain.TemperatureReading;
import com.fieldex.coldchain.TemperatureReadingRepository;
import com.fieldex.inventory.Inventory;
import com.fieldex.inventory.InventoryRepository;
import com.fieldex.order.Order;
import com.fieldex.order.OrderRepository;
import com.fieldex.order.OrderStatus;
import com.fieldex.quality.InspectionStatus;
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
import com.fieldex.warehouse.Warehouse;
import com.fieldex.warehouse.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PublicOverviewService {

    private final CatalogService catalogService;
    private final InventoryRepository inventoryRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final BuyerRepository buyerRepository;
    private final OrderRepository orderRepository;
    private final QuotationRepository quotationRepository;
    private final QualityInspectionRepository qualityInspectionRepository;
    private final FruitBatchRepository fruitBatchRepository;
    private final ShipmentRepository shipmentRepository;
    private final TemperatureReadingRepository temperatureReadingRepository;

    @Transactional(readOnly = true)
    public LandingOverviewDto getLandingOverview() {
        Page<CatalogFruitDto> catalogPage = catalogService.getAvailableFruits(null, PageRequest.of(0, 100));
        List<CatalogFruitDto> activeFruits = catalogPage.getContent();

        int activeVarietyCount = 0;
        double totalCatalogStockKg = 0.0;
        Set<String> origins = new LinkedHashSet<>();

        for (CatalogFruitDto fruit : activeFruits) {
            addIfNonBlank(origins, fruit.getOrigin());
            List<CatalogVarietyDto> varieties = fruit.getVarieties();
            if (varieties == null) continue;
            for (CatalogVarietyDto v : varieties) {
                if (!v.isActive()) continue;
                activeVarietyCount++;
                double qty = v.getAvailableQuantity() != null ? v.getAvailableQuantity() : 0.0;
                double kgFactor = "MT".equalsIgnoreCase(v.getUnit()) ? 1000.0 : 1.0;
                totalCatalogStockKg += qty * kgFactor;
            }
        }

        double totalWarehouseInventoryKg = inventoryRepository.findAll().stream()
                .filter(Inventory::isActive)
                .map(Inventory::getAvailableQuantity)
                .filter(Objects::nonNull)
                .mapToDouble(BigDecimal::doubleValue)
                .sum();

        List<Supplier> activeSuppliers = supplierRepository.findAll().stream()
                .filter(Supplier::isActive)
                .toList();
        for (Supplier supplier : activeSuppliers) {
            addIfNonBlank(origins, supplier.getFarmLocation());
            addIfNonBlank(origins, supplier.getRegion());
        }

        List<Warehouse> activeWarehouses = warehouseRepository.findAll().stream()
                .filter(Warehouse::isActive)
                .toList();
        double totalWarehouseCapacityMt = activeWarehouses.stream()
                .map(Warehouse::getCapacity)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();

        List<LandingOverviewDto.WarehouseSnapshotDto> warehouseSnapshots = activeWarehouses.stream()
                .map(w -> LandingOverviewDto.WarehouseSnapshotDto.builder()
                        .name(w.getName())
                        .location(w.getLocation())
                        .type(w.getType() != null ? w.getType().name() : "COLD_STORAGE")
                        .capacityMt(w.getCapacity())
                        .minTemperatureCelsius(w.getMinTemperature())
                        .maxTemperatureCelsius(w.getMaxTemperature())
                        .minHumidityPercent(w.getMinHumidity())
                        .maxHumidityPercent(w.getMaxHumidity())
                        .build())
                .toList();

        List<Buyer> activeBuyers = buyerRepository.findAll().stream()
                .filter(Buyer::isActive)
                .toList();
        Set<String> destinations = new LinkedHashSet<>();
        for (Buyer buyer : activeBuyers) {
            addIfNonBlank(destinations, buyer.getDestinationPort());
            addIfNonBlank(destinations, buyer.getCountry());
        }

        List<Order> activeDbOrders = orderRepository.findAll().stream()
                .filter(Order::isActive)
                .toList();
        List<Order> livePipelineOrders = activeDbOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.DELIVERED && o.getStatus() != OrderStatus.CANCELLED)
                .toList();
        BigDecimal activePipelineUsd = livePipelineOrders.stream()
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingQuotationCount = quotationRepository.findAll().stream()
                .filter(Quotation::isActive)
                .filter(q -> q.getStatus() == QuotationStatus.REQUESTED || q.getStatus() == QuotationStatus.SENT)
                .count();

        List<QualityInspection> activeInspections = qualityInspectionRepository.findAll().stream()
                .filter(QualityInspection::isActive)
                .toList();
        long pendingInspectionsCount = activeInspections.stream()
                .filter(q -> q.getStatus() == InspectionStatus.PENDING || q.getStatus() == InspectionStatus.REQUIRES_REINSPECTION)
                .count();
        long passedInspectionsCount = activeInspections.stream()
                .filter(q -> q.getStatus() == InspectionStatus.PASSED || q.getStatus() == InspectionStatus.PARTIALLY_PASSED)
                .count();
        long evaluatedInspectionsCount = activeInspections.stream()
                .filter(q -> q.getStatus() != InspectionStatus.PENDING && q.getStatus() != InspectionStatus.REQUIRES_REINSPECTION)
                .count();
        double qcPassRatePercent = evaluatedInspectionsCount > 0
                ? Math.round((passedInspectionsCount * 1000.0) / evaluatedInspectionsCount) / 10.0
                : 0.0;

        long activeColdStorageBatchCount = fruitBatchRepository.findAll().stream()
                .filter(FruitBatch::isActive)
                .filter(b -> b.getStatus() == BatchStatus.IN_COLD_STORAGE
                        || b.getStatus() == BatchStatus.PACKAGED
                        || b.getStatus() == BatchStatus.CREATED)
                .count();

        List<Shipment> activeDbShipments = shipmentRepository.findAll().stream()
                .filter(Shipment::isActive)
                .toList();
        long activeShipmentCount = activeDbShipments.stream()
                .filter(s -> s.getStatus() != ShipmentStatus.DELIVERED && s.getStatus() != ShipmentStatus.CANCELLED)
                .count();
        for (Shipment shipment : activeDbShipments) {
            if (shipment.getStatus() == ShipmentStatus.CANCELLED) continue;
            addIfNonBlank(destinations, shipment.getDestinationPort());
            addIfNonBlank(destinations, shipment.getDestinationCountry());
        }

        List<LandingOverviewDto.ShipmentRouteSnapshotDto> activeLanes = activeDbShipments.stream()
                .filter(s -> s.getStatus() != ShipmentStatus.CANCELLED)
                .map(s -> LandingOverviewDto.ShipmentRouteSnapshotDto.builder()
                        .originPort(s.getOriginPort())
                        .destinationPort(s.getDestinationPort())
                        .destinationCountry(s.getDestinationCountry())
                        .status(s.getStatus().name())
                        .shippingCompany(s.getShippingCompany())
                        .expectedDelivery(s.getExpectedDelivery())
                        .build())
                .toList();

        List<TemperatureReading> readings = temperatureReadingRepository.findAll().stream()
                .filter(TemperatureReading::isActive)
                .toList();
        Double latestTemperatureCelsius = readings.stream()
                .filter(r -> r.getTimestamp() != null && r.getTemperature() != null)
                .max(Comparator.comparing(TemperatureReading::getTimestamp))
                .map(r -> r.getTemperature().doubleValue())
                .orElse(null);

        return LandingOverviewDto.builder()
                .serverTimestamp(Instant.now())
                .activeFruitCount((int) catalogPage.getTotalElements())
                .activeVarietyCount(activeVarietyCount)
                .totalCatalogStockKg(totalCatalogStockKg)
                .totalWarehouseInventoryKg(totalWarehouseInventoryKg)
                .activeSupplierCount(activeSuppliers.size())
                .activeWarehouseCount(activeWarehouses.size())
                .totalWarehouseCapacityMt(totalWarehouseCapacityMt)
                .activeBuyerCount(activeBuyers.size())
                .totalOrdersCount(activeDbOrders.size())
                .activeOrdersCount(livePipelineOrders.size())
                .activeOrderPipelineUsd(activePipelineUsd)
                .pendingQuotationCount(pendingQuotationCount)
                .totalInspectionsCount(activeInspections.size())
                .passedInspectionsCount(passedInspectionsCount)
                .pendingInspectionsCount(pendingInspectionsCount)
                .qcPassRatePercent(qcPassRatePercent)
                .activeColdStorageBatchCount(activeColdStorageBatchCount)
                .activeShipmentCount(activeShipmentCount)
                .totalShipmentCount(activeDbShipments.size())
                .temperatureReadingCount(readings.size())
                .latestTemperatureCelsius(latestTemperatureCelsius)
                .activeOrigins(List.copyOf(origins))
                .exportDestinations(List.copyOf(destinations))
                .warehouses(warehouseSnapshots)
                .activeLanes(activeLanes)
                .featuredProduce(activeFruits)
                .build();
    }

    private void addIfNonBlank(Set<String> target, String value) {
        if (value != null && !value.isBlank()) {
            target.add(value.trim());
        }
    }
}
