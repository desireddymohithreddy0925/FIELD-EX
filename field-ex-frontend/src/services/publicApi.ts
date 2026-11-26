import axios from 'axios';

export interface LandingCatalogVariety {
  id: string;
  name: string;
  shelfLifeDays?: number;
  minStorageTemperature?: number;
  maxStorageTemperature?: number;
  grade?: string;
  brixLevel?: string;
  sizeProfile?: string;
  colorProfile?: string;
  description?: string;
  pricePerKg?: number | null;
  currency?: string;
  availableQuantity?: number | null;
  minOrderQuantity?: number | null;
  unit?: string;
  active: boolean;
}

export interface LandingCatalogFruit {
  id: string;
  name: string;
  description?: string;
  category?: string;
  origin?: string;
  season?: string;
  active: boolean;
  varieties: LandingCatalogVariety[];
}

export interface WarehouseSnapshot {
  name: string;
  location?: string;
  type: string;
  capacityMt?: number;
  minTemperatureCelsius?: number;
  maxTemperatureCelsius?: number;
  minHumidityPercent?: number;
  maxHumidityPercent?: number;
}

export interface ShipmentRouteSnapshot {
  originPort?: string;
  destinationPort?: string;
  destinationCountry?: string;
  status: string;
  shippingCompany?: string;
  expectedDelivery?: string;
}

export interface LandingOverview {
  serverTimestamp: string;
  activeFruitCount: number;
  activeVarietyCount: number;
  totalCatalogStockKg: number;
  totalWarehouseInventoryKg: number;
  activeSupplierCount: number;
  activeWarehouseCount: number;
  totalWarehouseCapacityMt: number;
  activeBuyerCount: number;
  totalOrdersCount: number;
  activeOrdersCount: number;
  activeOrderPipelineUsd: number;
  pendingQuotationCount: number;
  totalInspectionsCount: number;
  passedInspectionsCount: number;
  pendingInspectionsCount: number;
  qcPassRatePercent: number;
  activeColdStorageBatchCount: number;
  activeShipmentCount: number;
  totalShipmentCount: number;
  temperatureReadingCount: number;
  latestTemperatureCelsius?: number | null;
  activeOrigins: string[];
  exportDestinations: string[];
  warehouses: WarehouseSnapshot[];
  activeLanes: ShipmentRouteSnapshot[];
  featuredProduce: LandingCatalogFruit[];
}

const rawBase = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/+$/, '');
const apiV1Base = rawBase.endsWith('/v1') ? rawBase : `${rawBase}/v1`;

export const publicApi = {
  getLandingOverview: (): Promise<LandingOverview> =>
    axios.get<LandingOverview>(`${apiV1Base}/public/landing-overview`).then((res) => res.data),
};
