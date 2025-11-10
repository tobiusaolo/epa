import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://epa-backend-fxzh.onrender.com'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login-json', { email, password })
    return response.data
  },
  getCurrentUser: async (token) => {
    const response = await api.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },
  logout: async () => {
    await api.post('/api/auth/logout')
  },
}

// Users API
export const usersAPI = {
  list: async (params = {}) => {
    const response = await api.get('/api/users', { params })
    return response.data
  },
  get: async (id) => {
    const response = await api.get(`/api/users/${id}`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/api/users', data)
    return response.data
  },
  update: async (id, data) => {
    const response = await api.put(`/api/users/${id}`, data)
    return response.data
  },
  deactivate: async (id) => {
    const response = await api.patch(`/api/users/${id}/deactivate`)
    return response.data
  },
  getByRole: async (role) => {
    const response = await api.get(`/api/users/role/${role}`)
    return response.data
  },
}

// Shipments API
export const shipmentsAPI = {
  list: async (params = {}) => {
    const response = await api.get('/api/shipments', { params })
    return response.data
  },
  get: async (id) => {
    const response = await api.get(`/api/shipments/${id}`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/api/shipments', data)
    return response.data
  },
  update: async (id, data) => {
    const response = await api.put(`/api/shipments/${id}`, data)
    return response.data
  },
  updateStatus: async (id, data) => {
    const response = await api.patch(`/api/shipments/${id}/status`, data)
    return response.data
  },
  cancel: async (id, reason) => {
    const response = await api.post(`/api/shipments/${id}/cancel?reason=${encodeURIComponent(reason || '')}`)
    return response.data
  },
  assign: async (id, data) => {
    const response = await api.post(`/api/shipments/${id}/assign`, data)
    return response.data
  },
  getTimeline: async (id) => {
    const response = await api.get(`/api/shipments/${id}/timeline`)
    return response.data
  },
  getInsights: async (id) => {
    const response = await api.get(`/api/shipments/${id}/insights`)
    return response.data
  },
  optimizeRoute: async (params) => {
    const response = await api.post('/api/shipments/optimize-route', null, {
      params,
    })
    return response.data
  },
  exportExcel: async (status) => {
    const response = await api.get('/api/shipments/export/excel', {
      params: status ? { status } : {},
    })
    return response.data
  },
}

// Compliance API
export const complianceAPI = {
  generateT1: async (data) => {
    const response = await api.post('/api/compliance/t1/generate', data)
    return response.data
  },
  getT1: async (id) => {
    const response = await api.get(`/api/compliance/t1/${id}`)
    return response.data
  },
  generateIM4: async (data) => {
    const response = await api.post('/api/compliance/im4/generate', data)
    return response.data
  },
  generateIM7: async (data) => {
    const response = await api.post('/api/compliance/im7/generate', data)
    return response.data
  },
  createSeal: async (data) => {
    const response = await api.post('/api/compliance/seals', data)
    return response.data
  },
  getSeals: async (shipmentId) => {
    const response = await api.get(`/api/compliance/seals/shipment/${shipmentId}`)
    return response.data
  },
  uploadDocument: async (formData) => {
    const response = await api.post('/api/compliance/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  getDocuments: async (shipmentId) => {
    const response = await api.get(`/api/compliance/documents/shipment/${shipmentId}`)
    return response.data
  },
  getSummary: async (shipmentId) => {
    const response = await api.get(`/api/compliance/shipment/${shipmentId}/summary`)
    return response.data
  },
  escalate: async (params) => {
    const response = await api.post('/api/compliance/escalations', null, { params })
    return response.data
  },
  markT1Status: async (formId, status) => {
    const response = await api.patch(`/api/compliance/t1/${formId}/status`, { status })
    return response.data
  },
}

// Reports API
export const reportsAPI = {
  generateDaily: async (date) => {
    const response = await api.get('/api/reports/daily', { params: { date } })
    return response.data
  },
  getKPIs: async () => {
    const response = await api.get('/api/reports/kpis')
    return response.data
  },
  getDelayTrends: async (days = 30) => {
    const response = await api.get('/api/reports/trends/delays', {
      params: { days },
    })
    return response.data
  },
  getControlRoomAlerts: async () => {
    const response = await api.get('/api/reports/control-room/alerts')
    return response.data
  },
  generate: async (data) => {
    const response = await api.post('/api/reports/generate', data)
    return response.data
  },
}

// Notifications API
export const notificationsAPI = {
  list: async (params = {}) => {
    const response = await api.get('/api/notifications', { params })
    return response.data
  },
  getUnread: async (limit = 10) => {
    const response = await api.get('/api/notifications/unread', { params: { limit } })
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/api/notifications', data)
    return response.data
  },
  markRead: async (id) => {
    const response = await api.patch(`/api/notifications/${id}/read`)
    return response.data
  },
  markUnread: async (id) => {
    const response = await api.patch(`/api/notifications/${id}/unread`)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/api/notifications/${id}`)
    return response.data
  },
  markAllRead: async () => {
    const response = await api.post('/api/notifications/mark-all-read')
    return response.data
  },
}

// Inventory API
export const inventoryAPI = {
  list: async (params = {}) => {
    const response = await api.get('/api/inventory', { params })
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/api/inventory', data)
    return response.data
  },
  updateLocation: async (id, locationId) => {
    const response = await api.put(`/api/inventory/${id}/location`, null, {
      params: { location_id: locationId },
    })
    return response.data
  },
}

// Billing API
export const billingAPI = {
  generateInvoice: async (data) => {
    const response = await api.post('/api/billing/invoices/generate', data)
    return response.data
  },
  listInvoices: async (params = {}) => {
    const response = await api.get('/api/billing/invoices', { params })
    return response.data
  },
  calculateCosts: async (shipmentId) => {
    const response = await api.post('/api/billing/costs/calculate', null, {
      params: { shipment_id: shipmentId },
    })
    return response.data
  },
}

export default api

