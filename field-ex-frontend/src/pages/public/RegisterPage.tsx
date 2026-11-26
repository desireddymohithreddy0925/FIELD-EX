import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, Link } from "react-router-dom"
import { Sprout, ArrowLeft } from "lucide-react"
import { Button } from "../../components/ui/button"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { authService } from "../../services/auth.service"

const registerSchema = z.object({
  name: z.string().min(2, "Full name or company name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type RegisterRequest = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: RegisterRequest) => {
    setIsLoading(true)
    setError(null)
    try {
      await authService.register({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      })
      navigate("/login", { replace: true })
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.email ||
        "Registration failed. Please check your details."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-tertiary/20 selection:text-foreground">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4 px-4 sm:px-0">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to FIELD-EX Overview
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-md ring-2 ring-border">
            <Sprout className="w-7 h-7 text-agro-wheat" />
          </div>
        </div>
        <h2 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
          Buyer Registration
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Join the FIELD-EX Global Agro-Import Network
        </p>
      </div>

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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Full Name / Organization
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Global Fresh Imports" 
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="buyer@importcompany.com" 
                        {...field} 
                        className="bg-background/60 border-border focus-visible:ring-tertiary"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <p className="text-[11px] text-muted-foreground bg-muted/40 border border-border rounded-lg p-2.5">
                All self-registered accounts start with <strong>Buyer</strong> access. Operational staff roles (Manager, QC Inspector, Logistics) are assigned afterwards by the System Administrator.
              </p>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Password (min. 6 characters)
                    </FormLabel>
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
                {isLoading ? "Creating Account..." : "Create Buyer Account"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-primary hover:text-secondary underline underline-offset-4">
              Sign in to your console
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
