package com.fieldex.publicapi;

import com.fieldex.buyer.catalog.CatalogFruitDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Public, non-PII live platform metrics and active catalog snapshot for the landing page.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LandingOverviewDto {
    private Instant serverTimestamp;
    private int activeFruitCount;
    private int activeVarietyCount;
    private double totalCatalogStockKg;
    private double totalWarehouseInventoryKg;
    private int activeSupplierCount;
    private int activeWarehouseCount;
    private double totalWarehouseCapacityMt;
    private int activeBuyerCount;
    private long totalOrdersCount;
    private long activeOrdersCount;
    private BigDecimal activeOrderPipelineUsd;
    private long pendingQuotationCount;
    private long totalInspectionsCount;
    private long passedInspectionsCount;
    private long pendingInspectionsCount;
    private double qcPassRatePercent;
    private long activeColdStorageBatchCount;
    private long activeShipmentCount;
    private long totalShipmentCount;
    private long temperatureReadingCount;
    private Double latestTemperatureCelsius;
    private List<String> activeOrigins;
    private List<String> exportDestinations;
    private List<WarehouseSnapshotDto> warehouses;
    private List<ShipmentRouteSnapshotDto> activeLanes;
    private List<CatalogFruitDto> featuredProduce;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseSnapshotDto {
        private String name;
        private String location;
        private String type;
        private Double capacityMt;
        private Double minTemperatureCelsius;
        private Double maxTemperatureCelsius;
        private Double minHumidityPercent;
        private Double maxHumidityPercent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShipmentRouteSnapshotDto {
        private String originPort;
        private String destinationPort;
        private String destinationCountry;
        private String status;
        private String shippingCompany;
        private OffsetDateTime expectedDelivery;
    }
}
