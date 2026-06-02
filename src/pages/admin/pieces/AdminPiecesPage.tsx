import React, { useEffect, useState, Suspense } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Download,
  AlertTriangle,
  History,
  Tag
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import AdminPieceForm from './AdminPieceForm';
import axiosInstance from '../../../utils/axiosInstance';

interface Piece {
  id: number;
  reference: string;
  nom: string;
  prixUnitaire: number;
  quantiteStock: number;
  imageUrl: string;
  categorieId?: number;
  categorieLibelle?: string;
}

const AdminPiecesPage = () => {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pResponse, cResponse] = await Promise.all([
        axiosInstance.get('/api/v1/pieces-detachees/all'),
        axiosInstance.get('/api/v1/categories-pieces/all')
      ]);
      if (pResponse.data.statut === 200) setPieces(pResponse.data.data);
      if (cResponse.data.statut === 200) setCategories(cResponse.data.data);
    } catch (error) {
      console.error('Erreur chargement pièces:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cette pièce du catalogue ?')) return;
    try {
      const response = await axiosInstance.delete(`/api/v1/pieces-detachees/delete/${id}`);
      if (response.data.statut === 200) fetchData();
    } catch (error) { console.error(error); }
  };

  const exportCSV = () => {
    const headers = ['Référence', 'Nom', 'Catégorie', 'Prix', 'Stock'];
    const rows = filteredPieces.map(p => [
      p.reference,
      p.nom,
      p.categorie?.libelle || 'N/A',
      p.prixUnitaire,
      p.quantiteStock
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `catalogue_pieces_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const BASE_URL = 'http://localhost:8181';

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}/uploads/${url.replace(/^\//, '')}`;
  };

  const filteredPieces = pieces.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === 'all' || p.categorieId?.toString() === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="admin-page">
      <div className="page-header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="search-box" style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Référence ou nom..." 
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            style={{ padding: '0 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <NavLink to="/admin/categories">
             <Button variant="outline" icon={<Tag size={18} />}>Gérer Catégories</Button>
          </NavLink>
          <Button variant="outline" icon={<Download size={18} />} onClick={exportCSV}>Exporter CSV</Button>
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => { setSelectedPiece(null); setIsFormOpen(true); }}>Ajouter une pièce</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '24px', marginBottom: '24px' }}>
        <Card padding="none" shadow="sm">
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 700 }}>Référence</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 700 }}>Image</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 700 }}>Nom</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 700 }}>Catégorie</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 700 }}>Prix (FCFA)</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 700 }}>Stock</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Chargement...</td></tr>
              ) : filteredPieces.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Aucune pièce trouvée</td></tr>
              ) : filteredPieces.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px' }}><code>{p.reference}</code></td>
                  <td style={{ padding: '16px 24px' }}>
                    <div className="elite-small-thumb">
                      {p.imageUrl ? (
                         <img src={getImageUrl(p.imageUrl)!} alt="" />
                      ) : (
                         <div className="no-image-placeholder">N/A</div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <strong style={{ color: '#1e293b' }}>{p.nom}</strong>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontWeight: 600, color: '#475569' }}>
                      {p.categorieLibelle || 'Aucune catégorie'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>{p.prixUnitaire.toLocaleString()}</td>
                  <td style={{ padding: '16px 24px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          fontWeight: 700, 
                          color: p.quantiteStock <= 3 ? '#ef4444' : '#10b981' 
                        }}>{p.quantiteStock}</span>
                        {p.quantiteStock <= 3 && <AlertTriangle size={14} color="#ef4444" />}
                     </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <button className="icon-btn" title="Ajuster Stock"><History size={16} /></button>
                      <button className="icon-btn" onClick={() => { setSelectedPiece(p); setIsFormOpen(true); }}><Edit3 size={16} /></button>
                      <button className="icon-btn text-red" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Alertes Stock">
          <div className="alert-list">
             {pieces.filter(p => p.quantiteStock <= 3).slice(0, 5).map(p => (
               <div key={p.id} style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{p.nom}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Réf: {p.reference}</p>
                  </div>
                  <Badge variant="error">{p.quantiteStock} restants</Badge>
               </div>
             ))}
             <NavLink to="/admin/stock-alertes" style={{ display: 'block', textAlign: 'center', padding: '12px', fontSize: '0.85rem', color: 'var(--diwa-blue)', fontWeight: 600, textDecoration: 'none' }}>
                Voir toutes les alertes →
             </NavLink>
          </div>
        </Card>
      </div>

      {isFormOpen && (
        <AdminPieceForm 
          piece={selectedPiece} 
          categories={categories}
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => { setIsFormOpen(false); fetchData(); }} 
        />
      )}
    </div>
  );
};

export default AdminPiecesPage;
