import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Box, Button, Card, CardContent, Typography } from '@mui/material'

export function StudentsPage() {
  const [items, setItems] = useState([])
  const load = async () => { const { data } = await api.get('/admin/students'); setItems(data.items) }
  useEffect(() => { load() }, [])
  const setApproval = async (id, approve) => { await api.patch(`/admin/students/${id}/${approve?'approve':'reject'}`); load() }
  return (
    <Card><CardContent>
      <Typography variant="h6" gutterBottom>Students</Typography>
      {items.map(s => (
        <Box key={s.id} sx={{ p: 1.5, border: '1px solid #eee', borderRadius: 1, mb: 1 }}>
          <Typography>{s.name} • {s.email}</Typography>
          <Typography variant="caption">Approved: {s.approved ? 'Yes' : 'No'}</Typography>
          <Box>
            <Button size="small" onClick={()=>setApproval(s.id, true)}>Approve</Button>
            <Button size="small" color="warning" onClick={()=>setApproval(s.id, false)}>Reject</Button>
          </Box>
        </Box>
      ))}
    </CardContent></Card>
  )
}

