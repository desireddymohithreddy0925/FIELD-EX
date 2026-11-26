package com.fieldex.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsOverviewDto {
    private long totalOrders;
    private long activeOrders;
    private long deliveredOrders;
    private long cancelledOrders;
    private BigDecimal totalOrderValue;
    private BigDecimal deliveredRevenue;

    private long totalQuotations;
    private long pendingQuotations;
    private long acceptedQuotations;

    private long totalProcurementOrders;
    private BigDecimal totalProcurementSpend;

    private long totalInspections;
    private long approvedInspections;
    private double qcPassRatePercent;

    private long totalShipments;
    private long inTransitShipments;
    private long deliveredShipments;

    private long totalWarehouses;
    private double totalWarehouseCapacityMt;
    private BigDecimal totalInventoryKg;
    private BigDecimal availableInventoryKg;
    private BigDecimal reservedInventoryKg;

    private long totalBuyers;
    private long totalSuppliers;
    private long activeVarieties;
    private long coldChainExcursions;

    private Map<String, Long> ordersByStatus;
    private Map<String, Long> shipmentsByStatus;
    private List<FruitVolumeDto> topProduceVolumes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FruitVolumeDto {
        private String fruitName;
        private BigDecimal totalQuantityKg;
        private BigDecimal totalValueUsd;
    }
}
