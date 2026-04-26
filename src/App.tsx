import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"

import AdminLayout from "./layouts/AdminLayout"
import ProtectedRoute from "./components/admin/ProtectedRoute"

import Dashboard from "./pages/admin/Dashboard"
import Users from "./pages/admin/Users"
import Recharges from "./pages/admin/Recharges"
import Withdrawals from "./pages/admin/Withdrawals"
import Transactions from "./pages/admin/Transactions"
import Commissions from "./pages/admin/Commissions"
import Notifications from "./pages/admin/Notifications"
import AdminGift from "./pages/admin/Gifts"
import Banks from "./pages/admin/Banks"
import AdminFinance from "./pages/admin/AdminFinance"
import AdminLogs from "./pages/admin/AdminLogs"
import OtcOrders from "./components/admin/OtcOrders"
import OtcStats from "./components/admin/OtcStats"
import OtcAssets from "./pages/admin/OtcAssets"
import OTC from "./pages/admin/OTC"
import OTCAudit from "./pages/admin/OTCAudit"
import OTCPriceHistory from "./pages/admin/OTCPriceHistory"
import AdminSettlements from "./pages/admin/settlements/AdminSettlements"
import AdminServiceRequests from "./pages/admin/services/AdminServiceRequests"
import AdminServiceRefunds from "./pages/admin/service-refunds/AdminServiceRefunds"
import AdminRevenue from "./pages/admin/revenue/AdminRevenue"
import SupportChat from "./pages/admin/SupportChat"
import AdminPartners from "./pages/admin/AdminPartners"
import AdminKYCPage from "./pages/admin/kyc/AdminKYCPage"
import OtcOrdemDetalhe from "./pages/admin/OtcOrdemDetalhe"
import AdminApplications from "./pages/admin/AdminApplications"
import AdminKixikila from "./pages/admin/AdminKixikila"
import AdminDashboard from './pages/AdminDashboard'
import TaskManager from "./pages/admin/TaskManager"
import AdminLogin from "./pages/admin/Login"

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: "#ecfdf5",
              color: "#065f46",
              border: "1px solid #10b981",
              fontWeight: "500",
            },
          },
          error: {
            style: {
              background: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #ef4444",
              fontWeight: "500",
            },
          },
        }}
      />

      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<AdminLogin />} />

        {/* ADMIN PROTECTED */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* DASHBOARD */}
          <Route index element={<Dashboard />} />

          {/* CORE */}
          <Route path="users" element={<Users />} />
          <Route path="recharges" element={<Recharges />} />
          <Route path="withdrawals" element={<Withdrawals />} />
          <Route path="banks" element={<Banks />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="gift" element={<AdminGift />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="partners" element={<AdminPartners />} />
          <Route path="support" element={<SupportChat />} />
          <Route path="kyc" element={<AdminKYCPage />} />
          <Route path="/admin/kixikila" element={<AdminKixikila />} />
          <Route path="/admin/tasks" element={<AdminDashboard />} />
          <Route path="/admin/task-manager" element={<TaskManager />} />

          {/* INVESTMENTS */}
          <Route path="applications" element={<AdminApplications />} />

          {/* OTC */}
          <Route path="otc" element={<OTC />} />
          <Route path="otc/orders" element={<OtcOrders />} />
         <Route path="otc/ordem/:id" element={<OtcOrdemDetalhe />} />
          <Route path="otc/stats" element={<OtcStats />} />
          <Route path="otc/assets" element={<OtcAssets />} />
          <Route path="otc/audit" element={<OTCAudit />} />
          <Route path="otc/price-history" element={<OTCPriceHistory />} />

          {/* SERVICES */}
          <Route path="settlements" element={<AdminSettlements />} />
          <Route path="services" element={<AdminServiceRequests />} />
          <Route path="service-refunds" element={<AdminServiceRefunds />} />
          <Route path="revenue" element={<AdminRevenue />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}