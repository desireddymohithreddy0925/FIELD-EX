import { useState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import { jwtDecode } from "jwt-decode"
import api from "../services/api"
import { AuthContext } from "./auth-context"

interface JwtPayload {
  sub: string
  roles: string[]
  exp: number
}

function getInitialAuthState(): { token: string | null; roles: string[] } {
  const storedToken = localStorage.getItem("token")
  if (!storedToken) {
    return { token: null, roles: [] }
  }
  try {
    const decoded = jwtDecode<JwtPayload>(storedToken)
    if (decoded.exp * 1000 > Date.now()) {
      return { token: storedToken, roles: decoded.roles || [] }
    }
    localStorage.removeItem("token")
  } catch {
    localStorage.removeItem("token")
  }
  return { token: null, roles: [] }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<{ token: string | null; roles: string[] }>(getInitialAuthState)

  const login = useCallback((newToken: string) => {
    localStorage.setItem("token", newToken)
    const decoded = jwtDecode<JwtPayload>(newToken)
    setAuthState({ token: newToken, roles: decoded.roles || [] })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    setAuthState({ token: null, roles: [] })
    // Redirect handled by ProtectedRoute or can force reload
    window.location.href = '/login'
  }, [])

  // Hook into axios to handle 401s
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout()
        }
        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.response.eject(interceptor)
    }
  }, [logout])

  const hasRole = useCallback(
    (role: string) => {
      return authState.roles.includes(`ROLE_${role}`) || authState.roles.includes(role)
    },
    [authState.roles]
  )

  return (
    <AuthContext.Provider
      value={{
        token: authState.token,
        roles: authState.roles,
        isAuthenticated: !!authState.token,
        isLoading: false,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
