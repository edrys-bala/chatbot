import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Card, CardContent } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'

export function StudentsPage() {
  const [rows, setRows] = useState([])
  const load = async () => { const { data } = await api.get('/admin/students'); setRows(data.items) }
  useEffect(() => { load() }, [])
  const setApproval = async (id, approve) => { await api.patch(`/admin/students/${id}/${approve?'approve':'reject'}`); load() }
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'approved', headerName: 'Approved', width: 120, valueFormatter: ({ value }) => value ? 'Yes' : 'No' },
    { field: 'created_at', headerName: 'Joined', width: 180 },
    { field: 'actions', headerName: 'Actions', width: 220, renderCell: (params) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={()=>setApproval(params.row.id, true)}>Approve</button>
          <button onClick={()=>setApproval(params.row.id, false)}>Reject</button>
        </div>
      )
    },
  ]
  return (
    <Card><CardContent>
      <div style={{ height: 520, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </div>
    </CardContent></Card>
  )
}

