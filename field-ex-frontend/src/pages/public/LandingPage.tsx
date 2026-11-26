import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import {
  LayoutDashboard,
  Tractor,
  Globe,
  PackageSearch,
  FileText,
  Ship,
  Thermometer,
  ShieldCheck,
  Sprout,
  ArrowRight,
  Sparkles,
  RefreshCw,
  MapPin,
  Warehouse,
  Anchor,
  AlertCircle,
} from "lucide-react"
import {
  publicApi,
  type LandingOverview,
  type LandingCatalogFruit,
} from "../../services/publicApi"
import { getFruitMedia } from "../../utils/fruitMedia"

function formatWeight(kg: number): string {
  if (!Number.isFinite(kg) || kg <= 0) return "0 KG"
  if (kg >= 1000) {
    return `${(kg / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} MT`
  }
  return `${kg.toLocaleString(undefined, { maximumFractionDigits: 0 })} KG`
}

function formatCurrency(amount: number | null | undefined, currency = "USD"): string {
  const safeAmount = Number(amount ?? 0)
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: safeAmount >= 100 ? 0 : 2,
    }).format(safeAmount)
  } catch {
    return `${currency || "USD"} ${safeAmount.toLocaleString()}`
  }
}

function summarizeFruit(fruit: LandingCatalogFruit) {
  const media = getFruitMedia(fruit.name)
  const varieties = (fruit.varieties || []).filter((v) => v.active)

  const totalStockKg = varieties.reduce((sum, v) => {
    const qty = Number(v.availableQuantity ?? 0)
    const factor = v.unit?.toUpperCase() === "MT" ? 1000 : 1
    return sum + qty * factor
  }, 0)

  const pricedVarieties = varieties
    .filter((v) => v.pricePerKg != null && Number(v.pricePerKg) > 0)
    .sort((a, b) => Number(a.pricePerKg) - Number(b.pricePerKg))

  const lowestPriced = pricedVarieties[0]
  const primary = varieties[0]

  const minTemps = varieties
    .map((v) => v.minStorageTemperature)
    .filter((t): t is number => t != null)
  const maxTemps = varieties
    .map((v) => v.maxStorageTemperature)
    .filter((t): t is number => t != null)

  const tempRange =
    minTemps.length > 0 && maxTemps.length > 0
      ? `${Math.min(...minTemps)}°C – ${Math.max(...maxTemps)}°C`
      : null

  return {
    media,
    varieties,
    totalStockKg,
    startingPriceLabel: lowestPriced
      ? `${formatCurrency(lowestPriced.pricePerKg, lowestPriced.currency || "USD")}/${lowestPriced.unit || "KG"}`
      : "Spot Quote",
    primaryBrix: primary?.brixLevel || fruit.category || "Export Spec",
    primaryGrade: primary?.grade || "Export Grade",
    tempRange,
  }
}

export function LandingPage() {
  const [overview, setOverview] = useState<LandingOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)

  const fetchOverview = useCallback(async (silent = false) => {
    try {
      const data = await publicApi.getLandingOverview()
      setOverview(data)
      setError(null)
      setLastSynced(new Date())
    } catch {
      if (!silent) {
        setError("Live backend server unavailable. Start Spring Boot on port 8080 to stream real-time metrics.")
      }
    } finally {
      setIsLoading(false)
      setIsSyncing(false)
    }
  }, [])

  useEffect(() => {
    const initTimer = setTimeout(() => {
      void fetchOverview(false)
    }, 0)
    const pollTimer = setInterval(() => {
      void fetchOverview(true)
    }, 5000)
    return () => {
      clearTimeout(initTimer)
      clearInterval(pollTimer)
    }
  }, [fetchOverview])

  const handleRefresh = () => {
    setIsSyncing(true)
    void fetchOverview(false)
  }

  const evaluatedInspections = overview
    ? Math.max(0, overview.totalInspectionsCount - overview.pendingInspectionsCount)
    : 0

  const announcementDestinations =
    overview && overview.exportDestinations.length > 0
      ? overview.exportDestinations.slice(0, 3).join(", ")
      : "Global Export Lanes"

  const portals = [
    {
      title: "International Buyer Portal",
      description:
        "Browse live fruit catalogs, request spot/contract quotations, review proforma invoices, and track container transit.",
      path: "/buyer",
      role: "BUYER",
      badge: "Commercial Portal",
      liveStat: overview
        ? `${overview.activeVarietyCount} Priced Varieties • ${overview.pendingQuotationCount} Open Quotes`
        : "Connecting to live catalog...",
      iconBoxClass: "bg-[#DEE4DB] text-[#072C15]",
      badgeClass: "bg-[#D4EBAB] text-[#253507]",
      icon: Globe,
    },
    {
      title: "Operations & Admin Hub",
      description:
        "Enterprise command center for supplier onboarding, catalog pricing, procurement orders, and executive metrics.",
      path: "/admin",
      role: "ADMIN",
      badge: "HQ Command",
      liveStat: overview
        ? `${overview.totalOrdersCount} Total Orders • ${overview.activeBuyerCount} Buyers`
        : "Connecting to order engine...",
      iconBoxClass: "bg-[#FFDBC9] text-[#532200]",
      badgeClass: "bg-[#FFDBC9] text-[#532200]",
      icon: LayoutDashboard,
    },
    {
      title: "Quality Inspection & QC",
      description:
        "Field and warehouse inspection consoles: Brix sweetness ratings, defect thresholds, and GlobalGAP compliance.",
      path: "/qc",
      role: "QC_INSPECTOR",
      badge: "Quality Lab",
      liveStat: overview
        ? `${overview.passedInspectionsCount} Passed • ${overview.pendingInspectionsCount} Pending QC`
        : "Connecting to QC lab...",
      iconBoxClass: "bg-[#DEE4DB] text-[#072C15]",
      badgeClass: "bg-[#1F4229] text-[#D2FBD7]",
      icon: ShieldCheck,
    },
    {
      title: "Logistics & Cold-Chain",
      description:
        "Container packaging, cold-storage telemetry, export bill of ladings, customs clearance, and port dispatch.",
      path: "/logistics",
      role: "LOGISTICS",
      badge: "Freight Engine",
      liveStat: overview
        ? `${overview.activeShipmentCount} Active Shipment${overview.activeShipmentCount === 1 ? "" : "s"} • ${overview.activeColdStorageBatchCount} Batches`
        : "Connecting to fleet...",
      iconBoxClass: "bg-[#EAE8E3] text-[#71360D]",
      badgeClass: "bg-[#EAE8E3] text-[#1B1C19]",
      icon: Ship,
    },
    {
      title: "Operations & Manager Hub",
      description:
        "Pipeline governance, order approvals, inventory allocation, and fulfillment workflow velocity.",
      path: "/manager",
      role: "MANAGER",
      badge: "Operations Command",
      liveStat: overview
        ? `${overview.activeOrdersCount} Active Orders • ${formatCurrency(overview.activeOrderPipelineUsd)}`
        : "Connecting to pipeline...",
      iconBoxClass: "bg-[#DEE4DB] text-[#072C15]",
      badgeClass: "bg-[#1F4229] text-[#D2FBD7]",
      icon: LayoutDashboard,
    },
  ]

  const pillars = [
    {
      icon: Tractor,
      title: "Farm Procurement & Aggregation",
      description:
        overview && overview.activeOrigins.length > 0
          ? `Direct ties with ${overview.activeSupplierCount} audited supplier cluster${overview.activeSupplierCount === 1 ? "" : "s"} sourcing across ${overview.activeOrigins.join(", ")}.`
          : "Direct farm procurement integration with batch-level harvest origin tracking.",
      tag: "Harvest Source",
      iconBoxClass: "bg-[#DEE4DB] text-[#072C15]",
    },
    {
      icon: Thermometer,
      title: "Cold-Chain Integrity Telemetry",
      description:
        overview && overview.warehouses.length > 0
          ? `Monitored cold hubs calibrated between ${Math.min(...overview.warehouses.map((w) => w.minTemperatureCelsius ?? 2))}°C and ${Math.max(...overview.warehouses.map((w) => w.maxTemperatureCelsius ?? 12))}°C${overview.latestTemperatureCelsius != null ? ` (latest sensor reading: ${overview.latestTemperatureCelsius.toFixed(1)}°C)` : ""}.`
          : "Continuous cold-storage and reefer thermal monitoring from packhouse to port.",
      tag: "IoT Telemetry",
      iconBoxClass: "bg-[#FFDBC9] text-[#532200]",
    },
    {
      icon: FileText,
      title: "Phytosanitary & Customs Automation",
      description:
        "Automated Bill of Lading, Phytosanitary certificates, Certificate of Origin, and port customs clearance tracking.",
      tag: "APEDA & Customs",
      iconBoxClass: "bg-[#DEE4DB] text-[#072C15]",
    },
    {
      icon: PackageSearch,
      title: "FIFO Batch Warehouse Allocation",
      description:
        overview
          ? `Tracking ${formatWeight(overview.totalWarehouseInventoryKg)} live cold-hub inventory across ${overview.activeColdStorageBatchCount} stored batch${overview.activeColdStorageBatchCount === 1 ? "" : "es"} with expiry-ordered allocation.`
          : "Multi-facility warehouse inventory with automated FIFO allocation and shelf-life tracking.",
      tag: "Cold Storage",
      iconBoxClass: "bg-[#FFDBC9] text-[#532200]",
    },
  ]

  const produceList = overview?.featuredProduce ?? []
  const produceGridClass =
    produceList.length === 1
      ? "grid grid-cols-1 max-w-md gap-6"
      : produceList.length === 2
        ? "grid grid-cols-1 sm:grid-cols-2 gap-6"
        : produceList.length === 3
          ? "grid grid-cols-1 md:grid-cols-3 gap-6"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"

  return (
    <div className="min-h-dvh flex flex-col bg-[#FBF9F4] text-[#1B1C19] font-lato antialiased selection:bg-[#D4EBAB] selection:text-[#1B1C19]">
      <a
        href="#hero-heading"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-[#072C15] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white focus:outline-none focus:ring-2 focus:ring-[#D9A441]"
      >
        Skip to main content
      </a>

      <header className="w-full">
        {/* Top Real-Time Announcement Bar */}
        <div className="bg-[#072C15] border-b border-[#1F4229] px-4 sm:px-6 py-2.5">
          <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2 text-center">
            <span
              className={`w-2 h-2 shrink-0 rounded-full ${error ? "bg-amber-400" : "bg-[#D9A441] motion-safe:animate-pulse"}`}
              aria-hidden="true"
            />
            <p className="text-xs font-bold leading-4 tracking-[0.4px] text-[#D2FBD7]">
              {overview
                ? `FIELD-EX Live Agro-Export Network • ${overview.activeFruitCount} Active Cultivars (${overview.activeVarietyCount} Varieties) • ${overview.activeWarehouseCount} Cold Hub (${overview.totalWarehouseCapacityMt.toLocaleString()} MT) • Destinations: ${announcementDestinations}`
                : isLoading
                  ? "FIELD-EX Agro-Export Platform • Connecting to Live Farm-to-Port Database Stream..."
                  : "FIELD-EX Agro-Export Platform • Live Database Telemetry Standby"}
            </p>
          </div>
        </div>

        {/* Main Navigation Header */}
        <div className="px-4 sm:px-6 pt-4">
          <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-4 px-5 sm:px-6 py-2 min-h-[58px] bg-white border border-[#C2C8BF] rounded-full shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]">
            <Link
              to="/"
              className="flex items-center gap-4 group rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072C15] focus-visible:ring-offset-2"
            >
              <div className="w-10 h-10 shrink-0 rounded-[12px] bg-[#264730] flex items-center justify-center shadow-[0_0_0_1px_#E3DED6,0_1px_2px_rgba(0,0,0,0.05)] group-hover:scale-105 transition-transform duration-200">
                <Sprout className="w-5 h-5 text-[#C89938]" aria-hidden="true" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-crimson font-semibold text-[28px] leading-[34px] tracking-[-0.7px] text-[#1B1C19]">
                  FIELD-EX
                </span>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F0EEE9] border border-[#C2C8BF] font-medium text-xs leading-4 tracking-[0.5px] uppercase text-[#424842]">
                  B2B Export
                </span>
              </div>
            </Link>

            <nav aria-label="Primary" className="hidden md:flex items-center gap-2">
              <a
                href="#portals"
                className="px-4 py-1.5 rounded-full font-bold text-sm leading-5 tracking-[0.1px] text-[#424842] hover:text-[#072C15] hover:bg-[#DEE4DB]/70 active:bg-[#D4EBAB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072C15]"
              >
                Portals
              </a>
              <a
                href="#produce"
                className="px-4 py-1.5 rounded-full font-bold text-sm leading-5 tracking-[0.1px] text-[#424842] hover:text-[#072C15] hover:bg-[#DEE4DB]/70 active:bg-[#D4EBAB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072C15]"
              >
                Produce
              </a>
              <a
                href="#infrastructure"
                className="px-4 py-1.5 rounded-full font-bold text-sm leading-5 tracking-[0.1px] text-[#424842] hover:text-[#072C15] hover:bg-[#DEE4DB]/70 active:bg-[#D4EBAB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072C15]"
              >
                Infrastructure
              </a>
              <Link
                to="/buyer/catalog"
                className="px-4 py-1.5 rounded-full font-bold text-sm leading-5 tracking-[0.1px] text-[#424842] hover:text-[#072C15] hover:bg-[#DEE4DB]/70 active:bg-[#D4EBAB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072C15]"
              >
                Live Catalog
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center justify-center min-h-[38px] px-4 py-2 rounded-full bg-white border border-[#C2C8BF] font-bold text-sm leading-5 tracking-[0.1px] text-[#1B1C19] hover:bg-[#DEE4DB] hover:border-[#1F4229]/40 hover:text-[#072C15] active:bg-[#D4EBAB] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072C15]"
              >
                Sign In
              </Link>
              <Link
                to="/buyer"
                className="inline-flex items-center justify-center min-h-[36px] px-5 sm:px-6 py-2 rounded-full bg-[#072C15] text-white font-bold text-sm leading-5 tracking-[0.1px] shadow-sm hover:bg-[#1F4229] active:bg-[#264730] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072C15] focus-visible:ring-offset-2"
              >
                Enter Buyer Console
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="bg-[#FBF9F4] border-b border-[#C2C8BF] px-4 sm:px-6 py-16">
          <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-8">
            <div className="max-w-[896px] mx-auto flex flex-col items-center gap-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5F3EE] border border-[#C2C8BF] shadow-sm">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#71360D]" aria-hidden="true" />
                <span className="font-bold text-xs leading-4 tracking-[0.4px] text-[#1B1C19]">
                  Real-Time Farm Procurement • Live Cold-Chain &amp; Export Telemetry
                </span>
              </div>

              <h1
                id="hero-heading"
                tabIndex={-1}
                className="font-crimson font-bold text-[clamp(2.25rem,1.5rem+2.5vw,3.5rem)] leading-[1.11] tracking-[-0.75px] text-[#1B1C19] text-balance max-w-[18ch] outline-none"
              >
                The Premier B2B Agro-Export Infrastructure.
              </h1>

              <p className="max-w-[672px] font-normal text-lg leading-7 text-[#424842] text-pretty">
                FIELD-EX bridges verified farming collectives with international commercial fruit importers. Every stock balance, price quote, QC grading result, and transit container below streams directly from live operations.
              </p>

              <div className="pt-1 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/buyer/catalog"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3.5 rounded-[12px] bg-[#072C15] text-white font-bold text-sm leading-5 tracking-[0.1px] shadow-sm hover:bg-[#1F4229] active:bg-[#264730] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072C15] focus-visible:ring-offset-2"
                >
                  <span>Explore Fresh Produce Catalog</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center min-h-[50px] px-6 py-3.5 rounded-[12px] bg-white border border-[#C2C8BF] text-[#1B1C19] font-bold text-sm leading-5 tracking-[0.1px] hover:bg-[#DEE4DB] hover:border-[#1F4229]/40 hover:text-[#072C15] active:bg-[#D4EBAB] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072C15] focus-visible:ring-offset-2"
                >
                  Access Operator Consoles
                </Link>
              </div>
            </div>

            {/* Live Stream Control Strip */}
            <div className="w-full max-w-[1152px] mx-auto pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#C2C8BF] text-xs font-semibold text-[#424842]">
                <span
                  className={`w-2 h-2 rounded-full ${error ? "bg-amber-500" : "bg-emerald-600 animate-pulse"}`}
                  aria-hidden="true"
                />
                <span>
                  {overview && lastSynced
                    ? `Live Database Stream • Synced ${lastSynced.toLocaleTimeString()}`
                    : isLoading
                      ? "Connecting to live PostgreSQL telemetry..."
                      : "Live stream disconnected"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#C2C8BF] text-xs font-bold text-[#1B1C19] hover:bg-[#DEE4DB] hover:text-[#072C15] disabled:opacity-60 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} aria-hidden="true" />
                <span>Sync Live Metrics</span>
              </button>
            </div>

            {error && !overview && (
              <div className="w-full max-w-[1152px] mx-auto p-4 rounded-[16px] bg-amber-50 border border-amber-200 text-amber-900 flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" aria-hidden="true" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="px-3 py-1 rounded-lg bg-amber-900 text-white text-xs font-bold hover:bg-amber-800 cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Real-time KPI Metric Highlights */}
            <div className="w-full max-w-[1152px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-[16px] bg-white border border-[#C2C8BF] shadow-sm flex flex-col items-center justify-center gap-1 text-center">
                <p className="font-medium text-xs leading-4 tracking-[0.6px] uppercase text-[#424842]">
                  Available Export Stock
                </p>
                <p className="font-spline font-bold text-[1.875rem] leading-9 tracking-[-0.5px] text-[#1B1C19]">
                  {overview ? formatWeight(overview.totalCatalogStockKg) : isLoading ? "…" : "0 KG"}
                </p>
                <p className="font-bold text-xs leading-4 tracking-[0.4px] text-[#71360D]">
                  {overview
                    ? `${overview.activeFruitCount} Cultivars • ${overview.activeVarietyCount} Active Varieties`
                    : "Live Catalog Total"}
                </p>
              </div>

              <div className="p-6 rounded-[16px] bg-white border border-[#C2C8BF] shadow-sm flex flex-col items-center justify-center gap-1 text-center">
                <p className="font-medium text-xs leading-4 tracking-[0.6px] uppercase text-[#424842]">
                  QC Lab Approval Rate
                </p>
                <p className="font-spline font-bold text-[1.875rem] leading-9 tracking-[-0.5px] text-[#1B1C19]">
                  {overview
                    ? evaluatedInspections > 0
                      ? `${overview.qcPassRatePercent.toFixed(1)}%`
                      : "Pending"
                    : isLoading
                      ? "…"
                      : "—"}
                </p>
                <p className="font-bold text-xs leading-4 tracking-[0.4px] text-[#71360D]">
                  {overview
                    ? `${overview.passedInspectionsCount}/${evaluatedInspections} Passed • ${overview.pendingInspectionsCount} Pending`
                    : "Quality Lab Inspections"}
                </p>
              </div>

              <div className="p-6 rounded-[16px] bg-white border border-[#C2C8BF] shadow-sm flex flex-col items-center justify-center gap-1 text-center">
                <p className="font-medium text-xs leading-4 tracking-[0.6px] uppercase text-[#424842]">
                  Cold Storage &amp; Growers
                </p>
                <p className="font-spline font-bold text-[1.875rem] leading-9 tracking-[-0.5px] text-[#1B1C19]">
                  {overview ? `${overview.totalWarehouseCapacityMt.toLocaleString()} MT` : isLoading ? "…" : "0 MT"}
                </p>
                <p className="font-bold text-xs leading-4 tracking-[0.4px] text-[#71360D]">
                  {overview
                    ? `${overview.activeWarehouseCount} Cold Hub${overview.activeWarehouseCount === 1 ? "" : "s"} • ${overview.activeSupplierCount} Grower Cluster${overview.activeSupplierCount === 1 ? "" : "s"}`
                    : "Verified Storage Hubs"}
                </p>
              </div>

              <div className="p-6 rounded-[16px] bg-white border border-[#C2C8BF] shadow-sm flex flex-col items-center justify-center gap-1 text-center">
                <p className="font-medium text-xs leading-4 tracking-[0.6px] uppercase text-[#424842]">
                  Active Orders &amp; Freight
                </p>
                <p className="font-spline font-bold text-[1.875rem] leading-9 tracking-[-0.5px] text-[#1B1C19]">
                  {overview ? `${overview.activeOrdersCount} Active` : isLoading ? "…" : "0 Active"}
                </p>
                <p className="font-bold text-xs leading-4 tracking-[0.4px] text-[#71360D]">
                  {overview
                    ? `${overview.activeShipmentCount} Transit Shipment${overview.activeShipmentCount === 1 ? "" : "s"} • ${formatCurrency(overview.activeOrderPipelineUsd)}`
                    : "Commercial Pipeline"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Portals Launchpad Section */}
        <section id="portals" className="scroll-mt-6 bg-[#F5F3EE] border-b border-[#C2C8BF] px-4 sm:px-6 py-16">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-[672px] flex flex-col items-start gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#D4EBAB] border border-[#C2C8BF] font-medium text-xs leading-4 tracking-[0.5px] text-[#253507]">
                  Operational Consoles
                </span>
                <h2 className="font-crimson font-bold text-[clamp(1.75rem,1.25rem+1.2vw,2.25rem)] leading-[1.17] tracking-[-0.5px] text-[#1B1C19] text-balance">
                  Launchpad &amp; Specialized Portals
                </h2>
                <p className="font-normal text-[15px] leading-6 tracking-[0.1px] text-[#424842] text-pretty">
                  Every stakeholder in the export lifecycle operates with dedicated, role-authorized tools connected to live operations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className="text-[13px] leading-5 tracking-[0.15px] text-[#424842]">
                  Demo / Test Accounts Available on
                </span>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 font-bold text-sm leading-5 tracking-[0.1px] underline underline-offset-4 text-[#072C15] hover:text-[#1F4229] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072C15] rounded"
                >
                  <span>Login Page</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Balanced Portal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portals.map((portal) => {
                const Icon = portal.icon
                return (
                  <article
                    key={portal.title}
                    className="p-6 rounded-[16px] bg-white border border-[#C2C8BF] shadow-sm flex flex-col justify-between gap-6 transition-colors hover:border-[#072C15]/50"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className={`w-12 h-12 shrink-0 rounded-[12px] border border-[#C2C8BF] flex items-center justify-center ${portal.iconBoxClass}`}
                        >
                          <Icon className="w-6 h-6" aria-hidden="true" />
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#C2C8BF] font-medium text-xs leading-4 tracking-[0.5px] ${portal.badgeClass}`}
                        >
                          {portal.badge}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-xl leading-7 tracking-[-0.1px] text-[#1B1C19]">
                          {portal.title}
                        </h3>
                        <p className="font-normal text-[15px] leading-6 tracking-[0.1px] text-[#424842] text-pretty">
                          {portal.description}
                        </p>
                      </div>

                      <p className="text-xs font-semibold text-[#526532] bg-[#F5F3EE] px-3 py-1.5 rounded-lg border border-[#E3DED6]">
                        {portal.liveStat}
                      </p>
                    </div>

                    <footer className="pt-4 border-t border-[#C2C8BF] flex items-center justify-between gap-3">
                      <span className="font-medium text-xs leading-4 tracking-[0.5px] uppercase text-[#424842]">
                        Role: {portal.role}
                      </span>
                      <Link
                        to={portal.path}
                        className="inline-flex items-center gap-1 min-h-[24px] font-bold text-sm leading-5 tracking-[0.1px] text-[#072C15] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072C15] rounded"
                      >
                        <span>
                          Enter<span className="sr-only"> {portal.title}</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      </Link>
                    </footer>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Live Produce Catalog Highlights Section */}
        <section id="produce" className="scroll-mt-6 bg-white border-b border-[#C2C8BF] px-4 sm:px-6 py-16">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-[672px] flex flex-col items-start gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFDBC9] border border-[#C2C8BF] font-medium text-xs leading-4 tracking-[0.5px] text-[#532200]">
                  Live Catalog Portfolio
                </span>
                <h2 className="font-crimson font-bold text-[clamp(1.75rem,1.25rem+1.2vw,2.25rem)] leading-[1.17] tracking-[-0.5px] text-[#1B1C19] text-balance">
                  Active Export Harvests
                </h2>
                <p className="font-normal text-[15px] leading-6 tracking-[0.1px] text-[#424842] text-pretty">
                  Real cultivars, live warehouse-backed stock availability, and official unit pricing managed by Operations Admin &amp; Managers.
                </p>
              </div>

              <Link
                to="/buyer/catalog"
                className="inline-flex items-center justify-center gap-2 shrink-0 min-h-[38px] px-4 py-2 rounded-[12px] bg-white border border-[#C2C8BF] font-bold text-sm leading-5 tracking-[0.1px] text-[#1B1C19] hover:bg-[#DEE4DB] hover:border-[#1F4229]/40 hover:text-[#072C15] active:bg-[#D4EBAB] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072C15]"
              >
                <span>View Complete Live Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </Link>
            </div>

            {isLoading && !overview ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((slot) => (
                  <div
                    key={slot}
                    className="h-80 rounded-[16px] bg-[#F5F3EE] border border-[#C2C8BF] animate-pulse"
                  />
                ))}
              </div>
            ) : produceList.length > 0 ? (
              <div className={produceGridClass}>
                {produceList.map((fruit) => {
                  const summary = summarizeFruit(fruit)
                  return (
                    <article
                      key={fruit.id}
                      className="rounded-[16px] bg-[#FBF9F4] border border-[#C2C8BF] shadow-sm overflow-hidden flex flex-col justify-between transition-colors hover:border-[#072C15]/50"
                    >
                      <div className="flex flex-col">
                        <img
                          src={summary.media.image}
                          alt={summary.media.alt}
                          width={384}
                          height={240}
                          loading="lazy"
                          className="block w-full aspect-[16/10] object-cover bg-[#F0EEE9]"
                        />
                        <div className="p-5 flex flex-col gap-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#C2C8BF] bg-[#D4EBAB] font-medium text-xs leading-4 tracking-[0.5px] text-[#253507]">
                              {fruit.season || "Active Season"}
                            </span>
                            <span className="font-medium text-xs leading-4 tracking-[0.5px] text-[#71360D]">
                              {summary.primaryBrix}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <h3 className="font-bold text-lg leading-6 text-[#1B1C19]">
                                {fruit.name}
                              </h3>
                              <span className="font-spline font-bold text-sm text-[#072C15]">
                                {summary.startingPriceLabel}
                              </span>
                            </div>
                            <p className="font-normal text-[13px] leading-5 tracking-[0.15px] text-[#424842] flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#71360D]" aria-hidden="true" />
                              <span>{fruit.origin || summary.media.origin}</span>
                            </p>
                          </div>

                          <div className="text-xs text-[#424842] space-y-1 pt-1 border-t border-[#E3DED6]">
                            <p>
                              <span className="font-bold text-[#1B1C19]">
                                {summary.varieties.length} Variet{summary.varieties.length === 1 ? "y" : "ies"}:
                              </span>{" "}
                              {summary.varieties.length > 0
                                ? summary.varieties.map((v) => v.name).join(", ")
                                : "Standard grade"}
                            </p>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-[#072C15]">
                                {formatWeight(summary.totalStockKg)} Ready
                              </span>
                              {summary.tempRange && (
                                <span className="text-[#71360D] font-medium">
                                  Cold: {summary.tempRange}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <footer className="px-5 py-3.5 bg-[#F5F3EE] border-t border-[#C2C8BF] flex items-center justify-between gap-2">
                        <span className="font-bold text-xs leading-4 tracking-[0.4px] text-[#424842]">
                          {summary.primaryGrade}
                        </span>
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/buyer/catalog/${fruit.id}`}
                            className="inline-flex items-center gap-1 font-bold text-xs leading-5 text-[#424842] hover:text-[#072C15] hover:underline"
                          >
                            Specs
                          </Link>
                          <Link
                            to="/buyer/quotations/request"
                            className="inline-flex items-center gap-1 min-h-[24px] font-bold text-sm leading-5 tracking-[0.1px] text-[#072C15] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072C15] rounded"
                          >
                            <span>
                              Quote<span className="sr-only"> for {fruit.name}</span>
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          </Link>
                        </div>
                      </footer>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 rounded-[16px] bg-[#FBF9F4] border border-[#C2C8BF] text-center flex flex-col items-center gap-3">
                <Sprout className="w-8 h-8 text-[#072C15]/50" aria-hidden="true" />
                <p className="font-bold text-base text-[#1B1C19]">No Active Cultivars Published Yet</p>
                <p className="text-sm text-[#424842] max-w-md">
                  Publish produce varieties in the Admin Catalog &amp; Pricing console and they will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Strategic Infrastructure Pillars & Live Operations Section */}
        <section id="infrastructure" className="scroll-mt-6 bg-[#F5F3EE] border-b border-[#C2C8BF] px-4 sm:px-6 py-16">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
            <div className="max-w-[672px] mx-auto flex flex-col items-center gap-2 text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1F4229] border border-[#C2C8BF] font-medium text-xs leading-4 tracking-[0.5px] text-[#D2FBD7]">
                Enterprise Architecture
              </span>
              <h2 className="font-crimson font-bold text-[clamp(1.75rem,1.25rem+1.2vw,2.25rem)] leading-[1.17] tracking-[-0.5px] text-[#1B1C19] text-balance">
                Engineered for Agricultural Velocity
              </h2>
              <p className="font-normal text-[15px] leading-6 tracking-[0.1px] text-[#424842] text-pretty">
                Integrated procurement, cold-storage monitoring, quality grading, orders, and customs tracking backed by live relational telemetry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillars.map((pillar) => {
                const Icon = pillar.icon
                return (
                  <article
                    key={pillar.title}
                    className="p-6 rounded-[16px] bg-white border border-[#C2C8BF] shadow-sm flex items-start gap-6"
                  >
                    <div
                      className={`w-12 h-12 shrink-0 rounded-[12px] border border-[#C2C8BF] flex items-center justify-center ${pillar.iconBoxClass}`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col gap-2 min-w-0">
                      <div className="flex flex-col gap-1">
                        <span className="font-normal text-xs leading-4 tracking-[0.6px] uppercase text-[#526532]">
                          {pillar.tag}
                        </span>
                        <h3 className="font-bold text-xl leading-7 tracking-[-0.1px] text-[#1B1C19]">
                          {pillar.title}
                        </h3>
                      </div>
                      <p className="font-normal text-[15px] leading-6 tracking-[0.1px] text-[#424842] text-pretty">
                        {pillar.description}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Live Facilities & Export Freight Corridors from PostgreSQL */}
            {overview && (overview.warehouses.length > 0 || overview.activeLanes.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                <div className="p-6 rounded-[16px] bg-white border border-[#C2C8BF] shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-4 h-4 text-[#072C15]" aria-hidden="true" />
                      <h3 className="font-bold text-base text-[#1B1C19]">Live Cold-Storage Hubs</h3>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DEE4DB] text-[#072C15]">
                      {overview.warehouses.length} Active
                    </span>
                  </div>

                  {overview.warehouses.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {overview.warehouses.map((hub) => (
                        <div
                          key={hub.name}
                          className="p-3.5 rounded-xl bg-[#FBF9F4] border border-[#E3DED6] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <p className="font-bold text-sm text-[#1B1C19]">{hub.name}</p>
                            <p className="text-xs text-[#424842]">{hub.location || "Primary Export Hub"}</p>
                          </div>
                          <div className="text-xs sm:text-right font-medium text-[#71360D]">
                            <p className="font-bold text-[#072C15]">
                              {Number(hub.capacityMt ?? 0).toLocaleString()} MT Capacity
                            </p>
                            {hub.minTemperatureCelsius != null && hub.maxTemperatureCelsius != null && (
                              <p>
                                {hub.minTemperatureCelsius}°C – {hub.maxTemperatureCelsius}°C
                                {hub.minHumidityPercent != null && hub.maxHumidityPercent != null
                                  ? ` • ${hub.minHumidityPercent}–${hub.maxHumidityPercent}% RH`
                                  : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#424842]">No active cold-storage facilities registered yet.</p>
                  )}
                </div>

                <div className="p-6 rounded-[16px] bg-white border border-[#C2C8BF] shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Anchor className="w-4 h-4 text-[#71360D]" aria-hidden="true" />
                      <h3 className="font-bold text-base text-[#1B1C19]">Active Freight Corridors</h3>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFDBC9] text-[#532200]">
                      {overview.activeLanes.length} Route{overview.activeLanes.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {overview.activeLanes.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {overview.activeLanes.map((lane, idx) => (
                        <div
                          key={`${lane.originPort || "origin"}-${lane.destinationPort || "dest"}-${idx}`}
                          className="p-3.5 rounded-xl bg-[#FBF9F4] border border-[#E3DED6] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <p className="font-bold text-sm text-[#1B1C19]">
                              {lane.originPort || "Origin Port"} → {lane.destinationPort || "Destination Port"}
                              {lane.destinationCountry ? ` (${lane.destinationCountry})` : ""}
                            </p>
                            <p className="text-xs text-[#424842]">
                              Carrier: {lane.shippingCompany || "Field-Ex Partner Line"}
                              {lane.expectedDelivery
                                ? ` • ETA ${new Date(lane.expectedDelivery).toLocaleDateString()}`
                                : ""}
                            </p>
                          </div>
                          <span className="inline-flex self-start sm:self-center items-center px-2.5 py-0.5 rounded-full bg-[#D4EBAB] border border-[#C2C8BF] text-[11px] font-bold text-[#253507]">
                            {lane.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#424842]">
                      Active buyer destinations:{" "}
                      {overview.exportDestinations.length > 0
                        ? overview.exportDestinations.join(", ")
                        : "Awaiting first dispatched shipment"}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#C2C8BF] px-4 sm:px-6 py-8">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 shrink-0 rounded-[12px] bg-[#072C15] flex items-center justify-center">
              <Sprout className="w-4 h-4 text-[#D9A441]" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-[17px] leading-6 text-[#1B1C19]">FIELD-EX Enterprise</p>
              <p className="font-normal text-[13px] leading-5 tracking-[0.15px] text-[#424842]">
                International B2B Agricultural Export Management Platform
              </p>
            </div>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap lg:justify-center items-center gap-x-6 gap-y-2 max-w-[540px]">
            <Link to="/buyer/catalog" className="font-bold text-xs leading-4 tracking-[0.4px] text-[#424842] hover:text-[#1B1C19] transition-colors">
              Catalog
            </Link>
            <Link to="/buyer" className="font-bold text-xs leading-4 tracking-[0.4px] text-[#424842] hover:text-[#1B1C19] transition-colors">
              Buyer Portal
            </Link>
            <Link to="/admin" className="font-bold text-xs leading-4 tracking-[0.4px] text-[#424842] hover:text-[#1B1C19] transition-colors">
              Operations
            </Link>
            <Link to="/manager" className="font-bold text-xs leading-4 tracking-[0.4px] text-[#424842] hover:text-[#1B1C19] transition-colors">
              Manager
            </Link>
            <Link to="/qc" className="font-bold text-xs leading-4 tracking-[0.4px] text-[#424842] hover:text-[#1B1C19] transition-colors">
              QC Lab
            </Link>
            <Link to="/logistics" className="font-bold text-xs leading-4 tracking-[0.4px] text-[#424842] hover:text-[#1B1C19] transition-colors">
              Logistics
            </Link>
            <Link to="/login" className="font-bold text-xs leading-4 tracking-[0.4px] text-[#072C15] hover:underline">
              Sign In
            </Link>
          </nav>

          <p className="font-normal text-[13px] leading-5 tracking-[0.15px] text-[#424842] max-w-[280px]">
            © {new Date().getFullYear()} FIELD-EX Exporters Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
