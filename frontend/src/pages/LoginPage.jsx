import { Box, Button, Card, CardContent, Container, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { Link, useNavigate } from 'react-router-dom'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/')
    } catch (e) {
      setError('Invalid email or password')
    }
  }
  return (
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', minHeight: '80vh' }}>
      <Card sx={{ width: '100%' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Login</Typography>
          <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <Typography color="error">{error}</Typography>}
            <Button type="submit" variant="contained">Login</Button>
            <Typography variant="body2">No account? <Link to="/register">Register</Link></Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}

