import { useEffect, useState } from 'react'
import { Card, CardContent, Grid, Typography } from '@mui/material'
import { api } from '../../api/client'
import { BarChart } from '@mui/x-charts/BarChart'

export function DashboardPage() {
  const [metrics, setMetrics] = useState(null)
  const [downloadsByCategory, setDownloadsByCategory] = useState([])
  const [topQuestions, setTopQuestions] = useState([])
  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/admin/analytics')
      setMetrics(data.metrics)
      setDownloadsByCategory(data.downloadsByCategory)
      setTopQuestions(data.topQuestions)
    }
    load()
  }, [])
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={2.4}>
        <Card><CardContent>
          <Typography variant="overline">Students</Typography>
          <Typography variant="h4">{metrics?.students ?? '-'}</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={2.4}>
        <Card><CardContent>
          <Typography variant="overline">Approved</Typography>
          <Typography variant="h4">{metrics?.approvedStudents ?? '-'}</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={2.4}>
        <Card><CardContent>
          <Typography variant="overline">Resources</Typography>
          <Typography variant="h4">{metrics?.resources ?? '-'}</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={2.4}>
        <Card><CardContent>
          <Typography variant="overline">Downloads</Typography>
          <Typography variant="h4">{metrics?.downloads ?? '-'}</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={2.4}>
        <Card><CardContent>
          <Typography variant="overline">Conversations</Typography>
          <Typography variant="h4">{metrics?.conversations ?? '-'}</Typography>
        </CardContent></Card>
      </Grid>

      <Grid item xs={12} md={7}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Downloads by Category</Typography>
          <BarChart
            xAxis={[{ scaleType: 'band', data: downloadsByCategory.map(x => x.category || 'Uncategorized') }]}
            series={[{ data: downloadsByCategory.map(x => Number(x.downloads || 0)) }]}
            height={300}
          />
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={5}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Top Questions</Typography>
          {topQuestions.map((q, i) => (
            <Typography key={i} variant="body2" sx={{ mb: 1 }}>{q.q} ({q.c})</Typography>
          ))}
        </CardContent></Card>
      </Grid>
    </Grid>
  )
}

