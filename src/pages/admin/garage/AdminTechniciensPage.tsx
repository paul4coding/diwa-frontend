import React, { useEffect, useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone,
  Calendar
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import AdminTechnicienForm from './AdminTechnicienForm';

interface Technicien {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  tel: string;
  specialite: string;
  grade: string;
  actif: boolean;
}

const AdminTechniciensPage = () => {
  const [techniciens, setTechniciens] = useState<Technicien[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<Technicien | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTechniciens = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8181/api/v1/techniciens/all');
      const result = await response.json();
      if (result.code === 200) {
        setTechniciens(result.data);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTechniciens(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce technicien ?')) return;
    try {
      await fetch(`http://localhost:8181/api/v1/techniciens/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTechniciens();
    } catch (error) { console.error(error); }
  };

  const handleToggleActif = async (id: number) => {
    try {
      await fetch(`http://localhost:8181/api/v1/techniciens/actif/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTechniciens();
    } catch (error) { console.error(error); }
  };

  return (
    <div className="admin-page">
      <div className="page-header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div className="search-box" style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Nom ou spécialité..." 
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <NavLink to="/admin/garage">
             <Button variant="outline" icon={<Calendar size={18} />}>Voir Planning</Button>
          </NavLink>
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => { setSelectedTech(null); setIsFormOpen(true); }}>Nouveau Technicien</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {loading ? <p>Chargement...</p> : filteredTechs.length === 0 ? <p>Aucun technicien trouvé.</p> : filteredTechs.map(tech => (
          <Card key={tech.id} padding="none" shadow="sm">
             <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                   <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--diwa-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
                      {tech.nom.charAt(0)}{tech.prenom.charAt(0)}
                   </div>
                   <Badge variant={tech.actif ? 'success' : 'neutral'}>{tech.actif ? 'Disponible' : 'Indisponible'}</Badge>
                </div>
                
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{tech.prenom} {tech.nom}</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{tech.specialite} • {tech.grade}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <Mail size={14} color="#94a3b8" /> {tech.email}
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <Phone size={14} color="#94a3b8" /> {tech.tel}
                   </div>
                </div>
                
                <div style={{ display: 'flex', borderTop: '1px solid #f1f5f9', paddingTop: '16px', gap: '8px' }}>
                   <Button variant="outline" size="sm" icon={tech.actif ? <UserX size={14} /> : <UserCheck size={14} />} onClick={() => handleToggleActif(tech.id)} />
                   <Button variant="outline" fullWidth size="sm" icon={<Edit3 size={14} />} onClick={() => { setSelectedTech(tech); setIsFormOpen(true); }}>Détails</Button>
                   <Button variant="outline" size="sm" icon={<Trash2 size={14} />} onClick={() => handleDelete(tech.id)} />
                </div>
             </div>
          </Card>
        ))}
      </div>

      {isFormOpen && (
        <AdminTechnicienForm 
          technicien={selectedTech} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => { setIsFormOpen(false); fetchTechniciens(); }} 
        />
      )}
    </div>
  );
};

export default AdminTechniciensPage;
