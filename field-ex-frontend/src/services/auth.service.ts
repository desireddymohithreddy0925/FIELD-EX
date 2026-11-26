import api from "./api"
import { z } from "zod"

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

export type LoginRequest = z.infer<typeof loginSchema>

export interface AuthResponse {
  token: string
  userId?: string
  name?: string
  email?: string
  role?: string
}

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>("/v1/auth/login", {
      email: data.username,
      username: data.username,
      password: data.password,
    })
    return response.data
  },

  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post<AuthResponse>("/v1/auth/register", data)
    return response.data
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const response = await api.post<{ message: string }>("/v1/auth/change-password", payload)
    return response.data
  },
}
