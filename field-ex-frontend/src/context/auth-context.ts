import { createContext, useContext } from "react"

export interface AuthContextType {
  token: string | null
  roles: string[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => void
  logout: () => void
  hasRole: (role: string) => boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
