import React, { useState, useEffect } from 'react'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Wrench,
  ArrowRight,
  Filter,
  ChevronLeft,
  Plus,
  ShieldCheck,
  Zap
} from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

// Fonction pour générer les jours de la semaine en cours
const getWeekDates = () => {
  const now = new Date();
  const day = now.getDay(); // 0 (Dim) à 6 (Sam)
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour Lundi
  const monday = new Date(now.setDate(diff));
  
  return Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      name: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      date: d.getDate().toString(),
      fullDate: d.toISOString().split('T')[0],
      isToday: d.toDateString() === new Date().toDateString()
    };
  });
}

export default function AffectationTravailPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [techniciens, setTechniciens] = useState<any[]>([])
  const [affectations, setAffectations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [weekDays, setWeekDays] = useState(getWeekDates())
  const [viewMode, setViewMode] = useState<'week' | 'tech'>('week') // 'week' ou 'tech'
  const [selectedDay, setSelectedDay] = useState(getWeekDates().find(d => d.isToday) || getWeekDates()[0])
  const [filterTechId, setFilterTechId] = useState<string>('all')
  const [editMode, setEditMode] = useState(false)
  
  const [assignment, setAssignment] = useState({
    techId: '',
    dateDebut: '',
    dateFin: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ticketsRes, techRes, affRes] = await Promise.all([
        axiosInstance.get('/api/v1/atelier/affectations/en-attente'),
        axiosInstance.get('/api/v1/techniciens/all'),
        axiosInstance.get('/api/v1/atelier/affectations/all')
      ])
      setTickets(ticketsRes.data)
      setTechniciens(techRes.data.data || techRes.data)
      setAffectations(affRes.data)
    } catch (err) {
      console.error("Erreur chargement affectations", err)
    } finally {
      setLoading(false)
    }
  }

  // --- DRAG & DROP LOGIC ---
  const onDragStart = (e: React.DragEvent, ticket: any) => {
    e.dataTransfer.setData('ticketId', ticket.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over')
  }

  const onDrop = (e: React.DragEvent, day: any, hour: string, tech?: any) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    const ticketId = e.dataTransfer.getData('ticketId')
    const ticket = tickets.find(t => t.id.toString() === ticketId)
    
    if (ticket) {
      const dateStr = `${day.fullDate}T${hour}`
      
      setSelectedTicket(ticket)
      setEditMode(false)
      setAssignment({
        ...assignment,
        techId: tech ? tech.id.toString() : (filterTechId !== 'all' ? filterTechId : ''),
        dateDebut: dateStr,
        dateFin: `${day.fullDate}T18:00`
      })
      setShowModal(true)
    }
  }

  const handleOpenEdit = (e: React.MouseEvent, aff: any) => {
      e.stopPropagation() 
      setSelectedTicket({
          id: aff.proFormaId, // Pour la compatibilité
          proFormaId: aff.proFormaId, // L'ID réel attendu par l'API
          reference: aff.referenceDossier,
          vehiculeMarque: aff.vehicule.split(' ')[0],
          vehiculeModele: aff.vehicule.split(' ').slice(1).join(' ')
      })
      setEditMode(true)
      setAssignment({
          techId: aff.technicienId.toString(),
          dateDebut: aff.dateDebut.split('.')[0],
          dateFin: aff.dateFinPrevue.split('.')[0],
          notes: aff.notes || ''
      })
      setShowModal(true)
  }

  const handleAssign = async () => {
    if (!assignment.techId) return alert("Veuillez choisir un technicien")
    
    try {
      const url = `/api/v1/atelier/affectations/${selectedTicket.id}`
      if (editMode) {
          await axiosInstance.put(url, null, {
            params: {
              technicienId: assignment.techId,
              debut: assignment.dateDebut,
              finPrevue: assignment.dateFin,
              notes: assignment.notes
            }
          })
      } else {
          await axiosInstance.post(url, null, {
            params: {
              technicienId: assignment.techId,
              debut: assignment.dateDebut,
              finPrevue: assignment.dateFin,
              notes: assignment.notes
            }
          })
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      alert("Erreur lors de l'affectation")
    }
  }

  const handleFinish = async () => {
      if (!window.confirm("Confirmer la fin des travaux ? Le véhicule passera en statut 'PRÊT'.")) return;
      try {
          await axiosInstance.put(`/api/v1/atelier/affectations/${selectedTicket.proFormaId}/terminer`)
          setShowModal(false)
          fetchData()
      } catch (err) {
          alert("Erreur lors de la clôture des travaux")
      }
  }

  const getAffectationsForCell = (fullDate: string, hour: string, techId?: number) => {
    return affectations.filter(a => {
      if (a.statut === 'TERMINE') return false // On ne montre pas les terminés sur le planning actif
      
      const startDate = new Date(a.dateDebut)
      const formattedDate = startDate.toISOString().split('T')[0]
      const matchesDate = formattedDate === fullDate
      const matchesHour = startDate.getHours().toString().padStart(2, '0') === hour.split(':')[0]
      
      const matchesGlobalFilter = filterTechId === 'all' || a.technicienId.toString() === filterTechId
      const matchesColTech = techId ? a.technicienId === techId : true
      
      return matchesDate && matchesHour && matchesGlobalFilter && matchesColTech
    })
  }

  const finishedAffectations = affectations.filter(a => a.statut === 'TERMINE')

  if (loading) return <div className="p-20 text-center">Chargement de l'atelier...</div>

  return (
    <div style={{ padding: '100px 40px 40px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER PREMIUM */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-1px' }}>Planning Garage</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginTop: 10 }}>
             <Badge variant="info" style={{ background: '#eff6ff', color: '#3b82f6', fontWeight: 800 }}>
                {viewMode === 'week' ? `Semaine du ${new Date(weekDays[0].fullDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}` : `Planning du ${new Date(selectedDay.fullDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`}
             </Badge>
             <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                <ShieldCheck size={16} color="#10b981" /> {techniciens.length} Techniciens actifs
             </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, background: '#fff', padding: '8px 15px', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
                <Filter size={18} color="#94a3b8" />
                <select 
                    value={filterTechId}
                    onChange={(e) => setFilterTechId(e.target.value)}
                    style={{ 
                        border: 'none', background: 'none', fontWeight: 800, color: '#0f172a', 
                        fontSize: '0.9rem', outline: 'none', cursor: 'pointer', paddingRight: '10px'
                    }}
                >
                    <option value="all">Tous techniciens</option>
                    {techniciens.map(t => (
                        <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>
                    ))}
                </select>
            </div>
            <button 
                className={viewMode === 'tech' ? "premium-btn-primary" : "premium-btn-secondary"} 
                onClick={() => setViewMode('tech')}
            >
                <User size={18} /> Vue Techniciens
            </button>
            <button 
                className={viewMode === 'week' ? "premium-btn-primary" : "premium-btn-secondary"} 
                onClick={() => setViewMode('week')}
            >
                <CalendarIcon size={18} /> Vue Semaine
            </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 30 }}>
        
        {/* COLONNE GAUCHE: FILE D'ATTENTE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
             <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                À Planifier ({tickets.length})
             </h3>
             <Badge variant="warning">Priorité</Badge>
          </div>
          
          <div className="scroll-container" style={{ maxHeight: 'calc(100vh - 450px)', overflowY: 'auto', paddingRight: 10 }}>
            {tickets.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', background: '#fff', borderRadius: 32, border: '3px dashed #e2e8f0' }}>
                    <CheckCircle2 size={40} color="#22c55e" style={{ margin: '0 auto 20px' }} />
                    <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem' }}>File d'attente vide</p>
                </div>
            )}

            {tickets.map(tk => (
                <div 
                key={tk.id} 
                draggable
                onDragStart={(e) => onDragStart(e, tk)}
                style={{ 
                    background: '#fff', padding: '20px', borderRadius: 24, marginBottom: 15,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.03)', cursor: 'grab', transition: 'all 0.3s ease',
                    border: '1px solid #f1f5f9'
                }}
                className="draggable-ticket"
                >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: 900, background: '#eff6ff', padding: '4px 8px', borderRadius: 6 }}>#{tk.reference}</span>
                </div>
                <h4 style={{ margin: '0 0 5px', fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>{tk.vehiculeMarque} {tk.vehiculeModele}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Client: <strong style={{color: '#0f172a'}}>{tk.clientNom}</strong></p>
                </div>
            ))}
          </div>

          {/* ZONE ARCHIVE / HISTORIQUE */}
          <div style={{ marginTop: 20 }}>
             <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 10px', marginBottom: 15 }}>
                ✅ Terminés ({finishedAffectations.length})
             </h3>
             <div className="scroll-container" style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: 10 }}>
                {finishedAffectations.map(aff => (
                    <div key={aff.id} style={{ 
                        background: '#f0fdf4', padding: '15px', borderRadius: 20, marginBottom: 10,
                        border: '1px solid #dcfce7', opacity: 0.8
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 900 }}>{aff.referenceDossier}</span>
                        </div>
                        <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#064e3b' }}>{aff.vehicule}</h4>
                    </div>
                ))}
             </div>
          </div>

          {viewMode === 'tech' && (
              <div style={{ marginTop: 'auto', background: '#fff', padding: 20, borderRadius: 24, border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8', marginBottom: 10 }}>CHOISIR LE JOUR</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {weekDays.map(d => (
                          <button 
                            key={d.fullDate}
                            onClick={() => setSelectedDay(d)}
                            style={{ 
                                padding: '8px 12px', borderRadius: 10, border: 'none', 
                                background: selectedDay.fullDate === d.fullDate ? '#0f172a' : '#f1f5f9',
                                color: selectedDay.fullDate === d.fullDate ? '#fff' : '#64748b',
                                fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer'
                            }}
                          >
                              {d.name} {d.date}
                          </button>
                      ))}
                  </div>
              </div>
          )}
        </div>

        {/* COLONNE CENTRE: LE PLANNING GRID */}
        <Card padding="none" style={{ borderRadius: 36, overflow: 'hidden', border: 'none', boxShadow: '0 40px 100px rgba(0,0,0,0.06)' }}>
          {/* CALENDAR HEADER */}
          <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${viewMode === 'week' ? 6 : techniciens.length}, 1fr)`, background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ padding: '30px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} color="#94a3b8" />
            </div>
            {viewMode === 'week' ? weekDays.map(d => (
              <div key={d.name} style={{ 
                padding: '20px 10px', textAlign: 'center', borderLeft: '1px solid #f1f5f9',
                background: d.isToday ? '#f0f9ff' : 'transparent' 
              }}>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 900, color: d.isToday ? '#3b82f6' : '#94a3b8', textTransform: 'uppercase' }}>{d.name}</p>
                <h3 style={{ margin: '5px 0 0', fontSize: '1.5rem', fontWeight: 900, color: d.isToday ? '#3b82f6' : '#0f172a' }}>{d.date}</h3>
              </div>
            )) : techniciens.map(t => (
              <div key={t.id} style={{ padding: '25px 10px', textAlign: 'center', borderLeft: '1px solid #f1f5f9' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>{t.specialite}</p>
                <h3 style={{ margin: '5px 0 0', fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>{t.prenom}</h3>
              </div>
            ))}
          </div>

          {/* CALENDAR BODY */}
          <div style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto', background: '#fff' }} className="calendar-grid">
            {HOURS.map(h => (
              <div key={h} style={{ display: 'grid', gridTemplateColumns: `80px repeat(${viewMode === 'week' ? 6 : techniciens.length}, 1fr)`, borderBottom: '1px solid #f8fafc' }}>
                <div style={{ padding: '35px 10px', fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textAlign: 'center', background: '#fcfdfe' }}>{h}</div>
                {viewMode === 'week' ? weekDays.map(d => {
                  const cellAffectations = getAffectationsForCell(d.fullDate, h);
                  return (
                    <div 
                      key={d.name} 
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={(e) => onDrop(e, d, h)}
                      style={{ 
                          borderLeft: '1px solid #f8fafc', minHeight: 110, padding: 8, 
                          transition: 'all 0.2s', position: 'relative',
                          background: d.isToday ? '#fcfdfe' : 'transparent'
                      }}
                      className="calendar-cell"
                    >
                      {cellAffectations.map(aff => (
                        <div 
                          key={aff.id} 
                          onClick={(e) => handleOpenEdit(e, aff)}
                          style={{ 
                            background: aff.statut === 'TERMINE' ? '#10b981' : '#3b82f6', 
                            color: '#fff', padding: '6px 10px', borderRadius: 10, 
                            fontSize: '0.65rem', fontWeight: 800, boxShadow: '0 5px 15px rgba(59, 130, 246, 0.2)',
                            marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            cursor: 'pointer', transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {aff.vehicule}
                        </div>
                      ))}
                    </div>
                  );
                }) : techniciens.map(t => {
                   const cellAffectations = getAffectationsForCell(selectedDay.fullDate, h, t.id);
                   return (
                    <div 
                      key={t.id} 
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={(e) => onDrop(e, selectedDay, h, t)}
                      style={{ borderLeft: '1px solid #f8fafc', minHeight: 110, padding: 8, transition: 'all 0.2s', position: 'relative' }}
                      className="calendar-cell"
                    >
                      {cellAffectations.map(aff => (
                        <div 
                          key={aff.id} 
                          onClick={(e) => handleOpenEdit(e, aff)}
                          style={{ 
                            background: aff.statut === 'TERMINE' ? '#10b981' : '#3b82f6', 
                            color: '#fff', padding: '6px 10px', borderRadius: 10, 
                            fontSize: '0.65rem', fontWeight: 800, boxShadow: '0 5px 15px rgba(59, 130, 246, 0.2)',
                            marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            cursor: 'pointer', transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {aff.vehicule}
                        </div>
                      ))}
                    </div>
                   );
                })}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* MODAL D'AFFECTATION / MODIFICATION */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <Card style={{ width: '100%', maxWidth: 550, borderRadius: 40, border: 'none', boxShadow: '0 50px 100px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                <div style={{ background: editMode ? '#0f172a' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', padding: '40px', color: '#fff', textAlign: 'center', position: 'relative' }}>
                    <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: 10, borderRadius: '50%', fontSize: '1.2rem' }}>×</button>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>{editMode ? 'Modifier le Planning' : 'Affecter un Expert'}</h2>
                    <p style={{ margin: '10px 0 0', opacity: 0.8, fontSize: '0.9rem', fontWeight: 600 }}>Dossier: #{selectedTicket?.reference}</p>
                </div>
                
                <div style={{ padding: '40px' }}>
                    <div style={{ marginBottom: 25 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '1px' }}>Choisir le Technicien</label>
                        <select 
                            value={assignment.techId}
                            onChange={(e) => setAssignment({...assignment, techId: e.target.value})}
                            style={{ width: '100%', padding: '18px 25px', borderRadius: 20, border: '2px solid #f1f5f9', background: '#f8fafc', fontWeight: 700, fontSize: '1rem', outline: 'none', color: '#0f172a' }}
                        >
                            <option value="">-- Sélectionner --</option>
                            {techniciens.map(t => (
                                <option key={t.id} value={t.id}>{t.prenom} {t.nom} ({t.specialite})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 25 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' }}>Début</label>
                            <input 
                                type="datetime-local" 
                                value={assignment.dateDebut}
                                onChange={(e) => setAssignment({...assignment, dateDebut: e.target.value})}
                                style={{ width: '100%', padding: '18px', borderRadius: 20, border: '2px solid #f1f5f9', background: '#f8fafc', fontWeight: 700 }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' }}>Fin Estimée</label>
                            <input 
                                type="datetime-local" 
                                value={assignment.dateFin}
                                onChange={(e) => setAssignment({...assignment, dateFin: e.target.value})}
                                style={{ width: '100%', padding: '18px', borderRadius: 20, border: '2px solid #f1f5f9', background: '#f8fafc', fontWeight: 700 }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: 35 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' }}>Instructions (Optionnel)</label>
                        <textarea 
                            value={assignment.notes}
                            onChange={(e) => setAssignment({...assignment, notes: e.target.value})}
                            placeholder="Détails spécifiques pour le technicien..."
                            style={{ width: '100%', padding: '20px', borderRadius: 20, border: '2px solid #f1f5f9', background: '#f8fafc', fontWeight: 600, minHeight: 100, outline: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                        <button 
                            onClick={handleAssign}
                            className="premium-btn-primary"
                            style={{ width: '100%', padding: '20px', fontSize: '1rem', justifyContent: 'center' }}
                        >
                            {editMode ? 'Mettre à jour le planning' : 'Confirmer l\'affectation'}
                        </button>
                        
                        {editMode && (
                            <button 
                                onClick={handleFinish}
                                style={{ 
                                    width: '100%', padding: '20px', fontSize: '1rem', borderRadius: 20, 
                                    border: 'none', background: '#fee2e2', color: '#ef4444', 
                                    fontWeight: 900, cursor: 'pointer', transition: 'all 0.3s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}
                            >
                                <CheckCircle2 size={20} />
                                Clôturer les travaux (Véhicule Prêt)
                            </button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
      )}

      <style>{`
        .calendar-cell.drag-over { background: #eff6ff !important; border: 2px dashed #3b82f6 !important; }
        .draggable-ticket:hover { transform: translateX(5px); border-color: #3b82f6; }
        .premium-btn-primary {
            padding: 10px 20px; background: #0f172a; color: #fff; border: none; border-radius: 12px;
            font-weight: 800; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;
        }
        .premium-btn-secondary {
            padding: 10px 20px; background: #fff; color: #0f172a; border: 1.5px solid #e2e8f0; border-radius: 12px;
            font-weight: 800; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px;
        }
      `}</style>
    </div>
  )
}
