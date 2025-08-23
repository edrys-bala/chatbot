import { Card, CardContent, Grid, Typography } from '@mui/material'

export function DashboardPage() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Card><CardContent>
          <Typography variant="h6">Active Students</Typography>
          <Typography variant="h4">-</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card><CardContent>
          <Typography variant="h6">Top Questions</Typography>
          <Typography variant="body1">Coming soon</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card><CardContent>
          <Typography variant="h6">Resource Downloads</Typography>
          <Typography variant="h4">-</Typography>
        </CardContent></Card>
      </Grid>
    </Grid>
  )
}

