import React, { useEffect, useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Plus, Edit3, Trash2, Save, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';

interface Category {
  id: number;
  libelle: string;
}

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/v1/categories-pieces/all');
      if (response.data.statut === 200) setCategories(response.data.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async (libelle: string, id?: number) => {
    console.log("[DEBUG] Tentative de sauvegarde", { id, libelle });
    setSaving(true);
    setError(null);
    setSuccess(null);
    const method = id ? 'put' : 'post';
    const url = id 
      ? `/api/v1/categories-pieces/update/${id}` 
      : '/api/v1/categories-pieces/save';
    const body = { libelle };

    try {
      const response = await axiosInstance[method](url, body);
      if (response.data.statut === 200 || response.data.statut === 201) {
        setIsModalOpen(false);
        setSuccess(id ? "Catégorie mise à jour !" : "Catégorie créée avec succès !");
        fetchCategories();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data.description || "Une erreur est survenue.");
      }
    } catch (err: any) { 
      console.error(err);
      setError(err.response?.data?.description || "Erreur lors de la communication avec le serveur.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cette catégorie ? Toutes les pièces associées n\'auront plus de catégorie.')) return;
    try {
      const response = await axiosInstance.delete(`/api/v1/categories-pieces/delete/${id}`);
      if (response.data.statut === 200) fetchCategories();
    } catch (error) { console.error(error); }
  };

  // --- COMPOSANT FORMULAIRE MODAL ---
  const CategoryModal = () => {
    const [value, setValue] = useState(selectedCategory?.libelle || '');
    
    return (
      <div className="modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}>
        <div className="modal-container" style={{
          background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ margin: 0 }}>{selectedCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h3>
            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Libellé de la catégorie</label>
            <input 
              autoFocus
              type="text" 
              id="category-libelle"
              name="libelle"
              value={value} 
              onChange={(e) => setValue(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              placeholder="Ex: Lubrifiants, Freinage..."
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button 
              variant="primary" 
              style={{ flex: 1 }} 
              onClick={() => handleSave(value, selectedCategory?.id)}
              disabled={saving || !value.trim()}
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : 'Enregistrer'}
            </Button>
            <Button 
              variant="outline" 
              style={{ flex: 1 }} 
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Annuler
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2>Gestion des Catégories</h2>
          <p style={{ color: '#64748b' }}>Configurez les catégories pour organiser votre catalogue de pièces.</p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus size={18} />} 
          onClick={() => { setSelectedCategory(null); setIsModalOpen(true); setError(null); }}
        >
          Nouvelle Catégorie
        </Button>
      </header>

      {error && (
        <div style={{ color: '#ef4444', background: '#fef2f2', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #fee2e2' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ color: '#059669', background: '#ecfdf5', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #d1fae5' }}>
          <CheckCircle2 size={20} />
          <span>{success}</span>
        </div>
      )}

      <div style={{ maxWidth: '800px' }}>
        <Card padding="none">
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <th style={{ padding: '16px 24px' }}>Libellé de la catégorie</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && !loading && (
                <tr>
                  <td colSpan={2} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    Aucune catégorie trouvée.
                  </td>
                </tr>
              )}
              {categories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--diwa-blue)' }}></div>
                      <strong>{cat.libelle}</strong>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        type="button" 
                        className="icon-btn"
                        onClick={() => { setSelectedCategory(cat); setIsModalOpen(true); }}
                        title="Modifier"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        type="button" 
                        className="icon-btn text-red"
                        onClick={() => handleDelete(cat.id)}
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {isModalOpen && <CategoryModal />}

      <style>{`
        .icon-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
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

export default AdminCategoriesPage;
