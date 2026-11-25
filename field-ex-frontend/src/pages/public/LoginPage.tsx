import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { Sprout, ArrowLeft, KeyRound } from "lucide-react"
import { Button } from "../../components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { authService, loginSchema, type LoginRequest } from "../../services/auth.service"
import { useAuth } from "../../context/AuthContext"

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const from = location.state?.from?.pathname || "/"

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.login(data)
      login(response.token)
      setTimeout(() => {
        if (from === "/") {
          const rolePathMap: Record<string, string> = {
            ADMIN: "/admin",
            BUYER: "/buyer",
            QC_INSPECTOR: "/qc",
            ENGINEER: "/engineer",
            LOGISTICS: "/logistics",
            MANAGER: "/manager",
            EDITOR: "/editor",
          }
          const destination = response.role ? (rolePathMap[response.role] || "/") : "/"
          navigate(destination, { replace: true })
        } else {
          navigate(from, { replace: true })
        }
      }, 100)
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.email ||
        "Invalid credentials. Please verify username and password."
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const setPreset = (username: string, password = "password123") => {
    form.setValue("username", username)
    form.setValue("password", password)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-tertiary/20 selection:text-foreground">
      {/* Back button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4 px-4 sm:px-0">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to FIELD-EX Overview
        </Link>
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-md ring-2 ring-border">
            <Sprout className="w-7 h-7 text-agro-wheat" />
          </div>
        </div>
        <h2 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
          FIELD<span className="text-secondary">-EX</span> Console
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          B2B Agro-Export & Supply Chain Portal
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-card py-8 px-6 sm:px-8 shadow-card rounded-2xl border border-border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-xl flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Username / Email
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="operator@field-ex.com" 
                        {...field} 
                        className="bg-background/60 border-border focus-visible:ring-tertiary"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Password
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="bg-background/60 border-border focus-visible:ring-tertiary"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-11 font-semibold text-sm shadow-sm" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Sign in to Console"}
              </Button>
            </form>
          </Form>

          {/* Quick Demo Accounts Selection */}
          <div className="mt-6 pt-5 border-t border-border/80">
            <div className="flex items-center gap-1.5 mb-2.5">
              <KeyRound className="w-3.5 h-3.5 text-tertiary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Preset Fill
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPreset("admin@field-ex.com")}
                className="p-2 rounded-lg bg-background hover:bg-muted border border-border text-left transition-colors"
              >
                <p className="font-semibold text-foreground">Admin</p>
                <p className="text-[10px] text-muted-foreground truncate">admin@field-ex.com</p>
              </button>

              <button
                type="button"
                onClick={() => setPreset("buyer@field-ex.com")}
                className="p-2 rounded-lg bg-background hover:bg-muted border border-border text-left transition-colors"
              >
                <p className="font-semibold text-foreground">Buyer</p>
                <p className="text-[10px] text-muted-foreground truncate">buyer@field-ex.com</p>
              </button>

              <button
                type="button"
                onClick={() => setPreset("manager@field-ex.com")}
                className="p-2 rounded-lg bg-background hover:bg-muted border border-border text-left transition-colors"
              >
                <p className="font-semibold text-foreground">Manager</p>
                <p className="text-[10px] text-muted-foreground truncate">manager@field-ex.com</p>
              </button>

              <button
                type="button"
                onClick={() => setPreset("editor@field-ex.com")}
                className="p-2 rounded-lg bg-background hover:bg-muted border border-border text-left transition-colors"
              >
                <p className="font-semibold text-foreground">Editor</p>
                <p className="text-[10px] text-muted-foreground truncate">editor@field-ex.com</p>
              </button>

              <button
                type="button"
                onClick={() => setPreset("qc@field-ex.com")}
                className="p-2 rounded-lg bg-background hover:bg-muted border border-border text-left transition-colors"
              >
                <p className="font-semibold text-foreground">QC Inspector</p>
                <p className="text-[10px] text-muted-foreground truncate">qc@field-ex.com</p>
              </button>

              <button
                type="button"
                onClick={() => setPreset("eng@field-ex.com")}
                className="p-2 rounded-lg bg-background hover:bg-muted border border-border text-left transition-colors"
              >
                <p className="font-semibold text-foreground">Engineer</p>
                <p className="text-[10px] text-muted-foreground truncate">eng@field-ex.com</p>
              </button>

              <button
                type="button"
                onClick={() => setPreset("logistics@field-ex.com")}
                className="p-2 rounded-lg bg-background hover:bg-muted border border-border text-left transition-colors col-span-2 sm:col-span-1"
              >
                <p className="font-semibold text-foreground">Logistics</p>
                <p className="text-[10px] text-muted-foreground truncate">logistics@field-ex.com</p>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-muted-foreground">
            Need a new international buyer account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:text-secondary underline underline-offset-4">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
