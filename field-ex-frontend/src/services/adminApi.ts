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
};
