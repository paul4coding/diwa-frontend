import React, { useEffect, useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { 
  MessageSquare, 
  UserPlus, 
  User,
  Briefcase,
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  Car,
  Truck,
  Plus,
  X,
  Phone,
  Mail,
  User as UserIcon,
  Trash2
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const AdminSavPage = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [eliteRdvs, setEliteRdvs] = useState<any[]>([]);
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isChefTech = user.roles?.includes('ROLE_CHEF_TECHNICIEN');
  const isReceptionnist = user.roles?.includes('ROLE_RECEPTIONNISTE');
  const isAdmin = user.roles?.includes('ROLE_ADMIN');

  // Direct Arrival States
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({ prenom: '', nom: '', email: '', telephone: '' });
  const [directVehiculeData, setDirectVehiculeData] = useState({
    immat: '', chassis: '', marque: '', modele: '', probleme: '', categorie: 'Entretien & Vidange'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // INDIVIDUAL FETCHES
      fetch('http://localhost:8181/api/sav/tickets', { headers })
        .then(r => r.json())
        .then(res => setTickets(res || []))
        .catch(e => console.error("Error fetching SAV tickets", e));

      fetch('http://localhost:8181/api/v1/techniciens/all', { headers })
        .then(r => r.json())
        .then(res => { if(res.statut === 200) setTechs(res.data); })
        .catch(e => console.error("Error fetching techs", e));

      // NOUVELLES DEMANDES SAV ELITE (Visites & Réparations & Arrivées)
      fetch('http://localhost:8181/api/v1/demandes', { headers })
        .then(r => r.json())
        .then(res => {
          if (Array.isArray(res)) {
            const relevant = res.filter((d: any) => 
                ['SOUMISE', 'VEHICULE_RECU', 'EN_ENREGISTREMENT'].includes(d.statut)
            );
            setEliteRdvs(relevant);
          }
        })
        .catch(e => console.error("Error fetching elite demands", e));

      Promise.all([
        fetch('http://localhost:8181/api/v1/users/role/ROLE_CLIENT', { headers }).then(r => r.json()),
        fetch('http://localhost:8181/api/v1/users/role/ROLE_USER', { headers }).then(r => r.json())
      ]).then(([clientsRole, usersRole]) => {
        const combined = [...(Array.isArray(clientsRole) ? clientsRole : []), ...(Array.isArray(usersRole) ? usersRole : [])];
        const unique = Array.from(new Map(combined.map(c => [c.id, c])).values());
        setClients(unique);
      }).catch(e => console.error("Error fetching clients", e));

    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useGSAP(() => {
    if (!loading && document.querySelector('.ticket-card')) {
      gsap.from('.ticket-card', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
      });
    }
  }, [loading, filterStatus, eliteRdvs]);

  const handleAssign = async (ticketId: number, techId: string) => {
    if (!techId) return;
    try {
      await fetch(`http://localhost:8181/api/sav/tickets/${ticketId}/technicien?technicienId=${techId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (ticketId: number, status: string) => {
    try {
      await fetch(`http://localhost:8181/api/sav/tickets/${ticketId}/statut?statut=${status}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce ticket ?")) return;
    try {
      const res = await fetch(`http://localhost:8181/api/v1/demandes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
          alert("Ticket supprimé !");
          fetchData();
      } else {
          alert("Erreur lors de la suppression");
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateDirect = async () => {
    if (!selectedClient || !directVehiculeData.immat) return;
    try {
        const res = await fetch('http://localhost:8181/api/v1/demandes/direct', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: JSON.stringify({
                clientId: selectedClient.id,
                vehiculeImmatriculation: directVehiculeData.immat,
                vehiculeNumeroChassis: directVehiculeData.chassis,
                vehiculeMarque: directVehiculeData.marque,
                vehiculeModele: directVehiculeData.modele,
                descriptionProbleme: `${directVehiculeData.categorie}: ${directVehiculeData.probleme}`
            })
        });
        if (res.ok) {
            alert("Entrée directe enregistrée !");
            setShowDirectModal(false);
            setDirectVehiculeData({ immat: '', chassis: '', marque: '', modele: '', probleme: '', categorie: 'Entretien & Vidange' });
            setSelectedClient(null);
            fetchData();
        }
    } catch (err) { console.error(err); }
  };

  const handleCreateClient = async () => {
    try {
        const res = await fetch('http://localhost:8181/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                ...newClientData, 
                username: newClientData.email, 
                roles: ['ROLE_CLIENT'], 
                password: 'Password123!' 
            })
        });
        if (res.ok) {
            const data = await res.json();
            setSelectedClient(data.user || data);
            setShowNewClientForm(false);
            alert("Compte client créé avec succès !");
            fetchData();
        }
    } catch (err) { console.error(err); }
  };

  const filteredClients = Array.isArray(clients) ? clients.filter((c: any) => {
    if (c.email === 'client@diwa.tg') return false; // Ignorer le compte de test
    const nomComplet = `${c.nom || ''} ${c.prenom || ''}`.toLowerCase();
    const email = (c.email || '').toLowerCase();
    const search = clientSearch.toLowerCase();
    return nomComplet.includes(search) || email.includes(search);
  }) : [];

  const filteredTickets = Array.isArray(tickets) 
    ? tickets.filter(t => filterStatus === 'all' || t.statut === filterStatus)
    : [];

  return (
    <div className="admin-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
          <h1>Support & SAV Elite</h1>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '10px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600 }}
            >
               <option value="all">Tous les flux</option>
               <option value="SOUMISE">Nouveaux (SOUMISE)</option>
               <option value="VEHICULE_RECU">Au Garage (RECU)</option>
            <option value="EN_ENREGISTREMENT">Enregistrés (TECH)</option>
            </select>
            {isReceptionnist && (
              <Button variant="primary" icon={<Plus size={18} />} onClick={() => setShowDirectModal(true)}>
                Nouvelle Arrivée Directe
              </Button>
            )}
          </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
         {/* ELITE PREMIUM RDV SECTION */}
         {!loading && eliteRdvs.map(rdv => (
            <div key={`rdv-${rdv.id}`} className="elite-rdv-card">
               <div className="elite-rdv-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <div className="elite-avatar-box" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}><Car size={18} /></div>
                     <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>DEMANDE ELITE SAV</span>
                  </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                     <div className={`elite-status-pill ${rdv.urgence?.toUpperCase() || 'NORMAL'}`}>
                        {rdv.urgence || 'NORMAL'}
                     </div>
                     {(isReceptionnist || isAdmin) && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(rdv.id); }}
                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: '0.3s' }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                        >
                            <Trash2 size={18} />
                        </button>
                     )}
                   </div>
                </div>
               
               <div className="elite-rdv-body">
                  <div className="elite-user-badge">
                     <div className="elite-avatar-box"><User size={20} /></div>
                     <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{rdv.clientNom || rdv.userName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ref: {rdv.reference || `RDV-${rdv.id}`}</div>
                     </div>
                  </div>

                  <div className="elite-info-grid">
                     <div className="elite-info-item">
                        <div className="elite-info-label">Véhicule</div>
                        <div className="elite-info-value">
                            {rdv.vehiculeMarque} {rdv.vehiculeModele} 
                            <span style={{ color: rdv.vehiculeImmatriculation ? '#0f172a' : '#ef4444', marginLeft: 5 }}>
                                ({rdv.vehiculeImmatriculation || 'IMMAT INCONNUE'})
                            </span>
                        </div>
                     </div>
                     <div className="elite-info-item">
                        <div className="elite-info-label">Logistique</div>
                        <div className="elite-info-value">{rdv.demandeVisite ? `📍 Visite: ${rdv.adresseVisite}` : '🏠 Garage'}</div>
                     </div>
                     <div className="elite-info-item">
                        <div className="elite-info-label">VIN</div>
                        <div className="elite-info-value" style={{ fontFamily: 'monospace' }}>{rdv.vehiculeNumeroChassis || rdv.vin || 'Non renseigné'}</div>
                     </div>
                     <div className="elite-info-item">
                        <div className="elite-info-label">Kilométrage</div>
                        <div className="elite-info-value">{rdv.kilometrage ? `${rdv.kilometrage} km` : 'N/A'}</div>
                     </div>
                  </div>

                  {rdv.detailsSpecifiques && (
                     <div className="elite-details-box">
                        <strong style={{ display: 'block', marginBottom: '5px' }}>DÉTAILS DIAGNOSTIC :</strong>
                        {rdv.detailsSpecifiques}
                     </div>
                  )}

                  {rdv.checkingObservations && (
                     <div className="elite-details-box" style={{ borderLeftColor: '#f59e0b', background: '#fffbeb', marginTop: '10px' }}>
                        <strong style={{ display: 'block', marginBottom: '5px', color: '#b45309' }}>OBSERVATIONS CHAUFFEUR :</strong>
                        {rdv.checkingObservations}
                     </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                     {rdv.statut === 'VEHICULE_RECU' && isChefTech ? (
                       <Button size="lg" variant="primary" fullWidth onClick={() => window.location.href=`/admin/atelier/enregistrement/${rdv.id}`} icon={<Briefcase size={18} />}>
                          ENREGISTRER FICHE TECHNIQUE
                       </Button>
                     ) : rdv.statut === 'SOUMISE' && (isReceptionnist || user.roles?.includes('ROLE_ADMIN')) ? (
                       <Button size="lg" variant="primary" fullWidth onClick={() => window.location.href='/admin/logistique'} icon={<Truck size={18} />}>
                          PLANIFIER L'INTERVENTION
                       </Button>
                     ) : (
                      <Button size="lg" variant="outline" fullWidth onClick={() => window.location.href=`/admin/sav/${rdv.uuid}`}>
                          VOIR DÉTAILS DOSSIER
                       </Button>
                     )}
                  </div>
               </div>
            </div>
         ))}

         {loading ? <p>Chargement...</p> : (tickets.length === 0 && eliteRdvs.length === 0) ? <p>Aucun ticket ou service en attente.</p> : filteredTickets.map(ticket => (
           <div key={ticket.id} className="ticket-card">
             <Card padding="none" shadow="sm">
                <div style={{ padding: '20px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <Badge variant={ticket.statut === 'OUVERT' ? 'error' : ticket.statut === 'EN_COURS' ? 'warning' : 'success'}>
                         {ticket.statut}
                      </Badge>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>#{ticket.id} • {new Date(ticket.dateCreation).toLocaleDateString()}</span>
                   </div>

                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '8px' }}><Car size={18} /></div>
                      <div>
                         <div style={{ fontWeight: 600 }}>{ticket.vehiculeMarque}</div>
                         <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Immat: {ticket.vehiculeImmat}</div>
                      </div>
                   </div>

                   <p style={{ fontSize: '0.9rem', marginBottom: '20px', color: '#334155', minHeight: '40px' }}>{ticket.description}</p>
                   
                   <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', color: '#64748b' }}>TECHNICIEN ASSIGNÉ</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                         <select 
                           value={ticket.technicien?.id || ''} 
                           onChange={(e) => handleAssign(ticket.id, e.target.value)}
                           style={{ flex: 1, padding: '6px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                         >
                            <option value="">-- Non assigné --</option>
                            {techs.filter(t => t.actif).map(t => <option key={t.id} value={t.id}>{t.prenom} {t.nom} ({t.specialite})</option>)}
                         </select>
                      </div>
                   </div>

                   <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      {ticket.statut === 'EN_COURS' && <Button size="sm" variant="outline" fullWidth icon={<CheckCircle2 size={14}/>} onClick={() => handleStatusChange(ticket.id, 'RESOLU')}>Résoudre</Button>}
                      <Button size="sm" variant="outline" icon={<MessageSquare size={14}/>}>Détails & Chat</Button>
                   </div>
                </div>
             </Card>
           </div>
         ))}
      </div>

      {showDirectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(10px)' }}>
            <div style={{ background: 'white', width: '900px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'slideUp 0.4s ease-out' }}>
                <div style={{ padding: '30px 40px', background: '#0f172a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 14 }}><Car size={24} /></div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>Enregistrer une Arrivée Directe</h2>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>Saisie rapide pour client présent au comptoir</p>
                        </div>
                    </div>
                    <button onClick={() => setShowDirectModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5 }}><X size={24} /></button>
                </div>

                <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40 }}>
                    {/* RECHERCHE CLIENT */}
                    <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: 40 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}><UserIcon size={20} color="#3b82f6" /> Identification Client</h3>
                        {!selectedClient ? (
                            <>
                                <div style={{ position: 'relative', marginBottom: 20 }}>
                                    <Search style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                                    <input 
                                        style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', outline: 'none' }} 
                                        placeholder="Rechercher par nom ou email..."
                                        value={clientSearch}
                                        onChange={e => setClientSearch(e.target.value)}
                                    />
                                </div>

                                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {filteredClients.slice(0, 5).map((c: any) => (
                                        <div 
                                            key={c.id} 
                                            onClick={() => setSelectedClient(c)}
                                            style={{ 
                                                padding: '15px', borderRadius: 16, border: '1px solid #e2e8f0', 
                                                background: 'white',
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ fontWeight: 800, color: '#1e293b' }}>{c.prenom} {c.nom}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.email}</div>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setShowNewClientForm(true)}
                                    style={{ width: '100%', padding: '15px', borderRadius: 16, border: '2px dashed #3b82f6', background: '#eff6ff', color: '#3b82f6', fontWeight: 800, cursor: 'pointer', marginTop: 15 }}
                                >
                                    + Créer un nouveau compte client
                                </button>
                            </>
                        ) : (
                            <div style={{ background: '#fff', border: '2px solid #10b981', padding: 25, borderRadius: 24, boxShadow: '0 15px 30px rgba(16, 185, 129, 0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                                    <div>
                                        <div style={{ fontWeight: 900, color: '#064e3b', fontSize: '1.1rem' }}>{selectedClient.prenom} {selectedClient.nom}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>{selectedClient.email}</div>
                                    </div>
                                    <button onClick={() => setSelectedClient(null)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', fontWeight: 800, padding: '5px 12px', borderRadius: 10, cursor: 'pointer', fontSize: '0.7rem' }}>Changer</button>
                                </div>
                                <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 14 }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: 8 }}>Tickets en cours</div>
                                    {eliteRdvs.filter((r: any) => r.clientNom?.includes(selectedClient.nom)).length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {eliteRdvs.filter((r: any) => r.clientNom?.includes(selectedClient.nom)).slice(0, 2).map((r: any) => (
                                                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '6px 10px', borderRadius: 8, fontSize: '0.75rem', border: '1px solid #d1fae5' }}>
                                                    <span style={{ fontWeight: 800 }}>{r.reference}</span>
                                                    <span style={{ color: '#64748b' }}>{r.statut}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>Aucun ticket actif</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {showNewClientForm && (
                            <div style={{ marginTop: 20, padding: 25, background: '#fff', border: '2px solid #3b82f6', borderRadius: 20, boxShadow: '0 15px 30px rgba(59, 130, 246, 0.1)' }}>
                                <h4 style={{ margin: '0 0 15px', fontSize: '0.9rem', fontWeight: 900, color: '#1e3a8a' }}>Nouveau Client</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                                    <input placeholder="Prénom" onChange={e => setNewClientData({...newClientData, prenom: e.target.value})} style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }} />
                                    <input placeholder="Nom" onChange={e => setNewClientData({...newClientData, nom: e.target.value})} style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }} />
                                </div>
                                <input placeholder="Email" onChange={e => setNewClientData({...newClientData, email: e.target.value})} style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, width: '100%', marginBottom: 10 }} />
                                <input placeholder="Téléphone" onChange={e => setNewClientData({...newClientData, telephone: e.target.value})} style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, width: '100%', marginBottom: 15 }} />
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => setShowNewClientForm(false)} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0', background: 'none', fontWeight: 700 }}>Annuler</button>
                                    <button onClick={handleCreateClient} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: '#3b82f6', color: 'white', fontWeight: 700 }}>Créer</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* INFOS VÉHICULE */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}><Car size={20} color="#f59e0b" /> Infos Véhicule</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 8 }}>Immatriculation</label>
                                <input 
                                    style={{ width: '100%', padding: '12px 15px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem' }} 
                                    placeholder="Ex: TG-1234-AX" 
                                    value={directVehiculeData.immat}
                                    onChange={e => setDirectVehiculeData({...directVehiculeData, immat: e.target.value.toUpperCase()})}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 8 }}>Numéro de Châssis (VIN)</label>
                                <input 
                                    style={{ width: '100%', padding: '12px 15px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem' }} 
                                    placeholder="Saisir les 17 caractères..." 
                                    value={directVehiculeData.chassis}
                                    onChange={e => setDirectVehiculeData({...directVehiculeData, chassis: e.target.value.toUpperCase()})}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 8 }}>Marque</label>
                                    <input style={{ width: '100%', padding: '12px 15px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc' }} placeholder="Ex: Toyota" value={directVehiculeData.marque} onChange={e => setDirectVehiculeData({...directVehiculeData, marque: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 8 }}>Modèle</label>
                                    <input style={{ width: '100%', padding: '12px 15px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc' }} placeholder="Ex: RAV4" value={directVehiculeData.modele} onChange={e => setDirectVehiculeData({...directVehiculeData, modele: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 8 }}>Catégorie du motif</label>
                                <select 
                                    style={{ width: '100%', padding: '12px 15px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }} 
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
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 8 }}>Détails / Observations</label>
                                <textarea 
                                    style={{ width: '100%', padding: '12px 15px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', height: 80, resize: 'none' }} 
                                    placeholder="Précisez le problème si nécessaire..."
                                    value={directVehiculeData.probleme}
                                    onChange={e => setDirectVehiculeData({...directVehiculeData, probleme: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '30px 40px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 15 }}>
                    <button onClick={() => setShowDirectModal(false)} style={{ padding: '15px 30px', borderRadius: 16, border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer' }}>Annuler</button>
                    <button 
                        disabled={!selectedClient || !directVehiculeData.immat}
                        onClick={handleCreateDirect}
                        style={{ padding: '15px 40px', borderRadius: 16, border: 'none', background: '#0f172a', color: 'white', fontWeight: 800, cursor: 'pointer', opacity: (!selectedClient || !directVehiculeData.immat) ? 0.5 : 1 }}
                    >
                        Valider l'Entrée Directe
                    </button>
                </div>
            </div>
        </div>
      )}

      <style>{`
  .elite-rdv-card {
      background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); transition: all 0.2s;
  }
  .elite-rdv-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-color: #3b82f6; }
  .elite-rdv-header { background: #0f172a; color: white; padding: 8px 15px; display: flex; justify-content: space-between; align-items: center; }
  .elite-rdv-body { padding: 10px; }
  .elite-status-pill { padding: 2px 8px; borderRadius: 4px; fontSize: 0.6rem; fontWeight: 800; textTransform: uppercase; }
  .elite-status-pill.NORMALE { background: rgba(16, 185, 129, 0.2); color: #10b981; }
  .elite-status-pill.URGENTE { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
  .elite-status-pill.TRES_URGENTE { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
  .elite-user-badge { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .elite-avatar-box { width: 28px; height: 28px; background: #f1f5f9; borderRadius: 8px; display: flex; alignItems: center; justifyContent: center; color: #64748b; }
  .elite-info-grid { display: grid; gridTemplateColumns: 1fr 1fr; gap: 8px; margin-bottom: 8px; background: #f8fafc; padding: 8px; borderRadius: 10px; }
  .elite-info-label { font-size: 0.6rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; margin-bottom: 1px; }
  .elite-info-value { font-size: 0.75rem; color: #1e293b; font-weight: 700; }
  .elite-details-box { padding: 8px; border-left: 3px solid #3b82f6; background: #f0f7ff; border-radius: 4px; font-size: 0.75rem; color: #1e3a8a; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default AdminSavPage;
