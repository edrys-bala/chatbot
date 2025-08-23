import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Box, Card, CardContent, TextField, Typography } from '@mui/material'

export function ResourcesPage() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const load = async () => {
    const { data } = await api.get('/resources', { params: { q } })
    setItems(data.items)
  }
  useEffect(() => { load() }, [])
  return (
    <Box>
      <TextField fullWidth placeholder="Search resources" value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') load() }} sx={{ mb: 2 }} />
      <Box sx={{ display: 'grid', gap: 1.5 }}>
        {items.map(r => (
          <Card key={r.id}><CardContent>
            <Typography variant="subtitle1">{r.title}</Typography>
            <Typography variant="body2" color="text.secondary">{r.description}</Typography>
            <Typography variant="caption">{r.category}</Typography>
          </CardContent></Card>
        ))}
      </Box>
    </Box>
  )
}

