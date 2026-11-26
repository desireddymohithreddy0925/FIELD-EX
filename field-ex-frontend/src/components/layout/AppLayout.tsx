import { useState } from "react"
import { Outlet, NavLink, Link, useLocation } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import { LogOut, Sprout, Shield, ArrowUpRight, ChevronRight, Home, KeyRound, X, CheckCircle2, AlertCircle } from "lucide-react"
import { useAuth } from "../../context/auth-context"
import { authService } from "../../services/auth.service"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

export interface NavItem {
  name: string
  path: string
  icon: LucideIcon
}

interface AppLayoutProps {
  navItems: NavItem[]
  title: string
}

function formatSegment(segment: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return "Details"
  }
  if (/^\d+$/.test(segment)) return `#${segment}`
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function AppLayout({ navItems, title }: AppLayoutProps) {
  const { logout, roles, email } = useAuth()
  const { pathname } = useLocation()
  const primaryRole = roles[0] || title.toUpperCase()

  const [pwdModalOpen, setPwdModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwdSubmitting, setPwdSubmitting] = useState(false)
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null)

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdError(null)
    setPwdSuccess(null)
    if (newPassword.length < 6) {
      setPwdError("New password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPwdError("New password and confirmation do not match.")
      return
    }
    try {
      setPwdSubmitting(true)
      await authService.changePassword({ currentPassword, newPassword })
      setPwdSuccess("Password updated successfully.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => {
        setPwdModalOpen(false)
        setPwdSuccess(null)
      }, 1200)
    } catch (err: any) {
      setPwdError(err.response?.data?.message || err.response?.data?.error || "Failed to update password.")
    } finally {
      setPwdSubmitting(false)
    }
  }

  const segments = pathname.split("/").filter(Boolean)
  const portalBasePath = segments.length > 0 ? `/${segments[0]}` : "/"
  const matchedNavItem = navItems.find((item) => item.path === pathname)
  const extraSegments = segments.slice(1)

  const breadcrumbs: { label: string; to?: string }[] = [
    { label: "FIELD-EX", to: "/" },
    { label: `${title} Portal`, to: portalBasePath },
  ]

  if (matchedNavItem) {
    breadcrumbs.push({ label: matchedNavItem.name })
  } else if (extraSegments.length > 0) {
    extraSegments.forEach((segment, idx) => {
      const targetPath = `/${segments.slice(0, idx + 2).join("/")}`
      const navMatch = navItems.find((item) => item.path === targetPath)
      const isLast = idx === extraSegments.length - 1
      breadcrumbs.push({
        label: navMatch ? navMatch.name : formatSegment(segment),
        to: isLast ? undefined : targetPath,
      })
    })
  }

  return (
    <div className="flex h-screen bg-background font-sans text-foreground antialiased selection:bg-tertiary/20 selection:text-foreground">
      {/* Sidebar */}
      <aside className="w-68 bg-card border-r border-border flex flex-col shadow-[1px_0_12px_rgba(30,40,30,0.03)] z-20">
        {/* Brand Area */}
        <div className="p-5 border-b border-border/80 bg-background/50">
          <Link to="/" className="group flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm ring-1 ring-border group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-5 h-5 text-agro-wheat" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-heading font-extrabold tracking-tight text-foreground">
                  FIELD<span className="text-secondary">-EX</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                  B2B
                </span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">
                Agro-Export Platform
              </span>
            </div>
          </Link>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {title} Console
            </span>
            <Badge variant="olive" className="text-[10px] px-2 py-0 font-medium">
              Live Network
            </Badge>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path.split('/').length <= 2}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? "text-agro-wheat" : "text-muted-foreground group-hover:text-foreground"
                    }`} />
                    <span className="flex-1 truncate">{item.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-agro-wheat" />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User Identity & Logout */}
        <div className="p-3 border-t border-border/80 bg-background/60">
          <div className="p-3 rounded-xl bg-card border border-border shadow-soft flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-agro-linen border border-border flex items-center justify-center font-heading font-bold text-xs text-primary shadow-inner">
              {primaryRole.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate" title={email || "Operator Account"}>
                {email || "Operator Account"}
              </p>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-tertiary" />
                <span className="text-[11px] font-medium text-muted-foreground truncate">{primaryRole}</span>
              </div>
            </div>
            <button
              onClick={() => { setPwdError(null); setPwdSuccess(null); setPwdModalOpen(true); }}
              title="Change Password"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
            </button>
            <button 
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-muted-foreground">
            <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
              <span>Public Portal</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
            <span className="text-[10px] text-muted-foreground/80">v2.4 Agro-Suite</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-background">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-10 min-h-16 border-b border-border bg-card/85 backdrop-blur-md px-6 sm:px-8 py-2.5 flex items-center justify-between gap-4 shadow-soft">
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1
                return (
                  <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5 min-w-0">
                    {index > 0 && (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" aria-hidden="true" />
                    )}
                    {isLast || !crumb.to ? (
                      <span
                        aria-current="page"
                        className="font-heading font-semibold text-foreground px-2.5 py-1 rounded-md bg-muted/60 border border-border/60 truncate"
                      >
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        to={crumb.to}
                        className="text-muted-foreground font-medium hover:text-foreground px-1.5 py-0.5 rounded-md hover:bg-muted/60 transition-colors truncate"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/60 border border-border text-xs text-foreground font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" aria-hidden="true" />
              <span className="text-muted-foreground">Cold-Chain Telemetry:</span>
              <span className="text-primary font-semibold">Online (99.8%)</span>
            </div>

            {/* Quick Public Link */}
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full border border-border bg-background/80 hover:bg-muted transition-colors"
            >
              <Home className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Home</span>
            </Link>
          </div>
        </header>

        {/* Viewport Content */}
        <div className="p-8 max-w-7xl w-full mx-auto flex-1">
          <Outlet />
        </div>
      </main>

      {pwdModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-heading font-bold text-foreground">Change Account Password</h3>
              </div>
              <button onClick={() => setPwdModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-4">
              {pwdError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pwdError}</span>
                </div>
              )}
              {pwdSuccess && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{pwdSuccess}</span>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Account
                </label>
                <Input value={email || ''} disabled className="bg-muted/40 text-xs font-mono" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Current Password
                </label>
                <Input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  New Password (min 6 characters)
                </label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setPwdModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={pwdSubmitting}>
                  {pwdSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
