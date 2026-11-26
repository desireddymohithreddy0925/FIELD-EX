import { Link } from "react-router-dom"
import { 
  LayoutDashboard, Users, Tractor, Globe, ClipboardCheck, PackageSearch, 
  Truck, FileText, Bell, Ship, Building, BookOpen, Warehouse, 
  Thermometer, Archive, BarChart, History, Box, ShieldCheck, CheckSquare, AlertTriangle, 
  Clock, Sprout, ArrowRight, Sparkles
} from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import alphonsoMangoImg from "../assets/produce/alphonso-mango.jpg"
import thompsonGrapesImg from "../assets/produce/thompson-grapes.jpg"
import cavendishBananasImg from "../assets/produce/cavendish-bananas.jpg"
import bhagwaPomegranateImg from "../assets/produce/bhagwa-pomegranate.jpg"

// --- Public Layout (High-End Agro-Export Platform Landing) ---
export function PublicLayout() {
  const portals = [
    {
      title: "International Buyer Portal",
      description: "Browse live fruit catalogs, request spot/contract quotations, review proforma invoices, and track container transit.",
      path: "/buyer",
      role: "BUYER",
      badge: "Commercial Portal",
      iconBoxClass: "bg-[#DEE4DB] text-[#072C15]",
      badgeClass: "bg-[#D4EBAB] text-[#253507]",
      icon: Globe,
    },
    {
      title: "Operations & Admin Hub",
      description: "Enterprise command center for supplier onboarding, catalog pricing, procurement orders, and executive metrics.",
      path: "/admin",
      role: "ADMIN",
      badge: "HQ Command",
      iconBoxClass: "bg-[#FFDBC9] text-[#532200]",
      badgeClass: "bg-[#FFDBC9] text-[#532200]",
      icon: LayoutDashboard,
    },
    {
      title: "Quality Inspection & QC",
      description: "Field and warehouse inspection consoles: Brix sweetness ratings, defect thresholds, and GlobalGAP compliance.",
      path: "/qc",
      role: "QC_INSPECTOR",
      badge: "Quality Lab",
      iconBoxClass: "bg-[#DEE4DB] text-[#072C15]",
      badgeClass: "bg-[#1F4229] text-[#D2FBD7]",
      icon: ShieldCheck,
    },
    {
      title: "Logistics & Cold-Chain",
      description: "Container packaging, cold-storage telemetry, export bill of ladings, customs clearance, and port dispatch.",
      path: "/logistics",
      role: "LOGISTICS",
      badge: "Freight Engine",
      iconBoxClass: "bg-[#EAE8E3] text-[#71360D]",
      badgeClass: "bg-[#EAE8E3] text-[#1B1C19]",
      icon: Ship,
    },
    {
      title: "Operations & Manager Hub",
      description: "Pipeline governance, order approvals, inventory allocation, and fulfillment workflow velocity.",
      path: "/manager",
      role: "MANAGER",
      badge: "Operations Command",
      iconBoxClass: "bg-[#DEE4DB] text-[#072C15]",
      badgeClass: "bg-[#1F4229] text-[#D2FBD7]",
      icon: LayoutDashboard,
    },
  ]

  const pillars = [
    {
      icon: Tractor,
      title: "Farm Procurement & Aggregation",
      description: "Direct ties with certified farming clusters across Maharashtra, Karnataka, and Gujarat. Real-time lot tracking right at harvest.",
      tag: "Harvest Source",
      iconBoxClass: "bg-[#DEE4DB] text-[#072C15]",
    },
    {
      icon: Thermometer,
      title: "Cold-Chain Integrity Telemetry",
      description: "Active IoT temperature logging from packhouse pre-cooling (+0.5°C tolerance) through refrigerated reefers to destination ports.",
      tag: "IoT Telemetry",
      iconBoxClass: "bg-[#FFDBC9] text-[#532200]",
    },
    {
      icon: FileText,
      title: "Phytosanitary & Customs Automation",
      description: "Automated Bill of Lading, Phytosanitary certificates, Certificate of Origin, and customs dispatch dossiers.",
      tag: "APEDA & Customs",
      iconBoxClass: "bg-[#DEE4DB] text-[#072C15]",
    },
    {
      icon: PackageSearch,
      title: "FIFO Batch Warehouse Allocation",
      description: "Multi-facility warehouse inventory with automated FIFO allocation, shelf-life monitoring, and packhouse sorting.",
      tag: "Cold Storage",
      iconBoxClass: "bg-[#FFDBC9] text-[#532200]",
    },
  ]

  const produceHighlights = [
    {
      name: "Alphonso Mango",
      origin: "Ratnagiri, Maharashtra",
      grade: "Grade A Export",
      brix: "18-20° Brix",
      badge: "In Season",
      badgeClass: "bg-[#D4EBAB] text-[#253507]",
      image: alphonsoMangoImg,
      imageAlt: "Ratnagiri Alphonso Mango export harvest",
    },
    {
      name: "Thompson Seedless Grapes",
      origin: "Nashik, Maharashtra",
      grade: "Super Extra",
      brix: "16-18° Brix",
      badge: "GlobalGAP",
      badgeClass: "bg-[#1F4229] text-[#D2FBD7]",
      image: thompsonGrapesImg,
      imageAlt: "Nashik Thompson Seedless Grapes export harvest",
    },
    {
      name: "Cavendish Bananas",
      origin: "Jalgaon, Maharashtra",
      grade: "Premium Hand",
      brix: "High Caliber",
      badge: "Year-Round",
      badgeClass: "bg-[#D4EBAB] text-[#253507]",
      image: cavendishBananasImg,
      imageAlt: "Jalgaon Cavendish Bananas export harvest",
    },
    {
      name: "Bhagwa Pomegranate",
      origin: "Solapur, Maharashtra",
      grade: "Export Extra",
      brix: "Deep Red Arils",
      badge: "High Demand",
      badgeClass: "bg-[#FFDBC9] text-[#532200]",
      image: bhagwaPomegranateImg,
      imageAlt: "Solapur Bhagwa Pomegranate export harvest",
    },
  ]

  return (
    <div className="min-h-dvh flex flex-col bg-[#FBF9F4] text-[#1B1C19] font-lato antialiased selection:bg-[#D4EBAB] selection:text-[#1B1C19]">
      <a
        href="#hero-heading"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-[#072C15] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white focus:outline-none focus:ring-2 focus:ring-[#D9A441]"
      >
        Skip to main content
      </a>

      <header className="w-full">
        {/* Top Announcement Bar */}
        <div className="bg-[#072C15] border-b border-[#1F4229] px-4 sm:px-6 py-2.5">
          <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2 text-center">
            <span className="w-2 h-2 shrink-0 rounded-full bg-[#D9A441] motion-safe:animate-pulse" aria-hidden="true" />
            <p className="text-xs font-bold leading-4 tracking-[0.4px] text-[#D2FBD7]">
              FIELD-EX Agro-Export Platform • Direct Indian Farm-to-Port Supply Chains Active for EU, GCC &amp; UK Importers
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
                  Certified Indian Farm Procurement • Worldwide Cold-Chain Velocity
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
                FIELD-EX bridges Indian farming clusters with international commercial fruit buyers. Built with precision cold-chain telemetry, automated phytosanitary clearance, and transparent lot-level traceability.
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

            {/* Real-time KPI Metric Highlights */}
            <div className="w-full max-w-[1152px] mx-auto pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-[16px] bg-white border border-[#C2C8BF] shadow-sm flex flex-col items-center justify-center gap-1 text-center">
                <p className="font-medium text-xs leading-4 tracking-[0.6px] uppercase text-[#424842]">
                  Annual Export
                </p>
                <p className="font-spline font-bold text-[1.875rem] leading-9 tracking-[-0.5px] text-[#1B1C19]">
                  48,500<span className="font-lato font-bold text-[17px] leading-6 text-[#424842] ml-1.5">MT</span>
                </p>
                <p className="font-bold text-xs leading-4 tracking-[0.4px] text-[#71360D]">
                  Certified A-Grade Produce
                </p>
              </div>

              <div className="p-6 rounded-[16px] bg-white border border-[#C2C8BF] shadow-sm flex flex-col items-center justify-center gap-1 text-center">
                <p className="font-medium text-xs leading-4 tracking-[0.6px] uppercase text-[#424842]">
                  Cold-Chain Uptime
                </p>
                <p className="font-spline font-bold text-[1.875rem] leading-9 tracking-[-0.5px] text-[#1B1C19]">
                  99.7%
                </p>
                <p className="font-bold text-xs leading-4 tracking-[0.4px] text-[#71360D]">
                  Continuous IoT Telemetry
                </p>
              </div>

              <div className="p-6 rounded-[16px] bg-white border border-[#C2C8BF] shadow-sm flex flex-col items-center justify-center gap-1 text-center">
                <p className="font-medium text-xs leading-4 tracking-[0.6px] uppercase text-[#424842]">
                  Farm Clusters
                </p>
                <p className="font-spline font-bold text-[1.875rem] leading-9 tracking-[-0.5px] text-[#1B1C19]">
                  1,400+
                </p>
                <p className="font-bold text-xs leading-4 tracking-[0.4px] text-[#71360D]">
                  GlobalGAP &amp; APEDA Verified
                </p>
              </div>

              <div className="p-6 rounded-[16px] bg-white border border-[#C2C8BF] shadow-sm flex flex-col items-center justify-center gap-1 text-center">
                <p className="font-medium text-xs leading-4 tracking-[0.6px] uppercase text-[#424842]">
                  Export Lanes
                </p>
                <p className="font-spline font-bold text-[1.875rem] leading-9 tracking-[-0.5px] text-[#1B1C19]">
                  24 Ports
                </p>
                <p className="font-bold text-xs leading-4 tracking-[0.4px] text-[#71360D]">
                  GCC, EU, UK &amp; SE Asia
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
                  Every stakeholder in the export lifecycle operates with dedicated, role-authorized tools tailored to their workflow.
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

            {/* Balanced 3-Column Portal Grid */}
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
                        <div className={`w-12 h-12 shrink-0 rounded-[12px] border border-[#C2C8BF] flex items-center justify-center ${portal.iconBoxClass}`}>
                          <Icon className="w-6 h-6" aria-hidden="true" />
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#C2C8BF] font-medium text-xs leading-4 tracking-[0.5px] ${portal.badgeClass}`}>
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

        {/* Produce Catalog Highlights Section */}
        <section id="produce" className="scroll-mt-6 bg-white border-b border-[#C2C8BF] px-4 sm:px-6 py-16">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-[672px] flex flex-col items-start gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFDBC9] border border-[#C2C8BF] font-medium text-xs leading-4 tracking-[0.5px] text-[#532200]">
                  Produce Portfolio
                </span>
                <h2 className="font-crimson font-bold text-[clamp(1.75rem,1.25rem+1.2vw,2.25rem)] leading-[1.17] tracking-[-0.5px] text-[#1B1C19] text-balance">
                  Featured Export Harvests
                </h2>
                <p className="font-normal text-[15px] leading-6 tracking-[0.1px] text-[#424842] text-pretty">
                  Procured directly from audited Indian groves, sorted in cold packhouses, and pre-cleared for export.
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {produceHighlights.map((fruit) => (
                <article
                  key={fruit.name}
                  className="rounded-[16px] bg-[#FBF9F4] border border-[#C2C8BF] shadow-sm overflow-hidden flex flex-col justify-between transition-colors hover:border-[#072C15]/50"
                >
                  <div className="flex flex-col">
                    <img
                      src={fruit.image}
                      alt={fruit.imageAlt}
                      width={288}
                      height={180}
                      loading="lazy"
                      className="block w-full aspect-[16/10] object-cover bg-[#F0EEE9]"
                    />
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#C2C8BF] font-medium text-xs leading-4 tracking-[0.5px] ${fruit.badgeClass}`}>
                          {fruit.badge}
                        </span>
                        <span className="font-medium text-xs leading-4 tracking-[0.5px] text-[#71360D]">
                          {fruit.brix}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-[17px] leading-6 text-[#1B1C19]">
                          {fruit.name}
                        </h3>
                        <p className="font-normal text-[13px] leading-5 tracking-[0.15px] text-[#424842]">
                          {fruit.origin}
                        </p>
                      </div>
                    </div>
                  </div>

                  <footer className="px-4 py-4 bg-[#F5F3EE] border-t border-[#C2C8BF] flex items-center justify-between gap-2">
                    <span className="font-bold text-xs leading-4 tracking-[0.4px] text-[#424842]">
                      {fruit.grade}
                    </span>
                    <Link
                      to="/buyer/quotations/request"
                      className="inline-flex items-center gap-1 min-h-[24px] font-bold text-sm leading-5 tracking-[0.1px] text-[#072C15] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072C15] rounded"
                    >
                      <span>
                        Request Quote<span className="sr-only"> for {fruit.name}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    </Link>
                  </footer>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Strategic Infrastructure Pillars Section */}
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
                A comprehensive modular monolith managing procurement, cold chain, quality, orders, and customs under strict international compliance.
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
                    <div className={`w-12 h-12 shrink-0 rounded-[12px] border border-[#C2C8BF] flex items-center justify-center ${pillar.iconBoxClass}`}>
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
