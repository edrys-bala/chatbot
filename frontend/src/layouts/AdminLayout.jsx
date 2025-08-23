import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

export function AdminLayout() {
  const { logout } = useAuth()
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Admin Panel</Typography>
          <Button color="inherit" component={RouterLink} to="/admin">Dashboard</Button>
          <Button color="inherit" component={RouterLink} to="/admin/knowledge">Knowledge</Button>
          <Button color="inherit" component={RouterLink} to="/admin/resources">Resources</Button>
          <Button color="inherit" component={RouterLink} to="/admin/students">Students</Button>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  )
}

