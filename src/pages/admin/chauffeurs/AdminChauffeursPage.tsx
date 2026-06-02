import React, { useEffect, useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Star, 
  TrendingUp, 
  Phone, 
  Mail,
  ShieldCheck,
  Award
} from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';

const AdminChauffeursPage = () => {
  const [chauffeurs, setChauffeurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChauffeur, setSelectedChauffeur] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChauffeur, setNewChauffeur] = useState({ prenom: '', nom: '', email: '', telephone: '', password: 'password123' });

  const fetchChauffeurs = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/v1/logistique/chauffeurs/status');
      setChauffeurs(res.data || []);
    } catch (err) {
      console.error("Erreur chargement chauffeurs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChauffeurs();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-page">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ color: 'var(--admin-text-main)', marginBottom: '8px' }}>Gestion de l'Équipe Chauffeurs</h1>
          <p style={{ color: 'var(--admin-text-muted)' }}>Consultez les performances et gérez les profils de vos chauffeurs Elite.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>+ Ajouter un chauffeur</Button>
      </header>

      {/* Résumé des stats chauffeurs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <Card shadow="sm">
          <div style={{ padding: '20px' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>TOTAL CHAUFFEURS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{chauffeurs.length}</div>
          </div>
        </Card>
        <Card shadow="sm">
          <div style={{ padding: '20px' }}>
            <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>DISPONIBLES</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{chauffeurs.filter(c => c.statut === 'LIBRE').length}</div>
          </div>
        </Card>
        <Card shadow="sm">
          <div style={{ padding: '20px' }}>
            <div style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>EN MISSION</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{chauffeurs.filter(c => c.statut === 'EN_MISSION').length}</div>
          </div>
        </Card>
        <Card shadow="sm">
          <div style={{ padding: '20px' }}>
            <div style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>SCORE MOYEN</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>4.8/5</div>
          </div>
        </Card>
      </div>

      {/* Barre de recherche et filtres */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Rechercher un chauffeur par nom ou matricule..." 
            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
          />
        </div>
        <Button variant="outline"><Filter size={18} /> Filtrer</Button>
      </div>

      {/* Liste détaillée */}
      <Card shadow="sm">
        <div style={{ padding: '0px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>CHAUFFEUR</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>STATUT</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>PERFORMANCE</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>CONTACT</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center' }}>Chargement...</td></tr>
              ) : chauffeurs.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="table-row-hover">
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#1A5276', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {c.nomComplet?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{c.nomComplet}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: #CH-{c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Badge variant={c.statut === 'LIBRE' ? 'success' : c.statut === 'EN_MISSION' ? 'primary' : 'warning'}>
                      {c.statut === 'LIBRE' ? 'Disponible' : c.statut === 'EN_MISSION' ? 'En mission' : 'Assigné'}
                    </Badge>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                      <Star size={14} fill="#f59e0b" />
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{c.score}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({c.totalMissions} missions)</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}><Phone size={14} color="#64748b" /> {c.telephone || 'Non renseigné'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}><Mail size={14} color="#64748b" /> {c.email || 'chauffeur@diwa.tg'}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button size="sm" variant="outline" onClick={() => setSelectedChauffeur(c)}>Détails</Button>
                      <Button size="sm" variant="outline"><MoreVertical size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Détails */}
      {selectedChauffeur && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', width: '500px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ background: '#1A5276', padding: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Détails Chauffeur</h2>
              <button onClick={() => setSelectedChauffeur(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: '#1A5276' }}>
                  {selectedChauffeur.nomComplet?.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0' }}>{selectedChauffeur.nomComplet}</h3>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px' }}>Chauffeur Expert DIWA</div>
                  <Badge variant={selectedChauffeur.statut === 'LIBRE' ? 'success' : 'warning'}>{selectedChauffeur.statut}</Badge>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>TÉLÉPHONE</label>
                  <div style={{ fontWeight: 600 }}>{selectedChauffeur.telephone || 'Non renseigné'}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>EMAIL</label>
                  <div style={{ fontWeight: 600 }}>{selectedChauffeur.email || 'N/A'}</div>
                </div>
              </div>

              {selectedChauffeur.statut !== 'LIBRE' && (
                <div style={{ marginBottom: '24px' }}>
                   <Button 
                    variant="outline" 
                    fullWidth 
                    style={{ color: '#ef4444', borderColor: '#ef4444', background: '#fef2f2' }}
                    onClick={async () => {
                      if (window.confirm("Voulez-vous vraiment libérer ce chauffeur ? Cela annulera son assignation actuelle.")) {
                        try {
                          await axiosInstance.put(`/api/v1/demandes/${selectedChauffeur.missionId}/annuler-mission`);
                          setSelectedChauffeur(null);
                          fetchChauffeurs();
                        } catch (e) {
                          alert("Erreur lors de la libération du chauffeur");
                        }
                      }
                    }}
                   >
                     Libérer le chauffeur (Annuler mission)
                   </Button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>DÉBUT SERVICE</label>
                  <div style={{ fontWeight: 600 }}>{selectedChauffeur.heureDebutTravail || '07:00'}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>FIN SERVICE</label>
                  <div style={{ fontWeight: 600 }}>{selectedChauffeur.heureFinTravail || '18:00'}</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#1A5276', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} /> Mission Actuelle
                </h4>
                {selectedChauffeur.missionActuelle ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Référence:</span>
                      <span style={{ fontWeight: 700 }}>{selectedChauffeur.missionActuelle}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Destination:</span>
                      <span style={{ fontWeight: 600 }}>{selectedChauffeur.destination}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '4px', borderTop: '1px dotted #e2e8f0' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Assigné le:</span>
                      <Badge variant="primary" size="sm">{formatDate(selectedChauffeur.dateAssignation) || 'Aujourd\'hui'}</Badge>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>Aucune mission active</div>
                )}
              </div>

              <Button fullWidth onClick={() => setSelectedChauffeur(null)}>Fermer</Button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Ajouter Chauffeur */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', width: '450px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
             <div style={{ padding: '24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontWeight: 800 }}>Nouveau Chauffeur Elite</h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
             </div>
             <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input placeholder="Prénom" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }} onChange={e => setNewChauffeur({...newChauffeur, prenom: e.target.value})} />
                  <input placeholder="Nom" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }} onChange={e => setNewChauffeur({...newChauffeur, nom: e.target.value})} />
                </div>
                <input placeholder="Email" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }} onChange={e => setNewChauffeur({...newChauffeur, email: e.target.value})} />
                <input placeholder="Téléphone" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }} onChange={e => setNewChauffeur({...newChauffeur, telephone: e.target.value})} />
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>Le mot de passe par défaut sera 'password123'</div>
             </div>
             <div style={{ padding: '24px', background: '#f8fafc', display: 'flex', gap: '10px' }}>
                <Button fullWidth variant="outline" onClick={() => setShowAddModal(false)}>Annuler</Button>
                <Button fullWidth variant="primary" onClick={async () => {
                    try {
                    await axiosInstance.post('/api/v1/admin/users/create-chauffeur', newChauffeur);
                    setShowAddModal(false);
                    fetchChauffeurs();
                  } catch (e: any) {
                    const errorMsg = e.response?.data?.message || "Erreur lors de la création du chauffeur";
                    alert(errorMsg);
                  }
                }}>Enregistrer</Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChauffeursPage;
