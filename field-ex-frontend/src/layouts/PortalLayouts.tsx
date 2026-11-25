import { Link } from "react-router-dom"
import { 
  LayoutDashboard, Users, Tractor, Globe, Settings, ClipboardCheck, PackageSearch, 
  Truck, FileText, Bell, Ship, Building, BookOpen, Warehouse, 
  Thermometer, Archive, BarChart, History, Box, ShieldCheck, CheckSquare, AlertTriangle, 
  Clock, Sprout, ArrowRight, Sparkles, ChevronRight
} from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"

// --- Public Layout (High-End Agro-Export Platform Landing) ---
export function PublicLayout() {
  const portals = [
    {
      title: "International Buyer Portal",
      description: "Browse live fruit catalogs, request spot/contract quotations, review proforma invoices, and track container transit.",
      path: "/buyer",
      role: "BUYER",
      badge: "Commercial Portal",
      badgeVariant: "olive" as const,
      icon: Globe,
      color: "border-agro-sage/40 bg-card hover:border-agro-olive",
    },
    {
      title: "Operations & Admin Hub",
      description: "Enterprise command center for supplier onboarding, catalog pricing, procurement orders, and executive metrics.",
      path: "/admin",
      role: "ADMIN",
      badge: "HQ Command",
      badgeVariant: "clay" as const,
      icon: LayoutDashboard,
      color: "border-agro-clay/40 bg-card hover:border-agro-terracotta",
    },
    {
      title: "Quality Inspection & QC",
      description: "Field and warehouse inspection consoles: Brix sweetness ratings, defect thresholds, and GlobalGAP compliance.",
      path: "/qc",
      role: "QC_INSPECTOR",
      badge: "Quality Lab",
      badgeVariant: "forest" as const,
      icon: ShieldCheck,
      color: "border-agro-forest/40 bg-card hover:border-primary",
    },
    {
      title: "Logistics & Cold-Chain",
      description: "Container packaging, cold-storage telemetry, export bill of ladings, customs clearance, and port dispatch.",
      path: "/logistics",
      role: "LOGISTICS",
      badge: "Freight Engine",
      badgeVariant: "wheat" as const,
      icon: Ship,
      color: "border-agro-wheat/40 bg-card hover:border-agro-ochre",
    },
    {
      title: "Operations & Manager Hub",
      description: "Pipeline governance, order approvals, inventory allocation, and fulfillment workflow velocity.",
      path: "/manager",
      role: "MANAGER",
      badge: "Operations Command",
      badgeVariant: "forest" as const,
      icon: LayoutDashboard,
      color: "border-agro-forest/40 bg-card hover:border-primary",
    },
    {
      title: "Produce & Variety Editor",
      description: "Manage fresh produce lines, fruit varieties, Brix sweetness ratings, and harvest seasons.",
      path: "/editor",
      role: "EDITOR",
      badge: "Editorial Desk",
      badgeVariant: "clay" as const,
      icon: BookOpen,
      color: "border-agro-clay/40 bg-card hover:border-agro-terracotta",
    },
  ]

  const pillars = [
    {
      icon: Tractor,
      title: "Farm Procurement & Aggregation",
      description: "Direct ties with certified farming clusters across Maharashtra, Karnataka, and Gujarat. Real-time lot tracking right at harvest.",
      tag: "Harvest Source",
    },
    {
      icon: Thermometer,
      title: "Cold-Chain Integrity Telemetry",
      description: "Active IoT temperature logging from packhouse pre-cooling (+0.5°C tolerance) through refrigerated reefers to destination ports.",
      tag: "IoT Telemetry",
    },
    {
      icon: FileText,
      title: "Phytosanitary & Customs Automation",
      description: "Automated Bill of Lading, Phytosanitary certificates, Certificate of Origin, and customs dispatch dossiers.",
      tag: "APEDA & Customs",
    },
    {
      icon: PackageSearch,
      title: "FIFO Batch Warehouse Allocation",
      description: "Multi-facility warehouse inventory with automated FIFO allocation, shelf-life monitoring, and packhouse sorting.",
      tag: "Cold Storage",
    },
  ]

  const produceHighlights = [
    { name: "Alphonso Mango", origin: "Ratnagiri, Maharashtra", grade: "Grade A Export", brix: "18-20° Brix", badge: "In Season" },
    { name: "Thompson Seedless Grapes", origin: "Nashik, Maharashtra", grade: "Super Extra", brix: "16-18° Brix", badge: "GlobalGAP" },
    { name: "Cavendish Bananas", origin: "Jalgaon, Maharashtra", grade: "Premium Hand", brix: "High Caliber", badge: "Year-Round" },
    { name: "Bhagwa Pomegranate", origin: "Solapur, Maharashtra", grade: "Export Extra", brix: "Deep Red Arils", badge: "High Demand" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-tertiary/20 selection:text-foreground">
      {/* Top Announcement Bar */}
      <div className="bg-agro-forest text-agro-offwhite text-xs py-2 px-4 text-center font-medium border-b border-agro-slate/40 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-agro-wheat animate-pulse" />
        <span>FIELD-EX Agro-Export Platform • Direct Indian Farm-to-Port Supply Chains Active for EU, GCC & UK Importers</span>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm ring-1 ring-border group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-5 h-5 text-agro-wheat" />
            </div>
            <div>
              <span className="text-2xl font-heading font-extrabold tracking-tight text-foreground">
                FIELD<span className="text-secondary">-EX</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                B2B Export
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#portals" className="hover:text-foreground transition-colors">Portals</a>
            <a href="#produce" className="hover:text-foreground transition-colors">Produce</a>
            <a href="#infrastructure" className="hover:text-foreground transition-colors">Infrastructure</a>
            <Link to="/buyer/catalog" className="hover:text-foreground transition-colors">Live Catalog</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="shadow-sm">
              <Link to="/buyer">Enter Buyer Console</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-border bg-gradient-to-b from-card via-background to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/70 border border-border text-xs font-semibold text-foreground mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-tertiary" />
              <span>Certified Indian Farm Procurement • Worldwide Cold-Chain Velocity</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-foreground leading-[1.12]">
              The Premier B2B <span className="text-primary underline decoration-agro-wheat/60 underline-offset-8">Agro-Export</span> Infrastructure.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground font-sans leading-relaxed">
              FIELD-EX bridges Indian farming clusters with international commercial fruit buyers. Built with precision cold-chain telemetry, automated phytosanitary clearance, and transparent lot-level traceability.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="h-12 px-7 text-base font-semibold shadow-soft">
                <Link to="/buyer/catalog">
                  Explore Fresh Produce Catalog <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-7 text-base font-semibold">
                <Link to="/login">Access Operator Consoles</Link>
              </Button>
            </div>
          </div>

          {/* Real-time KPI Metric Highlights */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-soft text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Annual Export</p>
              <h3 className="text-3xl font-heading font-bold text-foreground mt-1">48,500 <span className="text-lg font-normal text-muted-foreground">MT</span></h3>
              <p className="text-xs text-tertiary font-medium mt-1">Certified A-Grade Produce</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border shadow-soft text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Cold-Chain Uptime</p>
              <h3 className="text-3xl font-heading font-bold text-foreground mt-1">99.7%</h3>
              <p className="text-xs text-tertiary font-medium mt-1">Continuous IoT Telemetry</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border shadow-soft text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Farm Clusters</p>
              <h3 className="text-3xl font-heading font-bold text-foreground mt-1">1,400+</h3>
              <p className="text-xs text-tertiary font-medium mt-1">GlobalGAP & APEDA Verified</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border shadow-soft text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Export Lanes</p>
              <h3 className="text-3xl font-heading font-bold text-foreground mt-1">24 Ports</h3>
              <p className="text-xs text-tertiary font-medium mt-1">GCC, EU, UK & SE Asia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portals Launchpad Section */}
      <section id="portals" className="py-20 bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="olive" className="mb-2">Operational Consoles</Badge>
              <h2 className="text-3xl font-heading font-bold text-foreground">Launchpad & Specialized Portals</h2>
              <p className="text-muted-foreground mt-1 text-base max-w-xl">
                Every stakeholder in the export lifecycle operates with dedicated, role-authorized tools tailored to their workflow.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span>Demo / Test Accounts Available on</span>
              <Link to="/login" className="text-primary font-semibold underline underline-offset-4 hover:text-secondary">
                Login Page →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portals.map((portal) => {
              const Icon = portal.icon
              return (
                <div 
                  key={portal.title}
                  className={`p-6 rounded-2xl border transition-all duration-200 shadow-soft flex flex-col justify-between group ${portal.color}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/80 border border-border flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-200">
                        <Icon className="w-6 h-6 text-foreground" />
                      </div>
                      <Badge variant={portal.badgeVariant} className="text-[11px] font-medium">
                        {portal.badge}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                      {portal.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {portal.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/80 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Role: {portal.role}
                    </span>
                    <Button asChild size="sm" variant="ghost" className="h-8 px-2 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                      <Link to={portal.path} className="flex items-center gap-1 text-primary">
                        Enter <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Produce Catalog Highlights */}
      <section id="produce" className="py-20 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="clay" className="mb-2">Produce Portfolio</Badge>
              <h2 className="text-3xl font-heading font-bold text-foreground">Featured Export Harvests</h2>
              <p className="text-muted-foreground mt-1 text-base">
                Procured directly from audited Indian groves, sorted in cold packhouses, and pre-cleared for export.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/buyer/catalog">View Complete Live Catalog →</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {produceHighlights.map((fruit) => (
              <div key={fruit.name} className="p-5 rounded-2xl bg-background border border-border shadow-soft flex flex-col justify-between hover:border-agro-sage transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <Badge variant="wheat" className="text-[10px] font-semibold">{fruit.badge}</Badge>
                    <span className="text-xs font-semibold text-tertiary">{fruit.brix}</span>
                  </div>
                  <h4 className="text-lg font-heading font-bold text-foreground mt-3">{fruit.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{fruit.origin}</p>
                </div>
                
                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">{fruit.grade}</span>
                  <Link to="/buyer/quotations/request" className="font-semibold text-primary hover:text-secondary transition-colors">
                    Request Quote →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Infrastructure Pillars */}
      <section id="infrastructure" className="py-20 border-b border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="forest" className="mb-2">Enterprise Architecture</Badge>
            <h2 className="text-3xl font-heading font-bold text-foreground">Engineered for Agricultural Velocity</h2>
            <p className="text-muted-foreground mt-2 text-base">
              A comprehensive modular monolith managing procurement, cold chain, quality, orders, and customs under strict international compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon
              return (
                <div key={pillar.title} className="p-6 rounded-2xl bg-card border border-border shadow-soft flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center text-primary mb-4">
                      <Icon className="w-5 h-5 text-tertiary" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                      {pillar.tag}
                    </span>
                    <h3 className="text-base font-heading font-bold text-foreground mt-1">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Sprout className="w-4 h-4 text-agro-wheat" />
            </div>
            <div>
              <p className="font-heading font-bold text-foreground">FIELD-EX Enterprise</p>
              <p className="text-xs text-muted-foreground">International B2B Agricultural Export Management Platform</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
            <Link to="/buyer/catalog" className="hover:text-foreground transition-colors">Catalog</Link>
            <Link to="/buyer" className="hover:text-foreground transition-colors">Buyer Portal</Link>
            <Link to="/admin" className="hover:text-foreground transition-colors">Operations</Link>
            <Link to="/manager" className="hover:text-foreground transition-colors">Manager</Link>
            <Link to="/editor" className="hover:text-foreground transition-colors">Editor</Link>
            <Link to="/qc" className="hover:text-foreground transition-colors">QC Lab</Link>
            <Link to="/logistics" className="hover:text-foreground transition-colors">Logistics</Link>
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </div>

          <div className="text-xs text-muted-foreground/80">
            © {new Date().getFullYear()} FIELD-EX Exporters Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

// --- Admin Layout ---
const adminNav = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Suppliers', path: '/admin/suppliers', icon: Tractor },
  { name: 'Buyers', path: '/admin/buyers', icon: Users },
  { name: 'Catalog', path: '/admin/catalog', icon: Globe },
  { name: 'Procurement', path: '/admin/procurement', icon: FileText },
  { name: 'QC', path: '/admin/qc', icon: ShieldCheck },
  { name: 'Batches', path: '/admin/batches', icon: Box },
  { name: 'Warehouses', path: '/admin/warehouses', icon: Warehouse },
  { name: 'Inventory', path: '/admin/inventory', icon: PackageSearch },
  { name: 'Cold Chain', path: '/admin/cold-chain', icon: Thermometer },
  { name: 'Orders', path: '/admin/orders', icon: FileText },
  { name: 'Packaging', path: '/admin/packaging', icon: Archive },
  { name: 'Documents', path: '/admin/documents', icon: BookOpen },
  { name: 'Shipments', path: '/admin/shipments', icon: Ship },
  { name: 'Customs', path: '/admin/customs', icon: ClipboardCheck },
  { name: 'Audit', path: '/admin/audit', icon: History },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart },
]

export function AdminLayout() {
  return <AppLayout title="Admin" navItems={adminNav} />
}

// --- Buyer Layout ---
const buyerNav = [
  { name: 'Dashboard', path: '/buyer', icon: LayoutDashboard },
  { name: 'Company Profile', path: '/buyer/profile', icon: Building },
  { name: 'Fruit Catalog', path: '/buyer/catalog', icon: Globe },
  { name: 'Quotations', path: '/buyer/quotations', icon: FileText },
  { name: 'Orders', path: '/buyer/orders', icon: Tractor },
  { name: 'Shipments', path: '/buyer/shipments', icon: Ship },
  { name: 'Customs', path: '/buyer/customs', icon: ClipboardCheck },
  { name: 'Documents', path: '/buyer/documents', icon: BookOpen },
  { name: 'Notifications', path: '/buyer/notifications', icon: Bell },
]

export function BuyerLayout() {
  return <AppLayout title="Buyer" navItems={buyerNav} />
}

// --- Engineer Layout ---
const engineerNav = [
  { name: 'Dashboard', path: '/engineer', icon: LayoutDashboard },
  { name: 'Suppliers', path: '/engineer/suppliers', icon: Tractor },
  { name: 'Procurement', path: '/engineer/procurement', icon: FileText },
  { name: 'Batches', path: '/engineer/batches', icon: Box },
  { name: 'Warehouses', path: '/engineer/warehouses', icon: Warehouse },
  { name: 'Inventory', path: '/engineer/inventory', icon: PackageSearch },
  { name: 'Operations', path: '/engineer/operations', icon: Settings },
]

export function EngineerLayout() {
  return <AppLayout title="Engineer" navItems={engineerNav} />
}

// --- QC Inspector Layout ---
const qcNav = [
  { name: 'Dashboard', path: '/qc', icon: LayoutDashboard },
  { name: 'Inspections', path: '/qc/inspections', icon: ClipboardCheck },
  { name: 'Grading', path: '/qc/grading', icon: CheckSquare },
  { name: 'Failed Batches', path: '/qc/failed-batches', icon: AlertTriangle },
  { name: 'Reinspection', path: '/qc/reinspection', icon: History },
  { name: 'Quality History', path: '/qc/history', icon: BookOpen },
]

export function QcLayout() {
  return <AppLayout title="QC" navItems={qcNav} />
}

// --- Logistics Layout ---
const logisticsNav = [
  { name: 'Dashboard', path: '/logistics', icon: LayoutDashboard },
  { name: 'Warehouse', path: '/logistics/warehouse', icon: Warehouse },
  { name: 'Packaging', path: '/logistics/packaging', icon: Archive },
  { name: 'Shipments', path: '/logistics/shipments', icon: Ship },
  { name: 'Customs', path: '/logistics/customs', icon: ClipboardCheck },
  { name: 'Delayed Shipments', path: '/logistics/delayed-shipments', icon: Clock },
  { name: 'Delivery', path: '/logistics/delivery', icon: Truck },
]

export function LogisticsLayout() {
  return <AppLayout title="Logistics" navItems={logisticsNav} />
}

// --- Manager Layout ---
const managerNav = [
  { name: 'Dashboard', path: '/manager', icon: LayoutDashboard },
  { name: 'Orders', path: '/manager/orders', icon: FileText },
  { name: 'Quotations', path: '/manager/quotations', icon: FileText },
  { name: 'Procurement', path: '/manager/procurement', icon: Tractor },
  { name: 'Inventory', path: '/manager/inventory', icon: PackageSearch },
  { name: 'Quality QC', path: '/manager/qc', icon: ShieldCheck },
  { name: 'Shipments', path: '/manager/shipments', icon: Ship },
  { name: 'Customs', path: '/manager/customs', icon: ClipboardCheck },
  { name: 'Analytics', path: '/manager/analytics', icon: BarChart },
]

export function ManagerLayout() {
  return <AppLayout title="Manager" navItems={managerNav} />
}

// --- Editor Layout ---
const editorNav = [
  { name: 'Dashboard', path: '/editor', icon: LayoutDashboard },
  { name: 'Produce Catalog', path: '/editor/catalog', icon: Globe },
  { name: 'Varieties & Specs', path: '/editor/varieties', icon: Box },
  { name: 'Farm Suppliers', path: '/editor/suppliers', icon: Tractor },
  { name: 'Harvest Batches', path: '/editor/batches', icon: Archive },
  { name: 'Packaging Protocols', path: '/editor/packaging', icon: BookOpen },
]

export function EditorLayout() {
  return <AppLayout title="Editor" navItems={editorNav} />
}
