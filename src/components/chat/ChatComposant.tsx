import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { Tag } from 'lucide-react'

interface Message {
  id: number
  contenu: string
  auteurNom: string
  roleAuteur: string
  createdAt: string
  lu: boolean
  pieceJointeUrl?: string
  type?: string
}

export default function ChatComposant({ demandeId }: { demandeId: number }) {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const [connected, setConnected] = useState(false)
  const [remiseRequested, setRemiseRequested] = useState(false)
  const stompClient = useRef<Client | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['chat', demandeId],
    queryFn: () => axios.get(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8181'}/api/v1/chat/demande/${demandeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data)
  })

  useEffect(() => {
    const socket = new SockJS(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8181'}/ws`)
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        setConnected(true)
        client.subscribe(`/topic/chat/${demandeId}`, (msg) => {
          const newMsg = JSON.parse(msg.body)
          queryClient.setQueryData(['chat', demandeId], (old: Message[] = []) => [...old, newMsg])
        })
      },
      onDisconnect: () => setConnected(false)
    })

    client.activate()
    stompClient.current = client

    return () => {
      client.deactivate()
    }
  }, [demandeId])

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
  }, [messages])

  const handleSend = (texte?: string) => {
    const contenu = texte ?? message
    if (!contenu.trim() || !connected) return

    stompClient.current?.publish({
      destination: `/app/chat/${demandeId}`,
      body: JSON.stringify({ contenu }),
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!texte) setMessage('')
  }

  const handleDemanderRemise = () => {
    if (!connected) return
    const texte = '🎟️ Bonjour, je souhaite obtenir une remise sur ce devis. Pouvez-vous me proposer un coupon de réduction ?'
    stompClient.current?.publish({
      destination: `/app/chat/${demandeId}`,
      body: JSON.stringify({ contenu: texte, type: 'DEMANDE_REMISE' }),
      headers: { Authorization: `Bearer ${token}` }
    })
    setRemiseRequested(true)
  }

  return (
    <div className="chat-composant" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: 500 }}>
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #F2F4F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ margin: 0 }}>💬 Chat Technique</h4>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: connected ? '#27AE60' : '#E74C3C' }} />
      </div>

      <div ref={scrollRef} style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 15 }}>
        {messages.map((m) => {
          const isMe = m.auteurNom === user?.username || (user?.prenom && m.auteurNom.includes(user.prenom))
          const isSystème = m.roleAuteur === 'SYSTEME'
          const isRemise = m.type === 'DEMANDE_REMISE'
          const isCoupon = m.type === 'COUPON_APPLIQUE'

          if (isSystème) {
            return (
              <div key={m.id} style={{ alignSelf: 'center', maxWidth: '90%' }}>
                <div style={{
                  padding: '8px 16px', borderRadius: 20,
                  background: isCoupon ? '#dcfce7' : '#f1f5f9',
                  color: isCoupon ? '#166534' : '#64748b',
                  fontSize: 13, fontWeight: 600, textAlign: 'center',
                  border: isCoupon ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                }}>
                  {m.contenu}
                </div>
              </div>
            )
          }

          return (
            <div key={m.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textAlign: isMe ? 'right' : 'left' }}>
                {m.auteurNom} • {m.roleAuteur}
              </div>
              <div style={{
                padding: '10px 14px', borderRadius: 12, fontSize: 14,
                background: isRemise ? '#fef3c7' : isMe ? '#1A5276' : '#F2F4F4',
                color: isRemise ? '#92400e' : isMe ? '#fff' : '#2E4053',
                borderBottomRightRadius: isMe ? 2 : 12,
                borderBottomLeftRadius: isMe ? 12 : 2,
                border: isRemise ? '1px solid #fde68a' : 'none',
              }}>
                {m.contenu}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick action — Demander une remise */}
      {!remiseRequested && (
        <div style={{ padding: '0 15px 10px', display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={handleDemanderRemise}
            disabled={!connected}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20,
              background: connected ? '#fef9c3' : '#f1f5f9',
              color: connected ? '#854d0e' : '#94a3b8',
              border: `1px solid ${connected ? '#fde68a' : '#e2e8f0'}`,
              fontSize: '0.78rem', fontWeight: 700, cursor: connected ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
            title="Envoyer une demande de remise au réceptionniste"
          >
            <Tag size={13} />
            Demander une remise
          </button>
        </div>
      )}
      {remiseRequested && (
        <div style={{ padding: '0 15px 10px' }}>
          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
            ✓ Demande de remise envoyée
          </span>
        </div>
      )}

      <div style={{ padding: 15, borderTop: '1px solid #F2F4F4', display: 'flex', gap: 10 }}>
        <input
          value={message} onChange={e => setMessage(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="Posez une question..."
          style={{ flex: 1, padding: '10px 15px', border: '1px solid #ddd', borderRadius: 25, outline: 'none' }} />
        <button onClick={() => handleSend()}
          style={{ width: 40, height: 40, borderRadius: '50%', background: '#1A5276', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ➤
        </button>
      </div>
    </div>
  )
}
