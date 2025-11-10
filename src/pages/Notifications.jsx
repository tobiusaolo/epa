import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Button,
  CircularProgress,
  Avatar,
} from '@mui/material'
import {
  CheckCircle,
  Undo,
  Delete,
  Visibility,
  NotificationsActive,
  NotificationsNone,
  MarkEmailRead,
  MarkEmailUnread,
  Refresh,
  Inbox,
} from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'react-toastify'
import { notificationsAPI } from '../services/api'

const tabOptions = [
  { value: 0, label: 'All', icon: <Inbox fontSize="small" /> },
  { value: 1, label: 'Unread', icon: <MarkEmailUnread fontSize="small" /> },
  { value: 2, label: 'Read', icon: <MarkEmailRead fontSize="small" /> },
]

const typeColorMap = {
  alert: 'error',
  warning: 'warning',
  error: 'error',
  info: 'info',
  success: 'success',
}

const Notifications = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [tabValue, setTabValue] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const focusNotificationId = location.state?.notificationId

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const statusParam =
        tabValue === 1 ? 'unread' : tabValue === 2 ? 'read' : undefined
      const response = await notificationsAPI.list({ status: statusParam, limit: 100 })
      setNotifications(response.items || [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [tabValue, refreshKey])

  useEffect(() => {
    if (focusNotificationId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`notification-${focusNotificationId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.classList.add('highlight')
          setTimeout(() => element.classList.remove('highlight'), 1500)
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [focusNotificationId, notifications])

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue)
  }

  const triggerGlobalRefresh = () => {
    window.dispatchEvent(new Event('notifications:updated'))
  }

  const handleMarkRead = async (notification) => {
    try {
      await notificationsAPI.markRead(notification.id)
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, is_read: true, read_at: new Date().toISOString() } : item
        )
      )
      toast.success('Notification marked as read')
      triggerGlobalRefresh()
    } catch (error) {
      console.error(error)
      toast.error('Failed to mark notification as read')
    }
  }

  const handleMarkUnread = async (notification) => {
    try {
      await notificationsAPI.markUnread(notification.id)
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, is_read: false, read_at: null } : item
        )
      )
      toast.success('Notification marked as unread')
      triggerGlobalRefresh()
    } catch (error) {
      console.error(error)
      toast.error('Failed to mark notification as unread')
    }
  }

  const handleDelete = async (notification) => {
    try {
      await notificationsAPI.delete(notification.id)
      setNotifications((prev) => prev.filter((item) => item.id !== notification.id))
      toast.success('Notification deleted')
      triggerGlobalRefresh()
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete notification')
    }
  }

  const handleView = async (notification) => {
    if (!notification.is_read) {
      await handleMarkRead(notification)
    }

    if (notification.resource_type === 'shipment' && notification.resource_id) {
      navigate(`/shipments/${notification.resource_id}`)
    } else if (notification.resource_type === 'report') {
      navigate('/reports')
    } else {
      toast.info('No linked resource for this notification')
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      toast.success('All notifications marked as read')
      handleRefresh()
      triggerGlobalRefresh()
    } catch (error) {
      console.error(error)
      toast.error('Failed to mark all notifications as read')
    }
  }

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  )

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
            <NotificationsActive />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 0 }}>
              Notifications Center
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Stay on top of operational alerts, approvals, and system updates
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh notifications feed" arrow>
            <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh}>
              Refresh
            </Button>
          </Tooltip>
          <Tooltip title="Mark every notification as read" arrow>
            <span>
              <Button variant="contained" startIcon={<MarkEmailRead />} onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                Mark all read
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }} variant="scrollable" allowScrollButtonsMobile>
        {tabOptions.map((tab) => (
          <Tab
            key={tab.value}
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ display: 'flex', alignItems: 'center', color: tab.value === tabValue ? 'primary.main' : 'text.secondary' }}>
                  {tab.icon}
                </Box>
                <Typography variant="body2" fontWeight={tab.value === tabValue ? 600 : 500}>
                  {tab.label}
                </Typography>
                {tab.value === 1 && unreadCount > 0 && (
                  <Chip label={unreadCount} size="small" color="error" />
                )}
              </Stack>
            }
            value={tab.value}
          />
        ))}
      </Tabs>

      {loading ? (
        <Box display="flex" alignItems="center" justifyContent="center" minHeight="40vh">
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(21,101,192,0.05) 0%, rgba(21,101,192,0.12) 100%)',
            borderRadius: 3,
          }}
        >
          <NotificationsNone sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            {tabValue === 1 ? 'No unread notifications' : 'No notifications yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You're all caught up. We'll keep you posted when new updates arrive.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {notifications.map((notification) => {
            const isUnread = !notification.is_read
            const typeColor = typeColorMap[notification.notification_type] || 'default'

            return (
              <Paper
                key={notification.id}
                id={`notification-${notification.id}`}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  borderLeft: '4px solid',
                  borderColor: isUnread ? 'primary.main' : 'divider',
                  transition: 'background 0.3s ease, box-shadow 0.3s ease',
                  '&.highlight': {
                    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.2)',
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="h6" fontWeight={700}>
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.notification_type.toUpperCase()}
                        size="small"
                        color={typeColor}
                      />
                      <Chip
                        label={notification.is_read ? 'Read' : 'Unread'}
                        size="small"
                        color={notification.is_read ? 'default' : 'primary'}
                        variant={notification.is_read ? 'outlined' : 'filled'}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {notification.message}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.disabled">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {notification.resource_type && notification.resource_id && (
                    <Tooltip title="View linked resource">
                      <IconButton color="primary" onClick={() => handleView(notification)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  )}
                  {notification.is_read ? (
                    <Tooltip title="Mark as unread">
                      <IconButton onClick={() => handleMarkUnread(notification)}>
                        <Undo />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Mark as read">
                      <IconButton color="success" onClick={() => handleMarkRead(notification)}>
                        <CheckCircle />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete notification">
                    <IconButton color="error" onClick={() => handleDelete(notification)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Paper>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}

export default Notifications

