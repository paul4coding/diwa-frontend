import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../utils/axiosInstance'
import {
  Car,
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  Activity,
  Truck,
  User,
  ArrowRight,
  ChevronRight,
  Search,
  Package,
  Wrench,
  AlertCircle,
  Eye,
  FileText,
  ClipboardCheck,
  Navigation,
  Trash2,
  Download
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'

export default function ReceptionDashboard() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('a-assigner')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showDirectModal, setShowDirectModal] = useState(false)
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [newClientData, setNewClientData] = useState({ prenom: '', nom: '', email: '', telephone: '' })
  const [directVehiculeData, setDirectVehiculeData] = useState({ immat: '', chassis: '', marque: '', modele: '', probleme: '' })
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [targetTechId, setTargetTechId] = useState('')
  const [showLivraisonModal, setShowLivraisonModal] = useState(false)
  const [livraisonItem, setLivraisonItem] = useState<any>(null)
  const [fraisLivraisonInput, setFraisLivraisonInput] = useState('')
  const [showDeliveryAssignModal, setShowDeliveryAssignModal] = useState(false)
  const [deliveryItem, setDeliveryItem] = useState<any>(null)
  const [targetChauffeurId, setTargetChauffeurId] = useState('')

  const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' as const, marginBottom: '8px' }
  const modalInput = { width: '100%', padding: '15px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: 600 }
  const miniInput = { width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }

  // Fetch all demands
  const { data: demandes = [], isLoading, refetch } = useQuery({
    queryKey: ['demandes-reception'],
    queryFn: () => axiosInstance.get('/api/v1/demandes').then(res => res.data)
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () => {
      const [resClient, resUser] = await Promise.all([
        axiosInstance.get('/api/v1/users/role/ROLE_CLIENT'),
        axiosInstance.get('/api/v1/users/role/ROLE_USER')
      ])
      const combined = [...resClient.data, ...resUser.data]
      // Dédupliquer par ID au cas où
      const unique = Array.from(new Map(combined.map(c => [c.id, c])).values())
      console.log(">>> [DEBUG] Clients (Combined):", unique)
      return unique
    }
  })

  const { data: techniciens = [] } = useQuery({
    queryKey: ['techniciens-users'],
    queryFn: () => axiosInstance.get('/api/v1/users/role/ROLE_TECHNICIEN').then(res => res.data)
  })

  const { data: chauffeursDisponibles = [] } = useQuery({
    queryKey: ['chauffeurs-disponibles'],
    queryFn: () => axiosInstance.get('/api/v1/atelier/missions/chauffeurs/disponibles').then(res => res.data)
  })

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    refetch()
  }

  // 1. À ASSIGNER (Scenario A : Demande récupération sans chauffeur)
  const aAssigner = demandes.filter((d: any) => d.demandeRecuperation && !d.chauffeurRecuperationNom && d.statut === 'SOUMISE')

  // 2. À VALIDER (Technicien a fini l'enregistrement technique)
  const aValider = demandes.filter((d: any) => d.statut === 'EN_ENREGISTREMENT')

  // 3. AU GARAGE (Attente Enregistrement Technique)
  const auGarage = demandes.filter((d: any) => d.statut === 'VEHICULE_RECU')

  // 4. PRO FORMA À CHIFFRER (Version V1 reçue, attente prix)
  const aChiffrer = demandes.filter((d: any) => d.statut === 'PROFORMA_V1')

  // 5. RÉPARATIONS EN COURS
  const enReparation = demandes.filter((d: any) => d.statut === 'EN_COURS_REPARATION')

  // 5. MISSIONS CHAUFFEUR EN COURS
  const missionsEnCours = demandes.filter((d: any) => 
    d.chauffeurRecuperationNom && 
    ['CHAUFFEUR_ASSIGNE', 'CHAUFFEUR_EN_ROUTE', 'CHAUFFEUR_ARRIVE_CHEZ_CLIENT', 'VEHICULE_EN_TRANSIT', 'VEHICULE_RECU'].includes(d.statut)
  )

  // 6. ZONE DE RÉCEPTION (Arrivés à DIWA, attente contrôle/technicien)
  const enZoneReception = demandes.filter((d: any) => ['VEHICULE_RECU', 'EN_RECEPTION'].includes(d.statut))

  // 7. VALIDATIONS CLIENTS — client has submitted selection OR confirmed proforma with no delivery
  const aValiderClient = demandes.filter((d: any) =>
    d.statut === 'SELECTION_RECUE' || d.statut === 'CONFIRME'
  )

  // 8. EN ATTENTE CONFIRMATION FINALE — delivery fee set, waiting for client's final OK
  const enAttenteConfFin = demandes.filter((d: any) => d.statut === 'EN_ATTENTE_CONFIRMATION_FINALE')

  // 9. PRÊTS À LIVRER — repair done + delivery requested
  const pretsALivrer = demandes.filter((d: any) => d.statut === 'PRET' && d.demandeLivraison === true)

  // 10. CLÔTURÉS — dossiers terminés
  const clotures = demandes.filter((d: any) => d.statut === 'CLOTURE')

  const telechargerFacture = async (demandeId: number, reference: string) => {
    try {
      const resp = await axiosInstance.get(`/api/v1/factures/${demandeId}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Facture_DIWA_${reference}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Facture non disponible.')
    }
  }

  // Mutations
  const mutationValiderEnregistrement = useMutation({
    mutationFn: (id: number) => axiosInstance.put(`/api/v1/demandes/${id}/valider-reception`),
    onSuccess: () => {
        queryClient.invalidateQueries()
        alert("Dossier transmis au chef technicien !")
    }
  })

  const mutationValiderSelectionFinale = useMutation({
    mutationFn: (proFormaId: number) => axiosInstance.put(`/api/v1/proformas/${proFormaId}/valider`),
    onSuccess: () => {
        queryClient.invalidateQueries()
        alert("Sélection client validée ! Prêt pour affectation technique.")
    }
  })

  const mutationCreateClient = useMutation({
    mutationFn: (data: any) => axiosInstance.post('/api/auth/register', { ...data, username: data.email, roles: ['ROLE_CLIENT'], password: 'Password123!' }),
    onSuccess: (res) => {
        setSelectedClient(res.data.user || res.data)
        setShowNewClientForm(false)
        alert("Client créé avec succès !")
    }
  })

  const mutationCreateDirect = useMutation({
    mutationFn: (data: any) => axiosInstance.post('/api/v1/demandes/direct', data),
    onSuccess: () => {
        queryClient.invalidateQueries()
        setShowDirectModal(false)
        resetDirectForm()
        alert("Ticket d'arrivée directe créé !")
    }
  })

  const mutationDelete = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/api/v1/demandes/${id}`),
    onSuccess: () => {
        queryClient.invalidateQueries()
        alert("Ticket supprimé avec succès")
    },
    onError: () => alert("Erreur lors de la suppression")
  })

  const mutationAssign = useMutation({
    mutationFn: ({ id, techId }: any) => axiosInstance.put(`/api/v1/demandes/${id}/assigner?technicienId=${techId}`),
    onSuccess: () => {
        queryClient.invalidateQueries()
        setShowAssignModal(false)
        setSelectedItem(null)
        alert("Technicien affecté avec succès !")
    }
  })

  const mutationMettreAJourLivraison = useMutation({
    mutationFn: ({ proFormaId, frais }: any) =>
        axiosInstance.put(`/api/v1/proformas/${proFormaId}/mettre-a-jour-livraison?fraisLivraison=${frais}`),
    onSuccess: () => {
        queryClient.invalidateQueries()
        setShowLivraisonModal(false)
        setLivraisonItem(null)
        setFraisLivraisonInput('')
        alert("Frais de livraison enregistrés ! Le client doit confirmer le devis final.")
    },
    onError: (e: any) => alert("Erreur : " + (e?.response?.data?.message || e.message))
  })

  const mutationAssignDelivery = useMutation({
    mutationFn: ({ demandeId, chauffeurId }: any) =>
        axiosInstance.post(`/api/v1/atelier/missions?demandeId=${demandeId}&chauffeurId=${chauffeurId}&type=LIVRAISON`),
    onSuccess: () => {
        queryClient.invalidateQueries()
        setShowDeliveryAssignModal(false)
        setDeliveryItem(null)
        setTargetChauffeurId('')
        alert("Mission de livraison assignée au chauffeur !")
    },
    onError: (e: any) => alert("Erreur : " + (e?.response?.data?.message || e.message))
  })

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce ticket ?")) {
        mutationDelete.mutate(id)
    }
  }

  const resetDirectForm = () => {
    setSelectedClient(null)
    setClientSearch('')
    setShowNewClientForm(false)
    setDirectVehiculeData({ immat: '', chassis: '', marque: '', modele: '', probleme: '', categorie: 'Entretien & Vidange' })
  }

  const filteredClients = Array.isArray(clients) ? clients.filter((c: any) => {
    if (c.email === 'client@diwa.tg') return false // Ignorer le compte de test
    const nomComplet = `${c.nom || ''} ${c.prenom || ''}`.toLowerCase()
    const email = (c.email || '').toLowerCase()
    const search = clientSearch.toLowerCase()
    return nomComplet.includes(search) || email.includes(search)
  }) : []

  if (isLoading) return <div className="p-20 text-center">Chargement du centre logistique...</div>

  function ReceptionSection({ title, icon, color, items, renderItem }: any) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 30 }}>
          <div style={{ background: color + '15', color: color, padding: 12, borderRadius: 16 }}>{icon}</div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>
            {title} <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 10 }}>({items.length})</span>
          </h2>
        </div>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', background: '#fff', borderRadius: 24, border: '2px dashed #e2e8f0' }}>
              <AlertCircle size={40} style={{ marginBottom: 15, opacity: 0.5 }} />
              <p>Aucun dossier en attente</p>
          </div>
        ) : (
          items.map(renderItem)
        )}
      </div>
    )
  }

  function ReceptionCard({ item, children }: any) {
    return (
      <div className="reception-card">
          <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a' }}>{item.reference}</span>
                  {item.diagnosticGratuit && <Badge variant="success">Diagnostic Offert</Badge>}
              </div>
              <div style={{ display: 'flex', gap: 20, color: '#64748b', fontSize: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Car size={14} /> 
                    {item.vehiculeMarque} {item.vehiculeModele}
                    <span style={{ color: item.vehiculeImmatriculation ? '#0f172a' : '#ef4444', fontWeight: 700, marginLeft: 5 }}>
                        ({item.vehiculeImmatriculation || 'IMMAT INCONNUE'})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} /> {item.clientNom}</div>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><Clock size={12} style={{ marginRight: 5 }} /> Reçue le {new Date(item.createDate).toLocaleString()}</div>
                  <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 700 }}
                  >
                      <Trash2 size={14} /> Supprimer
                  </button>
              </div>
          </div>
          <div>{children}</div>
      </div>
    )
  }

  function tabStyle(active: boolean) {
    return {
      padding: '10px 20px',
      borderRadius: '10px',
      border: 'none',
      fontWeight: 800,
      fontSize: '0.9rem',
      cursor: 'pointer',
      background: active ? '#0f172a' : 'transparent',
      color: active ? '#fff' : '#64748b',
      transition: '0.3s'
    }
  }

  return (
    <div className="reception-premium-dashboard" style={{ padding: '40px 0', background: '#f8fafc', minHeight: '100vh' }}>
      
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>🏪 Logistique & Réception</h1>
          <p style={{ color: '#64748b', marginTop: '8px', fontSize: '1.1rem' }}>Pilotage du flux atelier et logistique chauffeur</p>
        </div>
        <div style={{ display: 'flex', gap: 15 }}>
            <Button variant="primary" size="lg" icon={<Car size={20} />} onClick={() => setShowDirectModal(true)}>
                Nouvelle Arrivée Directe
            </Button>
        </div>
        <div style={{ display: 'flex', gap: 10, background: '#fff', padding: 5, borderRadius: 14, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <button onClick={() => handleTabChange('a-assigner')} style={tabStyle(activeTab === 'a-assigner')}>
                Chauffeurs {aAssigner.length > 0 && <span style={{ marginLeft: 5, background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 10 }}>{aAssigner.length}</span>}
            </button>
            <button onClick={() => handleTabChange('missions-en-cours')} style={tabStyle(activeTab === 'missions-en-cours')}>Suivi Missions</button>
            <button onClick={() => handleTabChange('zone-reception')} style={tabStyle(activeTab === 'zone-reception')}>
                Réception DIWA {enZoneReception.length > 0 && <span style={{ marginLeft: 5, background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 10 }}>{enZoneReception.length}</span>}
            </button>
            <button onClick={() => handleTabChange('a-valider')} style={tabStyle(activeTab === 'a-valider')}>
                Validation Tech {aValider.length > 0 && <span style={{ marginLeft: 5, background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 10 }}>{aValider.length}</span>}
            </button>
            <button onClick={() => handleTabChange('a-chiffrer')} style={tabStyle(activeTab === 'a-chiffrer')}>
                Pro Formas {aChiffrer.length > 0 && <span style={{ marginLeft: 5, background: '#f59e0b', color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 10 }}>{aChiffrer.length}</span>}
            </button>
            <button onClick={() => handleTabChange('validations-client')} style={tabStyle(activeTab === 'validations-client')}>
                Validations Client {aValiderClient.length > 0 && <span style={{ marginLeft: 5, background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 10 }}>{aValiderClient.length}</span>}
            </button>
            {enAttenteConfFin.length > 0 && (
              <button onClick={() => handleTabChange('attente-confirmation')} style={tabStyle(activeTab === 'attente-confirmation')}>
                  Attente Conf. Client <span style={{ marginLeft: 5, background: '#f59e0b', color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 10 }}>{enAttenteConfFin.length}</span>
              </button>
            )}
            <button onClick={() => handleTabChange('en-reparation')} style={tabStyle(activeTab === 'en-reparation')}>Atelier</button>
            <button onClick={() => handleTabChange('prets-a-livrer')} style={tabStyle(activeTab === 'prets-a-livrer')}>
                Prêts à Livrer {pretsALivrer.length > 0 && <span style={{ marginLeft: 5, background: '#8b5cf6', color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 10 }}>{pretsALivrer.length}</span>}
            </button>
            <button onClick={() => handleTabChange('clotures')} style={tabStyle(activeTab === 'clotures')}>
                Clôturés {clotures.length > 0 && <span style={{ marginLeft: 5, background: '#64748b', color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 10 }}>{clotures.length}</span>}
            </button>
        </div>
      </header>

      <div className="reception-content">
        
        {activeTab === 'a-assigner' && (
          <ReceptionSection 
            title="Logistique Récupération (À Assigner)" 
            icon={<Truck size={22} />} 
            color="#3b82f6"
            items={aAssigner}
            renderItem={(d: any) => (
              <ReceptionCard key={d.id} item={d}>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="outline" size="sm" icon={<Eye size={16} />} onClick={() => setSelectedItem(d)}>Détails</Button>
                    <Button variant="primary" size="sm" icon={<User size={16} />} onClick={() => navigate('/admin/logistique')}>Assigner Chauffeur</Button>
                </div>
              </ReceptionCard>
            )}
          />
        )}

        {activeTab === 'missions-en-cours' && (
          <ReceptionSection 
            title="Suivi des Missions Chauffeurs" 
            icon={<Navigation size={22} />} 
            color="#6366f1"
            items={missionsEnCours}
            renderItem={(d: any) => (
              <ReceptionCard key={d.id} item={d}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 600 }}>
                    Chauffeur : <span style={{ color: '#3b82f6' }}>{d.chauffeurRecuperationNom}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                      <Button variant="outline" size="sm" icon={<Eye size={16} />} onClick={() => setSelectedItem(d)}>Détails</Button>
                      <Button variant="warning" size="sm" icon={<Wrench size={16} />} onClick={() => navigate(`/admin/logistique?missionId=${d.id}`)}>Modifier Chauffeur</Button>
                  </div>
                </div>
              </ReceptionCard>
            )}
          />
        )}

        {activeTab === 'zone-reception' && (
          <ReceptionSection 
            title="Zone de Réception (Contrôle à l'arrivée)" 
            icon={<ClipboardCheck size={22} />} 
            color="#ec4899"
            items={enZoneReception}
            renderItem={(d: any) => (
              <ReceptionCard key={d.id} item={d}>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="outline" size="sm" icon={<Eye size={16} />} onClick={() => setSelectedItem(d)}>Détails</Button>
                    {d.statut === 'VEHICULE_RECU' ? (
                      <div style={{ 
                          padding: '8px 15px', background: '#fdf2f8', color: '#db2777', 
                          borderRadius: 12, fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 
                      }}>
                          <Clock size={14} /> EN ATTENTE ENREGISTREMENT TECH
                      </div>
                    ) : (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        icon={<User size={16} />} 
                        onClick={() => { setSelectedItem(d); setShowAssignModal(true); }}
                      >
                        Affecter Expert
                      </Button>
                    )}
                </div>
              </ReceptionCard>
            )}
          />
        )}

        {activeTab === 'a-valider' && (
          <ReceptionSection 
            title="Validation Dossiers Techniques" 
            icon={<ClipboardCheck size={22} />} 
            color="#10b981"
            items={aValider}
            renderItem={(d: any) => (
              <ReceptionCard key={d.id} item={d}>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/admin/sav/${d.uuid}`)}>Examiner</Button>
                    <Button variant="success" size="sm" onClick={() => mutationValiderEnregistrement.mutate(d.id)}>Valider & Envoyer Tech</Button>
                </div>
              </ReceptionCard>
            )}
          />
        )}

        {activeTab === 'a-chiffrer' && (
          <ReceptionSection 
            title="Pro Formas à Chiffrer" 
            icon={<FileText size={22} />} 
            color="#f59e0b"
            items={aChiffrer}
            renderItem={(d: any) => (
              <ReceptionCard key={d.id} item={d}>
                {d.proFormaId ? (
                  <Button variant="warning" size="sm" onClick={() => navigate(`/admin/reception/proforma/${d.proFormaId}/prix`)}>
                    <Activity size={16} /> Ajouter les Prix (V2)
                  </Button>
                ) : (
                  <Badge variant="warning">ProForma non générée</Badge>
                )}
              </ReceptionCard>
            )}
          />
        )}

        {activeTab === 'validations-client' && (
          <ReceptionSection
            title="Validations Finales (Accords Clients)"
            icon={<ClipboardCheck size={22} />}
            color="#10b981"
            items={aValiderClient}
            renderItem={(d: any) => (
              <ReceptionCard key={d.id} item={d}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {d.demandeLivraison && (
                    <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 10, padding: '8px 12px', fontSize: '0.8rem', fontWeight: 700, color: '#92400e' }}>
                      🚚 Livraison à domicile demandée — adresse : {d.adresseLivraison || 'non précisée'}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/admin/sav/${d.uuid}`)}>Voir Sélection</Button>
                    {d.demandeLivraison && !d.fraisLivraison ? (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => { setLivraisonItem(d); setShowLivraisonModal(true) }}
                      >
                        Fixer frais livraison
                      </Button>
                    ) : (
                      <Button
                          variant="success"
                          size="sm"
                          disabled={mutationValiderSelectionFinale.isPending}
                          onClick={() => mutationValiderSelectionFinale.mutate(d.proFormaId)}
                      >
                          {mutationValiderSelectionFinale.isPending ? 'Validation...' : 'Valider la sélection'}
                      </Button>
                    )}
                  </div>
                </div>
              </ReceptionCard>
            )}
          />
        )}

        {activeTab === 'attente-confirmation' && (
          <ReceptionSection
            title="En attente de confirmation finale client (avec livraison)"
            icon={<Clock size={22} />}
            color="#f59e0b"
            items={enAttenteConfFin}
            renderItem={(d: any) => (
              <ReceptionCard key={d.id} item={d}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: 600 }}>
                    En attente que le client confirme le devis final incluant les frais de livraison.
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/admin/sav/${d.uuid}`)}>Voir dossier</Button>
                </div>
              </ReceptionCard>
            )}
          />
        )}

        {activeTab === 'en-reparation' && (
          <ReceptionSection
            title="Véhicules en Travaux"
            icon={<Wrench size={22} />}
            color="#6366f1"
            items={enReparation}
            renderItem={(d: any) => (
              <ReceptionCard key={d.id} item={d}>
                <Badge variant="primary">En cours</Badge>
              </ReceptionCard>
            )}
          />
        )}

        {activeTab === 'prets-a-livrer' && (
          <ReceptionSection
            title="Prêts à Livrer à Domicile"
            icon={<Truck size={22} />}
            color="#8b5cf6"
            items={pretsALivrer}
            renderItem={(d: any) => (
              <ReceptionCard key={d.id} item={d}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: '0.85rem', color: '#6d28d9', fontWeight: 600 }}>
                    Livraison : <strong>{d.adresseLivraison || 'Adresse non précisée'}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/admin/sav/${d.uuid}`)}>Dossier</Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Truck size={16} />}
                      onClick={() => { setDeliveryItem(d); setShowDeliveryAssignModal(true) }}
                    >
                      Assigner chauffeur livraison
                    </Button>
                  </div>
                </div>
              </ReceptionCard>
            )}
          />
        )}

        {activeTab === 'clotures' && (
          <ReceptionSection
            title="Dossiers Clôturés — Factures"
            icon={<FileText size={22} />}
            color="#64748b"
            items={clotures}
            renderItem={(d: any) => (
              <ReceptionCard key={d.id} item={d}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Button variant="outline" size="sm" icon={<Eye size={16} />} onClick={() => navigate(`/admin/sav/${d.uuid}`)}>
                    Dossier
                  </Button>
                  <button
                    onClick={() => telechargerFacture(d.id, d.reference)}
                    title="Télécharger la facture"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: '#b71c1c', color: '#fff', border: 'none',
                      padding: '8px 16px', borderRadius: 10,
                      fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(183,28,28,0.25)'
                    }}
                  >
                    <Download size={14} /> Télécharger facture
                  </button>
                </div>
              </ReceptionCard>
            )}
          />
        )}
      </div>

      {/* MODAL ARRIVÉE DIRECTE */}
      {showDirectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)', padding: 20 }}>
            <div style={{ background: 'white', width: '100%', maxWidth: '800px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                <div style={{ background: '#0f172a', padding: '30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>🆕 Création Ticket Arrivée Directe</h2>
                    <button onClick={() => setShowDirectModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}>X</button>
                </div>

                <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                    {/* COLONNE CLIENT */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}><User size={20} color="#3b82f6" /> Identification Client</h3>
                        
                        {!selectedClient ? (
                            <>
                                <div style={{ position: 'relative', marginBottom: 15 }}>
                                    <Search size={18} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Rechercher un client (Nom, Email)..." 
                                        value={clientSearch}
                                        onChange={(e) => setClientSearch(e.target.value)}
                                        style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem' }}
                                    />
                                                       <div style={{ 
                                    maxHeight: '200px', 
                                    overflowY: 'auto', 
                                    marginBottom: 20, 
                                    border: '2px solid #e2e8f0', 
                                    borderRadius: 16,
                                    background: 'white',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}>
                                    {filteredClients.length > 0 ? (
                                        filteredClients.map((c: any) => (
                                            <div 
                                                key={c.id} 
                                                onClick={() => setSelectedClient(c)}
                                                style={{ 
                                                    padding: '12px 15px', 
                                                    cursor: 'pointer', 
                                                    borderBottom: '1px solid #f1f5f9', 
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                                className="client-item"
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>{c.nom} {c.prenom}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.email}</div>
                                                </div>
                                                <div style={{ background: '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800 }}>SÉLECTIONNER</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                                            {clientSearch ? "Aucun client ne correspond à votre recherche" : "Commencez à taper pour rechercher un client"}
                                        </div>
                                    )}
                                </div>
                                </div>
                                <button 
                                    onClick={() => setShowNewClientForm(true)}
                                    style={{ width: '100%', padding: '15px', borderRadius: 16, border: '2px dashed #3b82f6', background: '#eff6ff', color: '#3b82f6', fontWeight: 800, cursor: 'pointer' }}
                                >
                                    + Créer un nouveau compte client
                                </button>
                            </>
                        ) : (
                            <div style={{ background: '#fff', border: '2px solid #10b981', padding: 25, borderRadius: 24, boxShadow: '0 15px 30px rgba(16, 185, 129, 0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                                    <div>
                                        <div style={{ fontWeight: 900, color: '#064e3b', fontSize: '1.2rem' }}>{selectedClient.prenom} {selectedClient.nom}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>{selectedClient.email} • {selectedClient.telephone || 'Sans tel'}</div>
                                    </div>
                                    <button onClick={() => setSelectedClient(null)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', fontWeight: 800, padding: '8px 15px', borderRadius: 10, cursor: 'pointer', fontSize: '0.75rem' }}>Changer</button>
                                </div>
                                
                                {/* Liste des dossiers en cours du client */}
                                <div style={{ background: '#f0fdf4', padding: 15, borderRadius: 16 }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: 10 }}>Dossiers en cours du client</div>
                                    {demandes.filter((d: any) => d.clientNom?.includes(selectedClient.nom)).length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {demandes.filter((d: any) => d.clientNom?.includes(selectedClient.nom)).slice(0, 3).map((d: any) => (
                                                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '8px 12px', borderRadius: 10, fontSize: '0.8rem', border: '1px solid #d1fae5' }}>
                                                    <span style={{ fontWeight: 800 }}>{d.reference}</span>
                                                    <span style={{ color: '#64748b' }}>{d.vehiculeMarque} ({d.statut})</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>Aucun dossier actif trouvé</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {showNewClientForm && (
                            <div style={{ marginTop: 25, padding: 30, background: '#fff', border: '2px solid #3b82f6', borderRadius: 24, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.1)' }}>
                                <h4 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 900, color: '#1e3a8a' }}>✨ Nouveau Compte Client</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
                                    <div className="input-field">
                                        <label style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Prénom</label>
                                        <input placeholder="Ex: Jean" onChange={e => setNewClientData({...newClientData, prenom: e.target.value})} style={{ ...miniInput, width: '100%' }} />
                                    </div>
                                    <div className="input-field">
                                        <label style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Nom</label>
                                        <input placeholder="Ex: DUPONT" onChange={e => setNewClientData({...newClientData, nom: e.target.value})} style={{ ...miniInput, width: '100%' }} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: 15 }}>
                                    <label style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Adresse Email</label>
                                    <input placeholder="client@email.com" onChange={e => setNewClientData({...newClientData, email: e.target.value})} style={{...miniInput, width: '100%'}} />
                                </div>
                                <div style={{ marginBottom: 25 }}>
                                    <label style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Numéro Téléphone</label>
                                    <input placeholder="+228 90 00 00 00" onChange={e => setNewClientData({...newClientData, telephone: e.target.value})} style={{...miniInput, width: '100%'}} />
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button onClick={() => setShowNewClientForm(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', background: 'none', fontWeight: 700, cursor: 'pointer' }}>Annuler</button>
                                    <button 
                                        disabled={mutationCreateClient.isPending}
                                        onClick={() => mutationCreateClient.mutate(newClientData)} 
                                        style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: '#3b82f6', color: 'white', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)' }}
                                    >
                                        {mutationCreateClient.isPending ? 'Création...' : 'CRÉER LE COMPTE'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* COLONNE VÉHICULE */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}><Car size={20} color="#f59e0b" /> Infos Véhicule</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            <div>
                                <label style={labelStyle}>Immatriculation</label>
                                <input 
                                    style={modalInput} 
                                    placeholder="Ex: TG-1234-AX" 
                                    value={directVehiculeData.immat}
                                    onChange={e => setDirectVehiculeData({...directVehiculeData, immat: e.target.value.toUpperCase()})}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Numéro de Châssis (VIN)</label>
                                <input 
                                    style={modalInput} 
                                    placeholder="Saisir les 17 caractères..." 
                                    value={directVehiculeData.chassis}
                                    onChange={e => setDirectVehiculeData({...directVehiculeData, chassis: e.target.value.toUpperCase()})}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                                <div>
                                    <label style={labelStyle}>Marque</label>
                                    <input style={modalInput} placeholder="Ex: Toyota" value={directVehiculeData.marque} onChange={e => setDirectVehiculeData({...directVehiculeData, marque: e.target.value})} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Modèle</label>
                                    <input style={modalInput} placeholder="Ex: RAV4" value={directVehiculeData.modele} onChange={e => setDirectVehiculeData({...directVehiculeData, modele: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Catégorie du motif</label>
                                <select 
                                    style={{ ...modalInput, cursor: 'pointer' }} 
                                    value={directVehiculeData.categorie} 
                                    onChange={e => setDirectVehiculeData({...directVehiculeData, categorie: e.target.value})}
                                >
                                    <option>Entretien & Vidange</option>
                                    <option>Mécanique Générale</option>
                                    <option>Électricité / Batterie</option>
                                    <option>Climatisation</option>
                                    <option>Freinage / Pneus</option>
                                    <option>Carrosserie</option>
                                    <option>Autre</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Détails / Observations</label>
                                <textarea 
                                    style={{ ...modalInput, height: '80px', resize: 'none' }} 
                                    placeholder="Précisez le problème si nécessaire..."
                                    value={directVehiculeData.probleme}
                                    onChange={e => setDirectVehiculeData({...directVehiculeData, probleme: e.target.value})}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '30px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 15 }}>
                    <button 
                        onClick={() => setShowDirectModal(false)}
                        style={{ padding: '15px 30px', borderRadius: 16, border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Annuler
                    </button>
                    <button 
                        disabled={!selectedClient || !directVehiculeData.immat || mutationCreateDirect.isPending}
                        onClick={() => mutationCreateDirect.mutate({
                            clientId: selectedClient.id,
                            vehiculeImmatriculation: directVehiculeData.immat,
                            vehiculeNumeroChassis: directVehiculeData.chassis,
                            vehiculeMarque: directVehiculeData.marque,
                            vehiculeModele: directVehiculeData.modele,
                            descriptionProbleme: `${directVehiculeData.categorie}: ${directVehiculeData.probleme}`
                        })}
                        style={{ padding: '15px 40px', borderRadius: 16, border: 'none', background: '#0f172a', color: 'white', fontWeight: 800, cursor: 'pointer', opacity: (!selectedClient || !directVehiculeData.immat || mutationCreateDirect.isPending) ? 0.5 : 1 }}
                    >
                        {mutationCreateDirect.isPending ? 'Enregistrement...' : 'Valider l\'Entrée Directe'}
                    </button>
                   </div>
            </div>
        </div>
      )}

      {selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'white', width: '600px', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
               <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Dossier #{selectedItem.reference}</h3>
               <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            
            <div style={{ padding: '30px' }}>
               {/* ── STEPPER VISUEL ── */}
               <div style={{ marginBottom: '35px', padding: '0 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '10px' }}>
                    {[
                      { id: 'SOUMISE', label: 'Demande', icon: '📋' },
                      { id: 'CHAUFFEUR_ASSIGNE', label: 'Assigné', icon: '👤' },
                      { id: 'CHAUFFEUR_EN_ROUTE', label: 'En Route', icon: '🚚' },
                      { id: 'CHAUFFEUR_ARRIVE_CHEZ_CLIENT', label: 'Arrivé Client', icon: '📍' },
                      { id: 'VEHICULE_EN_TRANSIT', label: 'Transit', icon: '🚗' },
                      { id: 'VEHICULE_RECU', label: 'Réception', icon: '🏁' }
                    ].map((step, idx, arr) => {
                      const stepsOrder = ['SOUMISE', 'CHAUFFEUR_ASSIGNE', 'CHAUFFEUR_EN_ROUTE', 'CHAUFFEUR_ARRIVE_CHEZ_CLIENT', 'VEHICULE_EN_TRANSIT', 'VEHICULE_RECU', 'EN_RECEPTION', 'EN_ENREGISTREMENT'];
                      const currentIdx = stepsOrder.indexOf(selectedItem.statut);
                      const stepIdx = stepsOrder.indexOf(step.id);
                      const isCompleted = currentIdx >= stepIdx;
                      const isActive = selectedItem.statut === step.id;

                      return (
                        <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                          <div style={{ 
                            width: '32px', height: '32px', borderRadius: '50%', 
                            background: isCompleted ? '#10b981' : '#f1f5f9',
                            color: isCompleted ? 'white' : '#94a3b8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1rem', border: isActive ? '3px solid #3b82f6' : 'none',
                            transition: 'all 0.3s ease'
                          }}>
                            {isCompleted ? '✓' : step.icon}
                          </div>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, marginTop: '8px', color: isCompleted ? '#1e293b' : '#94a3b8', textTransform: 'uppercase' }}>{step.label}</span>
                          
                          {idx < arr.length - 1 && (
                            <div style={{ 
                              position: 'absolute', top: '16px', left: 'calc(50% + 20px)', width: 'calc(100% - 40px)', height: '2px', 
                              background: currentIdx > stepIdx ? '#10b981' : '#e2e8f0',
                              zIndex: -1 
                            }} />
                          )}
                        </div>
                      )
                    })}
                  </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Véhicule</label>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedItem.vehiculeMarque} {selectedItem.vehiculeModele}</div>
                    <div style={{ color: '#64748b' }}>Immat: {selectedItem.vehiculeImmatriculation || selectedItem.vehiculeImmat}</div>
                    <div style={{ color: '#64748b' }}>VIN: {selectedItem.vehiculeNumeroChassis || selectedItem.vehiculeVin || selectedItem.vin || 'N/A'}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Client</label>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedItem.clientNom}</div>
                    <div style={{ color: '#64748b' }}>Tél: {selectedItem.clientTel || 'N/A'}</div>
                  </div>
               </div>

               {selectedItem.chauffeurRecuperationNom && (
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#eff6ff', borderRadius: '18px', marginBottom: '25px', border: '1px solid #bfdbfe' }}>
                    <div style={{ width: '45px', height: '45px', background: '#3b82f6', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <Truck size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase' }}>Chauffeur Assigné</label>
                      <div style={{ fontWeight: 800, color: '#1e3a8a' }}>{selectedItem.chauffeurRecuperationNom}</div>
                    </div>
                    <Badge variant="primary">{selectedItem.statut.replace(/_/g, ' ')}</Badge>
                 </div>
               )}

               <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '18px', marginBottom: '25px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Diagnostic / Motif</label>
                  <p style={{ margin: 0, color: '#1e293b', lineHeight: 1.5 }}>
                    <strong>{selectedItem.serviceType || 'Diagnostic SAV'}</strong><br/>
                    {selectedItem.diagnosticClient || selectedItem.detailsSpecifiques || 'Aucune description fournie.'}
                  </p>
               </div>

               {/* ── PHOTOS DE RÉCEPTION ── */}
               {(selectedItem.statut === 'VEHICULE_RECU' || selectedItem.statut === 'EN_RECEPTION' || selectedItem.statut === 'EN_ENREGISTREMENT') && (
                 <div style={{ background: '#fff5f5', padding: '20px', borderRadius: '18px', marginBottom: '25px', border: '1px solid #feb2b2' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#e53e3e', display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>🏁 État à l'arrivée (DIWA)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                       {[selectedItem.receptionPhotoAvant, selectedItem.receptionPhotoArriere, selectedItem.receptionPhotoGauche, selectedItem.receptionPhotoDroit].map((p, i) => (
                         p ? <img key={i} src={`http://localhost:8181${p}`} alt="reception" style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '8px' }} /> 
                           : <div key={i} style={{ width: '100%', height: '60px', background: '#fee2e2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#f87171' }}>N/A</div>
                       ))}
                    </div>
                    {selectedItem.receptionObservations && (
                      <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#c53030', fontStyle: 'italic' }}>Obs: {selectedItem.receptionObservations}</p>
                    )}
                 </div>
               )}

               <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Planification</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 700 }}>
                      <Calendar size={16} color="#3b82f6" /> {selectedItem.dateRecuperation ? new Date(selectedItem.dateRecuperation).toLocaleDateString() : 'Non définie'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{selectedItem.creneauLibelle || 'Créneau non spécifié'}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Lieu de récupération</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 700 }}>
                      <MapPin size={16} color="#ef4444" /> {selectedItem.adresseRecuperation || 'Garage DIWA'}
                    </div>
                  </div>
               </div>
            </div>

            <div style={{ padding: '25px 30px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
               <Button variant="outline" onClick={() => setSelectedItem(null)}>Fermer</Button>
               {selectedItem.statut === 'SOUMISE' && (
                 <Button variant="primary" onClick={() => { setSelectedItem(null); navigate('/admin/logistique'); }}>
                    Aller à l'assignation <ArrowRight size={16} />
                 </Button>
               )}
            </div>
          </div>
        </div>
    )}

      {showAssignModal && selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)' }}>
            <div style={{ background: 'white', width: '450px', borderRadius: '24px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem', fontWeight: 900 }}>Affecter un Technicien</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '25px' }}>
                    Choisir l'expert pour le diagnostic de : <br/>
                    <strong>{selectedItem.vehiculeMarque} {selectedItem.vehiculeModele} ({selectedItem.reference})</strong>
                </p>
                
                <div style={{ marginBottom: '25px' }}>
                    <label style={labelStyle}>Expert Technicien</label>
                    <select 
                        value={targetTechId} 
                        onChange={(e) => setTargetTechId(e.target.value)}
                        style={{ ...modalInput, padding: '12px', fontSize: '0.9rem' }}
                    >
                        <option value="">Sélectionner un technicien...</option>
                        {techniciens.map((t: any) => (
                            <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={() => setShowAssignModal(false)}
                        style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'none', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Annuler
                    </button>
                    <button 
                        disabled={!targetTechId || mutationAssign.isPending}
                        onClick={() => mutationAssign.mutate({ id: selectedItem.uuid || selectedItem.id, techId: targetTechId })}
                        style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: (!targetTechId || mutationAssign.isPending) ? 0.5 : 1 }}
                    >
                        {mutationAssign.isPending ? 'Affectation...' : 'Confirmer l\'Affectation'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL FRAIS LIVRAISON */}
      {showLivraisonModal && livraisonItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'white', width: '480px', borderRadius: '24px', padding: '35px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem', fontWeight: 900 }}>Frais de livraison</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '25px' }}>
              Dossier : <strong>{livraisonItem.reference}</strong> — {livraisonItem.vehiculeMarque} {livraisonItem.vehiculeModele}<br/>
              Adresse : <strong>{livraisonItem.adresseLivraison || 'Non précisée'}</strong>
            </p>
            <div style={{ marginBottom: '25px' }}>
              <label style={labelStyle}>Montant des frais de livraison (FCFA)</label>
              <input
                type="number"
                placeholder="Ex: 5000"
                value={fraisLivraisonInput}
                onChange={e => setFraisLivraisonInput(e.target.value)}
                style={{ ...modalInput, fontSize: '1.2rem', fontWeight: 800 }}
              />
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 8 }}>Ce montant sera ajouté au total du pro forma et envoyé au client pour confirmation finale.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setShowLivraisonModal(false); setLivraisonItem(null); setFraisLivraisonInput('') }}
                style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Annuler
              </button>
              <button
                disabled={!fraisLivraisonInput || Number(fraisLivraisonInput) <= 0 || mutationMettreAJourLivraison.isPending}
                onClick={() => mutationMettreAJourLivraison.mutate({ proFormaId: livraisonItem.proFormaId, frais: Number(fraisLivraisonInput) })}
                style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: 800, cursor: 'pointer',
                  opacity: (!fraisLivraisonInput || Number(fraisLivraisonInput) <= 0 || mutationMettreAJourLivraison.isPending) ? 0.5 : 1 }}
              >
                {mutationMettreAJourLivraison.isPending ? 'Enregistrement...' : 'Valider & Notifier Client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ASSIGNATION CHAUFFEUR LIVRAISON */}
      {showDeliveryAssignModal && deliveryItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'white', width: '480px', borderRadius: '24px', padding: '35px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem', fontWeight: 900 }}>Assigner chauffeur — Livraison</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px' }}>
              Véhicule : <strong>{deliveryItem.vehiculeMarque} {deliveryItem.vehiculeModele} ({deliveryItem.vehiculeImmatriculation})</strong>
            </p>
            <p style={{ color: '#6d28d9', fontSize: '0.9rem', fontWeight: 700, marginBottom: '25px' }}>
              Adresse de livraison : {deliveryItem.adresseLivraison || 'Non précisée'}
            </p>
            <div style={{ marginBottom: '25px' }}>
              <label style={labelStyle}>Chauffeur disponible</label>
              <select
                value={targetChauffeurId}
                onChange={e => setTargetChauffeurId(e.target.value)}
                style={{ ...modalInput, padding: '12px', fontSize: '0.9rem' }}
              >
                <option value="">Sélectionner un chauffeur...</option>
                {chauffeursDisponibles.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setShowDeliveryAssignModal(false); setDeliveryItem(null); setTargetChauffeurId('') }}
                style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Annuler
              </button>
              <button
                disabled={!targetChauffeurId || mutationAssignDelivery.isPending}
                onClick={() => mutationAssignDelivery.mutate({ demandeId: deliveryItem.id, chauffeurId: targetChauffeurId })}
                style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: '#8b5cf6', color: '#fff', fontWeight: 800, cursor: 'pointer',
                  opacity: (!targetChauffeurId || mutationAssignDelivery.isPending) ? 0.5 : 1 }}
              >
                {mutationAssignDelivery.isPending ? 'Assignation...' : 'Confirmer la mission livraison'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPOSANTS INTERNES DÉPLACÉS POUR LE SCOPE */}
      <style>{`
        .reception-content { animation: fadeIn 0.4s ease-out; }
        .reception-card { 
          background: #fff; border-radius: 24px; padding: 25px; 
          border: 1px solid #e2e8f0; margin-bottom: 20px;
          display: flex; justify-content: space-between; align-items: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .reception-card:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,0,0,0.05); border-color: #3b82f6; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}


const tabStyle = (active: boolean) => ({
  padding: '10px 25px',
  borderRadius: 10,
  border: 'none',
  background: active ? '#0f172a' : 'transparent',
  color: active ? '#fff' : '#64748b',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  transition: 'all 0.2s'
})
