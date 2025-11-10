# EPA FMS Admin Dashboard - User Guide

## 🎉 Welcome to the EPA Freight Management System Admin Dashboard

A professional, world-class admin interface built with React.js and Material-UI.

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd backend
python3 run.py
```
Backend runs on: http://localhost:8000

### 2. Start the Dashboard
```bash
cd epa-dashboard
npm run dev
```
Dashboard runs on: http://localhost:3000

## 🔐 Login Credentials

**Default Admin Account:**
- Email: `testuser@example.com`
- Password: `testpass123`

## 📋 Features Overview

### 1. **Dashboard**
- Real-time KPIs (Total Shipments, Pending, In Transit, Delivered)
- Visual charts and graphs
- Delivery rate metrics
- Recent shipments overview
- Status distribution pie chart

### 2. **User Management**
- View all users
- Create new users
- Edit user details
- Deactivate users
- Role management
- User status indicators

### 3. **Shipment Management**
- Create new shipments
- View all shipments with filters (All, Pending, In Transit, Delivered)
- Update shipment status
- View detailed shipment timeline
- Track shipment progress
- Assign drivers to shipments

### 4. **Compliance & Customs**
- Generate T1 forms
- Generate IM4/IM7 forms
- Create and manage seals
- Upload compliance documents
- Track compliance status

### 5. **Reports & Analytics**
- Daily reports generation
- KPI dashboard
- Delay trends analysis
- Visual charts and graphs
- Export capabilities

### 6. **Inventory Management**
- Add inventory items
- Track stock levels
- Manage SKUs
- View inventory value
- Update locations

### 7. **Billing & Invoicing**
- Generate invoices
- View all invoices
- Track payment status
- Calculate costs
- M-Pesa integration ready

## 🎨 UI/UX Features

- **Material Design**: Clean, modern Material-UI components
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Intuitive Navigation**: Easy-to-use sidebar menu
- **Real-time Updates**: Live data from backend API
- **Toast Notifications**: User-friendly feedback
- **Loading States**: Smooth loading indicators
- **Error Handling**: Graceful error messages
- **Professional Styling**: World-class look and feel

## 🔄 Workflow Examples

### Creating a Shipment
1. Navigate to **Shipments**
2. Click **New Shipment**
3. Fill in origin, destination, consignee details
4. Add cargo description
5. Set estimated cost
6. Click **Create**

### Generating T1 Form
1. Go to **Compliance**
2. Select a shipment
3. Fill in transporter details
4. Enter vehicle registration
5. Add goods description
6. Click **Generate T1 Form**

### Managing Users
1. Navigate to **Users**
2. Click **Add User** to create new user
3. Or click **Edit** icon to modify existing user
4. Use **Block** icon to deactivate users

## 🛠️ Technical Stack

- **React 18**: Modern React with hooks
- **Material-UI 5**: Professional component library
- **React Router 6**: Client-side routing
- **Axios**: HTTP client for API calls
- **Recharts**: Beautiful charts and graphs
- **Vite**: Fast build tool
- **Date-fns**: Date formatting

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1366px+)
- Tablet (768px+)
- Mobile (375px+)

## 🔒 Security Features

- JWT token authentication
- Protected routes
- Auto-logout on token expiry
- Secure API communication
- Input validation

## 🎯 Best Practices

1. **Always log out** when done
2. **Verify data** before submitting forms
3. **Check notifications** for operation results
4. **Use filters** to find specific records
5. **Review details** before making changes

## 🐛 Troubleshooting

### Dashboard won't load
- Check if backend is running on port 8000
- Verify API URL in `.env` file
- Check browser console for errors

### Login fails
- Verify backend is running
- Check credentials
- Ensure user has admin role

### API errors
- Check backend logs
- Verify CORS settings
- Ensure token is valid

## 📞 Support

For issues or questions, check:
1. Backend logs: `backend/` directory
2. Browser console: F12 Developer Tools
3. Network tab: Check API requests

---

**Enjoy managing your freight operations! 🚚📦**



