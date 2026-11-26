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
  QcLayout,
  LogisticsLayout,
  ManagerLayout,
} from './layouts/PortalLayouts'

// Dashboards
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const CatalogPricingPage = lazy(() => import('./pages/admin/CatalogPricingPage'))
const CalendarPage = lazy(() => import('./pages/calendar/CalendarPage'))
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminQuotationsPage = lazy(() => import('./pages/admin/AdminQuotationsPage'))
const AdminSuppliersPage = lazy(() => import('./pages/admin/AdminSuppliersPage'))
const AdminBuyersPage = lazy(() => import('./pages/admin/AdminBuyersPage'))
const AdminProcurementPage = lazy(() => import('./pages/admin/AdminProcurementPage'))
const AdminQcPage = lazy(() => import('./pages/admin/AdminQcPage'))
const AdminBatchesPage = lazy(() => import('./pages/admin/AdminBatchesPage'))
const AdminWarehousesPage = lazy(() => import('./pages/admin/AdminWarehousesPage'))
const AdminInventoryPage = lazy(() => import('./pages/admin/AdminInventoryPage'))
const AdminColdChainPage = lazy(() => import('./pages/admin/AdminColdChainPage'))
const AdminPackagingPage = lazy(() => import('./pages/admin/AdminPackagingPage'))
const AdminDocumentsPage = lazy(() => import('./pages/admin/AdminDocumentsPage'))
const AdminShipmentsPage = lazy(() => import('./pages/admin/AdminShipmentsPage'))
const AdminCustomsPage = lazy(() => import('./pages/admin/AdminCustomsPage'))
const AdminAuditPage = lazy(() => import('./pages/admin/AdminAuditPage'))
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'))
const QcDashboard = lazy(() => import('./pages/qc/QcDashboard'))
const LogisticsDashboard = lazy(() => import('./pages/logistics/LogisticsDashboard'))
const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard'))

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
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="suppliers" element={<AdminSuppliersPage />} />
                  <Route path="buyers" element={<AdminBuyersPage />} />
                  <Route path="catalog" element={<CatalogPricingPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="procurement" element={<AdminProcurementPage />} />
                  <Route path="qc" element={<AdminQcPage />} />
                  <Route path="batches" element={<AdminBatchesPage />} />
                  <Route path="warehouses" element={<AdminWarehousesPage />} />
                  <Route path="inventory" element={<AdminInventoryPage />} />
                  <Route path="cold-chain" element={<AdminColdChainPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="quotations" element={<AdminQuotationsPage />} />
                  <Route path="packaging" element={<AdminPackagingPage />} />
                  <Route path="documents" element={<AdminDocumentsPage />} />
                  <Route path="shipments" element={<AdminShipmentsPage />} />
                  <Route path="customs" element={<AdminCustomsPage />} />
                  <Route path="audit" element={<AdminAuditPage />} />
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
                </Route>
              </Route>

              {/* Buyer Routes (Accessible to Buyers, Managers, and Admins) */}
              <Route element={<RoleRoute allowedRoles={['BUYER', 'MANAGER']} />}>
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

              {/* QC Inspector Routes */}
              <Route element={<RoleRoute allowedRoles={['QC_INSPECTOR']} />}>
                <Route path="/qc" element={<QcLayout />}>
                  <Route index element={<QcDashboard />} />
                  <Route path="inspections" element={<AdminQcPage />} />
                  <Route path="grading" element={<AdminQcPage />} />
                  <Route path="failed-batches" element={<AdminBatchesPage />} />
                  <Route path="reinspection" element={<AdminQcPage />} />
                  <Route path="history" element={<AdminQcPage />} />
                </Route>
              </Route>

              {/* Logistics Routes */}
              <Route element={<RoleRoute allowedRoles={['LOGISTICS']} />}>
                <Route path="/logistics" element={<LogisticsLayout />}>
                  <Route index element={<LogisticsDashboard />} />
                  <Route path="warehouse" element={<AdminWarehousesPage />} />
                  <Route path="packaging" element={<AdminPackagingPage />} />
                  <Route path="shipments" element={<AdminShipmentsPage />} />
                  <Route path="customs" element={<AdminCustomsPage />} />
                  <Route path="delayed-shipments" element={<AdminShipmentsPage />} />
                  <Route path="delivery" element={<AdminShipmentsPage />} />
                </Route>
              </Route>

              {/* Manager Routes */}
              <Route element={<RoleRoute allowedRoles={['MANAGER']} />}>
                <Route path="/manager" element={<ManagerLayout />}>
                  <Route index element={<ManagerDashboard />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="catalog" element={<CatalogPricingPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="quotations" element={<AdminQuotationsPage />} />
                  <Route path="procurement" element={<AdminProcurementPage />} />
                  <Route path="inventory" element={<AdminInventoryPage />} />
                  <Route path="qc" element={<AdminQcPage />} />
                  <Route path="shipments" element={<AdminShipmentsPage />} />
                  <Route path="customs" element={<AdminCustomsPage />} />
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
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
