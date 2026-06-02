import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import StatusPill from '../components/ui/StatusPill';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import {
  User as UserIcon, Calendar, MessageSquare, Car,
  ShoppingBag, Settings, LogOut, ChevronRight,
  Clock, CheckCircle, AlertCircle, FileText, Eye, Download
} from 'lucide-react';
import './MonEspacePage.css';

import { useNavigate } from 'react-router-dom';

const MonEspacePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  useEffect(() => {
    const roles = user?.roles || [];
    const isStaff = roles.some((role: string) => 
      ['ROLE_ADMIN', 'ADMIN', 'ROLE_RECEPTIONNISTE', 'ROLE_CHEF_TECHNICIEN', 'ROLE_TECHNICIEN'].includes(role)
    );
    if (isStaff) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const results = await Promise.allSettled([
          axiosInstance.get('/api/v1/rendezvous/mes-rdv'),
          axiosInstance.get(`/api/sav/tickets/mes?userId=${user?.id}`),
          axiosInstance.get('/api/v1/configuration/my-configs'),
          axiosInstance.get('/api/v1/demandes/mes')
        ]);
        
        const rdvRes = results[0];
        const tktRes = results[1];
        const cfgRes = results[2];
        const demRes = results[3];

        if (rdvRes.status === 'fulfilled' && rdvRes.value.data) {
          const data = rdvRes.value.data.data || rdvRes.value.data;
          setRdvs(Array.isArray(data) ? data : []);
        }
        
        if (tktRes.status === 'fulfilled' && tktRes.value.data) {
          setTickets(Array.isArray(tktRes.value.data) ? tktRes.value.data : []);
        }

        if (demRes.status === 'fulfilled' && demRes.value.data) {
          setDemandes(Array.isArray(demRes.value.data) ? demRes.value.data : []);
        }
        if (cfgRes.status === 'fulfilled' && cfgRes.value.data) {
          console.log('Configurations reçues:', cfgRes.value.data);
          // Gestion flexible du format de réponse (data.data ou data directement)
          const rawData = cfgRes.value.data;
          let configList = [];
          
          if (Array.isArray(rawData)) {
            configList = rawData;
          } else if (rawData.data && Array.isArray(rawData.data)) {
            configList = rawData.data;
          } else if (rawData.configurations && Array.isArray(rawData.configurations)) {
            configList = rawData.configurations;
          }
          
          // Déduplication côté client par précaution
          const uniqueConfigs = configList.reduce((acc: any[], current: any) => {
            const x = acc.find(item => 
              (item.nomConfig === current.nomConfig && item.vehicule?.id === current.vehicule?.id)
            );
            if (!x) return acc.concat([current]);
            else return acc;
          }, []);

          setConfigs(uniqueConfigs);
          
          if (configList.length === 0) {
            const localData = localStorage.getItem('diwa_local_configs');
            if (localData) setConfigs(JSON.parse(localData));
          }
        } else if (cfgRes.status === 'rejected') {
          console.warn('API Configurations en erreur, tentative via LocalStorage...');
          const localData = localStorage.getItem('diwa_local_configs');
          if (localData) setConfigs(JSON.parse(localData));
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchUserData();
  }, [user]);

  const telechargerFacture = async (demandeId: number, reference: string) => {
    try {
      const resp = await axiosInstance.get(`/api/v1/factures/${demandeId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Facture_DIWA_${reference}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Facture non disponible. Veuillez réessayer ultérieurement.');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
      <div className="loader-elite"></div>
    </div>
  );

  return (
    <div className="espace-page-wrapper" style={{ paddingTop: '100px', background: '#f8fafc', minHeight: '100vh' }}>
      <div className="espace-container">
        {/* TOP BANNER */}
        <div className="espace-banner">
          <div className="banner-content">
            <h1 className="serif">Espace Privilège</h1>
            <p>Bonjour, <strong>{user?.prenom}</strong>. Bienvenue dans votre univers DIWA Internationale.</p>
          </div>
          <div className="banner-badge">
             MEMBRE ELITE
          </div>
        </div>

        <div className="espace-grid">
          {/* MAIN CONTENT */}
          <div className="espace-main">
            
            {/* STATS ROW */}
            <div className="stats-row">
              <div className="stat-card">
                <Car size={24} color="#b71c1c" />
                <div>
                  <span className="stat-value">{rdvs.length}</span>
                  <span className="stat-label">Rendez-vous</span>
                </div>
              </div>
              <div className="stat-card">
                <MessageSquare size={24} color="#b71c1c" />
                <div>
                  <span className="stat-value">{demandes.length}</span>
                  <span className="stat-label">Dossiers SAV</span>
                </div>
              </div>
              <div className="stat-card" onClick={() => {
                const el = document.getElementById('configs-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }} style={{ cursor: 'pointer' }}>
                <Settings size={24} color="#b71c1c" />
                <div>
                  <span className="stat-value">{configs.length}</span>
                  <span className="stat-label">Configurations</span>
                </div>
              </div>
            </div>

            {/* DEMANDES INTERVENTION SECTION */}
            <Card padding="none" className="dashboard-card mb-8">
              <div className="card-header-elite">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div className="header-icon-box" style={{ background: '#fef2f2', color: '#b91c1c' }}><FileText size={20} /></div>
                  <h3 style={{ margin: 0 }}>Mes Dossiers d'Intervention</h3>
                </div>
                <button className="btn-view-all" onClick={() => navigate('/garage')}>Nouveau dossier <ChevronRight size={14} /></button>
              </div>
              
              <div className="espace-table-premium">
                <div className="table-row-premium header">
                  <span>RÉFÉRENCE</span>
                  <span>VÉHICULE</span>
                  <span>STATUT</span>
                  <span>ACTIONS</span>
                </div>
                {demandes.length === 0 ? (
                  <div className="empty-state">
                    <AlertCircle size={40} opacity={0.2} />
                    <p>Aucun dossier d'intervention actif.</p>
                  </div>
                ) : demandes.map(dem => (
                  <div key={dem.id} className="table-row-premium">
                    <span style={{ color: '#b71c1c', fontWeight: 700 }}>{dem.reference}</span>
                    <span style={{ fontWeight: 500 }}>{dem.vehiculeMarque} {dem.vehiculeModele}</span>
                    <StatusPill status={dem.statut} />
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        className="btn-view-mini"
                        onClick={() => navigate(`/mes-demandes/${dem.uuid}`)}
                        style={{
                          background: '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                        }}
                      >
                        <Eye size={14} /> Voir
                      </button>
                      {dem.statut === 'CLOTURE' && (
                        <button
                          onClick={() => telechargerFacture(dem.id, dem.reference)}
                          title="Télécharger la facture"
                          style={{
                            background: '#b71c1c',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(183, 28, 28, 0.2)'
                          }}
                        >
                          <Download size={14} /> Facture
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>


            {/* CONFIGURATIONS SECTION */}
            <div id="configs-section">
              <Card padding="none" className="dashboard-card mb-8">
                <div className="card-header-elite">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="header-icon-box" style={{ background: '#f0f9ff', color: '#0369a1' }}><Car size={20} /></div>
                    <h3 style={{ margin: 0 }}>Mes Configurations Sauvées</h3>
                  </div>
                  <button className="btn-view-all" onClick={() => navigate('/vehicules')}>Nouvelle config <ChevronRight size={14} /></button>
                </div>
                
                <div className="espace-table-premium">
                  <div className="table-row-premium header">
                    <span>NOM CONFIG</span>
                    <span>MODÈLE</span>
                    <span>DATE</span>
                    <span>ACTIONS</span>
                  </div>
                  {configs.length === 0 ? (
                    <div className="empty-state">
                      <Car size={40} opacity={0.2} />
                      <p>Vous n'avez pas encore de configuration sauvegardée.</p>
                      <button className="btn-action-outline" onClick={() => navigate('/vehicules')}>Découvrir la gamme</button>
                    </div>
                  ) : configs.map(cfg => (
                    <div key={cfg.id} className="table-row-premium">
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>{cfg.nomConfig}</span>
                      <span style={{ fontWeight: 500 }}>{cfg.vehicule?.marque} {cfg.vehicule?.modele}</span>
                      <span style={{ color: '#64748b' }}>
                        {(() => {
                          const d = cfg.createdAt || cfg.createDate || cfg.dateCreation;
                          if (!d) return 'Date inconnue';
                          const dateObj = new Date(d);
                          return isNaN(dateObj.getTime()) ? 'Date invalide' : dateObj.toLocaleDateString();
                        })()}
                      </span>
                      <button 
                        className="btn-view-mini"
                        onClick={() => navigate(`/vehicules/${cfg.vehicule?.uuid}/configuration`)}
                        style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Voir / Éditer
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
          
          <div className="espace-side-content">
            <Card padding="none" className="dashboard-card">
              <div className="card-header-elite">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div className="header-icon-box" style={{ background: '#fef2f2', color: '#b91c1c' }}><AlertCircle size={20} /></div>
                  <h3 style={{ margin: 0 }}>Support & SAV</h3>
                </div>
                <button className="btn-view-all" onClick={() => navigate('/garage')}>Nouveau ticket <ChevronRight size={14} /></button>
              </div>
              
              <div className="espace-table-premium">
                <div className="table-row-premium header">
                  <span>RÉFÉRENCE</span>
                  <span>OBJET</span>
                  <span>DERNIÈRE MAJ</span>
                  <span>STATUS</span>
                </div>
                {tickets.length === 0 ? (
                  <div className="empty-state">
                    <MessageSquare size={40} opacity={0.2} />
                    <p>Vous n'avez aucune demande d'assistance en cours.</p>
                  </div>
                ) : tickets.map(ticket => (
                  <div key={ticket.id} className="table-row-premium">
                    <span style={{ color: '#b71c1c', fontWeight: 700 }}>#ELT-{ticket.id}</span>
                    <span style={{ fontWeight: 500 }}>{ticket.description.substring(0, 40)}...</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      {(() => {
                        const d = ticket.dateDerniereMAJ || ticket.dateCreation || ticket.createdAt || ticket.createDate;
                        if (!d) return 'N/A';
                        const dateObj = new Date(d);
                        return isNaN(dateObj.getTime()) ? 'Date invalide' : dateObj.toLocaleDateString();
                      })()}
                    </span>
                    <StatusPill status={ticket.statut} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* SIDEBAR */}
          <aside className="espace-sidebar">
            <Card padding="none" className="profile-card-premium">
              <div className="profile-top-bg"></div>
              <div style={{ padding: '30px', position: 'relative', marginTop: '-50px', textAlign: 'center' }}>
                <div className="profile-avatar-elite">
                   {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                </div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '15px 0 5px' }}>{user?.prenom} {user?.nom}</h4>
                <p style={{ color: '#b71c1c', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>{user?.email}</p>
                
                <div className="profile-actions-list">
                  <button className="action-item active">
                    <UserIcon size={18} /> <span>Mon Profil</span>
                  </button>
                  <button className="action-item">
                    <Car size={18} /> <span>Mes Véhicules</span>
                  </button>
                  <button className="action-item">
                    <Settings size={18} /> <span>Paramètres</span>
                  </button>
                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '10px 0' }} />
                  <button className="action-item logout" onClick={logout}>
                    <LogOut size={18} /> <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            </Card>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default MonEspacePage;
