import { 
  LayoutDashboard, Users, Tractor, Globe, ClipboardCheck, PackageSearch, 
  Truck, FileText, Bell, Ship, Building, BookOpen, Warehouse, 
  Thermometer, Archive, BarChart, History, Box, ShieldCheck, CheckSquare, AlertTriangle, 
  Clock, Calendar
} from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { LandingPage } from "../pages/public/LandingPage"

// --- Public Layout (High-End Agro-Export Platform Landing) ---
export function PublicLayout() {
  return <LandingPage />
}

// --- Admin Layout ---
const adminNav = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Suppliers', path: '/admin/suppliers', icon: Tractor },
  { name: 'Buyers', path: '/admin/buyers', icon: Users },
  { name: 'Catalog & Pricing', path: '/admin/catalog', icon: Globe },
  { name: 'Operations Calendar', path: '/admin/calendar', icon: Calendar },
  { name: 'Procurement', path: '/admin/procurement', icon: FileText },
  { name: 'QC', path: '/admin/qc', icon: ShieldCheck },
  { name: 'Batches', path: '/admin/batches', icon: Box },
  { name: 'Warehouses', path: '/admin/warehouses', icon: Warehouse },
  { name: 'Inventory', path: '/admin/inventory', icon: PackageSearch },
  { name: 'Cold Chain', path: '/admin/cold-chain', icon: Thermometer },
  { name: 'Orders & Audit', path: '/admin/orders', icon: FileText },
  { name: 'Quotations & Pricing', path: '/admin/quotations', icon: FileText },
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
  { name: 'User Access', path: '/manager/users', icon: Users },
  { name: 'Catalog & Pricing', path: '/manager/catalog', icon: Globe },
  { name: 'Operations Calendar', path: '/manager/calendar', icon: Calendar },
  { name: 'Orders & Audit', path: '/manager/orders', icon: FileText },
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
