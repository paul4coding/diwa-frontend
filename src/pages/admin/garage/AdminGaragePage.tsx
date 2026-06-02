import React, { useEffect, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Clock,
  User,
  Car,
  AlertCircle,
  Undo2,
  X
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const HOURS = Array.from({ length: 11 }, (_, i) => {
  const h = i + 8;
  return `${h < 10 ? '0' : ''}${h}:00`;
}); // 08:00 to 18:00

const AdminGaragePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [techs, setTechs] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [events, setEvents] = useState<any[]>([]);
  const [pendingRDVs, setPendingRDVs] = useState<any[]>([]);
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [directForm, setDirectForm] = useState({ immat: '', marque: '', modele: '', probleme: '' });
  const [loading, setLoading] = useState(true);

  const fetchTechsAndPlanning = async () => {
    setLoading(true);
    try {
      const start = getMonday(currentDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // INDIVIDUAL FETCHES TO AVOID PROMISE.ALL GLOBAL FAILURE
      fetch('http://localhost:8181/api/v1/techniciens/all', { headers })
        .then(r => r.json())
        .then(res => { if(res.statut === 200) setTechs(res.data); })
        .catch(e => console.error("Error fetching techs", e));

      fetch(`http://localhost:8181/api/garage/planning/global?debut=${formatDate(start)}&fin=${formatDate(end)}`, { headers })
        .then(r => r.json())
        .then(res => {
            const allEvents: any[] = [];
            if (res.rendezVous) res.rendezVous.forEach((r: any) => allEvents.push({ ...r, type: 'RDV' }));
            if (res.interventions) res.interventions.forEach((i: any) => allEvents.push({ ...i, type: 'SAV' }));
            setEvents(allEvents);
        })
        .catch(e => console.error("Error fetching planning", e));

      fetch('http://localhost:8181/api/v1/rendezvous/en-attente', { headers })
        .then(r => r.json())
        .then(res => { 
          if(res.statut === 200) {
            // Combiner avec les demandes d'intervention au garage
            fetch('http://localhost:8181/api/v1/demandes?statut=VEHICULE_RECU', { headers })
              .then(r2 => r2.json())
              .then(res2 => {
                const combined = [...res.data, ...res2];
                setPendingRDVs(combined);
              });
          } 
        })
        .catch(e => console.error("Error fetching pending", e));

    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleValidate = async (rdvId: number) => {
    if(!window.confirm("Valider ce rendez-vous ? L'email de confirmation professionnelle sera envoyé.")) return;
    try {
        const res = await fetch(`http://localhost:8181/api/v1/rendezvous/admin/valider/${rdvId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json());
        if(res.statut === 200) {
            alert("Rendez-vous validé ! Un email haute-fidélité a été envoyé au client.");
            fetchTechsAndPlanning();
        }
    } catch(err) { console.error(err); }
  };

  const handleCancel = async (rdvId: number) => {
    if(!window.confirm("Voulez-vous vraiment annuler ce rendez-vous ? Un email de notification sera envoyé.")) return;
    try {
        const res = await fetch(`http://localhost:8181/api/v1/rendezvous/admin/annuler/${rdvId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json());
        if(res.statut === 200) {
            alert("Rendez-vous annulé.");
            fetchTechsAndPlanning();
        } else {
            alert("Erreur: " + res.description);
        }
    } catch(err) { console.error(err); }
  };

  const handleReset = async (rdvId: number) => {
    try {
        const res = await fetch(`http://localhost:8181/api/v1/rendezvous/admin/reinitialiser/${rdvId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json());
        if(res.statut === 200) {
            fetchTechsAndPlanning();
        } else {
            alert("Erreur: " + res.description);
        }
    } catch(err) { console.error(err); }
  };

  const handleDirectArrival = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8181/api/v1/demandes/direct', {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vehiculeImmatriculation: directForm.immat,
                vehiculeMarque: directForm.marque,
                vehiculeModele: directForm.modele,
                descriptionProbleme: directForm.probleme
            })
        }).then(r => r.json());

        if (res.id || res.reference) {
            alert("Véhicule enregistré avec succès !");
            setShowDirectModal(false);
            setDirectForm({ immat: '', marque: '', modele: '', probleme: '' });
            fetchTechsAndPlanning();
        }
    } catch (err) {
        console.error(err);
        alert("Erreur lors de l'enregistrement.");
    }
  };

  const handleAssociateClient = async (demandeId: number) => {
    const clientId = window.prompt("Entrez l'ID du client (ou son email pour recherche) :");
    if (!clientId) return;
    
    try {
        // Pour simplifier ici, on attend un ID numérique. 
        // Une version plus pro utiliserait une modale de recherche client.
        const res = await fetch(`http://localhost:8181/api/v1/demandes/${demandeId}/associer-client?clientId=${clientId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json());
        
        if (res.id) {
            alert("Client associé avec succès !");
            fetchTechsAndPlanning();
        }
    } catch (err) { console.error(err); }
  };

  // DRAG & DROP LOGIC
  const onDragStart = (e: React.DragEvent, rdvId: number) => {
    console.log("Départ Drag RDV #", rdvId);
    e.dataTransfer.setData("rdvId", rdvId.toString());
  };

  const onWaitingZoneDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const rdvId = e.dataTransfer.getData("rdvId");
      if (rdvId) {
          handleReset(parseInt(rdvId));
      }
  };

  const onDrop = async (e: React.DragEvent, dateStr: string, hour: string) => {
    e.preventDefault();
    const rdvId = e.dataTransfer.getData("rdvId");
    console.log(`Tentative de planification : RDV #${rdvId} le ${dateStr} à ${hour} avec Tech #${selectedTech}`);
    
    if (!rdvId) return;

    if (selectedTech === 'all') {
        alert("Action requise : Sélectionnez un technicien spécifique avant de planifier ce rendez-vous.");
        return;
    }

    try {
        const url = `http://localhost:8181/api/v1/rendezvous/planifier-direct/${rdvId}?date=${dateStr}&heure=${hour}&techId=${selectedTech}`;
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json());
        
        if (res.statut === 200) {
            console.log("Planification réussie !");
            fetchTechsAndPlanning();
        } else {
            alert("Erreur Serveur: " + (res.description || "Erreur de planification"));
        }
    } catch (err) { 
        console.error("Erreur Planification:", err);
        alert("Erreur de connexion au serveur.");
    }
  };

  useGSAP(() => {
    if (!loading && document.querySelector('.slot-card')) {
        gsap.from('.slot-card', {
            scale: 0.8,
            opacity: 0,
            duration: 0.5,
            stagger: { each: 0.02, from: "random" },
            ease: 'power2.out'
        });
    }
  }, [loading, currentDate, selectedTech]);

  useEffect(() => { fetchTechsAndPlanning(); }, [currentDate, selectedTech]);

  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDayDates = () => {
    const monday = getMonday(currentDate);
    return DAYS.map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const dayDates = getDayDates();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANIFIE': return '#3b82f6';
      case 'CONFIRME': return '#10b981';
      case 'TERMINE': return '#94a3b8';
      case 'ANNULE': return '#ef4444';
      default: return '#6366f1';
    }
  };

  const getEventsForSlot = (date: Date, hour: string) => {
    const dateStr = formatDate(date);
    return events.filter(e => {
      // Pour les RDV Elite, on regarde e.date ou e.dateRdv
      const matchDate = e.date === dateStr || e.dateRdv === dateStr;
      
      const tId = e.technicienId || e.technicien?.id;
      const matchTech = selectedTech === 'all' || (tId && tId.toString() === selectedTech);
      
      // Extraction de l'heure depuis creneauHeures (format "08:00" ou "08:00:00")
      const h = e.creneauHeures || e.heureDebut || "";
      
      // On compare seulement l'heure (ex: "08" de "08:00")
      const slotHour = hour.split(':')[0];
      const eventHour = h.split(':')[0];
      
      return matchDate && matchTech && eventHour === slotHour;
    });
  };

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      <style>{`
        @keyframes slotIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .slot-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .slot-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .pending-card-horizontal:active {
          cursor: grabbing;
          opacity: 0.8;
          transform: scale(0.98);
        }
        .grid-cell-active {
          background: rgba(59, 130, 246, 0.1) !important;
          box-shadow: inset 0 0 0 2px #3b82f6 !important;
        }
      `}</style>
      
      {/* PENDING SHELF (TOP) - NOW A DROP ZONE FOR RETURNS */}
      <section 
        className="pending-shelf" 
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = '#f8fafc'; }}
        onDragLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
        onDrop={(e) => { e.currentTarget.style.background = '#fff'; onWaitingZoneDrop(e); }}
        style={{ marginBottom: '32px', padding: '16px', background: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0', transition: 'all 0.3s' }}
      >
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Demandes à Planifier</h3>
            <Badge variant="primary">{pendingRDVs.length} dossiers actifs</Badge>
         </div>
         
         <div className="pending-horizontal-list" style={{ 
            display: 'flex', 
            gap: '16px', 
            overflowX: 'auto', 
            padding: '10px 4px',
            scrollSnapType: 'x mandatory'
         }}>
            {pendingRDVs.length === 0 && (
                <div style={{ padding: '20px', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', flex: 1, textAlign: 'center' }}>
                    Aucune demande en attente
                </div>
            )}
            {pendingRDVs.map(rdv => (
                <div 
                  key={rdv.id} 
                  draggable 
                  onDragStart={(e) => onDragStart(e, rdv.id)}
                  className={`pending-card-horizontal ${rdv.urgence?.toLowerCase() || 'normal'}`}
                  style={{ 
                      minWidth: '320px',
                      background: 'white',
                      borderRadius: '12px',
                      padding: '16px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e2e8f0',
                      cursor: 'grab',
                      position: 'relative',
                      borderTop: `4px solid ${rdv.urgence === 'URGENT' ? '#ef4444' : '#3b82f6'}`
                  }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                            {rdv.userName || "Client DIWA"} ({rdv.serviceLibelle || "SAV"})
                        </div>
                        <Badge variant="outline">{rdv.statut}</Badge>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: 600, marginBottom: '12px' }}>
                        <Car size={14} style={{ verticalAlign: 'middle', marginRight: '5px', color: '#3b82f6' }} />
                        {rdv.vehiculeMarque} {rdv.vehiculeModele} • {rdv.immatriculation || "---"}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Ref: {rdv.reference || `#${rdv.id}`}</span>
                        <div style={{ display: 'flex', gap: '5px' }}>
                           {rdv.statut === 'VEHICULE_RECU' && (
                             <Button variant="outline" size="sm" onClick={() => window.location.href=`/technicien/enregistrement/${rdv.id}`}>Fiche Technique</Button>
                           )}
                           {!rdv.clientEmail && !rdv.userName && (
                             <Button variant="outline" size="sm" onClick={() => handleAssociateClient(rdv.id)}>Associer Client</Button>
                           )}
                           <Button variant="primary" size="sm" onClick={() => handleValidate(rdv.id)}>Valider RDV</Button>
                        </div>
                    </div>
                </div>
            ))}
         </div>
      </section>

      <div style={{ flex: 1 }}>
        <header className="admin-garage-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <h2 style={{ margin: 0 }}>Planning Garage (Lun-Sam)</h2>
              <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '4px' }}>
                <button className="icon-btn" onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}><ChevronLeft size={20} /></button>
                <span style={{ padding: '0 16px', fontWeight: 600, fontSize: '0.9rem' }}>Semaine de {dayDates[0].getDate()} {dayDates[0].toLocaleString('fr-FR', {month: 'short'})}</span>
                <button className="icon-btn" onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}><ChevronRight size={20} /></button>
              </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <select 
               value={selectedTech} 
               onChange={(e) => setSelectedTech(e.target.value)}
               style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#0f172a', color: 'white', fontWeight: 600 }}
             >
                <option value="all">Tous techniciens</option>
                {techs.map(t => <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>)}
             </select>
             <Button variant="primary" icon={<Calendar size={18} />} onClick={() => setCurrentDate(new Date())}>Aujourd'hui</Button>
             <Button variant="outline" icon={<Car size={18} />} onClick={() => setShowDirectModal(true)} style={{ background: '#10b981', color: 'white', border: 'none' }}>Arrivée Directe</Button>
          </div>
        </header>

        <Card padding="none" shadow="sm">
            <div style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: '900px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(6, 1fr)', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <div style={{ padding: '16px' }}></div>
                        {dayDates.map((d, i) => (
                            <div key={i} style={{ padding: '16px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{DAYS[i]}</span>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{d.getDate()}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid-body">
                        {HOURS.map((hour, hIdx) => (
                            <div key={hIdx} style={{ display: 'grid', gridTemplateColumns: '80px repeat(6, 1fr)', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{hour}</div>
                                {dayDates.map((date, dIdx) => {
                                    const slotEvents = getEventsForSlot(date, hour);
                                    const dateStr = formatDate(date);
                                    return (
                                        <div 
                                          key={dIdx} 
                                          data-date={dateStr}
                                          data-hour={hour}
                                          onDragOver={(e) => e.preventDefault()}
                                          onDragEnter={(e) => {
                                              e.preventDefault();
                                              (e.currentTarget as HTMLElement).classList.add('grid-cell-active');
                                          }}
                                          onDragLeave={(e) => {
                                              (e.currentTarget as HTMLElement).classList.remove('grid-cell-active');
                                          }}
                                          onDrop={(e) => {
                                              const target = e.currentTarget as HTMLElement;
                                              target.classList.remove('grid-cell-active');
                                              const dropDate = target.getAttribute('data-date');
                                              const dropHour = target.getAttribute('data-hour');
                                              if (dropDate && dropHour) {
                                                  onDrop(e, dropDate, dropHour);
                                              }
                                          }}
                                          style={{ 
                                              borderLeft: '1px solid #f1f5f9', 
                                              padding: '4px', 
                                              minHeight: '70px',
                                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                              position: 'relative'
                                          }}
                                        >
                                            {slotEvents.map((evt, eIdx) => (
                                                <div 
                                                  key={eIdx} 
                                                  draggable 
                                                  onDragStart={(e) => onDragStart(e, evt.id)}
                                                  className="slot-card" 
                                                  style={{ 
                                                    background: `${getStatusColor(evt.statut)}15`, 
                                                    borderLeft: `4px solid ${getStatusColor(evt.statut)}`,
                                                    padding: '8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    marginBottom: '4px',
                                                    cursor: 'grab',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                    animation: 'slotIn 0.3s ease-out',
                                                    position: 'relative',
                                                    zIndex: 10
                                                }}>
                                                    <div style={{ fontWeight: 800, color: getStatusColor(evt.statut), marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.userName || 'Client'}</span>
                                                        <div style={{ display: 'flex', gap: '2px' }}>
                                                            {/* SEULEMENT SI NON VALIDÉ (PLANIFIE) */}
                                                            {evt.statut === 'PLANIFIE' && (
                                                              <>
                                                                <button 
                                                                  title="Valider et envoyer email"
                                                                  onClick={(e) => { e.stopPropagation(); handleValidate(evt.id); }}
                                                                  className="btn-admin-action btn-validate"
                                                                >
                                                                  Valider
                                                                </button>
                                                                <button 
                                                                  title="Renvoyer en zone d'attente"
                                                                  onClick={(e) => { e.stopPropagation(); handleReset(evt.id); }}
                                                                  className="btn-admin-action btn-reset"
                                                                >
                                                                  <Undo2 size={12} />
                                                                </button>
                                                              </>
                                                            )}
                                                            
                                                            {/* SEULEMENT SI DÉJÀ VALIDÉ (CONFIRME) */}
                                                            {evt.statut === 'CONFIRME' && (
                                                              <button 
                                                                title="Annuler (envoie email annulation)"
                                                                onClick={(e) => { e.stopPropagation(); handleCancel(evt.id); }}
                                                                className="btn-admin-action btn-cancel"
                                                              >
                                                                <X size={12} />
                                                              </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '0.62rem', opacity: 0.8, fontWeight: 600, color: '#1e293b' }}>
                                                        {evt.serviceLibelle || 'Intervention'}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.6rem', color: '#64748b' }}>
                                                        <User size={10} />
                                                        <span style={{ fontWeight: 700 }}>{evt.technicienNom || "Expert SAV"}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>

        <div style={{ marginTop: '20px', display: 'flex', gap: '16px', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: '#3b82f6' }}></div> PLANIFIE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: '#10b981' }}></div> CONFIRME</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: '#94a3b8' }}></div> TERMINE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: '#ef4444' }}></div> ANNULE</div>
        </div>
      </div>

      {/* MODAL ARRIVEE DIRECTE */}
      {showDirectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card padding="lg" style={{ width: '500px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0 }}>Nouvel Enregistrement Direct</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>Le véhicule est déjà au garage (Arrivée physique sans RDV).</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <div>
                 <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Immatriculation</label>
                 <input 
                   style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                   placeholder="Ex: TG-1234-AB"
                   value={directForm.immat}
                   onChange={e => setDirectForm({...directForm, immat: e.target.value})}
                 />
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                 <div>
                   <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Marque</label>
                   <input 
                     style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                     placeholder="Ex: Toyota"
                     value={directForm.marque}
                     onChange={e => setDirectForm({...directForm, marque: e.target.value})}
                   />
                 </div>
                 <div>
                   <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Modèle</label>
                   <input 
                     style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                     placeholder="Ex: Corolla"
                     value={directForm.modele}
                     onChange={e => setDirectForm({...directForm, modele: e.target.value})}
                   />
                 </div>
               </div>
               <div>
                 <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Problème constaté</label>
                 <textarea 
                   style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px' }} 
                   placeholder="Description rapide..."
                   value={directForm.probleme}
                   onChange={e => setDirectForm({...directForm, probleme: e.target.value})}
                 />
               </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
               <Button variant="outline" onClick={() => setShowDirectModal(false)}>Annuler</Button>
               <Button variant="primary" onClick={handleDirectArrival}>Enregistrer</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminGaragePage;
