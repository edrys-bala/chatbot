import { AppBar, BottomNavigation, BottomNavigationAction, Box, Container, Toolbar, Typography } from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'
import FolderIcon from '@mui/icons-material/Folder'
import PersonIcon from '@mui/icons-material/Person'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'

export function StudentLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (location.pathname.endsWith('/resources')) setValue(1)
    else if (location.pathname.endsWith('/profile')) setValue(2)
    else setValue(0)
  }, [location.pathname])
  return (
    <Box sx={{ pb: 7, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Student Support</Typography>
          <Typography onClick={logout} sx={{ cursor: 'pointer' }}>Logout</Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 2 }}>
        <Outlet />
      </Container>
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(e, newValue) => {
            setValue(newValue)
            if (newValue === 0) navigate('/')
            if (newValue === 1) navigate('/resources')
            if (newValue === 2) navigate('/profile')
          }}
        >
          <BottomNavigationAction label="Chat" icon={<ChatIcon />} />
          <BottomNavigationAction label="Resources" icon={<FolderIcon />} />
          <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
        </BottomNavigation>
      </Box>
    </Box>
  )
}

