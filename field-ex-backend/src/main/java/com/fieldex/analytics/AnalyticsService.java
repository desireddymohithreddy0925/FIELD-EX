package com.fieldex.analytics;

import com.fieldex.analytics.dto.AnalyticsOverviewDto;
import com.fieldex.buyer.Buyer;
import com.fieldex.buyer.BuyerRepository;
import com.fieldex.coldchain.ColdChainEvent;
import com.fieldex.coldchain.ColdChainEventRepository;
import com.fieldex.coldchain.ColdChainEventType;
import com.fieldex.fruit.FruitVariety;
import com.fieldex.fruit.FruitVarietyRepository;
import com.fieldex.inventory.Inventory;
import com.fieldex.inventory.InventoryRepository;
import com.fieldex.order.Order;
import com.fieldex.order.OrderItem;
import com.fieldex.order.OrderRepository;
import com.fieldex.order.OrderStatus;
import com.fieldex.procurement.ProcurementOrder;
import com.fieldex.procurement.ProcurementOrderRepository;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final QuotationRepository quotationRepository;
    private final ProcurementOrderRepository procurementOrderRepository;
    private final QualityInspectionRepository qualityInspectionRepository;
    private final ShipmentRepository shipmentRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;
    private final BuyerRepository buyerRepository;
    private final SupplierRepository supplierRepository;
    private final FruitVarietyRepository fruitVarietyRepository;
    private final ColdChainEventRepository coldChainEventRepository;

    @Transactional(readOnly = true)
    public AnalyticsOverviewDto getOverview() {
        List<Order> orders = orderRepository.findAll().stream().filter(Order::isActive).toList();
        List<Quotation> quotations = quotationRepository.findAll().stream().filter(Quotation::isActive).toList();
        List<ProcurementOrder> procurements = procurementOrderRepository.findAll().stream().filter(ProcurementOrder::isActive).toList();
        List<QualityInspection> inspections = qualityInspectionRepository.findAll().stream().filter(QualityInspection::isActive).toList();
        List<Shipment> shipments = shipmentRepository.findAll().stream().filter(Shipment::isActive).toList();
        List<Warehouse> warehouses = warehouseRepository.findAll().stream().filter(Warehouse::isActive).toList();
        List<Inventory> inventories = inventoryRepository.findAll().stream().filter(Inventory::isActive).toList();
        List<ColdChainEvent> events = coldChainEventRepository.findAll().stream().filter(ColdChainEvent::isActive).toList();

        long deliveredOrders = orders.stream().filter(o -> o.getStatus() == OrderStatus.DELIVERED).count();
        long cancelledOrders = orders.stream().filter(o -> o.getStatus() == OrderStatus.CANCELLED).count();
        long activeOrders = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.DELIVERED && o.getStatus() != OrderStatus.CANCELLED)
                .count();

        BigDecimal totalOrderValue = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getTotalAmount() != null)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal deliveredRevenue = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED && o.getTotalAmount() != null)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus s : OrderStatus.values()) {
            long c = orders.stream().filter(o -> o.getStatus() == s).count();
            if (c > 0) ordersByStatus.put(s.name(), c);
        }

        Map<String, BigDecimal> volumeByFruit = new HashMap<>();
        Map<String, BigDecimal> valueByFruit = new HashMap<>();
        for (Order order : orders) {
            if (order.getStatus() == OrderStatus.CANCELLED || order.getItems() == null) continue;
            for (OrderItem item : order.getItems()) {
                String name = item.getFruit() != null ? item.getFruit().getName() : "Other";
                BigDecimal qty = item.getQuantity() != null ? item.getQuantity() : BigDecimal.ZERO;
                BigDecimal lineVal = item.getLineTotal() != null
                        ? item.getLineTotal()
                        : (item.getUnitPrice() != null ? item.getUnitPrice().multiply(qty) : BigDecimal.ZERO);
                volumeByFruit.merge(name, qty, BigDecimal::add);
                valueByFruit.merge(name, lineVal, BigDecimal::add);
            }
        }

        List<AnalyticsOverviewDto.FruitVolumeDto> topProduce = volumeByFruit.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue(Comparator.reverseOrder()))
                .limit(8)
                .map(e -> AnalyticsOverviewDto.FruitVolumeDto.builder()
                        .fruitName(e.getKey())
                        .totalQuantityKg(e.getValue())
                        .totalValueUsd(valueByFruit.getOrDefault(e.getKey(), BigDecimal.ZERO))
                        .build())
                .toList();

        long pendingQuotes = quotations.stream().filter(q -> q.getStatus() == QuotationStatus.REQUESTED || q.getStatus() == QuotationStatus.SENT).count();
        long acceptedQuotes = quotations.stream().filter(q -> q.getStatus() == QuotationStatus.ACCEPTED).count();

        BigDecimal totalProcurementSpend = procurements.stream()
                .map(p -> p.getTotalAmount() != null ? p.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long approvedInspections = inspections.stream()
                .filter(i -> i.getStatus() == InspectionStatus.PASSED || i.getStatus() == InspectionStatus.PARTIALLY_PASSED)
                .count();
        long completedInspections = inspections.stream()
                .filter(i -> i.getStatus() != InspectionStatus.PENDING)
                .count();
        double qcPassRate = completedInspections > 0
                ? Math.round((approvedInspections * 1000.0) / completedInspections) / 10.0
                : 100.0;

        long inTransitShipments = shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.IN_TRANSIT || s.getStatus() == ShipmentStatus.DISPATCHED || s.getStatus() == ShipmentStatus.CUSTOMS)
                .count();
        long deliveredShipments = shipments.stream().filter(s -> s.getStatus() == ShipmentStatus.DELIVERED).count();

        Map<String, Long> shipmentsByStatus = new LinkedHashMap<>();
        for (ShipmentStatus s : ShipmentStatus.values()) {
            long c = shipments.stream().filter(sh -> sh.getStatus() == s).count();
            if (c > 0) shipmentsByStatus.put(s.name(), c);
        }

        double totalCapMt = warehouses.stream()
                .mapToDouble(w -> w.getCapacity() != null ? w.getCapacity() : 0.0)
                .sum();
        BigDecimal totalInvKg = inventories.stream()
                .map(i -> i.getTotalQuantity() != null ? i.getTotalQuantity() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal availInvKg = inventories.stream()
                .map(i -> i.getAvailableQuantity() != null ? i.getAvailableQuantity() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal resInvKg = inventories.stream()
                .map(i -> i.getReservedQuantity() != null ? i.getReservedQuantity() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalBuyers = buyerRepository.findAll().stream().filter(Buyer::isActive).count();
        long totalSuppliers = supplierRepository.findAll().stream().filter(Supplier::isActive).count();
        long activeVarieties = fruitVarietyRepository.findAll().stream().filter(FruitVariety::isActive).count();
        long excursions = events.stream().filter(e -> e.getEventType() == ColdChainEventType.TEMPERATURE_EXCURSION).count();

        return AnalyticsOverviewDto.builder()
                .totalOrders(orders.size())
                .activeOrders(activeOrders)
                .deliveredOrders(deliveredOrders)
                .cancelledOrders(cancelledOrders)
                .totalOrderValue(totalOrderValue)
                .deliveredRevenue(deliveredRevenue)
                .totalQuotations(quotations.size())
                .pendingQuotations(pendingQuotes)
                .acceptedQuotations(acceptedQuotes)
                .totalProcurementOrders(procurements.size())
                .totalProcurementSpend(totalProcurementSpend)
                .totalInspections(inspections.size())
                .approvedInspections(approvedInspections)
                .qcPassRatePercent(qcPassRate)
                .totalShipments(shipments.size())
                .inTransitShipments(inTransitShipments)
                .deliveredShipments(deliveredShipments)
                .totalWarehouses(warehouses.size())
                .totalWarehouseCapacityMt(totalCapMt)
                .totalInventoryKg(totalInvKg)
                .availableInventoryKg(availInvKg)
                .reservedInventoryKg(resInvKg)
                .totalBuyers(totalBuyers)
                .totalSuppliers(totalSuppliers)
                .activeVarieties(activeVarieties)
                .coldChainExcursions(excursions)
                .ordersByStatus(ordersByStatus)
                .shipmentsByStatus(shipmentsByStatus)
                .topProduceVolumes(topProduce)
                .build();
    }
}
