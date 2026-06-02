import React, { useEffect, useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Clock, 
  User, 
  Car,
  Briefcase,
  AlertCircle,
  Truck
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

const AdminPlanningPage = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [techniciens, setTechniciens] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlanning = async () => {
    setLoading(true);
    try {
      const start = getMonday(currentWeek);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      
      const [techRes, planRes] = await Promise.all([
        fetch('http://localhost:8181/api/v1/techniciens/all').then(r => r.json()),
        fetch(`http://localhost:8181/api/garage/planning/global?debut=${formatDate(start)}&fin=${formatDate(end)}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json())
      ]);

      if (techRes.code === 200) setTechniciens(techRes.data);
      
      // Merge RDV, Interventions and Visites Experts into a single event list
      const allEvents: any[] = [];
      if (planRes.rendezVous) {
        planRes.rendezVous.forEach((r: any) => allEvents.push({ ...r, type: 'RDV' }));
      }
      if (planRes.interventions) {
        planRes.interventions.forEach((i: any) => allEvents.push({ ...i, type: 'SAV' }));
      }
      if (planRes.visitesExperts) {
        planRes.visitesExperts.forEach((v: any) => allEvents.push({ ...v, type: 'VISITE' }));
      }
      setEvents(allEvents);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPlanning();
  }, [currentWeek]);

  // Helpers
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const getWeekLabels = () => {
    const monday = getMonday(currentWeek);
    return DAYS.map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const changeWeek = (dir: number) => {
    const next = new Date(currentWeek);
    next.setDate(currentWeek.getDate() + (dir * 7));
    setCurrentWeek(next);
  };

  const getEventsForSlot = (date: Date, hour: string) => {
    const dateStr = formatDate(date);
    return events.filter(e => {
        const matchesTech = selectedTech === 'all' || (e.technicien?.id?.toString() === selectedTech) || (e.technicienId?.toString() === selectedTech);
        
        if (e.type === 'RDV') {
           return matchesTech && e.date === dateStr && e.creneau?.heureDebut.startsWith(hour.split(':')[0]);
        }
        if (e.type === 'VISITE') {
           // On utilise les nouveaux champs de DemandeIntervention
           const hVisite = e.heureDebutVisite?.split(':')[0];
           const dVisite = e.creneauVisiteId ? e.heureDebutVisite?.split('T')[0] : null; // Si on a le creneau, on a la date
           // Note: on suppose que le mapper a mis le format ISO ou que la date est celle du créneau
           return matchesTech && e.creneauVisiteId && hVisite === hour.split(':')[0]; 
        }
        if (e.type === 'SAV') {
           // Les tickets SAV en cours occupent le technicien (on les montre à 8h par défaut)
           return matchesTech && hour === '08:00'; 
        }
        return false;
    });
  };

  const weekDays = getWeekLabels();

  return (
    <div className="admin-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h2 style={{ margin: 0 }}>Planning Garage</h2>
            <div className="week-nav" style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '4px' }}>
               <button className="icon-btn" onClick={() => changeWeek(-1)}><ChevronLeft size={20} /></button>
               <span style={{ padding: '0 16px', fontWeight: 600, fontSize: '0.9rem' }}>
                  Semaine du {weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au {weekDays[5].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
               </span>
               <button className="icon-btn" onClick={() => changeWeek(1)}><ChevronRight size={20} /></button>
            </div>
         </div>

         <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '0 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
               <Filter size={16} color="#64748b" />
               <select 
                 value={selectedTech} 
                 onChange={(e) => setSelectedTech(e.target.value)}
                 style={{ border: 'none', padding: '10px 0', fontSize: '0.9rem', outline: 'none' }}
               >
                  <option value="all">Tous les techniciens</option>
                  {techniciens.map(t => <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>)}
               </select>
            </div>
            <Button variant="primary" icon={<CalendarIcon size={18} />}>Aujourd'hui</Button>
         </div>
      </header>

      <Card padding="none" shadow="sm">
        <div className="planning-grid-container" style={{ overflowX: 'auto' }}>
          <div className="planning-grid" style={{ minWidth: '1000px' }}>
            {/* Header Jours */}
            <div className="grid-header" style={{ display: 'grid', gridTemplateColumns: '100px repeat(6, 1fr)', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
               <div className="hour-col" style={{ padding: '16px' }}></div>
               {weekDays.map((d, i) => (
                 <div key={i} className={`day-col ${formatDate(new Date()) === formatDate(d) ? 'today' : ''}`} style={{ padding: '16px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{DAYS[i]}</p>
                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{d.getDate()}</p>
                 </div>
               ))}
            </div>

            {/* Corps Grille */}
            <div className="grid-body">
               {HOURS.map((hour, hIdx) => (
                 <div key={hIdx} className="grid-row" style={{ display: 'grid', gridTemplateColumns: '100px repeat(6, 1fr)', borderBottom: '1px solid #f1f5f9' }}>
                    <div className="hour-label" style={{ padding: '20px 16px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                       {hour}
                    </div>
                    {weekDays.map((date, dIdx) => {
                       const slotEvents = getEventsForSlot(date, hour);
                       return (
                        <div key={dIdx} className="grid-cell" style={{ borderLeft: '1px solid #f1f5f9', padding: '4px', position: 'relative', minHeight: '80px', background: hIdx % 2 === 0 ? 'transparent' : '#fcfdfe' }}>
                           {slotEvents.map((evt, eIdx) => {
                             const isVisite = evt.type === 'VISITE';
                             const isSAV = evt.type === 'SAV';
                             const color = isVisite ? '#e53e3e' : (isSAV ? '#6366f1' : '#3b82f6');
                             const bg = isVisite ? 'rgba(229, 62, 62, 0.1)' : (isSAV ? 'rgba(99, 102, 241, 0.1)' : 'rgba(59, 130, 246, 0.1)');
                             
                             return (
                              <div key={eIdx} className="planning-event" style={{ 
                                background: bg,
                                borderLeft: `3px solid ${color}`,
                                padding: '8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                marginBottom: '4px',
                                cursor: 'pointer'
                              }}>
                                 <p style={{ margin: '0 0 2px 0', fontWeight: 700, color: color }}>
                                    {isVisite ? <Truck size={10} style={{ display: 'inline', marginRight: '4px' }}/> : (isSAV ? <Briefcase size={10} style={{ display: 'inline', marginRight: '4px' }}/> : <User size={10} style={{ display: 'inline', marginRight: '4px' }}/>)}
                                    {isVisite ? 'Visite' : (isSAV ? 'Réparation' : (evt.user?.nom || 'Client'))}
                                 </p>
                                 <p style={{ margin: 0, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {isVisite ? evt.clientNom : (isSAV ? evt.reference : (evt.vehicule?.modele || 'RDV'))}
                                 </p>
                              </div>
                             );
                           })}
                        </div>
                       );
                    })}
                 </div>
               ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="planning-legend" style={{ display: 'flex', gap: '24px', marginTop: '24px', padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ width: '12px', height: '12px', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '3px solid #3b82f6', borderRadius: '2px' }}></div>
            <span>Rendez-vous Clients</span>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ width: '12px', height: '12px', background: 'rgba(99, 102, 241, 0.1)', borderLeft: '3px solid #6366f1', borderRadius: '2px' }}></div>
            <span>Interventions SAV</span>
         </div>
         <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
            <AlertCircle size={14} />
            <span>2 Interventions en attente d'affectation</span>
         </div>
      </div>

      <style>{`
        .day-col.today { background: #eff6ff; }
        .grid-cell:hover { background: #f8fafc !important; }
        .planning-event:hover { filter: brightness(0.95); transform: translateY(-1px); transition: all 0.2s; }
      `}</style>
    </div>
  );
};

export default AdminPlanningPage;
