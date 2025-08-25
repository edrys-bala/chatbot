import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Grid, TextField, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
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
          <div style={{ height: 520, width: '100%' }}>
            <DataGrid
              rows={items}
              columns={[
                { field: 'id', headerName: 'ID', width: 70 },
                { field: 'title', headerName: 'Title', flex: 1 },
                { field: 'tags', headerName: 'Tags', width: 160 },
                { field: 'created_at', headerName: 'Created', width: 180 },
                { field: 'actions', headerName: 'Actions', width: 140, renderCell: (params) => (
                    <Button size="small" color="error" onClick={()=>del(params.row.id)}>Delete</Button>
                  )
                },
              ]}
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            />
          </div>
        </CardContent></Card>
      </Grid>
    </Grid>
  )
}

