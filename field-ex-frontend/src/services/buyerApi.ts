import api from './api';

export interface Page<T> {
  content: T[];
  pageable: any;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: any;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export const buyerApi = {
  // Profile
  getMyProfile: () => api.get('/buyers/me').then(res => res.data),
  updateMyProfile: (data: any) => api.put('/buyers/me', data).then(res => res.data),

  // Catalog
  getFruits: (params?: any) => api.get<Page<any>>('/catalog/fruits', { params }).then(res => res.data),
  getFruitDetails: (id: string) => api.get(`/catalog/fruits/${id}`).then(res => res.data),
  createFruit: (data: any) => api.post('/catalog/fruits', data).then(res => res.data),
  updateFruit: (id: string, data: any) => api.put(`/catalog/fruits/${id}`, data).then(res => res.data),
  deleteFruit: (id: string) => api.delete(`/catalog/fruits/${id}`).then(res => res.data),
  createVariety: (fruitId: string, data: any) => api.post(`/catalog/fruits/${fruitId}/varieties`, data).then(res => res.data),
  updateVariety: (varietyId: string, data: any) => api.put(`/catalog/varieties/${varietyId}`, data).then(res => res.data),
  deleteVariety: (varietyId: string) => api.delete(`/catalog/varieties/${varietyId}`).then(res => res.data),
  
  // Quotations
  getQuotations: (page = 0, size = 10, status?: string) => 
    api.get<Page<any>>('/quotations/me', { params: { page, size, status } }).then(res => res.data),
  getQuotationDetails: (id: string) => api.get(`/quotations/me/${id}`).then(res => res.data),
  requestQuotation: (data: any) => api.post('/quotations/request', data).then(res => res.data),
  acceptQuotation: (id: string) => api.post(`/quotations/me/${id}/accept`).then(res => res.data),
  rejectQuotation: (id: string) => api.post(`/quotations/me/${id}/reject`).then(res => res.data),

  // Orders
  getOrders: (page = 0, size = 10, status?: string) => 
    api.get<any>('/v1/orders/me', { params: { page, size, status } }).then(res => res.data),
  getOrderDetails: (id: string) => api.get(`/v1/orders/${id}`).then(res => res.data),
  createOrderFromQuotation: (quotationId: string) => 
    api.post(`/v1/orders/from-quotation/${quotationId}`).then(res => res.data),
  confirmOrderDelivered: (id: string, notes?: string) =>
    api.post(`/v1/orders/${id}/confirm-delivery`, null, { params: { notes } }).then(res => res.data),
  
  // Shipments
  getMyShipments: () => api.get('/v1/shipments/me').then(res => res.data),
  getOrderShipments: (orderId: string) => api.get(`/v1/shipments/order/${orderId}`).then(res => res.data),

  // Documents
  getMyDocuments: () => api.get('/v1/documents/me').then(res => res.data),
  getOrderDocuments: (orderId: string) => api.get(`/v1/documents/order/${orderId}`).then(res => res.data),

  // Customs
  getOrderCustoms: (orderId: string) => api.get(`/v1/customs/orders/${orderId}`).then(res => res.data),

  // Notifications
  getMyNotifications: () => api.get('/v1/notifications/me').then(res => res.data),
};
