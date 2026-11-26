import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../context/auth-context"

interface RoleRouteProps {
  allowedRoles: string[]
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { hasRole, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Administrators have global superuser visibility across all portals & views ("admin can see everything what is happening")
  const isAuthorized = hasRole('ADMIN') || allowedRoles.some((role) => hasRole(role))

  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
