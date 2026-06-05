import React, { useEffect, useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck,
  XCircle,
  ShoppingBag
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const AdminCommandesPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8181'}/api/v1/commande/all`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await resp.json();
      if (result.code === 200) setOrders(result.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  useGSAP(() => {
    if (!loading) {
      gsap.from('.order-row', {
        x: -30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out'
      });
    }
  }, [loading, filterStatus, searchTerm]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8181'}/api/v1/commande/${id}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchOrders();
    } catch (err) { console.error(err); }
  };

  const filteredOrders = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.statut === filterStatus;
    const matchSearch = o.id.toString().includes(searchTerm) || (o.user?.nom || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAYE': return <Badge variant="success">Payée</Badge>;
      case 'EN_PREPARATION': return <Badge variant="warning">Préparation</Badge>;
      case 'LIVRE': return <Badge variant="neutral">Livrée</Badge>;
      case 'ANNULE': return <Badge variant="error">Annulée</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="admin-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
         <h1>Commandes & Ventes</h1>
         <div style={{ display: 'flex', gap: '12px' }}>
            <div className="search-box" style={{ position: 'relative' }}>
               <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
               <input 
                 type="text" 
                 placeholder="ID ou Client..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 style={{ padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
               />
            </div>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            >
               <option value="all">Tous les statuts</option>
               <option value="PAYE">Payées</option>
               <option value="EN_PREPARATION">En préparation</option>
               <option value="LIVRE">Livrées</option>
               <option value="ANNULE">Annulées</option>
            </select>
         </div>
      </header>

      <Card padding="none">
         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
               <tr style={{ textAlign: 'left' }}>
                  <th style={{ padding: '16px' }}>ID / Date</th>
                  <th style={{ padding: '16px' }}>Client</th>
                  <th style={{ padding: '16px' }}>Total</th>
                  <th style={{ padding: '16px' }}>Statut</th>
                  <th style={{ padding: '16px' }}>Actions</th>
               </tr>
            </thead>
            <tbody>
               {loading ? <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}>Chargement...</td></tr> : filteredOrders.map(order => (
                <tr key={order.id} className="order-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
                   <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600 }}>#{order.id}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(order.dateCommande).toLocaleDateString()}</div>
                   </td>
                   <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 500 }}>{order.user?.nom || 'Client Anonyme'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.user?.email || '-'}</div>
                   </td>
                   <td style={{ padding: '16px', fontWeight: 700 }}>{order.prixTotalTTC.toLocaleString()} FCFA</td>
                   <td style={{ padding: '16px' }}>{getStatusBadge(order.statut)}</td>
                   <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                         {order.statut === 'PAYE' && <Button size="sm" variant="outline" icon={<Package size={14}/>} onClick={() => handleStatusChange(order.id, 'EN_PREPARATION')}>Préparer</Button>}
                         {order.statut === 'EN_PREPARATION' && <Button size="sm" variant="outline" icon={<Truck size={14}/>} onClick={() => handleStatusChange(order.id, 'LIVRE')}>Livrer</Button>}
                         {order.statut !== 'LIVRE' && order.statut !== 'ANNULE' && <Button size="sm" variant="outline" icon={<XCircle size={14}/>} onClick={() => handleStatusChange(order.id, 'ANNULE')}/>}
                         <Button size="sm" variant="outline" icon={<Eye size={14}/>}/>
                      </div>
                   </td>
                </tr>
               ))}
            </tbody>
         </table>
      </Card>
    </div>
  );
};

export default AdminCommandesPage;
