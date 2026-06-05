import React, { useState, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { Send, Paperclip, User, MessageSquare } from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'
import { useAuth } from '../../context/AuthContext'

interface Message {
  id: number
  contenu: string
  roleAuteur: string
  auteurNom?: string
  pieceJointeUrl?: string
  createdAt: string
}

export default function ChatAtelier({ demandeId }: { demandeId: number }) {
  const { user, token } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const stompClient = useRef<Client | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 1. Fetch history
    axiosInstance.get(`/api/v1/atelier/chat/demande/${demandeId}`)
      .then(res => setMessages(res.data))

    // 2. Connect WebSocket
    const socket = new SockJS(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8181'}/ws-atelier`)
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        stompClient.current?.subscribe(`/topic/atelier/chat/${demandeId}`, (message) => {
          const newMessage = JSON.parse(message.body)
          setMessages(prev => [...prev, newMessage])
        })
      }
    })
    stompClient.current.activate()

    return () => {
      stompClient.current?.deactivate()
    }
  }, [demandeId])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !stompClient.current?.connected) return

    stompClient.current.publish({
      destination: `/app/atelier/chat/${demandeId}`,
      body: JSON.stringify({ contenu: input }),
      headers: { Authorization: `Bearer ${token}` }
    })
    setInput('')
  }

  return (
    <div className="chat-container" style={{ background: '#fff', borderRadius: 24, display: 'flex', flexDirection: 'column', height: '600px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <header style={{ padding: '20px 25px', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <MessageSquare size={20} />
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Assistance en direct</h3>
      </header>

      <div className="messages-list" style={{ flex: 1, padding: 25, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 15 }}>
        {messages.map((m, i) => (
          <div key={m.id || i} style={{ 
            alignSelf: m.roleAuteur === 'CLIENT' ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: m.roleAuteur === 'CLIENT' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, fontWeight: 700 }}>
              {m.roleAuteur} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ 
              background: m.roleAuteur === 'CLIENT' ? '#3b82f6' : '#f1f5f9',
              color: m.roleAuteur === 'CLIENT' ? '#fff' : '#1e293b',
              padding: '12px 18px',
              borderRadius: m.roleAuteur === 'CLIENT' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              fontSize: 14,
              fontWeight: 600,
              boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
            }}>
              {m.contenu}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} style={{ padding: 20, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Écrivez votre message..."
          style={{ flex: 1, padding: '14px 20px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: 14, fontWeight: 600 }}
        />
        <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', width: 50, height: 50, borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className="send-btn">
          <Send size={20} />
        </button>
      </form>

      <style>{`
        .send-btn:hover { background: #2563eb; transform: scale(1.05); }
        .messages-list::-webkit-scrollbar { width: 6px; }
        .messages-list::-webkit-scrollbar-track { background: transparent; }
        .messages-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  )
}
