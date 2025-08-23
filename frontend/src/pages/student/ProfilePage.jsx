import { Card, CardContent, Typography } from '@mui/material'
import { useAuth } from '../../auth/AuthContext'

export function ProfilePage() {
  const { user } = useAuth()
  return (
    <Card><CardContent>
      <Typography variant="h6">Profile</Typography>
      <Typography>Name: {user?.name}</Typography>
      <Typography>Email: {user?.email}</Typography>
      <Typography>Role: {user?.role}</Typography>
      <Typography>Approved: {user?.approved ? 'Yes' : 'No'}</Typography>
    </CardContent></Card>
  )
}

