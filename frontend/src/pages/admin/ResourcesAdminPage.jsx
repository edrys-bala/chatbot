import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Box, Button, Card, CardContent, Grid, TextField, Typography } from '@mui/material'

export function ResourcesAdminPage() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [file, setFile] = useState(null)

  const load = async () => {
    const { data } = await api.get('/resources')
    setItems(data.items)
  }
  useEffect(() => { load() }, [])

  const upload = async () => {
    const form = new FormData()
    form.append('title', title)
    form.append('description', description)
    form.append('category', category)
    if (file) form.append('file', file)
    await api.post('/resources/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    setTitle(''); setDescription(''); setCategory('General'); setFile(null)
    load()
  }

  const del = async (id) => { await api.delete(`/resources/${id}`); load() }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={5}>
        <Card><CardContent>
          <Typography variant="h6">Upload Resource</Typography>
          <Box sx={{ display: 'grid', gap: 1.5, mt: 1 }}>
            <TextField label="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
            <TextField label="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
            <TextField label="Category" value={category} onChange={(e)=>setCategory(e.target.value)} />
            <input type="file" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
            <Button variant="contained" onClick={upload}>Upload</Button>
          </Box>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={7}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Resources</Typography>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {items.map(it => (
              <Box key={it.id} sx={{ p: 1.5, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="subtitle1">{it.title}</Typography>
                <Typography variant="body2" color="text.secondary">{it.description}</Typography>
                <Typography variant="caption">{it.category} • {it.file_type} • {Math.round((it.file_size||0)/1024)} KB</Typography>
                <Box>
                  <Button size="small" color="error" onClick={()=>del(it.id)} sx={{ mt: 1 }}>Delete</Button>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent></Card>
      </Grid>
    </Grid>
  )
}

