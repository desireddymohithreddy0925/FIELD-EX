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
  pricePerKg: number;
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

  // Admin Orders Management
  getAllOrders: async (params?: any): Promise<any> => {
    const res = await api.get('/v1/admin/orders', { params });
    return res.data;
  },

  transitionOrderStatus: async (orderId: string, targetStatus: string, notes?: string): Promise<void> => {
    await api.post(`/v1/admin/orders/${orderId}/transition`, null, {
      params: { targetStatus, notes },
    });
  },
};
