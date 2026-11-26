import { Link } from "react-router-dom"
import { ShieldAlert, ArrowLeft, Home } from "lucide-react"
import { Button } from "../../components/ui/button"
import { useAuth } from "../../context/AuthContext"

export function UnauthorizedPage() {
  const { hasRole, isAuthenticated } = useAuth()

  const getDashboardPath = () => {
    if (hasRole('ADMIN')) return '/admin'
    if (hasRole('MANAGER')) return '/manager'
    if (hasRole('QC_INSPECTOR')) return '/qc'
    if (hasRole('LOGISTICS')) return '/logistics'
    if (hasRole('BUYER')) return '/buyer'
    return '/'
  }

  const getRoleLabel = () => {
    if (hasRole('ADMIN')) return 'Administrator'
    if (hasRole('MANAGER')) return 'Operations Manager'
    if (hasRole('QC_INSPECTOR')) return 'QC Inspector'
    if (hasRole('LOGISTICS')) return 'Logistics Officer'
    if (hasRole('BUYER')) return 'Commercial Buyer'
    return 'Guest'
  }

  const dashboardPath = getDashboardPath()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-card p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-border">
        <div className="flex justify-center mb-6">
          <div className="bg-destructive/10 p-4 rounded-full">
            <ShieldAlert className="w-12 h-12 text-destructive" />
          </div>
        </div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-4">
          You do not have the required permissions to access this page.
        </p>

        {isAuthenticated && (
          <div className="mb-6 px-3 py-2 rounded-lg bg-muted/60 text-xs text-muted-foreground">
            Signed in as <span className="font-semibold text-foreground">{getRoleLabel()}</span>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {isAuthenticated && dashboardPath !== '/' && (
            <Link to={dashboardPath}>
              <Button className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" /> Go to Your Dashboard
              </Button>
            </Link>
          )}
          <Link to="/">
            <Button variant="outline" className="w-full gap-2">
              <Home className="w-4 h-4" /> Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
