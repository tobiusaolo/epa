import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  InputBase,
  Chip,
  Tooltip,
  ListSubheader,
  LinearProgress,
  Stack,
  CircularProgress,
  Button,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocalShipping as ShipmentsIcon,
  GpsFixed as TrackingIcon,
  VerifiedUser as ComplianceIcon,
  Assessment as ReportsIcon,
  Logout,
  Notifications,
  Search,
  Settings,
  Person,
  BusinessCenter,
} from '@mui/icons-material'
import HubIcon from '@mui/icons-material/Hub'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import WidgetsIcon from '@mui/icons-material/Widgets'
import { useAuth } from '../contexts/AuthContext'
import { notificationsAPI } from '../services/api'
import { formatDistanceToNow } from 'date-fns'

const drawerWidth = 300

const navigationSections = [
  {
    title: 'Command Center',
    caption: 'Real-time operations cockpit',
    icon: <HubIcon fontSize="small" />, 
    items: [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/',
        description: 'Overview & Analytics',
  },
  { 
    text: 'Shipments', 
    icon: <ShipmentsIcon />, 
    path: '/shipments',
        description: 'Manage Freight',
  },
  { 
    text: 'Tracking', 
    icon: <TrackingIcon />, 
    path: '/tracking',
        description: 'Real-time Tracking',
      },
    ],
  },
  {
    title: 'Controls',
    caption: 'Governance & performance',
    icon: <SecurityOutlinedIcon fontSize="small" />, 
    items: [
  { 
    text: 'Compliance', 
    icon: <ComplianceIcon />, 
    path: '/compliance',
        description: 'Forms & Documents',
  },
  { 
    text: 'Reports', 
    icon: <ReportsIcon />, 
    path: '/reports',
        description: 'Analytics & Insights',
      },
      {
        text: 'Notifications',
        icon: <Notifications />,
        path: '/notifications',
        description: 'Alerts & Updates',
      },
    ],
  },
  {
    title: 'Resources',
    caption: 'People & governance roles',
    icon: <WidgetsIcon fontSize="small" />, 
    items: [
      {
        text: 'Users',
        icon: <PeopleIcon />,
        path: '/users',
        description: 'User Management',
      },
    ],
  },
]

const flattenedMenu = navigationSections.flatMap((section) => section.items)

const isPathActive = (currentPath, targetPath) => {
  if (targetPath === '/') {
    return currentPath === '/'
  }
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
}

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null)
  const [unreadNotifications, setUnreadNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)

  const activeItem = useMemo(
    () => flattenedMenu.find((item) => isPathActive(location.pathname, item.path)) ?? flattenedMenu[0],
    [location.pathname]
  )
  const notificationsMenuOpen = Boolean(notificationsAnchorEl)
  const unreadCount = unreadNotifications.length

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      setNotificationsLoading(true)
      const data = await notificationsAPI.getUnread()
      setUnreadNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load notifications', error)
    } finally {
      setNotificationsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUnreadNotifications()
  }, [fetchUnreadNotifications])

  useEffect(() => {
    const handler = () => fetchUnreadNotifications()
    window.addEventListener('notifications:updated', handler)
    return () => window.removeEventListener('notifications:updated', handler)
  }, [fetchUnreadNotifications])

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget)
    fetchUnreadNotifications()
  }

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null)
  }

  const handleNotificationsViewAll = () => {
    handleNotificationsClose()
    navigate('/notifications')
  }

  const handleNotificationsMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      setUnreadNotifications([])
      window.dispatchEvent(new Event('notifications:updated'))
    } catch (error) {
      console.error('Failed to mark notifications as read', error)
    } finally {
      handleNotificationsClose()
    }
  }

  const handleNotificationSelect = async (notification) => {
    handleNotificationsClose()
    try {
      if (!notification.is_read) {
        await notificationsAPI.markRead(notification.id)
        setUnreadNotifications((prev) => prev.filter((item) => item.id !== notification.id))
        window.dispatchEvent(new Event('notifications:updated'))
      }
    } catch (error) {
      console.error('Failed to update notification', error)
    }

    if (notification.resource_type === 'shipment' && notification.resource_id) {
      navigate(`/shipments/${notification.resource_id}`)
    } else {
      navigate('/notifications', { state: { notificationId: notification.id } })
    }
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          background: 'radial-gradient(circle at 10% 20%, #3349ff 0%, #16254f 45%, #08102b 100%)',
          color: 'white',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 18px 40px rgba(0, 18, 56, 0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}
        >
          <ShipmentsIcon sx={{ fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.1, letterSpacing: 0.5 }}>
            EPA Command
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.7rem' }}>
            Freight Management Suite
          </Typography>
        </Box>
        <Chip
          label="Live"
          size="small"
          sx={{
            ml: 'auto',
            backgroundColor: 'rgba(76, 175, 80, 0.18)',
            color: '#b2ffb0',
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
      </Box>
      
      <Divider />
      
      {/* Navigation Menu */}
      <List
        sx={{
          flexGrow: 1,
          pt: 0,
          px: 1.5,
          background: 'linear-gradient(180deg, #f8f9ff 0%, rgba(248, 249, 255, 0.3) 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        {navigationSections.map((section) => (
          <Box key={section.title} sx={{ mb: 1.5 }}>
            <ListSubheader
              disableSticky
              sx={{
                lineHeight: 1.4,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: 1.2,
                fontWeight: 700,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 0,
                background: 'transparent',
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  background: 'linear-gradient(135deg, rgba(30,60,114,0.16) 0%, rgba(42,82,152,0.24) 100%)',
                  boxShadow: 'inset 0 2px 6px rgba(8,24,68,0.18)',
                  color: 'primary.dark',
                }}
              >
                {section.icon}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {section.title}
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', mt: 0.25 }}>
                  {section.caption}
                </Typography>
              </Box>
            </ListSubheader>
            {section.items.map((item) => {
              const isSelected = isPathActive(location.pathname, item.path)
          return (
                <ListItem key={item.text} disablePadding sx={{ mb: 1.25 }}>
              <Tooltip title={item.description} placement="right" arrow>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => {
                    navigate(item.path)
                    setMobileOpen(false)
                  }}
                  sx={{
                        borderRadius: 2.5,
                    py: 1.4,
                        px: 2.25,
                    mb: 0.5,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.25s ease-in-out',
                        color: isSelected ? 'common.white' : 'text.primary',
                        boxShadow: isSelected ? '0 20px 35px rgba(30, 60, 114, 0.45)' : 'none',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: 0,
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(30, 60, 114, 0.9) 0%, rgba(42, 82, 152, 0.95) 100%)'
                            : 'linear-gradient(135deg, rgba(30,60,114,0.08) 0%, rgba(19,33,68,0.05) 100%)',
                          opacity: isSelected ? 1 : 0,
                          transition: 'opacity 0.25s ease-in-out',
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          left: 6,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 6,
                          height: isSelected ? '70%' : 0,
                          borderRadius: 3,
                          background: 'linear-gradient(180deg, #6ec6ff 0%, #3f51b5 100%)',
                          transition: 'height 0.25s ease-in-out',
                        },
                    '&:hover': {
                          transform: 'translateX(6px)',
                          boxShadow: isSelected
                            ? '0 24px 45px rgba(34, 89, 255, 0.35)'
                            : '0 18px 30px rgba(30, 60, 114, 0.18)',
                          '&::before': {
                            opacity: 0.85,
                          },
                          '& .MuiListItemIcon-root': {
                            color: isSelected ? 'common.white' : 'primary.main',
                      backgroundColor: isSelected 
                              ? 'rgba(255,255,255,0.2)'
                              : 'rgba(30, 60, 114, 0.12)',
                      },
                    },
                    '&.Mui-selected': {
                          color: 'common.white',
                      '& .MuiListItemIcon-root': {
                            color: 'common.white',
                            backgroundColor: 'rgba(255,255,255,0.22)',
                      },
                      '& .MuiListItemText-primary': {
                            fontWeight: 700,
                          },
                          '&::before': {
                            opacity: 1,
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                          minWidth: 48,
                          color: isSelected ? 'common.white' : 'text.secondary',
                          zIndex: 1,
                          transition: 'all 0.2s ease',
                          borderRadius: 1.5,
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.18)' : 'rgba(30, 60, 114, 0.08)',
                          px: 1,
                          py: 0.75,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                        sx={{ zIndex: 1 }}
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: isSelected ? 600 : 500,
                          letterSpacing: 0.2,
                          sx: {
                            color: isSelected ? 'common.white' : 'text.primary',
                            transition: 'color 0.2s ease',
                          },
                        }}
                      />
                      <Box
                        sx={{
                          zIndex: 1,
                          ml: 'auto',
                          fontSize: '0.72rem',
                          color: isSelected ? 'rgba(255,255,255,0.85)' : 'text.secondary',
                          letterSpacing: 0.3,
                          fontWeight: 500,
                        }}
                      >
                        {item.description}
                      </Box>
                </ListItemButton>
              </Tooltip>
            </ListItem>
          )
        })}
          </Box>
        ))}
      </List>
      
      {/* Footer Section */}
      <Box
        sx={{
          p: 2.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(180deg, rgba(8,16,43,0.92) 0%, #020510 100%)',
          color: 'rgba(255,255,255,0.88)',
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, letterSpacing: 0.4 }}>
          Operational Pulse
        </Typography>
        <Stack spacing={1.25}>
          <Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Network Health
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(129,230,217,0.95)' }}>
                99.3%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={99.3}
              sx={{
                mt: 0.5,
                height: 6,
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.12)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #81ffef 0%, #4990ff 100%)',
                },
              }}
            />
          </Box>
        <Chip
            icon={<BusinessCenter sx={{ color: 'rgba(255,255,255,0.8) !important' }} />}
            label="EPA Carriers — Executive Mode"
          size="small"
          sx={{
            width: '100%',
            justifyContent: 'flex-start',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
              color: 'rgba(255,255,255,0.8)',
            fontWeight: 500,
              borderRadius: 2,
          }}
        />
        </Stack>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: '70px !important' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: 'text.primary',
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Page Title */}
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h5" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '1.1rem', sm: '1.5rem' },
              }}
            >
              {activeItem.text}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.75rem',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {activeItem.description}
            </Typography>
          </Box>

          {/* Search Bar */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              position: 'relative',
              borderRadius: 2,
              backgroundColor: alpha('#1e3c72', 0.06),
              '&:hover': {
                backgroundColor: alpha('#1e3c72', 0.1),
              },
              width: { md: '300px', lg: '400px' },
              mr: 2,
              transition: 'all 0.2s',
            }}
          >
            <Box
              sx={{
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
            </Box>
            <InputBase
              placeholder="Search shipments, users..."
              sx={{
                flex: 1,
                color: 'text.primary',
                '& .MuiInputBase-input': {
                  padding: '8px 8px 8px 0',
                  fontSize: '0.9rem',
                },
              }}
            />
          </Box>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              onClick={handleNotificationsOpen}
              sx={{ 
                mr: 1,
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: alpha('#1e3c72', 0.08),
                  color: 'primary.main',
                },
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={notificationsAnchorEl}
            open={notificationsMenuOpen}
            onClose={handleNotificationsClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                width: 360,
                maxWidth: '90vw',
                borderRadius: 2,
                boxShadow: '0 12px 32px rgba(14, 30, 64, 0.25)',
              },
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Notifications
              </Typography>
              <Button
                size="small"
                onClick={handleNotificationsMarkAllRead}
                disabled={!unreadCount}
              >
                Mark all read
              </Button>
            </Box>
            <Divider />
            {notificationsLoading ? (
              <Box
                sx={{
                  px: 2,
                  py: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                }}
              >
                <CircularProgress size={18} />
                <Typography variant="body2" color="text.secondary">
                  Loading notifications...
                </Typography>
              </Box>
            ) : unreadNotifications.length === 0 ? (
              <Box sx={{ px: 2, py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  You're all caught up! No unread notifications.
                </Typography>
              </Box>
            ) : (
              unreadNotifications.map((notification) => (
                <MenuItem
                  key={notification.id}
                  onClick={() => handleNotificationSelect(notification)}
                  sx={{
                    alignItems: 'flex-start',
                    gap: 1.5,
                    py: 1.5,
                    whiteSpace: 'normal',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {notification.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
            <Divider />
            <MenuItem onClick={handleNotificationsViewAll}>
              <ListItemText primary="View all notifications" />
            </MenuItem>
          </Menu>

          {/* Date */}
          <Chip
            label={new Date().toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
            size="small"
            sx={{
              mr: 2,
              display: { xs: 'none', sm: 'flex' },
              backgroundColor: alpha('#1e3c72', 0.06),
              color: 'text.secondary',
              fontWeight: 500,
            }}
          />

          {/* User Menu */}
          <Tooltip title={user?.email || 'User'}>
            <IconButton 
              onClick={handleMenuOpen} 
              sx={{ 
                p: 0,
                border: '2px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                },
                transition: 'all 0.2s',
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main',
                  width: 40,
                  height: 40,
                  fontWeight: 600,
                }}
              >
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 220,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                borderRadius: 2,
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user?.full_name || 'Admin User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </MenuItem>
            <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '56px', sm: '70px' },
          backgroundColor: '#f8f9fa',
          minHeight: 'calc(100vh - 70px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout

