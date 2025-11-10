import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  CircularProgress,
  Stack,
  Avatar,
  Tooltip,
  Chip,
  Divider,
} from '@mui/material'
import {
  Assessment,
  Download,
  TrendingUp,
  Insights,
  AutoGraph,
  DateRange,
  PieChart as PieChartIcon,
} from '@mui/icons-material'
import { reportsAPI } from '../services/api'
import { toast } from 'react-toastify'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const Reports = () => {
  const [kpis, setKpis] = useState(null)
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const [kpisData, trendsData] = await Promise.all([
        reportsAPI.getKPIs(),
        reportsAPI.getDelayTrends(30),
      ])
      setKpis(kpisData)
      setTrends(trendsData)
    } catch (error) {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateDaily = async () => {
    try {
      const report = await reportsAPI.generateDaily(reportDate)
      toast.success('Daily report generated successfully')
    } catch (error) {
      toast.error('Failed to generate report')
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  const chartData = kpis
    ? [
        { name: 'Pending', value: kpis.pending },
        { name: 'In Transit', value: kpis.in_transit },
        { name: 'Delivered', value: kpis.delivered },
      ]
    : []

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
        <Avatar
          variant="rounded"
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'info.light',
            color: 'info.dark',
            boxShadow: '0 10px 24px rgba(3,169,244,0.25)',
          }}
        >
          <Insights />
        </Avatar>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 0 }}>
            Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualize operational performance and export data-driven summaries
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 18px 32px rgba(3,169,244,0.12)', border: '1px solid rgba(3,169,244,0.18)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <PieChartIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Shipment Status Overview
                </Typography>
              </Stack>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#1976d2" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, rgba(33,150,243,0.1) 0%, rgba(21,101,192,0.25) 100%)', color: 'common.white' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Assessment />
                  <Typography variant="h6" fontWeight="bold">
                    Key Metrics
                  </Typography>
                </Stack>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Shipments
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {kpis?.total_shipments || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Delivery Rate
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip icon={<TrendingUp sx={{ fontSize: 16 }} />} label={`${kpis?.delivery_rate?.toFixed(1) || 0}%`} color="success" />
                  </Stack>
                </Box>
                {trends && (
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Delayed Shipments (30d)
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={trends.delayed_shipments || 0} color="warning" />
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {trends.delay_rate ? `${(trends.delay_rate * 100).toFixed(1)}% delay rate` : 'Delay rate pending'}
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 12px 26px rgba(3,169,244,0.12)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <AutoGraph color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Generate Daily Report
                  </Typography>
                </Stack>
                <Tooltip title="Export PDF summary for stakeholders" arrow>
                  <span>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      onClick={handleGenerateDaily}
                    >
                      Generate Report
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
              <Box display="flex" gap={2} alignItems="center" sx={{ mt: 3 }}>
                <TextField
                  type="date"
                  label="Report Date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                  <DateRange />
                  <Typography variant="caption">
                    Select the day you need a consolidated operations summary for.
                  </Typography>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Reports


