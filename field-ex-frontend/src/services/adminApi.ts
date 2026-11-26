import api from './api';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'BUYER' | 'QC_INSPECTOR' | 'LOGISTICS' | 'MANAGER';
  active: boolean;
  createdAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'BUYER' | 'QC_INSPECTOR' | 'LOGISTICS' | 'MANAGER';
}

export interface OrderStatusHistoryDto {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  notes: string;
  timestamp: string;
}

export interface CalendarEventDto {
  id: string;
  title: string;
  eventType: string;
  date: string;
  orderId?: string;
  orderNumber?: string;
  buyerName?: string;
  status?: string;
  details?: string;
  badgeColor?: string;
}

export interface PricingUpdatePayload {
  pricePerKg?: number;
  pricePerTonne?: number;
  currency: string;
  availableQuantity: number;
  minOrderQuantity: number;
  unit?: string;
}

export interface AuditLogDto {
  id: string;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: string;
  correlationId: string;
  timestamp: string;
}

export interface AdminQuotationUpdatePayload {
  currencyCode: string;
  packagingCost: number;
  transportationCost: number;
  exportHandlingCost: number;
  shippingCost: number;
  insuranceCost: number;
  discount: number;
  taxAmount: number;
  paymentTerms: string;
  validityDate: string;
  itemPrices: Record<string, number>;
}

export const adminApi = {
  getUsers: async (): Promise<UserDto[]> => {
    const res = await api.get<UserDto[]>('/v1/admin/users');
    return res.data;
  },

  assignRole: async (userId: string, role: string): Promise<UserDto> => {
    const res = await api.put<UserDto>(`/v1/admin/users/${userId}/role`, { role });
    return res.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<UserDto> => {
    const res = await api.post<UserDto>('/v1/admin/users', payload);
    return res.data;
  },

  toggleUserStatus: async (userId: string, active: boolean): Promise<UserDto> => {
    const res = await api.patch<UserDto>(`/v1/admin/users/${userId}/status?active=${active}`);
    return res.data;
  },

  // Order Lifecycle History
  getOrderHistory: async (orderId: string): Promise<OrderStatusHistoryDto[]> => {
    const res = await api.get<OrderStatusHistoryDto[]>(`/v1/admin/orders/${orderId}/history`);
    return res.data;
  },

  // Operational Calendar Events
  getCalendarEvents: async (): Promise<CalendarEventDto[]> => {
    const res = await api.get<CalendarEventDto[]>('/v1/calendar/events');
    return res.data;
  },

  // Variety Pricing & Inventory
  updatePricing: async (varietyId: string, payload: PricingUpdatePayload): Promise<any> => {
    const res = await api.patch(`/v1/catalog/varieties/${varietyId}/pricing`, payload);
    return res.data;
  },

  updateVarietySpecs: async (varietyId: string, payload: any): Promise<any> => {
    const res = await api.put(`/v1/catalog/varieties/${varietyId}`, payload);
    return res.data;
  },

  // Audit Logs (Real-time Watchdog)
  getRecentAuditLogs: async (): Promise<AuditLogDto[]> => {
    const res = await api.get<AuditLogDto[]>('/v1/admin/audit/recent');
    return res.data;
  },

  getAuditLogs: async (page = 0, size = 50): Promise<any> => {
    const res = await api.get('/v1/admin/audit/logs', { params: { page, size } });
    return res.data;
  },

  // Admin & Manager Orders Management
  getAllOrders: async (params?: any): Promise<any> => {
    const res = await api.get('/v1/admin/orders', { params });
    return res.data;
  },

  transitionOrderStatus: async (orderId: string, targetStatus: string, notes?: string): Promise<void> => {
    await api.post(`/v1/admin/orders/${orderId}/transition`, null, {
      params: { targetStatus, notes },
    });
  },

  acceptOrder: async (orderId: string, notes?: string): Promise<any> => {
    const res = await api.post(`/v1/admin/orders/${orderId}/accept`, null, {
      params: { notes },
    });
    return res.data;
  },

  rejectOrder: async (orderId: string, notes?: string): Promise<any> => {
    const res = await api.post(`/v1/admin/orders/${orderId}/reject`, null, {
      params: { notes },
    });
    return res.data;
  },

  // Admin & Manager Quotations Pricing & Management
  getAllQuotations: async (status?: string): Promise<any> => {
    const res = await api.get('/v1/admin/quotations', {
      params: status && status !== 'ALL' ? { status, size: 100 } : { size: 100 },
    });
    return res.data;
  },

  updateAndSendQuotation: async (id: string, payload: AdminQuotationUpdatePayload): Promise<any> => {
    const res = await api.put(`/v1/admin/quotations/${id}/send`, payload);
    return res.data;
  },

  // Logistics & Shipments
  getShipments: async (): Promise<any> => {
    const res = await api.get('/v1/shipments', { params: { size: 100 } });
    return res.data;
  },

  createShipmentForOrder: async (orderId: string): Promise<any> => {
    const res = await api.post(`/v1/shipments/orders/${orderId}`);
    return res.data;
  },

  updateShipmentDetails: async (shipmentId: string, payload: any): Promise<any> => {
    const res = await api.put(`/v1/shipments/${shipmentId}`, payload);
    return res.data;
  },

  updateShipmentStatus: async (shipmentId: string, status: string, remarks?: string): Promise<any> => {
    const res = await api.patch(`/v1/shipments/${shipmentId}/status`, null, { params: { status, remarks } });
    return res.data;
  },

  // Suppliers
  getSuppliers: async (): Promise<any> => {
    const res = await api.get('/v1/suppliers', { params: { size: 100 } });
    return res.data;
  },

  createSupplier: async (payload: any): Promise<any> => {
    const res = await api.post('/v1/suppliers', payload);
    return res.data;
  },

  activateSupplier: async (id: string): Promise<void> => {
    await api.patch(`/v1/suppliers/${id}/activate`);
  },

  deactivateSupplier: async (id: string): Promise<void> => {
    await api.patch(`/v1/suppliers/${id}/deactivate`);
  },

  // Buyers Directory
  getBuyers: async (): Promise<any[]> => {
    const res = await api.get<any[]>('/v1/buyers');
    return res.data;
  },

  // Procurement
  getProcurementOrders: async (): Promise<any> => {
    const res = await api.get('/v1/procurement', { params: { size: 100 } });
    return res.data;
  },

  createProcurementOrder: async (payload: any): Promise<any> => {
    const res = await api.post('/v1/procurement', payload);
    return res.data;
  },

  updateProcurementStatus: async (id: string, status: string, notes?: string): Promise<any> => {
    const res = await api.patch(`/v1/procurement/${id}/status`, { status, notes });
    return res.data;
  },

  // Quality Control
  getQualityInspections: async (): Promise<any> => {
    const res = await api.get('/v1/quality', { params: { size: 100 } });
    return res.data;
  },

  createQualityInspection: async (payload: any): Promise<any> => {
    const res = await api.post('/v1/quality', payload);
    return res.data;
  },

  updateQualityStatus: async (id: string, status: string, notes?: string): Promise<any> => {
    const res = await api.patch(`/v1/quality/${id}/status`, { status, notes });
    return res.data;
  },

  // Fruit Batches
  getBatches: async (): Promise<any> => {
    const res = await api.get('/v1/batches', { params: { size: 100 } });
    return res.data;
  },

  createBatch: async (payload: any): Promise<any> => {
    const res = await api.post('/v1/batches', payload);
    return res.data;
  },

  updateBatchStatus: async (id: string, status: string, notes?: string): Promise<any> => {
    const res = await api.patch(`/v1/batches/${id}/status`, { status, notes });
    return res.data;
  },

  // Warehouses & Storage Locations
  getWarehouses: async (): Promise<any> => {
    const res = await api.get('/v1/warehouses', { params: { size: 100 } });
    return res.data;
  },

  createWarehouse: async (payload: any): Promise<any> => {
    const res = await api.post('/v1/warehouses', payload);
    return res.data;
  },

  getStorageLocations: async (warehouseId: string): Promise<any[]> => {
    const res = await api.get<any[]>(`/v1/warehouses/${warehouseId}/locations`);
    return res.data;
  },

  createStorageLocation: async (warehouseId: string, payload: any): Promise<any> => {
    const res = await api.post(`/v1/warehouses/${warehouseId}/locations`, payload);
    return res.data;
  },

  // Inventory
  getInventories: async (): Promise<any> => {
    const res = await api.get('/v1/inventory', { params: { size: 100 } });
    return res.data;
  },

  receiveBatchInventory: async (batchId: string, payload: { quantity: number; reason?: string; reference?: string }, storageLocationId?: string): Promise<any> => {
    const res = await api.post(`/v1/inventory/batch/${batchId}/receive`, payload, {
      params: storageLocationId ? { storageLocationId } : undefined,
    });
    return res.data;
  },

  reserveInventory: async (id: string, payload: { quantity: number; reason?: string; reference?: string }): Promise<any> => {
    const res = await api.post(`/v1/inventory/${id}/reserve`, payload);
    return res.data;
  },

  releaseInventory: async (id: string, payload: { quantity: number; reason?: string; reference?: string }): Promise<any> => {
    const res = await api.post(`/v1/inventory/${id}/release`, payload);
    return res.data;
  },

  packInventory: async (id: string, payload: { quantity: number; reason?: string; reference?: string }): Promise<any> => {
    const res = await api.post(`/v1/inventory/${id}/pack`, payload);
    return res.data;
  },

  getInventoryTransactions: async (id: string): Promise<any[]> => {
    const res = await api.get<any[]>(`/v1/inventory/${id}/transactions`);
    return res.data;
  },

  // Cold Chain
  getColdChainReadings: async (): Promise<any[]> => {
    const res = await api.get<any[]>('/v1/cold-chain/readings');
    return res.data;
  },

  getColdChainEvents: async (): Promise<any[]> => {
    const res = await api.get<any[]>('/v1/cold-chain/events');
    return res.data;
  },

  recordColdChainReading: async (payload: { batchId: string; warehouseId: string; temperature: number; humidity?: number; timestamp: string; source: string; notes?: string }): Promise<any> => {
    const res = await api.post('/v1/cold-chain/readings', payload);
    return res.data;
  },

  // Packaging
  getPackagingRecords: async (): Promise<any[]> => {
    const res = await api.get<any[]>('/v1/packaging');
    return res.data;
  },

  createPackagingRecord: async (payload: any): Promise<any> => {
    const res = await api.post('/v1/packaging', payload);
    return res.data;
  },

  updatePackagingStatus: async (id: string, status: string, notes?: string): Promise<any> => {
    const res = await api.put(`/v1/packaging/${id}/status`, { status, notes });
    return res.data;
  },

  // Export Documents
  getAllDocuments: async (): Promise<any[]> => {
    const res = await api.get<any[]>('/v1/documents');
    return res.data;
  },

  generateDocument: async (orderId: string, type: string): Promise<any> => {
    const res = await api.post(`/v1/documents/generate/${orderId}`, null, { params: { type } });
    return res.data;
  },

  downloadDocumentBlob: async (documentId: string): Promise<Blob> => {
    const res = await api.get(`/v1/documents/${documentId}/download`, { responseType: 'blob' });
    return res.data;
  },

  // Customs Clearance
  getAllCustomsClearances: async (): Promise<any[]> => {
    const res = await api.get<any[]>('/v1/customs');
    return res.data;
  },

  initiateCustoms: async (orderId: string): Promise<any> => {
    const res = await api.post(`/v1/customs/orders/${orderId}/initiate`);
    return res.data;
  },

  submitCustomsDeclaration: async (clearanceId: string, payload: any): Promise<any> => {
    const res = await api.post(`/v1/customs/clearance/${clearanceId}/submit`, payload);
    return res.data;
  },

  updateCustomsStatus: async (clearanceId: string, status: string, remarks?: string): Promise<any> => {
    const res = await api.patch(`/v1/customs/clearance/${clearanceId}/status`, null, { params: { status, remarks } });
    return res.data;
  },

  // Analytics Overview
  getAnalyticsOverview: async (): Promise<any> => {
    const res = await api.get('/v1/analytics/overview');
    return res.data;
  },
};
