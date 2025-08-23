import { useEffect, useRef, useState } from 'react'
import { api } from '../../api/client'
import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material'

export function ChatPage() {
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    const start = async () => {
      const { data } = await api.post('/chat/start')
      setConversationId(data.conversation_id)
    }
    start()
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!text) return
    const userMsg = { sender: 'student', content: text, created_at: new Date().toISOString() }
    setMessages((prev)=>[...prev, userMsg])
    setText('')
    const { data } = await api.post('/chat/message', { conversation_id: conversationId, message: userMsg.content })
    setMessages((prev)=>[...prev, { sender: 'bot', content: data.reply, created_at: new Date().toISOString() }])
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Chat with Support Bot</Typography>
        <Box ref={listRef} sx={{ maxHeight: 400, overflowY: 'auto', display: 'grid', gap: 1, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
          {messages.map((m, idx) => (
            <Box key={idx} sx={{ alignSelf: m.sender==='student'?'end':'start', bgcolor: m.sender==='student'?'primary.main':'grey.100', color: m.sender==='student'?'primary.contrastText':'inherit', p: 1.2, borderRadius: 1.2, maxWidth: '80%' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{m.content}</Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <TextField fullWidth placeholder="Type your question..." value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') send() }} />
          <Button variant="contained" onClick={send}>Send</Button>
        </Box>
      </CardContent>
    </Card>
  )
}

