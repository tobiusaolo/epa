import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Button,
  Avatar,
  Stack,
  Tooltip,
} from '@mui/material'
import {
  LocalShipping,
  CheckCircle,
  Schedule,
  LocationOn,
  Refresh,
  Timeline,
  Radar,
  Flag,
} from '@mui/icons-material'
import { shipmentsAPI } from '../services/api'
import { toast } from 'react-toastify'

const ShipmentTracking = () => {
  const navigate = useNavigate()
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShipments()
    const interval = setInterval(fetchShipments, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchShipments = async () => {
    try {
      setLoading(true)
      const data = await shipmentsAPI.list({ limit: 100 })
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

  const getStatusSteps = () => {
    return [
      { label: 'Pending', value: 'pending', icon: <Schedule /> },
      { label: 'In Transit', value: 'in_transit', icon: <LocalShipping /> },
      { label: 'At Customs', value: 'at_customs', icon: <LocationOn /> },
      { label: 'Awaiting Release', value: 'awaiting_release', icon: <Schedule /> },
      { label: 'Delivered', value: 'delivered', icon: <CheckCircle /> },
    ]
  }

  const getCurrentStep = (status) => {
    const steps = getStatusSteps()
    return steps.findIndex((s) => s.value === status)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success'
      case 'in_transit':
        return 'info'
      case 'at_customs':
      case 'awaiting_release':
        return 'warning'
      case 'pending':
        return 'default'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const calculateProgress = (status) => {
    const steps = getStatusSteps()
    const currentIndex = getCurrentStep(status)
    return ((currentIndex + 1) / steps.length) * 100
  }

  if (loading) {
    return <LinearProgress />
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
              bgcolor: 'info.light',
              color: 'info.dark',
              boxShadow: '0 10px 22px rgba(3,169,244,0.25)',
            }}
          >
            <Radar />
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Shipment Tracking & Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time tracking and status updates
            </Typography>
          </Box>
        </Stack>
        <Tooltip title="Refresh live tracking" arrow>
          <Button
            startIcon={<Refresh />}
            onClick={fetchShipments}
            variant="outlined"
          >
            Refresh
          </Button>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {shipments.map((shipment) => (
          <Grid item xs={12} md={6} key={shipment.id}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                borderRadius: 3,
                border: '1px solid rgba(3,169,244,0.12)',
                background: 'linear-gradient(135deg, rgba(3,169,244,0.04) 0%, rgba(3,169,244,0.08) 100%)',
                '&:hover': {
                  boxShadow: '0 18px 30px rgba(3, 169, 244, 0.2)',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => navigate(`/shipments/${shipment.id}`)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h6" fontWeight="bold">
                        {shipment.shipment_number}
                      </Typography>
                      <Chip
                        icon={<Flag sx={{ fontSize: 16 }} />}
                        label={shipment.status}
                        color={getStatusColor(shipment.status)}
                        size="small"
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {shipment.origin} → {shipment.destination}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {calculateProgress(shipment.status).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress(shipment.status)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor:
                          shipment.status === 'delivered'
                            ? 'success.main'
                            : shipment.status === 'in_transit'
                            ? 'info.main'
                            : 'warning.main',
                      },
                    }}
                  />
                </Box>

                {shipment.current_location && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      {shipment.current_location}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Chip
                    icon={<Timeline />}
                    label="View Tracking"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default ShipmentTracking

