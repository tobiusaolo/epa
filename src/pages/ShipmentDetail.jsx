import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Divider,
  Stack,
  LinearProgress,
  Tooltip,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material'
import {
  ArrowBack,
  Refresh,
  LocationOn,
  LocalShipping,
  Insights,
  WarningAmber,
  CheckCircle,
  ArrowForward,
  ConfirmationNumber,
  Flag,
  FlightTakeoff,
  PersonOutline,
  MailOutline,
  Phone,
  Inventory2,
  Description,
  EventAvailable,
  MonetizationOn,
  AccessTime,
  Security,
  AssignmentTurnedIn,
} from '@mui/icons-material'
import { format, formatDistanceToNow } from 'date-fns'
import { shipmentsAPI, complianceAPI } from '../services/api'
import { toast } from 'react-toastify'

const STATUS_STEPS = ['pending', 'in_transit', 'at_customs', 'awaiting_release', 'delivered']

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
    case 'awaiting_release':
    case 'at_customs':
      return 'secondary'
    default:
      return 'default'
  }
}

const normaliseStatusLabel = (status) => {
  if (!status) return 'Unknown'
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

const ShipmentDetail = () => {
  const { shipmentId } = useParams()
  const navigate = useNavigate()
  const [shipment, setShipment] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [insights, setInsights] = useState(null)
  const [complianceSummary, setComplianceSummary] = useState(null)

  const fetchShipment = async (showLoader = true) => {
    if (!shipmentId) {
      setError('Missing shipment id')
      return
    }

    try {
      if (showLoader) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      const [shipmentData, timelineData, insightsData, complianceData] = await Promise.all([
        shipmentsAPI.get(shipmentId),
        shipmentsAPI.getTimeline(shipmentId),
        shipmentsAPI.getInsights(shipmentId),
        complianceAPI.getSummary(shipmentId),
      ])

      setShipment(shipmentData)
      setTimeline(Array.isArray(timelineData) ? timelineData : [])
      setInsights(insightsData)
      setComplianceSummary(complianceData)
      setError(null)
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to load shipment details'
      setError(message)
      toast.error(message)
    } finally {
      if (showLoader) {
        setLoading(false)
      } else {
        setRefreshing(false)
      }
    }
  }

  useEffect(() => {
    fetchShipment(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId])

  const progressValue = useMemo(() => {
    if (!shipment) return 0
    const currentIndex = STATUS_STEPS.indexOf(shipment.status)
    if (currentIndex === -1) return shipment.status === 'cancelled' ? 0 : 10
    return ((currentIndex + 1) / STATUS_STEPS.length) * 100
  }, [shipment])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !shipment) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/shipments')}
          sx={{ mb: 2 }}
        >
          Back to Shipments
        </Button>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Unable to load shipment
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {error || 'Unknown error occurred'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={() => fetchShipment(true)}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    )
  }

  const detailItems = [
    { label: 'Shipment Number', value: shipment.shipment_number, icon: <ConfirmationNumber fontSize="small" /> },
    { label: 'Status', value: normaliseStatusLabel(shipment.status), icon: <Flag fontSize="small" /> },
    { label: 'Origin', value: shipment.origin, icon: <LocationOn fontSize="small" color="primary" /> },
    { label: 'Destination', value: shipment.destination, icon: <FlightTakeoff fontSize="small" color="primary" /> },
    { label: "Shipper's Name", value: shipment.shipper_name || '—', icon: <PersonOutline fontSize="small" /> },
    { label: 'Consignee Name', value: shipment.consignee_name, icon: <PersonOutline fontSize="small" /> },
    { label: 'Consignee Email', value: shipment.consignee_email || '—', icon: <MailOutline fontSize="small" /> },
    { label: 'Consignee Phone', value: shipment.consignee_phone || '—', icon: <Phone fontSize="small" /> },
    { label: 'Container Number', value: shipment.container_number || '—', icon: <Inventory2 fontSize="small" /> },
    { label: 'Cargo Description', value: shipment.cargo_description || '—', icon: <Description fontSize="small" /> },
    {
      label: 'Estimated Delivery',
      value: shipment.estimated_delivery_date
        ? format(new Date(shipment.estimated_delivery_date), 'MMM dd, yyyy')
        : '—',
      icon: <EventAvailable fontSize="small" />,
    },
    {
      label: 'Actual Delivery',
      value: shipment.actual_delivery_date
        ? format(new Date(shipment.actual_delivery_date), 'MMM dd, yyyy')
        : '—',
      icon: <EventAvailable fontSize="small" />,
    },
    {
      label: 'Estimated Cost',
      value:
        shipment.estimated_cost !== null && shipment.estimated_cost !== undefined
          ? `UGX ${shipment.estimated_cost.toLocaleString()}`
          : '—',
      icon: <MonetizationOn fontSize="small" />,
    },
    {
      label: 'Actual Cost',
      value:
        shipment.actual_cost !== null && shipment.actual_cost !== undefined
          ? `UGX ${shipment.actual_cost.toLocaleString()}`
          : '—',
      icon: <MonetizationOn fontSize="small" />,
    },
    {
      label: 'Created On',
      value: shipment.created_at ? format(new Date(shipment.created_at), 'MMM dd, yyyy HH:mm') : '—',
      icon: <AccessTime fontSize="small" />,
    },
    {
      label: 'Last Updated',
      value: shipment.updated_at ? format(new Date(shipment.updated_at), 'MMM dd, yyyy HH:mm') : '—',
      icon: <AccessTime fontSize="small" />,
    },
  ]

  const currentLocation = shipment.current_location || 'Not provided'
  const riskPalette = insights?.risk?.level === 'high'
    ? { color: 'error', gradient: 'linear-gradient(135deg, rgba(211,47,47,0.14) 0%, rgba(198,40,40,0.35) 100%)' }
    : insights?.risk?.level === 'medium'
    ? { color: 'warning', gradient: 'linear-gradient(135deg, rgba(255,167,38,0.14) 0%, rgba(255,183,77,0.3) 100%)' }
    : { color: 'success', gradient: 'linear-gradient(135deg, rgba(46,125,50,0.12) 0%, rgba(76,175,80,0.28) 100%)' }
  const t1Forms = complianceSummary?.t1_forms || []
  const latestT1 = complianceSummary?.latest_t1_form
  const seals = complianceSummary?.seals || []
  const latestSeal = complianceSummary?.latest_seal

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
              boxShadow: '0 10px 24px rgba(25,118,210,0.25)',
            }}
          >
            <LocalShipping />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Shipment Tracking
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Detailed timeline and logistics data for shipment {shipment.shipment_number}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/shipments')}
            variant="outlined"
          >
            Back to Shipments
          </Button>
          <Tooltip title="Refresh shipment timeline and details">
            <span>
              <Button
                startIcon={<Refresh />}
                onClick={() => fetchShipment(false)}
                variant="contained"
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 12px 24px rgba(8, 29, 129, 0.12)',
              background: riskPalette.gradient,
              minHeight: 360,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1.5}>
                <Insights color={riskPalette.color} />
                <Typography variant="h6" fontWeight="bold">
                  Command Insights
                </Typography>
              </Box>
              {insights?.risk && (
                <Chip
                  label={`${insights.risk.level.toUpperCase()} RISK`}
                  color={riskPalette.color}
                  variant="filled"
                  sx={{ fontWeight: 700, letterSpacing: 0.6 }}
                />
              )}
            </Box>
            <Typography variant="h3" fontWeight="800">
              {insights?.risk?.score ? `${Math.round(insights.risk.score)} / 100` : '—'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {insights?.risk?.factors?.[0] || 'System monitoring shipment telemetry in real time.'}
            </Typography>

            {insights?.risk?.factors?.length > 0 && (
              <Stack spacing={1}>
                {insights.risk.factors.map((factor, idx) => (
                  <Alert
                    key={idx}
                    severity={insights.risk.level === 'high' ? 'error' : insights.risk.level === 'medium' ? 'warning' : 'success'}
                    iconMapping={{
                      error: <WarningAmber fontSize="inherit" />,
                      warning: <WarningAmber fontSize="inherit" />,
                      success: <CheckCircle fontSize="inherit" />,
                    }}
                    sx={{ borderRadius: 2, py: 0.5 }}
                  >
                    <AlertTitle sx={{ fontSize: '0.75rem', mb: 0 }}>{idx === 0 ? 'Primary Signal' : 'Additional Insight'}</AlertTitle>
                    <Typography variant="body2">{factor}</Typography>
                  </Alert>
                ))}
              </Stack>
            )}

            {insights?.recommendations?.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Next Best Actions
                </Typography>
                <List dense disablePadding>
                  {insights.recommendations.map((rec, idx) => (
                    <ListItem key={`${rec.title}-${idx}`} sx={{ borderRadius: 2, mb: 0.5, px: 1, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      <ListItemIcon sx={{ minWidth: 36, color: rec.priority === 'high' ? 'error.main' : rec.priority === 'medium' ? 'warning.main' : 'text.secondary' }}>
                        <ArrowForward fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600}>
                            {rec.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {rec.description}
                          </Typography>
                        }
                      />
                      <Chip
                        label={rec.priority.toUpperCase()}
                        size="small"
                        color={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'default'}
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {insights?.next_checkpoints?.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Upcoming Checkpoints
                </Typography>
                <Stack spacing={0.75}>
                  {insights.next_checkpoints.slice(0, 3).map((checkpoint, idx) => (
                    <Typography key={idx} variant="body2" color="text.secondary">
                      • {checkpoint}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 20px rgba(30, 60, 114, 0.08)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <LocalShipping color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Shipment Overview
                </Typography>
              </Box>
              <Chip label={normaliseStatusLabel(shipment.status)} color={getStatusColor(shipment.status)} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {Math.round(progressValue)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressValue}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor:
                      shipment.status === 'delivered'
                        ? '#2e7d32'
                        : shipment.status === 'in_transit'
                        ? '#0288d1'
                        : '#f9a825',
                  },
                }}
              />
              <Box display="flex" justifyContent="space-between" mt={1}>
                {STATUS_STEPS.map((step) => (
                  <Typography
                    key={step}
                    variant="caption"
                    color={shipment.status === step ? 'primary.main' : 'text.secondary'}
                    fontWeight={shipment.status === step ? 600 : 400}
                  >
                    {normaliseStatusLabel(step)}
                  </Typography>
                ))}
              </Box>
            </Box>

            <Grid container spacing={2}>
              {detailItems.map((item) => (
                <Grid item xs={12} sm={6} key={item.label}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 38,
                        height: 38,
                        bgcolor: 'rgba(25,118,210,0.08)',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.label}
                      </Typography>
                      {item.label === 'Status' ? (
                        <Chip
                          label={item.value}
                          size="small"
                          color={getStatusColor(shipment.status)}
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <Typography variant="body1" fontWeight="medium">
                          {item.value}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="body2" color="text.secondary">
                Current Location
              </Typography>
              <Typography variant="body1" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <LocationOn fontSize="small" color="primary" />
                {currentLocation}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 20px rgba(30, 60, 114, 0.08)' }}>
            <Stack spacing={3}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AssignmentTurnedIn color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Transit Declaration · T1 Forms
                    </Typography>
                  </Stack>
                  <Chip
                    label={`${t1Forms.length} ${t1Forms.length === 1 ? 'Form' : 'Forms'}`}
                    color={t1Forms.length ? 'primary' : 'default'}
                    size="small"
                  />
                </Box>
                {t1Forms.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No T1 forms have been submitted for this shipment yet. Generate a T1 to place the cargo under customs transit control.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {t1Forms.slice(0, 3).map((form) => (
                      <Paper
                        key={form.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          borderLeft: '4px solid',
                          borderColor:
                            form.status === 'approved'
                              ? 'success.main'
                              : form.status === 'submitted'
                              ? 'primary.main'
                              : form.status === 'rejected'
                              ? 'error.main'
                              : 'warning.main',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {form.form_number}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {form.goods_description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {`Transporter: ${form.transporter_name} · ${formatDistanceToNow(new Date(form.created_at), {
                                addSuffix: true,
                              })}`}
                            </Typography>
                          </Box>
                          <Chip
                            label={form.status.replace('_', ' ').toUpperCase()}
                            size="small"
                            color={
                              form.status === 'approved'
                                ? 'success'
                                : form.status === 'submitted'
                                ? 'primary'
                                : form.status === 'rejected'
                                ? 'error'
                                : 'warning'
                            }
                          />
                        </Stack>
                      </Paper>
                    ))}
                    {t1Forms.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        Showing latest 3 of {t1Forms.length} T1 submissions.
                      </Typography>
                    )}
                    {latestT1 && (
                      <Typography variant="body2" color="text.secondary">
                        Last update: {format(new Date(latestT1.created_at), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    )}
                  </Stack>
                )}
              </Box>

              <Divider />

              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Security color="secondary" />
                    <Typography variant="h6" fontWeight="bold">
                      Customs Seal Register
                    </Typography>
                  </Stack>
                  <Chip
                    label={`${seals.length} ${seals.length === 1 ? 'Seal' : 'Seals'}`}
                    color={seals.length ? 'secondary' : 'default'}
                    size="small"
                  />
                </Box>
                {seals.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No seals recorded. Document seal issuance to secure the cargo before transit.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {seals.slice(0, 3).map((seal) => (
                      <Paper
                        key={seal.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          borderLeft: '4px solid',
                          borderColor: seal.is_tampered ? 'error.main' : 'secondary.main',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {seal.seal_number}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {seal.seal_type || 'Standard seal'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {seal.applied_location
                                ? `${seal.applied_location} · ${formatDistanceToNow(new Date(seal.created_at), {
                                    addSuffix: true,
                                  })}`
                                : formatDistanceToNow(new Date(seal.created_at), { addSuffix: true })}
                            </Typography>
                          </Box>
                          <Chip
                            label={seal.is_tampered ? 'Tampered' : 'Intact'}
                            size="small"
                            color={seal.is_tampered ? 'error' : 'success'}
                            variant={seal.is_tampered ? 'filled' : 'outlined'}
                          />
                        </Stack>
                      </Paper>
                    ))}
                    {seals.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        Showing latest 3 of {seals.length} seal records.
                      </Typography>
                    )}
                    {latestSeal && (
                      <Typography variant="body2" color="text.secondary">
                        Latest seal update: {format(new Date(latestSeal.created_at), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    )}
                  </Stack>
                )}
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 20px rgba(30, 60, 114, 0.08)' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <AccessTime color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Timeline & History
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Live audit trail of every status update, location ping, and operational note.
            </Typography>

            <Divider sx={{ my: 2 }} />

            {timeline.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No tracking events have been recorded yet.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {timeline
                  .slice()
                  .reverse()
                  .map((event, idx) => (
                    <Paper
                      key={`${event.timestamp}-${idx}`}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        borderLeft: 4,
                        borderColor:
                          event.status === 'delivered'
                            ? 'success.main'
                            : event.status === 'in_transit'
                            ? 'info.main'
                            : event.status === 'cancelled'
                            ? 'error.main'
                            : 'warning.main',
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {normaliseStatusLabel(event.status)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.timestamp ? format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm') : 'No timestamp'}
                          </Typography>
                        </Box>
                        <Chip label={normaliseStatusLabel(event.status)} size="small" color={getStatusColor(event.status)} />
                      </Box>
                      {event.location && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                          <LocationOn fontSize="small" color="primary" />
                          {event.location}
                        </Typography>
                      )}
                      {event.notes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {event.notes}
                        </Typography>
                      )}
                    </Paper>
                  ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ShipmentDetail

