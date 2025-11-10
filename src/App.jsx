import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'
import Users from './pages/Users'
import Shipments from './pages/Shipments'
import ShipmentTracking from './pages/ShipmentTracking'
import ShipmentDetail from './pages/ShipmentDetail'
import Compliance from './pages/Compliance'
import Reports from './pages/Reports'
import Notifications from './pages/Notifications'
import { Box, CircularProgress } from '@mui/material'

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="shipments" element={<Shipments />} />
        <Route path="shipments/:shipmentId" element={<ShipmentDetail />} />
        <Route path="tracking" element={<ShipmentTracking />} />
        <Route path="compliance" element={<Compliance />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App

