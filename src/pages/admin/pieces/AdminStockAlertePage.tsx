import React, { useEffect, useState } from 'react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { AlertCircle, ArrowRight, Package, RefreshCw, ShoppingCart } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';

interface AlertePiece {
  id: number;
  reference: string;
  nom: string;
  quantiteStock: number;
  categorie: { libelle: string };
}

const AdminStockAlertePage = () => {
  const [alertes, setAlertes] = useState<AlertePiece[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlertes = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/v1/pieces-detachees/all');
      if (response.data.statut === 200) {
        // Filtrer localement les pièces sous le seuil (<= 3)
        const lowStock = response.data.data.filter((p: any) => p.quantiteStock <= 3);
        setAlertes(lowStock);
      }
    } catch (error) { console.error('Erreur chargement alertes:', error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAlertes(); }, []);

  return (
    <div className="admin-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={28} color="#ef4444" />
            <h2 style={{ margin: 0 }}>Alertes de Stock Critique</h2>
         </div>
         <Button variant="outline" icon={<RefreshCw size={18} />} onClick={fetchAlertes}>Actualiser</Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        <div className="main-alerts">
            {loading ? <p>Chargement...</p> : alertes.length === 0 ? (
               <Card style={{ textAlign: 'center', padding: '60px' }}>
                  <Package size={48} color="#10b981" style={{ opacity: 0.2, marginBottom: '16px' }} />
                  <h3>Tout est en ordre !</h3>
                  <p style={{ color: '#64748b' }}>Aucune pièce n'est actuellement en rupture ou sous le seuil critique.</p>
               </Card>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {alertes.map(piece => (
                    <Card key={piece.id} padding="none">
                       <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                             <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertCircle color="#ef4444" size={24} />
                             </div>
                             <div>
                                <h4 style={{ margin: '0 0 4px 0' }}>{piece.nom}</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                                   Réf: <code>{piece.reference}</code> • {piece.categorie?.libelle}
                                </p>
                             </div>
                          </div>
                          
                          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '24px' }}>
                             <div style={{ textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>En Stock</p>
                                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>{piece.quantiteStock}</p>
                             </div>
                             <NavLink to={`/admin/pieces`}>
                                <Button variant="primary" size="sm" icon={<ArrowRight size={16} />}>Réapprovisionner</Button>
                             </NavLink>
                          </div>
                       </div>
                    </Card>
                  ))}
               </div>
            )}
        </div>

        <div className="stats-sidebar">
           <Card title="Résumé Logistique" shadow="sm">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Articles en alerte</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{alertes.length}</p>
                 </div>
                 
                 <div style={{ padding: '16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fee2e2' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#b91c1c' }}>Ruptures Totales</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#b91c1c' }}>
                       {alertes.filter(a => a.quantiteStock === 0).length}
                    </p>
                 </div>

                 <Button variant="outline" fullWidth icon={<ShoppingCart size={18} />}>Générer Bon de Commande</Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminStockAlertePage;
