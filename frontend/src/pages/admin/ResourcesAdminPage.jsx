import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Box, Button, Card, CardContent, Grid, TextField, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'

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
          <div style={{ height: 520, width: '100%' }}>
            <DataGrid
              rows={items}
              columns={[
                { field: 'id', headerName: 'ID', width: 70 },
                { field: 'title', headerName: 'Title', flex: 1 },
                { field: 'category', headerName: 'Category', width: 140 },
                { field: 'file_type', headerName: 'Type', width: 120 },
                { field: 'file_size', headerName: 'Size (KB)', width: 120, valueFormatter: ({ value }) => Math.round((value||0)/1024) },
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

