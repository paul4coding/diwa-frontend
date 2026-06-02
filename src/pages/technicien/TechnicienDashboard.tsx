import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { 
  ClipboardCheck, 
  Wrench, 
  Search, 
  Settings, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Car,
  Eye,
  User as UserIcon,
  MapPin,
  Calendar,
  Truck
} from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'

export default function TechnicienDashboard() {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('a-enregistrer')
  const [showAll, setShowAll] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [targetTechId, setTargetTechId] = useState('')

  const isChefTech = user?.roles?.includes('ROLE_CHEF_TECHNICIEN');
  const isTech = user?.roles?.includes('ROLE_TECHNICIEN');

  // Fetch all demands for the workshop
  const { data: demandes = [], isLoading } = useQuery({
    queryKey: ['demandes-atelier'],
    queryFn: () => axiosInstance.get('/api/v1/demandes').then(res => res.data)
  })

  // 1. À ENREGISTRER (Arrivés mais pas encore enregistrés techniquement)
  const aEnregistrer = Array.isArray(demandes) ? demandes.filter((d: any) => 
    d.statut === 'VEHICULE_RECU' || 
    d.statut === 'EN_ENREGISTREMENT' ||
    d.statut === 'SOUMISE'
  ) : []
  
  // 2. À AFFECTER (Enregistrés et validés par la réception, attendent l'affectation d'un technicien pour diagnostic)
  const aAffecter = Array.isArray(demandes) ? demandes.filter((d: any) => d.statut === 'EN_RECEPTION') : []

  // 3. À DIAGNOSTIQUER (Affectés, en cours de diagnostic/V1)
  const aDiagnostiquer = Array.isArray(demandes) ? demandes.filter((d: any) => d.statut === 'EN_DIAGNOSTIC') : []
  
  // 4. EN RÉPARATION (Confirmés par client, en cours de travaux)
  const enReparation = Array.isArray(demandes) ? demandes.filter((d: any) => d.statut === 'EN_COURS_REPARATION') : []

  const { data: techniciens = [] } = useQuery({
    queryKey: ['techniciens-users'],
    queryFn: () => axiosInstance.get('/api/v1/users/role/ROLE_TECHNICIEN').then(res => res.data)
  })

  const mutationAssign = useMutation({
    mutationFn: ({ demandeId, techId }: any) => axiosInstance.put(`/api/v1/demandes/${demandeId}/assigner?technicienId=${techId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandes-atelier'] })
      setShowAssignModal(false)
      setSelectedItem(null)
      setTargetTechId('')
      alert("Technicien affecté au diagnostic !")
    }
  })

  if (isLoading) return <div className="p-10 text-center">Chargement de l'atelier...</div>

  return (
    <div className="technicien-dashboard" style={{ padding: '80px 40px 40px', background: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
            <h1 style={{ margin: 0, color: '#0f172a', fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
              🏭 Module Atelier
            </h1>
            <p style={{ color: '#64748b', margin: '8px 0 0', fontSize: '1.1rem' }}>
              Gestion technique et suivi des interventions — <strong>{user?.prenom} {user?.nom}</strong>
            </p>
        </div>
        <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
            {isChefTech && (
                <Link 
                    to="/admin/atelier/affectation" 
                    className="premium-planning-btn"
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: 10, padding: '15px 30px', 
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                        color: '#fff', borderRadius: '18px', textDecoration: 'none', 
                        fontWeight: 800, fontSize: '0.95rem', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.2)',
                        border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s ease'
                    }}
                >
                    <Calendar size={20} /> CALENDRIER D'AFFECTATION
                </Link>
            )}
            <div style={{ display: 'flex', gap: 10, background: '#fff', padding: 5, borderRadius: 14, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <button onClick={() => setActiveTab('a-enregistrer')} style={tabStyle(activeTab === 'a-enregistrer')}>À Enregistrer</button>
                <button onClick={() => setActiveTab('a-affecter')} style={tabStyle(activeTab === 'a-affecter')}>À Affecter (Diag)</button>
                <button onClick={() => setActiveTab('a-diagnostiquer')} style={tabStyle(activeTab === 'a-diagnostiquer')}>Diagnostics</button>
                <button onClick={() => setActiveTab('en-reparation')} style={tabStyle(activeTab === 'en-reparation')}>Réparations</button>
                <button onClick={() => setActiveTab('tous')} style={tabStyle(activeTab === 'tous')}>Tous les Dossiers</button>
            </div>
        </div>
      </header>

      <div className="atelier-grid">
        {activeTab === 'a-enregistrer' && (
          <SectionAtelier 
            title="Arrivées Récentes" 
            icon={<Car size={22} />} 
            count={aEnregistrer.length}
            color="#3b82f6"
            items={aEnregistrer}
            renderItem={(d: any) => (
              <AtelierCard key={d.id} item={d} onSelect={setSelectedItem}>
                <Link to={`/admin/atelier/enregistrement/${d.uuid || d.id}`} className="atelier-btn btn-primary">
                  <ClipboardCheck size={16} /> 📝 ÉDITER / ENREGISTRER
                </Link>
              </AtelierCard>
            )}
          />
        )}
        {activeTab === 'a-affecter' && (
          <SectionAtelier 
            title="Affectation Diagnostic" 
            icon={<UserIcon size={22} />} 
            count={aAffecter.length}
            color="#a855f7"
            items={aAffecter}
            renderItem={(d: any) => (
              <AtelierCard key={d.id} item={d} onSelect={setSelectedItem}>
                <button 
                  onClick={() => { setSelectedItem(d); setShowAssignModal(true); }} 
                  className="atelier-btn" 
                  style={{ background: '#a855f7', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  <UserIcon size={16} /> Affecter Technicien
                </button>
              </AtelierCard>
            )}
          />
        )}

        {activeTab === 'a-diagnostiquer' && (
          <SectionAtelier 
            title="Diagnostics & V1" 
            icon={<Search size={22} />} 
            count={aDiagnostiquer.length}
            color="#f59e0b"
            items={aDiagnostiquer}
            renderItem={(d: any) => (
              <AtelierCard key={d.id} item={d} onSelect={setSelectedItem}>
                <Link to={`/admin/atelier/proforma/nouvelle/${d.uuid || d.id}`} className="atelier-btn btn-warning">
                  <Wrench size={16} /> Créer Pro-Forma V1
                </Link>
              </AtelierCard>
            )}
          />
        )}

        {activeTab === 'en-reparation' && (
          <SectionAtelier 
            title="Travaux en Cours" 
            icon={<Settings size={22} />} 
            count={enReparation.length}
            color="#10b981"
            items={enReparation}
            renderItem={(d: any) => (
              <AtelierCard key={d.id} item={d} onSelect={setSelectedItem}>
                <Link to="/admin/atelier/affectation" className="atelier-btn btn-success">
                  <CheckCircle2 size={16} /> Suivi Avancement
                </Link>
              </AtelierCard>
            )}
          />
        )}
        {activeTab === 'tous' && (
          <SectionAtelier 
            title="Historique & Tous les Dossiers" 
            icon={<ClipboardCheck size={22} />} 
            count={demandes.length}
            color="#64748b"
            items={demandes}
            renderItem={(d: any) => (
              <AtelierCard key={d.id} item={d} onSelect={setSelectedItem}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>{d.statut}</span>
                  {(d.statut === 'VEHICULE_RECU' || d.statut === 'SOUMISE' || d.statut === 'EN_ENREGISTREMENT') && (
                    <Link to={`/admin/atelier/enregistrement/${d.uuid || d.id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 700, fontSize: '0.8rem' }}>
                      Éditer
                    </Link>
                  )}
                </div>
              </AtelierCard>
            )}
          />
        )}
      </div>

      {showAssignModal && selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
            <div style={{ background: 'white', width: '450px', borderRadius: '24px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem', fontWeight: 900 }}>Affecter un Technicien</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '25px' }}>
                    Choisir l'expert pour le diagnostic de : <br/>
                    <strong>{selectedItem.vehiculeMarque} {selectedItem.vehiculeModele} ({selectedItem.reference})</strong>
                </p>
                
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>Expert Technicien</label>
                    <select 
                        value={targetTechId} 
                        onChange={(e) => setTargetTechId(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 700 }}
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
                        onClick={() => mutationAssign.mutate({ demandeId: selectedItem.id, techId: targetTechId })}
                        style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: (!targetTechId || mutationAssign.isPending) ? 0.5 : 1 }}
                    >
                        {mutationAssign.isPending ? 'Affectation...' : 'Confirmer l\'Affectation'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {selectedItem && !showAssignModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'white', width: '600px', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
               <div style={{ padding: '25px 30px', background: '#0f172a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Détails Dossier #{selectedItem.reference}</h3>
                    <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>&times;</button>
               </div>
            
            <div style={{ padding: '30px', maxHeight: '70vh', overflowY: 'auto' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Véhicule</label>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedItem.vehiculeMarque} {selectedItem.vehiculeModele}</div>
                    <div style={{ color: '#64748b' }}>Immat: {selectedItem.vehiculeImmatriculation || selectedItem.vehiculeImmat}</div>
                    <div style={{ color: '#64748b' }}>VIN: {selectedItem.vehiculeNumeroChassis || selectedItem.vehiculeVin || 'N/A'}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Client</label>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedItem.clientNom}</div>
                    <div style={{ color: '#64748b' }}>Tél: {selectedItem.clientTel || 'N/A'}</div>
                  </div>
               </div>

               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
                  <Link 
                    to={`/admin/atelier/enregistrement/${selectedItem.uuid || selectedItem.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 25px', background: '#3b82f6', color: '#fff', borderRadius: '15px', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)' }}
                  >
                    <ClipboardCheck size={18} /> ÉDITER LES INFOS VÉHICULE (Immat, VIN, ...)
                  </Link>
               </div>

               <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '18px', marginBottom: '25px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Motif Diagnostic</label>
                  <p style={{ margin: 0, color: '#1e293b', lineHeight: 1.5, fontWeight: 600 }}>
                    {selectedItem.diagnosticClient || selectedItem.descriptionProbleme || 'Aucune description.'}
                  </p>
               </div>


            </div>

            <div style={{ padding: '25px 30px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
               <button onClick={() => setSelectedItem(null)} style={{ padding: '12px 25px', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer' }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .premium-planning-btn:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 15px 40px rgba(15, 23, 42, 0.3);
          filter: brightness(1.2);
        }
        .atelier-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
          gap: 20px;
          animation: fadeIn 0.5s ease-out; 
        }
        .atelier-card { 
          background: #fff; 
          border-radius: 24px; 
          padding: 28px; 
          border: 1px solid #e2e8f0; 
          margin-bottom: 5px;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .atelier-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; width: 4px; height: 100%;
          background: transparent;
          transition: background 0.3s ease;
        }
        .atelier-card:hover { 
          transform: translateX(8px) scale(1.01); 
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08); 
          border-color: #3b82f6; 
          background: #fcfdfe;
        }
        .atelier-card:hover::before {
          background: #3b82f6;
        }
        .atelier-card:hover .details-reveal {
          opacity: 1;
          transform: translateY(0);
        }
        .atelier-btn { 
          padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px;
          text-decoration: none; display: flex; align-items: center; gap: 8px;
          transition: transform 0.2s ease;
        }
        .atelier-btn:hover { transform: scale(1.05); }
        .btn-primary { background: #3b82f6; color: #fff; }
        .btn-warning { background: #f59e0b; color: #fff; }
        .btn-success { background: #10b981; color: #fff; }
        .badge { padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

function SectionAtelier({ title, icon, count, color, items, renderItem }: any) {
    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 30 }}>
                <div style={{ background: color + '15', color: color, padding: 12, borderRadius: 16 }}>{icon}</div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>
                    {title} <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 10 }}>({count})</span>
                </h2>
            </div>
            {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', background: '#fff', borderRadius: 24, border: '2px dashed #e2e8f0' }}>
                    <AlertCircle size={40} style={{ marginBottom: 15, opacity: 0.5 }} />
                    <p>Aucun dossier dans cette catégorie</p>
                </div>
            ) : (
                items.map(renderItem)
            )}
        </div>
    )
}

function AtelierCard({ item, children, onSelect }: any) {
    return (
        <div className="atelier-card">
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a' }}>{item.reference}</span>
                    {item.urgence === 'URGENTE' && <span className="badge" style={{ background: '#fef2f2', color: '#ef4444' }}>Urgent</span>}
                    {item.urgence === 'TRES_URGENTE' && <span className="badge" style={{ background: '#ef4444', color: '#fff' }}>Prioritaire</span>}
                </div>
                <div style={{ display: 'flex', gap: 20, color: '#64748b', fontSize: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Car size={14} /> 
                        {item.vehiculeMarque} {item.vehiculeModele} 
                        <span style={{ color: (item.vehiculeImmatriculation || item.vehiculeImmat) ? '#0f172a' : '#ef4444', fontWeight: 800 }}>
                            ({item.vehiculeImmatriculation || item.vehiculeImmat || 'IMMAT INCONNUE'})
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> {new Date(item.createDate).toLocaleDateString()}</div>
                    {item.vehiculeNumeroChassis && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0369a1' }}>
                            <Settings size={14} /> VIN: {item.vehiculeNumeroChassis}
                        </div>
                    )}
                </div>
                <div style={{ marginTop: 12, padding: '12px 15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>Motif / Diagnostic :</div>
                    <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>{item.diagnosticClient || item.descriptionProbleme || 'Non spécifié'}</div>
                </div>
                <div style={{ marginTop: 10, fontSize: 13, color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>Client: <strong style={{ color: '#0f172a' }}>{item.clientNom}</strong></div>
                    <Link to={`/admin/atelier/enregistrement/${item.uuid || item.id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ClipboardCheck size={14} /> Rectifier Infos
                    </Link>
                </div>
            </div>
            <div>
                <button 
                    onClick={() => onSelect && onSelect(item)}
                    style={{ background: '#f1f5f9', border: 'none', padding: '10px 15px', borderRadius: '12px', color: '#64748b', cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700 }}
                >
                    <Eye size={16} /> Voir Détails
                </button>
                <div>{children}</div>
            </div>
        </div>
    )
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
