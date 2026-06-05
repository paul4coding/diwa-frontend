import React, { useEffect, useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  XCircle,
  Car
} from 'lucide-react';
import AdminVehiculeForm from './AdminVehiculeForm';
import AdminVehiculeDetail from './AdminVehiculeDetail';
import axiosInstance from '../../../utils/axiosInstance';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8181';

const getImageUrl = (path: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('blob:')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // S'assurer que 'uploads/' est présent si ce n'est pas déjà le cas
  if (!cleanPath.startsWith('uploads/')) {
    return `${BASE_URL}/uploads/${cleanPath}`;
  }
  return `${BASE_URL}/${cleanPath}`;
};

interface Vehicule {
  id: number;
  uuid: string;
  marque: string;
  modele: string;
  prixBase: number;
  stock: number;
  fichierGlb: string;
  imagePrincipale: string;
  actif: boolean;
}

const AdminVehiculesPage = () => {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVehicule, setSelectedVehicule] = useState<Vehicule | null>(null);
  const [viewingVehicule, setViewingVehicule] = useState<Vehicule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchVehicules = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/v1/vehicules/all');
      if (response.data.statut === 200) {
        setVehicules(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicules();
  }, []);

  const handleCreate = () => {
    setSelectedVehicule(null);
    setIsFormOpen(true);
  };

  const handleEdit = (vehicule: Vehicule) => {
    setSelectedVehicule(vehicule);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return;
    
    try {
      const response = await axiosInstance.delete(`/api/v1/vehicules/delete/${id}`);
      if (response.status === 200 || response.status === 204) {
        fetchVehicules();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const filteredVehicules = vehicules.filter(v => 
    v.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marque.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="page-header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div className="search-box" style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Rechercher un modèle..." 
            className="admin-search-input"
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="header-buttons" style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline" icon={<Filter size={18} />}>Filtres</Button>
          <Button variant="primary" icon={<Plus size={18} />} onClick={handleCreate}>Ajouter un véhicule</Button>
        </div>
      </div>

      <Card padding="none" shadow="sm">
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <th style={{ padding: '16px 24px' }}>Véhicule</th>
              <th style={{ padding: '16px 24px' }}>Marque</th>
              <th style={{ padding: '16px 24px' }}>Prix (FCFA)</th>
              <th style={{ padding: '16px 24px' }}>Stock</th>
              <th style={{ padding: '16px 24px' }}>Médias</th>
              <th style={{ padding: '16px 24px' }}>Statut</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Chargement...</td></tr>
            ) : filteredVehicules.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Aucun véhicule trouvé</td></tr>
            ) : filteredVehicules.map((vehicule) => (
              <tr key={vehicule.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                      {vehicule.imagePrincipale ? (
                        <img src={getImageUrl(vehicule.imagePrincipale)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Car size={20} color="#cbd5e1"/></div>}
                    </div>
                    <strong>{vehicule.modele}</strong>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <Badge variant={vehicule.marque.toLowerCase() as any}>{vehicule.marque}</Badge>
                </td>
                <td style={{ padding: '16px 24px' }}>{vehicule.prixBase.toLocaleString()}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    fontWeight: 600, 
                    color: vehicule.stock === 0 ? '#ef4444' : vehicule.stock < 5 ? '#f59e0b' : '#10b981' 
                  }}>
                    {vehicule.stock}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                   <div style={{ display: 'flex', gap: '8px' }}>
                      <span title="Modèle 3D">{vehicule.fichierGlb ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#cbd5e1" />}</span>
                      <span title="Vue 360°">{vehicule.dossier360 ? <CheckCircle2 size={16} color="#3b82f6" /> : <XCircle size={16} color="#cbd5e1" />}</span>
                      <span title="Image">{vehicule.imagePrincipale ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#cbd5e1" />}</span>
                   </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <Badge variant={vehicule.actif ? 'success' : 'neutral'}>{vehicule.actif ? 'Actif' : 'Inactif'}</Badge>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button className="icon-btn" title="Voir en détail" onClick={() => setViewingVehicule(vehicule)}><Eye size={18} /></button>
                    <button className="icon-btn" title="Modifier" onClick={() => handleEdit(vehicule)}><Edit3 size={18} /></button>
                    <button className="icon-btn text-red" title="Supprimer" onClick={() => handleDelete(vehicule.id)}><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Modal Formulaire */}
      {isFormOpen && (
        <AdminVehiculeForm 
          vehicule={selectedVehicule} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => {
            setIsFormOpen(false);
            fetchVehicules();
          }}
        />
      )}

      {/* Vue de Détail Premium */}
      {viewingVehicule && (
        <AdminVehiculeDetail 
          vehicule={viewingVehicule} 
          onClose={() => setViewingVehicule(null)} 
        />
      )}

      <style>{`
        .icon-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .icon-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .icon-btn.text-red:hover {
          background: #fef2f2;
          color: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default AdminVehiculesPage;
