import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { 
  Truck, 
  User, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Navigation,
  Phone,
  Car
} from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const AdminLogistiquePage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as 'missions' | 'plages' | 'exceptions' || 'missions';
  const [activeTab, setActiveTab] = useState<'missions' | 'plages' | 'exceptions'>(initialTab);
  const [missions, setMissions] = useState<any[]>([]);
  const [chauffeurs, setChauffeurs] = useState<any[]>([]);
  const [plages, setPlages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlage, setEditingPlage] = useState<any>(null);
  const [selectedChauffeurs, setSelectedChauffeurs] = useState<{[key: number]: number}>({});
  const [editingMissions, setEditingMissions] = useState<{[key: number]: { date: string, creneauId: number | '' }}>({});
  const [selectedChauffeurDetails, setSelectedChauffeurDetails] = useState<any>(null);
  const [selectedMissionDetails, setSelectedMissionDetails] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        missionsSoumises, 
        missionsAssignees, 
        missionsEnRoute, 
        missionsArrivee, 
        missionsEnTransit, 
        missionsPretes,
        missionsEnLivraison,
        chauffeursRes, 
        plagesRes
      ] = await Promise.all([
        axiosInstance.get('/api/v1/demandes?statut=SOUMISE'),
        axiosInstance.get('/api/v1/demandes?statut=CHAUFFEUR_ASSIGNE'),
        axiosInstance.get('/api/v1/demandes?statut=CHAUFFEUR_EN_ROUTE'),
        axiosInstance.get('/api/v1/demandes?statut=CHAUFFEUR_ARRIVE_CHEZ_CLIENT'),
        axiosInstance.get('/api/v1/demandes?statut=VEHICULE_EN_TRANSIT'),
        axiosInstance.get('/api/v1/demandes?statut=PRET'),
        axiosInstance.get('/api/v1/demandes?statut=EN_LIVRAISON'),
        axiosInstance.get('/api/v1/logistique/chauffeurs/status'),
        axiosInstance.get('/api/v1/creneaux/plages')
      ]);
      
      const allMissions = [
        ...missionsSoumises.data, 
        ...missionsAssignees.data,
        ...missionsEnRoute.data,
        ...missionsArrivee.data,
        ...missionsEnTransit.data,
        ...missionsPretes.data,
        ...missionsEnLivraison.data
      ];
      setMissions(allMissions || []);
      setChauffeurs(chauffeursRes.data || []);
      setPlages(plagesRes.data || []);
    } catch (err) {
      console.error("Erreur logistique:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'missions' || tab === 'plages' || tab === 'exceptions')) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const handleAssign = async (missionId: number, isLivraison: boolean = false) => {
    const editData = editingMissions[missionId];
    const chauffeurId = selectedChauffeurs[missionId];

    if (!chauffeurId) {
      alert("Veuillez choisir un chauffeur");
      return;
    }

    try {
      // Si la réceptionniste a modifié la date ou le créneau (uniquement pour récupération pour l'instant)
      if (!isLivraison && editData && (editData.date || editData.creneauId)) {
        await axiosInstance.put(`/api/v1/demandes/${missionId}/planification`, {
          dateRecuperation: editData.date,
          creneauId: editData.creneauId
        });
      }

      const endpoint = isLivraison 
        ? `/api/v1/demandes/${missionId}/assigner-chauffeur-livraison?chauffeurId=${chauffeurId}`
        : `/api/v1/demandes/${missionId}/assigner-chauffeur?chauffeurId=${chauffeurId}`;

      await axiosInstance.put(endpoint);
      fetchData();
      alert(isLivraison ? "Livreur assigné !" : "Chauffeur et planification validés !");
    } catch (err) {
      console.error("Erreur assignation:", err);
      alert("Erreur lors de l'assignation");
    }
  };

  const handleChauffeurChange = (missionId: number, chauffeurId: string) => {
    setSelectedChauffeurs(prev => ({ ...prev, [missionId]: parseInt(chauffeurId) }));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Non définie';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const missionsRecup = missions.filter(m => ['SOUMISE', 'CHAUFFEUR_ASSIGNE', 'CHAUFFEUR_EN_ROUTE', 'CHAUFFEUR_ARRIVE_CHEZ_CLIENT', 'VEHICULE_EN_TRANSIT'].includes(m.statut));
  const missionsLivraison = missions.filter(m => m.demandeLivraison && ['PRET', 'EN_LIVRAISON'].includes(m.statut));

  const renderMissionCard = (mission: any, type: 'recup' | 'livraison') => {
    const isLivraison = type === 'livraison';
    
    const getBadgeProps = (statut: string) => {
      switch(statut) {
        case 'CHAUFFEUR_ASSIGNE': return { variant: 'primary' as const, label: 'CHAUFFEUR ASSIGNÉ' };
        case 'CHAUFFEUR_EN_ROUTE': return { variant: 'info' as const, label: 'EN ROUTE' };
        case 'CHAUFFEUR_ARRIVE_CHEZ_CLIENT': return { variant: 'success' as const, label: 'ARRIVÉ CLIENT' };
        case 'VEHICULE_EN_TRANSIT': return { variant: 'success' as const, label: 'EN TRANSIT' };
        case 'PRET': return { variant: 'warning' as const, label: 'PRÊT À LIVRER' };
        case 'EN_LIVRAISON': return { variant: 'info' as const, label: 'LIVRAISON EN COURS' };
        default: return { variant: 'warning' as const, label: 'À ASSIGNER' };
      }
    };

    const badge = getBadgeProps(mission.statut);
    const estEnCours = ['CHAUFFEUR_ASSIGNE', 'CHAUFFEUR_EN_ROUTE', 'CHAUFFEUR_ARRIVE_CHEZ_CLIENT', 'VEHICULE_EN_TRANSIT', 'EN_LIVRAISON'].includes(mission.statut);

    return (
      <div key={mission.id} className="logistique-card" id={`mission-${mission.id}`}>
        <Card shadow="sm">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Badge variant={badge.variant}>
                  {badge.label}
                </Badge>
                {mission.urgence === 'URGENTE' && <Badge variant="danger">URGENT</Badge>}
                <Badge variant="outline" style={{ borderColor: isLivraison ? '#C0392B' : '#1A5276', color: isLivraison ? '#C0392B' : '#1A5276' }}>
                   {isLivraison ? 'RETOUR / LIVRAISON' : 'ARRIVÉE / RÉCUPÉRATION'}
                </Badge>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Réf: {mission.reference}</span>
                <button 
                  onClick={() => setSelectedMissionDetails(mission)}
                  style={{ background: '#f1f5f9', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, color: '#1A5276', cursor: 'pointer' }}
                >
                  Détails
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Car size={20} color="#1A5276" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{mission.vehiculeMarque} {mission.vehiculeModele}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{mission.vehiculeImmatriculation}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="#64748b" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{mission.clientNom}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{mission.clientTel || 'Client DIWA'}</div>
                  </div>
                </div>
                
                {estEnCours && (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#e0f2fe', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369a1', marginBottom: '4px' }}>CHAUFFEUR ASSIGNÉ</div>
                    <div style={{ fontWeight: 700, color: '#075985' }}>
                       {isLivraison ? mission.chauffeurLivraisonNom : mission.chauffeurRecuperationNom}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '24px' }}>
                {!isLivraison && (
                  <div style={{ marginBottom: '15px', background: '#fffbeb', padding: '12px', borderRadius: '12px', border: '1px solid #fef3c7' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 800, color: '#b45309', marginBottom: '4px' }}>
                      <Clock size={12} /> CRÉNEAU SOUHAITÉ
                    </label>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#92400e' }}>
                      {formatDate(mission.dateRecuperation)}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1A5276', marginTop: '4px' }}>
                      {mission.creneauLibelle || 'Non spécifié'}
                    </div>
                  </div>
                )}

                {!isLivraison && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                      <Clock size={12} /> MODIFIER PLANIFICATION
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input 
                        type="date" 
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}
                        defaultValue={mission.dateRecuperation || ''}
                        onChange={(e) => setEditingMissions(prev => ({ 
                          ...prev, 
                          [mission.id]: { ...(prev[mission.id] || { creneauId: mission.creneauSouhaiteId || '' }), date: e.target.value } 
                        }))}
                      />
                      <select 
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}
                        defaultValue={mission.creneauSouhaiteId || ''}
                        onChange={(e) => setEditingMissions(prev => ({ 
                          ...prev, 
                          [mission.id]: { ...(prev[mission.id] || { date: mission.dateRecuperation || '' }), creneauId: parseInt(e.target.value) } 
                        }))}
                      >
                        <option value="">Choisir un créneau...</option>
                        {plages.map(p => <option key={p.id} value={p.id}>{p.heureDebut} - {p.heureFin}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                    <MapPin size={12} /> ADRESSE DE {isLivraison ? 'LIVRAISON' : 'RÉCUPÉRATION'}
                  </label>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isLivraison ? '#C0392B' : 'inherit' }}>
                    {isLivraison ? (mission.adresseLivraison || 'À confirmer avec le client') : (mission.adresseRecuperation || 'Non spécifiée')}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px' }}>
              <select 
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
                onChange={(e) => handleChauffeurChange(mission.id, e.target.value)}
                value={selectedChauffeurs[mission.id] || ''}
              >
                <option value="">{estEnCours ? 'Changer de chauffeur...' : 'Choisir un chauffeur...'}</option>
                {chauffeurs.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nomComplet} {c.statut !== 'LIBRE' ? ' (En mission)' : ' (Disponible)'}
                  </option>
                ))}
              </select>
              <Button variant={estEnCours ? 'warning' : 'primary'} onClick={() => handleAssign(mission.id, isLivraison)}>
                {estEnCours ? 'Mettre à jour' : isLivraison ? 'Confirmer la Livraison' : 'Confirmer l\'assignation'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="admin-page">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'var(--admin-text-main)', marginBottom: '8px' }}>Logistique & Missions</h1>
          <p style={{ color: 'var(--admin-text-muted)' }}>Assignation des chauffeurs et gestion des créneaux horaires.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
          <button 
            onClick={() => setActiveTab('missions')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'missions' ? 'white' : 'transparent', fontWeight: 700, cursor: 'pointer', boxShadow: activeTab === 'missions' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
            Missions
          </button>
          <button 
            onClick={() => setActiveTab('plages')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'plages' ? 'white' : 'transparent', fontWeight: 700, cursor: 'pointer', boxShadow: activeTab === 'plages' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
            Plages DIWA
          </button>
          <button 
            onClick={() => setActiveTab('exceptions')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'exceptions' ? 'white' : 'transparent', fontWeight: 700, cursor: 'pointer', boxShadow: activeTab === 'exceptions' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
            Exceptions
          </button>
        </div>
      </header>


      {activeTab === 'missions' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
          {/* Liste des Missions */}
          <div>
            {loading ? <p>Chargement...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                {/* Section RÉCUPÉRATION */}
                <div>
                  <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '24px', background: '#1A5276', borderRadius: '4px' }}></div>
                    Missions de Récupération (Arrivée)
                  </h2>
                  {missionsRecup.length === 0 ? <p style={{ color: '#64748b', fontStyle: 'italic' }}>Aucune mission de récupération en attente.</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {missionsRecup.map(m => renderMissionCard(m, 'recup'))}
                    </div>
                  )}
                </div>

                {/* Section LIVRAISON */}
                <div>
                  <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '24px', background: '#C0392B', borderRadius: '4px' }}></div>
                    Missions de Livraison (Retour à domicile)
                  </h2>
                  {missionsLivraison.length === 0 ? <p style={{ color: '#64748b', fontStyle: 'italic' }}>Aucun véhicule prêt pour livraison à domicile.</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {missionsLivraison.map(m => renderMissionCard(m, 'livraison'))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Chauffeurs */}
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 700 }}>Équipe Chauffeurs</h2>
            <Card shadow="sm">
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {chauffeurs.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: '#f8fafc', borderLeft: `4px solid ${c.statut === 'LIBRE' ? '#10b981' : '#f59e0b'}` }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1A5276', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                        {c.nomComplet?.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.nomComplet}</div>
                        <div style={{ fontSize: '0.7rem', color: c.statut === 'LIBRE' ? '#10b981' : '#64748b' }}>
                          {c.statut === 'LIBRE' ? 'Disponible' : 'En mission'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                        <Badge variant={c.statut === 'LIBRE' ? 'success' : 'warning'} size="sm">●</Badge>
                        <button 
                          onClick={() => setSelectedChauffeurDetails(c)}
                          style={{ background: 'none', border: 'none', color: '#1A5276', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                        >
                          Missions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button fullWidth variant="outline" style={{ marginTop: '20px' }} onClick={() => window.location.href='/admin/chauffeurs'}>Gérer l'équipe</Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Modal Détails Mission */}
      {selectedMissionDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', width: '600px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Détails de la demande #{selectedMissionDetails.reference}</h3>
              <button onClick={() => setSelectedMissionDetails(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>VÉHICULE</label>
                <div style={{ fontWeight: 700 }}>{selectedMissionDetails.vehiculeMarque} {selectedMissionDetails.vehiculeModele}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Immat: {selectedMissionDetails.vehiculeImmatriculation}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>VIN: {selectedMissionDetails.vehiculeVin || 'N/A'}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Kilométrage: {selectedMissionDetails.vehiculeKilometrage || 'N/A'} km</div>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>CLIENT</label>
                <div style={{ fontWeight: 700 }}>{selectedMissionDetails.clientNom}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Tél: {selectedMissionDetails.clientTel}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Email: {selectedMissionDetails.clientEmail || 'N/A'}</div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>DIAGNOSTIC / MOTIF</label>
                <div style={{ background: '#fffbeb', padding: '15px', borderRadius: '12px', border: '1px solid #fef3c7', fontSize: '0.9rem', color: '#92400e', lineHeight: 1.5 }}>
                  <strong>{selectedMissionDetails.serviceType || 'SAV GÉNÉRAL'}</strong><br/>
                  {selectedMissionDetails.diagnosticClient || 'Aucune description fournie.'}
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>ADRESSE DE RÉCUPÉRATION</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                  <MapPin size={18} color="#ef4444" />
                  {selectedMissionDetails.adresseRecuperation}
                </div>
              </div>
            </div>

            <div style={{ padding: '24px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={() => setSelectedMissionDetails(null)}>Fermer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Chauffeur */}
      {selectedChauffeurDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', width: '500px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '30px', background: 'linear-gradient(135deg, #1A5276 0%, #2E86C1 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: '20px' }}>
               <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                 {selectedChauffeurDetails.nomComplet?.charAt(0)}
               </div>
               <div>
                 <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>{selectedChauffeurDetails.nomComplet}</h3>
                 <div style={{ fontSize: '0.9rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} /> {selectedChauffeurDetails.telephone}
                 </div>
               </div>
            </div>
            
            <div style={{ padding: '30px' }}>
               <div style={{ marginBottom: '24px' }}>
                 <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>STATUT ACTUEL</label>
                 <Badge variant={selectedChauffeurDetails.statut === 'LIBRE' ? 'success' : 'warning'}>
                   {selectedChauffeurDetails.statut === 'LIBRE' ? 'DISPONIBLE' : 'EN MISSION'}
                 </Badge>
               </div>

               {selectedChauffeurDetails.statut !== 'LIBRE' ? (
                 <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '4px' }}>MISSION EN COURS</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{selectedChauffeurDetails.missionActuelle || 'Récupération de véhicule'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '4px' }}>DESTINATION</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={16} /> {selectedChauffeurDetails.destination || 'Non spécifiée'}
                      </div>
                    </div>
                    {selectedChauffeurDetails.dateAssignation && (
                       <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #cbd5e1', fontSize: '0.8rem', color: '#64748b' }}>
                         Assigné le {new Date(selectedChauffeurDetails.dateAssignation).toLocaleString('fr-FR')}
                       </div>
                    )}
                 </div>
               ) : (
                 <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                   <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: '16px', opacity: 0.5 }} />
                   <p style={{ fontWeight: 600 }}>Le chauffeur est actuellement disponible for une nouvelle mission.</p>
                 </div>
               )}

               <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                 <Button variant="outline" onClick={() => setSelectedChauffeurDetails(null)}>Fermer</Button>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'plages' && (
        <div style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 700 }}>Configuration des plages horaires standards</h2>
          <Card shadow="sm">
            <div style={{ padding: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '12px', fontSize: '0.8rem', color: '#64748b' }}>PLAGE HORAIRE</th>
                    <th style={{ padding: '12px', fontSize: '0.8rem', color: '#64748b' }}>ORDRE</th>
                    <th style={{ padding: '12px', fontSize: '0.8rem', color: '#64748b' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {plages.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 700 }}>{p.heureDebut} – {p.heureFin}</td>
                      <td style={{ padding: '12px' }}>{p.ordre}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button size="sm" variant="outline" onClick={() => setEditingPlage({...p})}>Modifier</Button>
                          <Button size="sm" variant="outline" style={{ color: '#ef4444' }} onClick={() => {
                            if (window.confirm("Supprimer cette plage ?")) {
                              axiosInstance.delete(`/api/v1/creneaux/plages/${p.id}`).then(() => fetchData());
                            }
                          }}>Supprimer</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {editingPlage ? (
                <div style={{ marginTop: '30px', padding: '20px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #10b981' }}>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#065f46' }}>✎ Modifier la plage</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input 
                      type="time" 
                      value={editingPlage.heureDebut.substring(0, 5)} 
                      onChange={(e) => setEditingPlage({...editingPlage, heureDebut: e.target.value + ":00"})}
                      style={{ padding: '8px', borderRadius: '8px', border: '1px solid #10b981' }} 
                    />
                    <input 
                      type="time" 
                      value={editingPlage.heureFin.substring(0, 5)} 
                      onChange={(e) => setEditingPlage({...editingPlage, heureFin: e.target.value + ":00"})}
                      style={{ padding: '8px', borderRadius: '8px', border: '1px solid #10b981' }} 
                    />
                    <input 
                      type="number" 
                      value={editingPlage.ordre} 
                      onChange={(e) => setEditingPlage({...editingPlage, ordre: parseInt(e.target.value)})}
                      style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #10b981' }} 
                    />
                    <Button variant="primary" onClick={() => {
                      axiosInstance.put(`/api/v1/creneaux/plages/${editingPlage.id}`, editingPlage).then(() => {
                        setEditingPlage(null);
                        fetchData();
                      });
                    }}>Enregistrer</Button>
                    <Button variant="outline" onClick={() => setEditingPlage(null)}>Annuler</Button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '30px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '15px' }}>+ Ajouter une nouvelle plage</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="time" id="new_start" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="time" id="new_end" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <input type="number" id="new_order" placeholder="Ordre" style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Button variant="primary" onClick={() => {
                      const hDebut = (document.getElementById('new_start') as HTMLInputElement).value;
                      const hFin = (document.getElementById('new_end') as HTMLInputElement).value;
                      const ordre = (document.getElementById('new_order') as HTMLInputElement).value;
                      if (!hDebut || !hFin) return;
                      axiosInstance.post('/api/v1/creneaux/plages', { heureDebut: hDebut + ":00", heureFin: hFin + ":00", ordre }).then(() => fetchData());
                    }}>Ajouter</Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'exceptions' && (
        <div style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 700 }}>Fermetures et exceptions exceptionnelles</h2>
          <Card shadow="sm">
            <div style={{ padding: '24px' }}>
              <p style={{ color: '#64748b', marginBottom: '20px' }}>Ajoutez ici des dates où DIWA ne propose pas de récupération (jours fériés, manque de personnel, etc.).</p>
              
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '15px' }}>Bloquer une date ou une plage</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px' }}>
                  <input type="date" id="exc_date" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <select id="exc_plage" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="">Journée entière</option>
                    {plages.map(p => <option key={p.id} value={p.id}>{p.heureDebut} - {p.heureFin}</option>)}
                  </select>
                  <input type="text" id="exc_motif" placeholder="Motif (ex: Férié)" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Button variant="primary" onClick={() => {
                    const date = (document.getElementById('exc_date') as HTMLInputElement).value;
                    const plageId = (document.getElementById('exc_plage') as HTMLSelectElement).value;
                    const motif = (document.getElementById('exc_motif') as HTMLInputElement).value;
                    if (!date) return;
                    axiosInstance.post('/api/v1/creneaux/exceptions', { 
                      date, 
                      plage: plageId ? { id: plageId } : null,
                      motif 
                    }).then(() => {
                      alert("Exception ajoutée");
                      fetchData();
                    });
                  }}>Bloquer</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminLogistiquePage;
