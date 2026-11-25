import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { RoleRoute } from './components/auth/RoleRoute'
import { LoginPage } from './pages/public/LoginPage'
import { RegisterPage } from './pages/public/RegisterPage'
import { UnauthorizedPage } from './pages/public/UnauthorizedPage'

import {
  PublicLayout,
  AdminLayout,
  BuyerLayout,
  EngineerLayout,
  QcLayout,
  LogisticsLayout,
  ManagerLayout,
  EditorLayout,
} from './layouts/PortalLayouts'

// Dashboards
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const EngineerDashboard = lazy(() => import('./pages/engineer/EngineerDashboard'))
const QcDashboard = lazy(() => import('./pages/qc/QcDashboard'))
const LogisticsDashboard = lazy(() => import('./pages/logistics/LogisticsDashboard'))
const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard'))
const EditorDashboard = lazy(() => import('./pages/editor/EditorDashboard'))

// Buyer Pages
const DashboardPage = lazy(() => import('./pages/buyer/DashboardPage'))
const CompanyProfilePage = lazy(() => import('./pages/buyer/CompanyProfilePage'))
const CatalogPage = lazy(() => import('./pages/buyer/CatalogPage'))
const FruitDetailsPage = lazy(() => import('./pages/buyer/FruitDetailsPage'))
const QuotationsPage = lazy(() => import('./pages/buyer/QuotationsPage'))
const RequestQuotationPage = lazy(() => import('./pages/buyer/RequestQuotationPage'))
const QuotationDetailsPage = lazy(() => import('./pages/buyer/QuotationDetailsPage'))
const OrdersPage = lazy(() => import('./pages/buyer/OrdersPage'))
const OrderDetailsPage = lazy(() => import('./pages/buyer/OrderDetailsPage'))
const ShipmentsPage = lazy(() => import('./pages/buyer/ShipmentsPage'))
const CustomsPage = lazy(() => import('./pages/buyer/CustomsPage'))
const DocumentsPage = lazy(() => import('./pages/buyer/DocumentsPage'))
const NotificationsPage = lazy(() => import('./pages/buyer/NotificationsPage'))

function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
      <h3 className="text-xl font-heading font-semibold text-primary">{name}</h3>
      <p className="mt-2 text-muted-foreground font-sans">
        This is a placeholder page for the {name} feature.
      </p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              
              {/* Admin Routes */}
              <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<PlaceholderPage name="System Users" />} />
                  <Route path="suppliers" element={<PlaceholderPage name="Suppliers" />} />
                  <Route path="buyers" element={<PlaceholderPage name="Buyers" />} />
                  <Route path="catalog" element={<PlaceholderPage name="Catalog" />} />
                  <Route path="procurement" element={<PlaceholderPage name="Procurement" />} />
                  <Route path="qc" element={<PlaceholderPage name="QC" />} />
                  <Route path="batches" element={<PlaceholderPage name="Batches" />} />
                  <Route path="warehouses" element={<PlaceholderPage name="Warehouses" />} />
                  <Route path="inventory" element={<PlaceholderPage name="Inventory" />} />
                  <Route path="cold-chain" element={<PlaceholderPage name="Cold Chain" />} />
                  <Route path="orders" element={<PlaceholderPage name="Orders" />} />
                  <Route path="packaging" element={<PlaceholderPage name="Packaging" />} />
                  <Route path="documents" element={<PlaceholderPage name="Documents" />} />
                  <Route path="shipments" element={<PlaceholderPage name="Shipments" />} />
                  <Route path="customs" element={<PlaceholderPage name="Customs" />} />
                  <Route path="audit" element={<PlaceholderPage name="Audit Log" />} />
                  <Route path="analytics" element={<PlaceholderPage name="Analytics" />} />
                </Route>
              </Route>

              {/* Buyer Routes */}
              <Route element={<RoleRoute allowedRoles={['BUYER']} />}>
                <Route path="/buyer" element={<BuyerLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="profile" element={<CompanyProfilePage />} />
                  <Route path="catalog" element={<CatalogPage />} />
                  <Route path="catalog/:id" element={<FruitDetailsPage />} />
                  <Route path="quotations" element={<QuotationsPage />} />
                  <Route path="quotations/request" element={<RequestQuotationPage />} />
                  <Route path="quotations/:id" element={<QuotationDetailsPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="orders/:id" element={<OrderDetailsPage />} />
                  <Route path="shipments" element={<ShipmentsPage />} />
                  <Route path="customs" element={<CustomsPage />} />
                  <Route path="documents" element={<DocumentsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>
              </Route>

              {/* Engineer Routes */}
              <Route element={<RoleRoute allowedRoles={['ENGINEER']} />}>
                <Route path="/engineer" element={<EngineerLayout />}>
                  <Route index element={<EngineerDashboard />} />
                  <Route path="suppliers" element={<PlaceholderPage name="Suppliers" />} />
                  <Route path="procurement" element={<PlaceholderPage name="Procurement" />} />
                  <Route path="batches" element={<PlaceholderPage name="Batches" />} />
                  <Route path="warehouses" element={<PlaceholderPage name="Warehouses" />} />
                  <Route path="inventory" element={<PlaceholderPage name="Inventory" />} />
                  <Route path="operations" element={<PlaceholderPage name="Operations" />} />
                </Route>
              </Route>

              {/* QC Inspector Routes */}
              <Route element={<RoleRoute allowedRoles={['QC_INSPECTOR']} />}>
                <Route path="/qc" element={<QcLayout />}>
                  <Route index element={<QcDashboard />} />
                  <Route path="inspections" element={<PlaceholderPage name="Inspections" />} />
                  <Route path="grading" element={<PlaceholderPage name="Grading" />} />
                  <Route path="failed-batches" element={<PlaceholderPage name="Failed Batches" />} />
                  <Route path="reinspection" element={<PlaceholderPage name="Reinspection" />} />
                  <Route path="history" element={<PlaceholderPage name="Quality History" />} />
                </Route>
              </Route>

              {/* Logistics Routes */}
              <Route element={<RoleRoute allowedRoles={['LOGISTICS']} />}>
                <Route path="/logistics" element={<LogisticsLayout />}>
                  <Route index element={<LogisticsDashboard />} />
                  <Route path="warehouse" element={<PlaceholderPage name="Warehouse" />} />
                  <Route path="packaging" element={<PlaceholderPage name="Packaging" />} />
                  <Route path="shipments" element={<PlaceholderPage name="Shipments" />} />
                  <Route path="customs" element={<PlaceholderPage name="Customs" />} />
                  <Route path="delayed-shipments" element={<PlaceholderPage name="Delayed Shipments" />} />
                  <Route path="delivery" element={<PlaceholderPage name="Delivery" />} />
                </Route>
              </Route>

              {/* Manager Routes */}
              <Route element={<RoleRoute allowedRoles={['MANAGER']} />}>
                <Route path="/manager" element={<ManagerLayout />}>
                  <Route index element={<ManagerDashboard />} />
                  <Route path="orders" element={<PlaceholderPage name="Operations Orders" />} />
                  <Route path="quotations" element={<PlaceholderPage name="Manager Quotations" />} />
                  <Route path="procurement" element={<PlaceholderPage name="Procurement Batches" />} />
                  <Route path="inventory" element={<PlaceholderPage name="Inventory Control" />} />
                  <Route path="qc" element={<PlaceholderPage name="QC Sign-Off" />} />
                  <Route path="shipments" element={<PlaceholderPage name="Logistics Shipments" />} />
                  <Route path="customs" element={<PlaceholderPage name="Customs Clearance" />} />
                  <Route path="analytics" element={<PlaceholderPage name="Operational Analytics" />} />
                </Route>
              </Route>

              {/* Editor Routes */}
              <Route element={<RoleRoute allowedRoles={['EDITOR']} />}>
                <Route path="/editor" element={<EditorLayout />}>
                  <Route index element={<EditorDashboard />} />
                  <Route path="catalog" element={<PlaceholderPage name="Produce Catalog Editor" />} />
                  <Route path="varieties" element={<PlaceholderPage name="Varieties & Specs" />} />
                  <Route path="suppliers" element={<PlaceholderPage name="Supplier Network" />} />
                  <Route path="batches" element={<PlaceholderPage name="Harvest Batches" />} />
                  <Route path="packaging" element={<PlaceholderPage name="Packaging Protocols" />} />
                </Route>
              </Route>

            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
