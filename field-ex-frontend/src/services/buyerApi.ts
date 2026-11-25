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
  
  // Quotations
  getQuotations: (page = 0, size = 10, status?: string) => 
    api.get<Page<any>>('/quotations/me', { params: { page, size, status } }).then(res => res.data),
  getQuotationDetails: (id: string) => api.get(`/quotations/me/${id}`).then(res => res.data),
  requestQuotation: (data: any) => api.post('/quotations/request', data).then(res => res.data),
  acceptQuotation: (id: string) => api.post(`/quotations/me/${id}/accept`).then(res => res.data),
  rejectQuotation: (id: string) => api.post(`/quotations/me/${id}/reject`).then(res => res.data),

  // Orders
  getOrders: (page = 0, size = 10, status?: string) => 
    api.get<any>('/orders/me', { params: { page, size, status } }).then(res => res.data),
  getOrderDetails: (id: string) => api.get(`/orders/${id}`).then(res => res.data),
  
  // Shipments
  getMyShipments: () => api.get('/shipments/me').then(res => res.data),
  getOrderShipments: (orderId: string) => api.get(`/shipments/order/${orderId}`).then(res => res.data),

  // Documents
  getMyDocuments: () => api.get('/documents/me').then(res => res.data),
  getOrderDocuments: (orderId: string) => api.get(`/documents/order/${orderId}`).then(res => res.data),

  // Customs
  getOrderCustoms: (orderId: string) => api.get(`/customs/orders/${orderId}`).then(res => res.data),

  // Notifications
  getMyNotifications: () => api.get('/notifications/me').then(res => res.data),
};
