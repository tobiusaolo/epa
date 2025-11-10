import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Avatar,
} from '@mui/material'
import {
  Add,
  Edit,
  Visibility,
  Cancel,
  CheckCircle,
  MoreVert,
  PendingActions,
  FlightTakeoff,
  DoneAll,
  ListAlt,
  Map,
  Phone,
  Inventory2,
  AssignmentTurnedIn,
  LocalPolice,
  Description,
} from '@mui/icons-material'
import { shipmentsAPI } from '../services/api'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import DataTable from '../components/DataTable'

const Shipments = () => {
  const navigate = useNavigate()
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingShipment, setEditingShipment] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    shipper_name: '',
    consignee_name: '',
    consignee_email: '',
    consignee_phone: '',
    container_number: '',
    cargo_description: '',
    estimated_cost: '',
  })
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, shipment: null })

  useEffect(() => {
    fetchShipments()
  }, [tabValue])

  const fetchShipments = async () => {
    try {
      setLoading(true)
      const statusFilter =
        tabValue === 1
          ? 'pending'
          : tabValue === 2
          ? 'in_transit'
          : tabValue === 3
          ? 'delivered'
          : undefined
      const data = await shipmentsAPI.list({
        status: statusFilter,
        limit: 100,
      })
      // Ensure latest shipments are at the top (sort by updated_at, then created_at)
      const sorted = (data.items || []).sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0)
        const dateB = new Date(b.updated_at || b.created_at || 0)
        return dateB - dateA // Descending order (newest first)
      })
      setShipments(sorted)
    } catch (error) {
      toast.error('Failed to load shipments')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = () => {
    setEditingShipment(null)
    setFormData({
      origin: '',
      destination: '',
      shipper_name: '',
      consignee_name: '',
      consignee_email: '',
      consignee_phone: '',
      container_number: '',
      cargo_description: '',
      estimated_cost: '',
    })
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const normalizePayload = () => {
    const trimmed = {
      ...formData,
    }
    const optionalFields = ['shipper_name', 'consignee_email', 'consignee_phone', 'container_number', 'cargo_description']
    optionalFields.forEach((field) => {
      const value = trimmed[field]
      if (typeof value === 'string') {
        const clean = value.trim()
        trimmed[field] = clean ? clean : null
      }
    })
    trimmed.estimated_cost = formData.estimated_cost ? parseFloat(formData.estimated_cost) : null
    trimmed.origin = formData.origin.trim()
    trimmed.destination = formData.destination.trim()
    trimmed.consignee_name = formData.consignee_name.trim()
    return trimmed
  }

  const handleSubmit = async () => {
    try {
      const payload = normalizePayload()
      if (editingShipment) {
        // Update existing
        await shipmentsAPI.update(editingShipment.id, payload)
        toast.success('Shipment updated successfully')
      } else {
        // Create new
        await shipmentsAPI.create(payload)
        toast.success('Shipment created successfully')
        window.dispatchEvent(new Event('notifications:updated'))
      }
      handleCloseDialog()
      setEditingShipment(null)
      fetchShipments()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save shipment')
    }
  }

  const handleView = (shipment) => {
    navigate(`/shipments/${shipment.id}`)
  }

  const handleStatusUpdate = async (shipmentId, status) => {
    try {
      await shipmentsAPI.updateStatus(shipmentId, { status, notes: 'Status updated' })
      toast.success('Status updated')
      fetchShipments()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleCancel = async (shipmentId) => {
    if (window.confirm('Are you sure you want to cancel this shipment?')) {
      try {
        await shipmentsAPI.cancel(shipmentId, 'Cancelled by admin')
        toast.success('Shipment cancelled')
        fetchShipments()
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to cancel shipment')
      }
    }
  }

  const openActionsMenu = Boolean(actionMenu.anchorEl)

  const handleOpenActionsMenu = (event, shipment) => {
    event.stopPropagation()
    setActionMenu({ anchorEl: event.currentTarget, shipment })
  }

  const handleCloseActionsMenu = () => {
    setActionMenu({ anchorEl: null, shipment: null })
  }

  const getNextStatus = (currentStatus) => {
    if (currentStatus === 'pending') return 'in_transit'
    if (currentStatus === 'in_transit') return 'delivered'
    return null
  }

  const handleAdvanceStatus = async () => {
    if (!actionMenu.shipment) return
    const nextStatus = getNextStatus(actionMenu.shipment.status)
    if (!nextStatus) return
    await handleStatusUpdate(actionMenu.shipment.id, nextStatus)
    handleCloseActionsMenu()
  }

  const handleCancelShipment = async () => {
    if (!actionMenu.shipment) return
    handleCloseActionsMenu()
    handleCancel(actionMenu.shipment.id)
  }

  const handleMenuView = () => {
    if (!actionMenu.shipment) return
    handleView(actionMenu.shipment)
    handleCloseActionsMenu()
  }

  const handleMenuEdit = () => {
    if (!actionMenu.shipment) return
    handleEdit(actionMenu.shipment)
    handleCloseActionsMenu()
  }

  const handleEdit = async (shipment) => {
    setEditingShipment(shipment)
    setFormData({
      origin: shipment.origin || '',
      destination: shipment.destination || '',
      shipper_name: shipment.shipper_name || '',
      consignee_name: shipment.consignee_name || '',
      consignee_email: shipment.consignee_email || '',
      consignee_phone: shipment.consignee_phone || '',
      container_number: shipment.container_number || '',
      cargo_description: shipment.cargo_description || '',
      estimated_cost: shipment.estimated_cost || '',
    })
    setOpenDialog(true)
  }

  const handleExportExcel = async () => {
    try {
      const statusFilter =
        tabValue === 1
          ? 'pending'
          : tabValue === 2
          ? 'in_transit'
          : tabValue === 3
          ? 'delivered'
          : undefined
      
      const response = await shipmentsAPI.exportExcel(statusFilter)
      
      // Decode base64 and download
      const byteCharacters = atob(response.data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], {
        type: response.mime_type,
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = response.file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Excel file downloaded successfully')
    } catch (error) {
      toast.error('Failed to export Excel file')
      console.error(error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success'
      case 'in_transit':
        return 'info'
      case 'pending':
        return 'warning'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            variant="rounded"
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.light',
              color: 'primary.dark',
              boxShadow: '0 8px 20px rgba(25,118,210,0.25)',
            }}
          >
            <Map />
          </Avatar>
          <Box>
        <Typography variant="h4" fontWeight="bold">
          Shipment Management
        </Typography>
            <Typography variant="body2" color="text.secondary">
              Create, monitor, and action freight missions
            </Typography>
          </Box>
        </Stack>
        <Tooltip title="Create a new shipment" arrow>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
          New Shipment
        </Button>
        </Tooltip>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          allowScrollButtonsMobile
        >
          <Tab icon={<ListAlt fontSize="small" />} iconPosition="start" label="All" />
          <Tab icon={<PendingActions fontSize="small" />} iconPosition="start" label="Pending" />
          <Tab icon={<FlightTakeoff fontSize="small" />} iconPosition="start" label="In Transit" />
          <Tab icon={<DoneAll fontSize="small" />} iconPosition="start" label="Delivered" />
        </Tabs>
      </Paper>

      <DataTable
        columns={[
          {
            field: 'shipment_number',
            headerName: 'Shipment #',
            render: (row) => (
              <Typography variant="body2" fontWeight="medium">
                {row.shipment_number}
              </Typography>
            ),
          },
          { field: 'origin', headerName: 'Origin' },
          { field: 'destination', headerName: 'Destination' },
          { field: 'shipper_name', headerName: "Shipper's Name" },
          { field: 'consignee_name', headerName: 'Consignee' },
          {
            field: 'consignee_phone',
            headerName: 'Consignee Phone',
            render: (row) => (
              <Stack direction="row" spacing={1} alignItems="center">
                <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2">{row.consignee_phone || '—'}</Typography>
              </Stack>
            ),
          },
          { field: 'container_number', headerName: 'Container #', render: (row) => (
            <Stack direction="row" spacing={1} alignItems="center">
              <Inventory2 sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2">{row.container_number || '—'}</Typography>
            </Stack>
          ) },
          {
            field: 'compliance',
            headerName: 'Compliance',
            render: (row) => (
              <Stack direction="row" spacing={1}>
                <Chip
                  icon={<AssignmentTurnedIn sx={{ fontSize: 18 }} />}
                  label={
                    row.t1_form_count > 0
                      ? `T1 Forms (${row.t1_form_count})`
                      : 'No T1 Forms'
                  }
                  color={row.t1_form_count > 0 ? 'primary' : 'default'}
                  size="small"
                  variant={row.t1_form_count > 0 ? 'filled' : 'outlined'}
                />
                <Chip
                  icon={<LocalPolice sx={{ fontSize: 18 }} />}
                  label={
                    row.seal_count > 0
                      ? `Seals (${row.seal_count})`
                      : 'No Seals'
                  }
                  color={row.seal_count > 0 ? 'secondary' : 'default'}
                  size="small"
                  variant={row.seal_count > 0 ? 'filled' : 'outlined'}
                />
              </Stack>
            ),
          },
          {
            field: 'status',
            headerName: 'Status',
            render: (row) => (
              <Chip
                label={row.status}
                color={getStatusColor(row.status)}
                size="small"
              />
            ),
          },
          {
            field: 'created_at',
            headerName: 'Created',
            render: (row) =>
              row.created_at
                ? format(new Date(row.created_at), 'MMM dd, yyyy')
                : 'N/A',
          },
          {
            field: 'actions',
            headerName: 'Actions',
            align: 'right',
            render: (row) => (
              <Box>
                <Tooltip title="Shipment actions">
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenActionsMenu(e, row)}
                    color="primary"
                  >
                    <MoreVert />
                  </IconButton>
                </Tooltip>
              </Box>
            ),
          },
        ]}
        data={shipments}
        loading={loading}
        onRowClick={handleView}
        searchable
        exportable
        onExport={handleExportExcel}
        onRefresh={fetchShipments}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingShipment ? 'Edit Shipment' : 'Create New Shipment'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Origin"
                value={formData.origin}
                onChange={(e) =>
                  setFormData({ ...formData, origin: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Destination"
                value={formData.destination}
                onChange={(e) =>
                  setFormData({ ...formData, destination: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Shipper's Name"
                value={formData.shipper_name}
                onChange={(e) =>
                  setFormData({ ...formData, shipper_name: e.target.value })
                }
                helperText="Name of the shipper/exporter"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Consignee Name"
                value={formData.consignee_name}
                onChange={(e) =>
                  setFormData({ ...formData, consignee_name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Consignee Email"
                type="email"
                value={formData.consignee_email}
                onChange={(e) =>
                  setFormData({ ...formData, consignee_email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Consignee Phone"
                value={formData.consignee_phone}
                onChange={(e) =>
                  setFormData({ ...formData, consignee_phone: e.target.value })
                }
                placeholder="+256700000000"
                helperText="Include country code (e.g., +2567XXXXXXXX)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Container Number"
                value={formData.container_number}
                onChange={(e) =>
                  setFormData({ ...formData, container_number: e.target.value })
                }
                helperText="Container/Unit number"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cargo/Goods Description"
                multiline
                rows={3}
                value={formData.cargo_description}
                onChange={(e) =>
                  setFormData({ ...formData, cargo_description: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated Cost"
                type="number"
                value={formData.estimated_cost}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_cost: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            handleCloseDialog()
            setEditingShipment(null)
          }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingShipment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={actionMenu.anchorEl}
        open={openActionsMenu}
        onClose={handleCloseActionsMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleMenuView}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View Details" secondary="Open shipment workspace" />
        </MenuItem>
        <MenuItem onClick={handleMenuEdit}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit" secondary="Update shipment details" />
        </MenuItem>
        <MenuItem onClick={handleAdvanceStatus} disabled={!getNextStatus(actionMenu.shipment?.status)}>
          <ListItemIcon>
            <CheckCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Advance Status" secondary="Move to next milestone" />
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleCancelShipment}>
          <ListItemIcon>
            <Cancel fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Cancel Shipment" secondary="Stop and record cancellation" primaryTypographyProps={{ color: 'error.main' }} />
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default Shipments

