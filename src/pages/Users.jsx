import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Avatar,
  Tooltip,
  Stack,
} from '@mui/material'
import {
  Add,
  Edit,
  Block,
  CheckCircle,
  Cancel,
  Group,
  AdminPanelSettings,
  LocalShipping,
  PersonOutline,
  FactCheck,
  MailOutline,
} from '@mui/icons-material'
import { usersAPI } from '../services/api'
import { toast } from 'react-toastify'
import DataTable from '../components/DataTable'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    username: '',
    password: '',
    role_ids: [],
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await usersAPI.list()
      setUsers(data.items || [])
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        email: user.email,
        full_name: user.full_name || '',
        phone: user.phone || '',
        username: user.username || '',
        password: '',
        role_ids: user.roles?.map((r) => r.id) || [],
      })
    } else {
      setEditingUser(null)
      setFormData({
        email: '',
        full_name: '',
        phone: '',
        username: '',
        password: '',
        role_ids: [],
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingUser(null)
  }

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await usersAPI.update(editingUser.id, formData)
        toast.success('User updated successfully')
      } else {
        await usersAPI.create(formData)
        toast.success('User created successfully')
      }
      handleCloseDialog()
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed')
    }
  }

  const handleDeactivate = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await usersAPI.deactivate(userId)
        toast.success('User deactivated')
        fetchUsers()
      } catch (error) {
        toast.error('Failed to deactivate user')
      }
    }
  }

  const roleIconMap = {
    admin: <AdminPanelSettings sx={{ fontSize: 16 }} />,
    driver: <LocalShipping sx={{ fontSize: 16 }} />,
    client: <PersonOutline sx={{ fontSize: 16 }} />,
    auditor: <FactCheck sx={{ fontSize: 16 }} />,
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
              bgcolor: 'secondary.light',
              color: 'secondary.dark',
              boxShadow: '0 8px 22px rgba(156,39,176,0.25)',
            }}
          >
            <Group />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0 }}>
              User Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Control account access, roles, and activation status across the fleet
            </Typography>
          </Box>
        </Stack>
        <Tooltip title="Add a new platform user" arrow>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add User
          </Button>
        </Tooltip>
      </Box>

      <DataTable
        columns={[
          {
            field: 'full_name',
            headerName: 'Name',
            render: (row) => (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                  {row.full_name?.charAt(0) || row.email?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {row.full_name || 'N/A'}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <MailOutline sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {row.email}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            ),
          },
          {
            field: 'username',
            headerName: 'Username',
            render: (row) => (
              <Typography variant="body2" fontWeight="medium">
                {row.username}
              </Typography>
            ),
          },
          {
            field: 'roles',
            headerName: 'Roles',
            render: (row) => (
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {row.roles?.map((role) => (
                  <Chip
                    key={role.id}
                    icon={roleIconMap[role.name] || undefined}
                    label={role.name.toUpperCase()}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                    color={role.name === 'admin' ? 'primary' : 'default'}
                  />
                ))}
              </Stack>
            ),
          },
          {
            field: 'is_active',
            headerName: 'Status',
            render: (row) => (
              <Chip
                icon={row.is_active ? <CheckCircle /> : <Cancel />}
                label={row.is_active ? 'Active' : 'Inactive'}
                color={row.is_active ? 'success' : 'default'}
                size="small"
              />
            ),
          },
          {
            field: 'actions',
            headerName: 'Actions',
            align: 'right',
            render: (row) => (
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenDialog(row)
                    }}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Deactivate">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeactivate(row.id)
                    }}
                    color="error"
                  >
                    <Block />
                  </IconButton>
                </Tooltip>
              </Stack>
            ),
          },
        ]}
        data={users}
        loading={loading}
        searchable
        exportable
        onExport={() => toast.info('Export functionality coming soon')}
        onRefresh={fetchUsers}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            required
            disabled={!!editingUser}
          />
          <TextField
            fullWidth
            label="Full Name"
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            margin="normal"
          />
          {!editingUser && (
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              margin="normal"
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Users

