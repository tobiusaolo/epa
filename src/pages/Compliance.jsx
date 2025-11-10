import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  Avatar,
  Tooltip,
  TablePagination,
} from '@mui/material'
import {
  Assignment,
  Description,
  Security,
  Assessment,
  LocalShipping,
  CheckCircle,
  Warning,
  DataUsage,
  DashboardCustomize,
  FlashOn,
  ReceiptLong,
  VerifiedUser,
  ManageAccounts,
  Gavel,
  AssignmentTurnedIn,
} from '@mui/icons-material'
import { complianceAPI, shipmentsAPI } from '../services/api'
import { toast } from 'react-toastify'

const Compliance = () => {
  const [shipments, setShipments] = useState([])
  const [selectedShipment, setSelectedShipment] = useState('')
  const [t1Form, setT1Form] = useState({
    transporter_name: '',
    transporter_tin: '',
    vehicle_registration: '',
    goods_description: '',
    customs_declaration_number: '',
  })
  const [sealData, setSealData] = useState({
    seal_number: '',
    seal_type: '',
  })
  const [summary, setSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [actionsShipment, setActionsShipment] = useState(null)
  const [actionsAnchorEl, setActionsAnchorEl] = useState(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [documentData, setDocumentData] = useState({ document_type: '', title: '', file: null })
  const [showEscalationDialog, setShowEscalationDialog] = useState(false)
  const [escalationData, setEscalationData] = useState({ issue_type: '', description: '', priority: 'medium' })
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [t1StatusForm, setT1StatusForm] = useState({ formId: '', status: 'submitted' })
  const [showT1Dialog, setShowT1Dialog] = useState(false)
  const [showSealDialog, setShowSealDialog] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [overviewPage, setOverviewPage] = useState(0)
  const [overviewRowsPerPage, setOverviewRowsPerPage] = useState(10)

  const shipmentsWithT1 = useMemo(
    () => shipments.filter((shipment) => (shipment.t1_form_count || 0) > 0),
    [shipments]
  )

  useEffect(() => {
    fetchShipments()
  }, [])

  const fetchShipments = async () => {
    try {
      const data = await shipmentsAPI.list({ limit: 100 })
      const sorted = (data.items || []).sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0)
        const dateB = new Date(b.updated_at || b.created_at || 0)
        return dateB - dateA
      })
      setShipments(sorted)
    } catch (error) {
      toast.error('Failed to load shipments')
    }
  }

  const handleGenerateT1 = async () => {
    if (!selectedShipment) {
      toast.error('Please select a shipment')
      return
    }
    try {
      await complianceAPI.generateT1({
        shipment_id: parseInt(selectedShipment, 10),
        ...t1Form,
      })
      toast.success('T1 form generated successfully')
      setShowT1Dialog(false)
      setT1Form({
        transporter_name: '',
        transporter_tin: '',
        vehicle_registration: '',
        goods_description: '',
        customs_declaration_number: '',
      })
      fetchShipments()
      fetchSummary(parseInt(selectedShipment, 10))
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate T1 form')
    }
  }

  const handleCreateSeal = async () => {
    if (!selectedShipment) {
      toast.error('Please select a shipment')
      return
    }
    if (!sealData.seal_number) {
      toast.error('Seal number is required')
      return
    }
    try {
      await complianceAPI.createSeal({
        shipment_id: parseInt(selectedShipment, 10),
        ...sealData,
      })
      toast.success('Seal created successfully')
      setShowSealDialog(false)
      setSealData({ seal_number: '', seal_type: '' })
      fetchShipments()
      fetchSummary(parseInt(selectedShipment, 10))
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create seal')
    }
  }

  const fetchSummary = async (shipmentId) => {
    if (!shipmentId) return null
    try {
      setLoadingSummary(true)
      const data = await complianceAPI.getSummary(shipmentId)
      setSummary(data)
      return data
    } catch (error) {
      console.error(error)
      toast.error('Failed to load compliance summary')
      return null
    } finally {
      setLoadingSummary(false)
    }
  }

  useEffect(() => {
    if (selectedShipment) {
      fetchSummary(parseInt(selectedShipment))
    } else {
      setSummary(null)
    }
  }, [selectedShipment])

  useEffect(() => {
    if (
      selectedShipment &&
      !shipmentsWithT1.some((shipment) => String(shipment.id) === String(selectedShipment))
    ) {
      setSelectedShipment('')
    }
  }, [shipmentsWithT1, selectedShipment])

  const latestT1 = summary?.latest_t1_form
  const latestSeal = summary?.latest_seal

  const handleActionsOpen = (event, shipment) => {
    setActionsAnchorEl(event.currentTarget)
    setActionsShipment(shipment)
  }

  const handleActionsClose = () => {
    setActionsAnchorEl(null)
    setActionsShipment(null)
  }

  const openDetailView = (shipmentId) => {
    setSelectedShipment(String(shipmentId))
    fetchSummary(shipmentId)
    handleActionsClose()
  }

  const openGenerateT1 = (shipmentId) => {
    setSelectedShipment(String(shipmentId))
    setShowT1Dialog(true)
    handleActionsClose()
  }

  const openCreateSeal = (shipmentId) => {
    setSelectedShipment(String(shipmentId))
    setShowSealDialog(true)
    handleActionsClose()
  }

  const openUploadDocument = (shipmentId) => {
    setSelectedShipment(String(shipmentId))
    setDocumentData({ document_type: '', title: '', file: null })
    setShowUploadDialog(true)
    handleActionsClose()
  }

  const openEscalation = (shipmentId) => {
    setSelectedShipment(String(shipmentId))
    setEscalationData({ issue_type: '', description: '', priority: 'medium' })
    setShowEscalationDialog(true)
    handleActionsClose()
  }

  const openStatusUpdate = async (shipment) => {
    if (!shipment) {
      return
    }
    const shipmentId = shipment.id
    let summaryData = summary?.shipment_id === shipmentId ? summary : null
    if (!summaryData) {
      summaryData = await fetchSummary(shipmentId)
    }
    if (!summaryData) {
      toast.error('Unable to retrieve T1 form details')
      return
    }
    const latestForm = summaryData.t1_forms.find((form) => form.form_number === shipment.latest_t1_form_number)
    if (!latestForm) {
      toast.error('Latest T1 form details not available. View detail first.')
      return
    }
    setSelectedShipment(String(shipmentId))
    setT1StatusForm({ formId: latestForm.id, status: latestForm.status })
    setShowStatusDialog(true)
    handleActionsClose()
  }

  const handleUploadDocument = async () => {
    if (!selectedShipment || !documentData.file || !documentData.document_type || !documentData.title) {
      toast.error('Please complete all document fields.')
      return
    }
    try {
      const formData = new FormData()
      formData.append('shipment_id', selectedShipment)
      formData.append('document_type', documentData.document_type)
      formData.append('title', documentData.title)
      formData.append('file', documentData.file)
      await complianceAPI.uploadDocument(formData)
      toast.success('Document uploaded successfully')
      setShowUploadDialog(false)
      if (summary?.shipment_id === parseInt(selectedShipment, 10)) {
        fetchSummary(parseInt(selectedShipment, 10))
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload document')
    }
  }

  const handleCreateEscalation = async () => {
    if (!selectedShipment || !escalationData.issue_type || !escalationData.description) {
      toast.error('Please fill in escalation details')
      return
    }
    try {
      await complianceAPI.escalate({
        shipment_id: selectedShipment,
        issue_type: escalationData.issue_type,
        description: escalationData.description,
        priority: escalationData.priority,
      })
      toast.success('Escalation created successfully')
      setShowEscalationDialog(false)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create escalation')
    }
  }

  const handleUpdateT1Status = async () => {
    if (!t1StatusForm.formId) {
      toast.error('No T1 form selected')
      return
    }
    try {
      await complianceAPI.markT1Status(t1StatusForm.formId, t1StatusForm.status)
      toast.success('T1 status updated')
      setShowStatusDialog(false)
      if (selectedShipment) {
        fetchSummary(parseInt(selectedShipment, 10))
      }
      fetchShipments()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update T1 status')
    }
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <Avatar
          variant="rounded"
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'primary.light',
            color: 'primary.dark',
            boxShadow: '0 8px 24px rgba(25,118,210,0.3)',
          }}
        >
          <VerifiedUser />
        </Avatar>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 0 }}>
        Compliance & Customs
      </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor declarations, seals, and regulatory escalations per shipment
          </Typography>
        </Box>
      </Stack>

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        variant="scrollable"
        allowScrollButtonsMobile
      >
        <Tab icon={<Assessment fontSize="small" />} iconPosition="start" label="Overview" />
        <Tab icon={<FlashOn fontSize="small" />} iconPosition="start" label="Quick Actions" />
        <Tab icon={<ReceiptLong fontSize="small" />} iconPosition="start" label="T1 Registry" />
        <Tab icon={<Security fontSize="small" />} iconPosition="start" label="Seal Registry" />
        <Tab icon={<Gavel fontSize="small" />} iconPosition="start" label="Guidance" />
      </Tabs>

      {activeTab !== 0 && shipmentsWithT1.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(33,150,243,0.04) 0%, rgba(21,101,192,0.08) 100%)',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Focus Shipment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a shipment to load its compliance summary, forms, and seals.
              </Typography>
            </Box>
            <TextField
              select
              size="small"
              label="Select shipment"
              value={selectedShipment}
              onChange={(e) => setSelectedShipment(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">None</MenuItem>
              {shipmentsWithT1.map((shipment) => (
                <MenuItem key={shipment.id} value={String(shipment.id)}>
                  {shipment.shipment_number} · {shipment.origin} → {shipment.destination}
                </MenuItem>
              ))}
            </TextField>
            {selectedShipment && summary && (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  icon={<AssignmentTurnedIn sx={{ fontSize: 18 }} />}
                  label={`T1 Forms: ${summary.t1_forms?.length || 0}`}
                  color={(summary.t1_forms?.length || 0) > 0 ? 'primary' : 'default'}
                  size="small"
                />
                <Chip
                  icon={<Security sx={{ fontSize: 18 }} />}
                  label={`Seals: ${summary.seals?.length || 0}`}
                  color={(summary.seals?.length || 0) > 0 ? 'secondary' : 'default'}
                  size="small"
                />
              </Stack>
            )}
          </Stack>
        </Paper>
      )}
      {activeTab !== 0 && shipmentsWithT1.length === 0 && (
        <Paper
          variant="outlined"
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: 3,
            borderStyle: 'dashed',
            borderColor: 'divider',
            background: 'rgba(33,150,243,0.03)',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No shipments with T1 forms yet. Generate a T1 from the Quick Actions tab to populate this registry.
          </Typography>
        </Paper>
      )}

      {activeTab === 0 && (
        <Paper variant="outlined" sx={{ mb: 4, p: 3, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <DashboardCustomize color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Compliance Overview (Database Snapshot)
            </Typography>
          </Stack>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Shipment #</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell align="center">T1 Forms</TableCell>
                  <TableCell>Latest T1</TableCell>
                  <TableCell>Latest T1 Date</TableCell>
                  <TableCell align="center">Seals</TableCell>
                  <TableCell>Latest Seal</TableCell>
                  <TableCell>Latest Seal Applied</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No shipments found. Generate a shipment to view compliance data.
                    </TableCell>
                  </TableRow>
                ) : (
                  shipments
                    .slice(
                      overviewPage * overviewRowsPerPage,
                      overviewPage * overviewRowsPerPage + overviewRowsPerPage
                    )
                    .map((shipment) => (
                      <TableRow key={shipment.id} hover>
                        <TableCell>{shipment.shipment_number}</TableCell>
                        <TableCell>{`${shipment.origin} → ${shipment.destination}`}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={shipment.t1_form_count}
                            color={shipment.t1_form_count ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{shipment.latest_t1_form_number || '—'}</TableCell>
                        <TableCell>
                          {shipment.latest_t1_created_at
                            ? new Date(shipment.latest_t1_created_at).toLocaleString()
                            : '—'}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={shipment.seal_count}
                            color={shipment.seal_count ? 'secondary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{shipment.latest_seal_number || '—'}</TableCell>
                        <TableCell>
                          {shipment.latest_seal_applied_at
                            ? new Date(shipment.latest_seal_applied_at).toLocaleString()
                            : '—'}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Open compliance actions">
                            <Button size="small" startIcon={<ManageAccounts />} onClick={(event) => handleActionsOpen(event, shipment)}>
                              Manage
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            rowsPerPageOptions={[10, 25, 50, 100]}
            count={shipments.length}
            rowsPerPage={overviewRowsPerPage}
            page={overviewPage}
            onPageChange={(_, newPage) => setOverviewPage(newPage)}
            onRowsPerPageChange={(event) => {
              setOverviewRowsPerPage(parseInt(event.target.value, 10))
              setOverviewPage(0)
            }}
          />
        </Paper>
      )}

      {activeTab === 1 && (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Assignment sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Generate T1 Form
                </Typography>
              </Box>
                <Stack spacing={2}>
              <TextField
                fullWidth
                select
                label="Select Shipment"
                value={selectedShipment}
                onChange={(e) => setSelectedShipment(e.target.value)}
              >
                {shipments.map((shipment) => (
                  <MenuItem key={shipment.id} value={shipment.id}>
                        {shipment.shipment_number} - {shipment.origin} → {shipment.destination}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Transporter Name"
                value={t1Form.transporter_name}
                    onChange={(e) => setT1Form({ ...t1Form, transporter_name: e.target.value })}
                required
              />
                  <TextField
                    fullWidth
                    label="Transporter TIN"
                    value={t1Form.transporter_tin}
                    onChange={(e) => setT1Form({ ...t1Form, transporter_tin: e.target.value })}
              />
              <TextField
                fullWidth
                label="Vehicle Registration"
                value={t1Form.vehicle_registration}
                    onChange={(e) => setT1Form({ ...t1Form, vehicle_registration: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Goods Description"
                multiline
                rows={3}
                value={t1Form.goods_description}
                    onChange={(e) => setT1Form({ ...t1Form, goods_description: e.target.value })}
                required
              />
                  <TextField
                fullWidth
                    label="Customs Declaration Number"
                    value={t1Form.customs_declaration_number}
                    onChange={(e) => setT1Form({ ...t1Form, customs_declaration_number: e.target.value })}
                  />
                  <Button variant="contained" fullWidth onClick={() => openGenerateT1(selectedShipment || shipments[0]?.id)} disabled={!selectedShipment}>
                    Open T1 Dialog
              </Button>
                </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Security sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Create Seal
                </Typography>
              </Box>
                <Stack spacing={2}>
              <TextField
                fullWidth
                select
                label="Select Shipment"
                value={selectedShipment}
                onChange={(e) => setSelectedShipment(e.target.value)}
              >
                {shipments.map((shipment) => (
                  <MenuItem key={shipment.id} value={shipment.id}>
                        {shipment.shipment_number} - {shipment.origin} → {shipment.destination}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Seal Number"
                value={sealData.seal_number}
                    onChange={(e) => setSealData({ ...sealData, seal_number: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Seal Type"
                value={sealData.seal_type}
                    onChange={(e) => setSealData({ ...sealData, seal_type: e.target.value })}
                  />
                  <Button variant="contained" fullWidth onClick={() => openCreateSeal(selectedShipment || shipments[0]?.id)} disabled={!selectedShipment}>
                    Open Seal Dialog
              </Button>
                </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 20px rgba(30, 60, 114, 0.08)', mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <ReceiptLong color="primary" />
            <Typography variant="h6" fontWeight="bold">
              T1 Form Registry
            </Typography>
          </Stack>
          {summary?.t1_forms?.length ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Form Number</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Transporter</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.t1_forms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell>{form.form_number}</TableCell>
                      <TableCell>
                        <Chip
                          label={form.status.toUpperCase()}
                          size="small"
                          color={
                            form.status === 'approved'
                              ? 'success'
                              : form.status === 'rejected'
                              ? 'error'
                              : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>{form.transporter_name}</TableCell>
                      <TableCell>{new Date(form.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select a shipment to view T1 forms.
            </Typography>
          )}
        </Paper>
      )}

      {activeTab === 3 && (
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 20px rgba(30, 60, 114, 0.08)', mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Security fontSize="small" />
            <Typography variant="h6" fontWeight="bold">
              Seal Registry
            </Typography>
          </Stack>
          {summary?.seals?.length ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Seal Number</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Applied At</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.seals.map((seal) => (
                    <TableRow key={seal.id}>
                      <TableCell>{seal.seal_number}</TableCell>
                      <TableCell>{seal.seal_type || '—'}</TableCell>
                      <TableCell>
                        {seal.applied_location
                          ? `${seal.applied_location} · ${new Date(seal.created_at).toLocaleString()}`
                          : new Date(seal.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={seal.is_tampered ? <Warning /> : <CheckCircle />}
                          label={seal.is_tampered ? 'Tampered' : 'Intact'}
                          color={seal.is_tampered ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select a shipment to view seal records.
            </Typography>
          )}
        </Paper>
      )}

      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(3,155,229,0.05) 0%, rgba(3,155,229,0.15) 100%)',
                height: '100%',
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Compliance Guidance
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <LocalShipping color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Make sure the transporter and vehicle details on the T1 form match the actual carrier before you submit to customs.
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Security color="secondary" />
                  <Typography variant="body2" color="text.secondary">
                    Record every seal issued for a container or trailer. Report any tampered seal immediately to the customs liaison.
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <DataUsage color="success" />
                  <Typography variant="body2" color="text.secondary">
                    Upload supporting documents (UNBS, DPC, invoices) so the compliance team can access them quickly during inspections.
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Menu
        anchorEl={actionsAnchorEl}
        open={Boolean(actionsAnchorEl)}
        onClose={handleActionsClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => openDetailView(actionsShipment?.id)}
          disabled={!actionsShipment}
        >
          View Compliance Detail
        </MenuItem>
        <MenuItem
          onClick={() => openGenerateT1(actionsShipment?.id)}
          disabled={!actionsShipment}
        >
          Generate T1 Form
        </MenuItem>
        <MenuItem
          onClick={() => openCreateSeal(actionsShipment?.id)}
          disabled={!actionsShipment}
        >
          Create Seal
        </MenuItem>
        <MenuItem
          onClick={() => openStatusUpdate(actionsShipment)}
          disabled={!actionsShipment || !actionsShipment.latest_t1_form_number}
        >
          Update T1 Status
        </MenuItem>
        <MenuItem onClick={() => openUploadDocument(actionsShipment?.id)} disabled={!actionsShipment}>
          Upload Document
        </MenuItem>
        <MenuItem onClick={() => openEscalation(actionsShipment?.id)} disabled={!actionsShipment}>
          Raise Escalation
        </MenuItem>
      </Menu>

      <Dialog open={showT1Dialog} onClose={() => setShowT1Dialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate T1 Form</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Transporter Name"
              value={t1Form.transporter_name}
              onChange={(e) => setT1Form({ ...t1Form, transporter_name: e.target.value })}
              required
            />
            <TextField
              label="Transporter TIN"
              value={t1Form.transporter_tin}
              onChange={(e) => setT1Form({ ...t1Form, transporter_tin: e.target.value })}
            />
            <TextField
              label="Vehicle Registration"
              value={t1Form.vehicle_registration}
              onChange={(e) => setT1Form({ ...t1Form, vehicle_registration: e.target.value })}
              required
            />
            <TextField
              label="Goods Description"
              multiline
              rows={3}
              value={t1Form.goods_description}
              onChange={(e) => setT1Form({ ...t1Form, goods_description: e.target.value })}
              required
            />
            <TextField
              label="Customs Declaration Number"
              value={t1Form.customs_declaration_number}
              onChange={(e) => setT1Form({ ...t1Form, customs_declaration_number: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowT1Dialog(false)}>Cancel</Button>
          <Button onClick={handleGenerateT1} variant="contained">Generate</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showSealDialog} onClose={() => setShowSealDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Seal</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Seal Number"
              value={sealData.seal_number}
              onChange={(e) => setSealData({ ...sealData, seal_number: e.target.value })}
              required
            />
            <TextField
              label="Seal Type"
              value={sealData.seal_type}
              onChange={(e) => setSealData({ ...sealData, seal_type: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSealDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateSeal} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Compliance Document</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Document Type"
              value={documentData.document_type}
              onChange={(e) => setDocumentData({ ...documentData, document_type: e.target.value })}
              required
            />
            <TextField
              label="Title"
              value={documentData.title}
              onChange={(e) => setDocumentData({ ...documentData, title: e.target.value })}
              required
            />
            <Button variant="outlined" component="label">
              Select File
              <input
                type="file"
                hidden
                onChange={(e) => setDocumentData({ ...documentData, file: e.target.files?.[0] || null })}
              />
            </Button>
            {documentData.file && (
              <Typography variant="caption" color="text.secondary">
                Selected: {documentData.file.name}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
          <Button onClick={handleUploadDocument} variant="contained">Upload</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showEscalationDialog} onClose={() => setShowEscalationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Raise Compliance Escalation</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Issue Type"
              value={escalationData.issue_type}
              onChange={(e) => setEscalationData({ ...escalationData, issue_type: e.target.value })}
              required
            />
            <TextField
              label="Description"
              multiline
              rows={4}
              value={escalationData.description}
              onChange={(e) => setEscalationData({ ...escalationData, description: e.target.value })}
              required
            />
            <TextField
              label="Priority"
              select
              value={escalationData.priority}
              onChange={(e) => setEscalationData({ ...escalationData, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEscalationDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateEscalation} variant="contained">Create Escalation</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showStatusDialog} onClose={() => setShowStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update T1 Status</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="New Status"
              select
              value={t1StatusForm.status}
              onChange={(e) => setT1StatusForm({ ...t1StatusForm, status: e.target.value })}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="submitted">Submitted</MenuItem>
              <MenuItem value="under_review">Under Review</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatusDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateT1Status} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Compliance