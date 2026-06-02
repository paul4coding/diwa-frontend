import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { 
  BarChart2, 
  PieChart, 
  Download, 
  ChevronRight,
  Target,
  Trophy,
  Activity
} from 'lucide-react';
import Button from '../../components/ui/Button';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import axiosInstance from '../../utils/axiosInstance';

gsap.registerPlugin(useGSAP);

const AdminStatsPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/api/v1/stats/full');
        if (response.data.statut === 200) {
          setStats(response.data.data);
        }
      } catch (error) { 
        console.error("Erreur statistiques:", error); 
      }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  useGSAP(() => {
    if (!loading) {
      gsap.from('.stat-card', {
        scale: 0.9,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      });

      gsap.from('.progress-bar', {
        width: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: 'power4.out',
        delay: 0.5
      });
    }
  }, [loading]);

  if (loading) return <div>Chargement des analyses...</div>;

  return (
    <div className="admin-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center' }}>
         <div>
            <h1>Statistiques Détaillées</h1>
            <p style={{ color: '#64748b' }}>Analyse des performances du catalogue et de l'atelier.</p>
         </div>
         <Button variant="outline" icon={<Download size={18} />}>Télécharger Rapport PDF</Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
         <div className="stat-card">
           <Card padding="none">
              <div style={{ padding: '24px', textAlign: 'center' }}>
                 <Trophy size={40} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
                 <h4 style={{ margin: 0, color: '#64748b' }}>Top Vendeur</h4>
                 <h3 style={{ margin: '8px 0 0 0' }}>S. Koffi (Tech)</h3>
                 <p style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>12 interventions terminées</p>
              </div>
           </Card>
         </div>
         <div className="stat-card">
           <Card padding="none">
              <div style={{ padding: '24px', textAlign: 'center' }}>
                 <Target size={40} color="#3b82f6" style={{ margin: '0 auto 16px' }} />
                 <h4 style={{ margin: 0, color: '#64748b' }}>Objectif CA Mensuel</h4>
                 <h3 style={{ margin: '8px 0 0 0' }}>85.5% atteint</h3>
                 <div style={{ width: '80%', height: '8px', background: '#e2e8f0', borderRadius: '4px', margin: '12px auto' }}>
                    <div className="progress-bar" style={{ width: '85.5%', height: '100%', background: '#3b82f6', borderRadius: '4px' }}></div>
                 </div>
              </div>
           </Card>
         </div>
         <div className="stat-card">
           <Card padding="none">
              <div style={{ padding: '24px', textAlign: 'center' }}>
                 <Activity size={40} color="#10b981" style={{ margin: '0 auto 16px' }} />
                 <h4 style={{ margin: 0, color: '#64748b' }}>Taux de Conversion</h4>
                 <h3 style={{ margin: '8px 0 0 0' }}>64%</h3>
                 <p style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>+4% vs mois dernier</p>
              </div>
           </Card>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
         <div className="stat-card">
           <Card title="Répartition du Volume d'Activité" subtitle="Comparaison Ventes vs SAV vs RDV">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px 0' }}>
                 {stats?.statusDistribution && Object.entries(stats.statusDistribution).map(([label, value]: any) => (
                   <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                         <span style={{ fontWeight: 600 }}>{label}</span>
                         <span style={{ color: '#64748b' }}>{value} unités</span>
                      </div>
                      <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' }}>
                         <div className="progress-bar" style={{ 
                           width: `${(value / 50) * 100}%`, 
                           height: '100%', 
                           background: label === 'Ventes' ? '#3b82f6' : label === 'SAV' ? '#6366f1' : '#10b981' 
                         }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
         </div>

         <div className="stat-card">
           <Card title="Top Pièces les plus vendues">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 {[
                   { name: 'Huile Moteur 5W30', qty: 45, price: '8,500' },
                   { name: 'Plaquettes Frein AV', qty: 32, price: '12,000' },
                   { name: 'Filtre Habitacle', qty: 28, price: '4,500' },
                   { name: 'Bougies Allumage', qty: 22, price: '15,000' }
                 ].map((item, i) => (
                   <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.name}</span>
                      <Badge variant="neutral">{item.qty} vendus</Badge>
                   </div>
                 ))}
              </div>
           </Card>
         </div>
      </div>
    </div>
  );
};

export default AdminStatsPage;
