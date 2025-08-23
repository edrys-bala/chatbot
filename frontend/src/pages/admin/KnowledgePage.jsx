import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Grid, TextField, Typography } from '@mui/material'
import { api } from '../../api/client'

export function KnowledgePage() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')

  const load = async () => {
    const { data } = await api.get('/kb')
    setItems(data.items)
  }
  useEffect(() => { load() }, [])

  const add = async () => {
    await api.post('/kb', { title, content })
    setTitle(''); setContent('');
    load()
  }
  const addFromUrl = async () => {
    await api.post('/kb/from_url', { url })
    setUrl('')
    load()
  }
  const del = async (id) => { await api.delete(`/kb/${id}`); load() }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card><CardContent>
          <Typography variant="h6">Add Article</Typography>
          <Box sx={{ display: 'grid', gap: 1.5, mt: 1 }}>
            <TextField label="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
            <TextField label="Content" multiline minRows={4} value={content} onChange={(e)=>setContent(e.target.value)} />
            <Button variant="contained" onClick={add}>Save</Button>
          </Box>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card><CardContent>
          <Typography variant="h6">Import from URL</Typography>
          <Box sx={{ display: 'grid', gap: 1.5, mt: 1 }}>
            <TextField label="URL" value={url} onChange={(e)=>setUrl(e.target.value)} />
            <Button variant="outlined" onClick={addFromUrl}>Import</Button>
          </Box>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Articles</Typography>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {items.map(it => (
              <Box key={it.id} sx={{ p: 1.5, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="subtitle1">{it.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{String(it.content).slice(0, 200)}...</Typography>
                <Button size="small" color="error" onClick={()=>del(it.id)} sx={{ mt: 1 }}>Delete</Button>
              </Box>
            ))}
          </Box>
        </CardContent></Card>
      </Grid>
    </Grid>
  )
}

