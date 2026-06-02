import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  Mail, 
  Phone, 
  Clock, 
  Inbox, 
  CheckCircle, 
  Send as SendIcon, 
  Loader2,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await axiosInstance.get('/api/contact/admin/all');
      setMessages(res.data);
    } catch (e) {
      console.error("Erreur messages:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    setReplyLoading(true);
    try {
      await axiosInstance.post('/api/contact/admin/reply', {
        id: selectedMessage.id,
        reponse: replyText
      });
      setReplyText("");
      // Mettre à jour localement pour feedback immédiat
      const updatedMessages = messages.map(m => 
        m.id === selectedMessage.id 
        ? { ...m, repondu: true, lu: true, reponse: replyText, dateReponse: new Date() } 
        : m
      );
      setMessages(updatedMessages);
      setSelectedMessage({ ...selectedMessage, repondu: true, lu: true, reponse: replyText, dateReponse: new Date() });
      alert("Réponse envoyée avec succès !");
    } catch (e) {
      alert("Erreur lors de l'envoi de la réponse.");
    } finally {
      setReplyLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await axiosInstance.put(`/api/contact/admin/mark-read/${id}`);
      setMessages(messages.map(m => m.id === id ? { ...m, lu: true } : m));
    } catch (e) {}
  };

  const handleSelectMessage = (m: any) => {
    setSelectedMessage(m);
    if (!m.lu) {
      markAsRead(m.id);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
      <Loader2 className="animate-spin" size={40} color="var(--accent-color)" />
    </div>
  );

  return (
    <div className="admin-fade-in">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Messages Clients</h1>
        <p style={{ color: '#64748b', marginTop: '5px' }}>Gérez les demandes reçues via le formulaire de contact.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', height: 'calc(100vh - 220px)' }}>
        {/* LISTE DES MESSAGES */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Boîte de réception</h3>
            <span style={{ fontSize: '0.75rem', background: 'var(--accent-color)', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>
              {messages.filter(m => !m.lu).length} nouveaux
            </span>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {messages.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <Inbox size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                <p>Aucun message pour le moment.</p>
              </div>
            ) : (
              messages.map((m: any) => (
                <div 
                  key={m.id} 
                  onClick={() => handleSelectMessage(m)}
                  style={{ 
                    padding: '18px 20px', 
                    borderBottom: '1px solid #f1f5f9', 
                    cursor: 'pointer',
                    position: 'relative',
                    background: selectedMessage?.id === m.id ? '#f1f5f9' : (m.lu ? '#fff' : '#eff6ff'),
                    transition: 'all 0.2s',
                    borderLeft: !m.lu ? '4px solid var(--accent-color)' : '4px solid transparent'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: m.lu ? 600 : 800, fontSize: '0.95rem', color: m.lu ? '#1e293b' : '#0f172a' }}>{m.nom}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(m.createDate).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.message}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {m.repondu && (
                      <span style={{ fontSize: '0.7rem', color: '#10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle size={10} /> Répondu
                      </span>
                    )}
                    {!m.lu && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        Nouveau
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DETAILS ET REPONSE */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
          {selectedMessage ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Header du message */}
              <div style={{ padding: '30px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <h2 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', fontWeight: 800 }}>{selectedMessage.nom}</h2>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {selectedMessage.email}</span>
                        {selectedMessage.telephone && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {selectedMessage.telephone}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                      <Clock size={14} /> {new Date(selectedMessage.createDate).toLocaleString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenu du message */}
              <div style={{ flex: 1, padding: '30px', overflowY: 'auto', background: '#fcfcfd' }}>
                <div style={{ background: '#fff', padding: '25px', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                   <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Message du client</div>
                   <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1.05rem', color: '#334155' }}>{selectedMessage.message}</p>
                </div>

                <AnimatePresence>
                  {selectedMessage.repondu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ background: '#ecfdf5', padding: '25px', borderRadius: '16px', borderLeft: '5px solid #10b981' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#065f46', fontWeight: 700 }}>
                        <SendIcon size={18} /> RÉPONSE ENVOYÉE LE {new Date(selectedMessage.dateReponse).toLocaleString('fr-FR')}
                      </div>
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#065f46', fontSize: '1.05rem' }}>{selectedMessage.reponse}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Zone de réponse */}
              {!selectedMessage.repondu && (
                <div style={{ 
                  padding: '24px 30px', 
                  borderTop: '1px solid #e2e8f0', 
                  background: '#fff',
                  boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Rédiger une réponse officielle</h4>
                  </div>
                  <textarea 
                    style={{ 
                      width: '100%',
                      minHeight: '120px', 
                      background: '#f8fafc', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '15px 20px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'all 0.2s',
                      marginBottom: '15px',
                      resize: 'vertical'
                    }}
                    placeholder="Tapez votre réponse ici..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={handleReply} 
                      disabled={replyLoading || !replyText.trim()}
                      style={{ 
                        background: '#ef4444', 
                        color: '#fff', 
                        padding: '12px 25px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: 'none',
                        cursor: (replyLoading || !replyText.trim()) ? 'not-allowed' : 'pointer',
                        opacity: (replyLoading || !replyText.trim()) ? 0.6 : 1,
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => { if(!replyLoading && replyText.trim()) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {replyLoading ? <Loader2 className="animate-spin" size={18} /> : <><SendIcon size={18} /> Envoyer la réponse</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', background: '#fcfcfd' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <Inbox size={40} strokeWidth={1} />
              </div>
              <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Sélectionnez un message</h3>
              <p style={{ maxWidth: '300px', textAlign: 'center', lineHeight: '1.5' }}>Choisissez une demande dans la liste à gauche pour consulter les détails et répondre.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessagesPage;
