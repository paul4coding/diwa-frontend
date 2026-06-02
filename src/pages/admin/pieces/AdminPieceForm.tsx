import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import axiosInstance from '../../../utils/axiosInstance';

interface AdminPieceFormProps {
  piece?: any;
  categories: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const AdminPieceForm: React.FC<AdminPieceFormProps> = ({ piece, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    reference: piece?.reference || '',
    nom: piece?.nom || '',
    prixUnitaire: piece?.prixUnitaire ?? '',
    quantiteStock: piece?.quantiteStock ?? '',
    categorieId: piece?.categorie?.id || (categories.length > 0 ? categories[0].id : ''),
    imageUrl: piece?.imageUrl || null
  });

  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = 'http://localhost:8181';

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}/uploads/${url.replace(/^\//, '')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await axiosInstance.post('/api/v1/admin/media/piece/image', uploadFormData);

      if (response.data.statut === 201) {
        // Supposons que l'API renvoie le nom du fichier ou l'URL relative
        const newUrl = response.data.data.url || response.data.data;
        setFormData(prev => ({ ...prev, imageUrl: newUrl }));
      } else {
        setError(response.data.description || "Erreur upload.");
      }
    } catch (err: any) {
      setError("Erreur lors de l'upload de l'image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.categorieId) {
      setError("Veuillez sélectionner une catégorie.");
      setIsSubmitting(false);
      return;
    }

    const method = piece ? 'PUT' : 'POST';
    const url = piece 
      ? `/api/v1/pieces-detachees/update/${piece.id}` 
      : '/api/v1/pieces-detachees/save';

    try {
      const response = await axiosInstance[method.toLowerCase() as 'post' | 'put'](url, formData);

      if (response.data.statut === 200 || response.data.statut === 201) {
        onSuccess();
      } else {
        setError(response.data.description || "Erreur enregistrement.");
      }
    } catch (err: any) {
      setError(err.response?.data?.description || "Erreur réseau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '550px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <Card padding="none">
          <div style={{ background: '#fff', color: '#1e293b', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{piece ? 'Modifier la pièce' : 'Nouvelle pièce'}</h3>
            <button 
              onClick={onClose} 
              style={{ 
                 background: 'transparent', 
                 border: 'none', 
                 color: '#64748b', 
                 width: '32px', 
                 height: '32px', 
                 cursor: 'pointer', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center',
                 transition: '0.2s',
                 padding: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
            {/* --- SECTION INFOS --- */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Nom de la pièce</label>
              <input name="nom" value={formData.nom} onChange={handleInputChange} style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', color: '#1e293b' }} placeholder="Ex: Plaquettes de frein Performance" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Référence</label>
                <input name="reference" value={formData.reference} onChange={handleInputChange} style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', color: '#1e293b' }} placeholder="REF-000" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Catégorie</label>
                <select 
                  name="categorieId" 
                  value={formData.categorieId} 
                  onChange={handleInputChange} 
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '10px', 
                    fontSize: '0.95rem', 
                    background: '#fff',
                    color: '#1e293b',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Choisir --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id} style={{ color: '#1e293b' }}>
                      {c.libelle}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Prix (FCFA)</label>
                <input type="number" name="prixUnitaire" value={formData.prixUnitaire ?? ''} onChange={handleInputChange} style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Stock Initial</label>
                <input type="number" name="quantiteStock" value={formData.quantiteStock ?? ''} onChange={handleInputChange} style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' }} required />
              </div>
            </div>

            {/* --- SECTION IMAGE --- */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Image de la pièce</label>
              <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '10px', minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                {formData.imageUrl ? (
                  <div style={{ position: 'relative', width: '100%', height: '180px', background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img src={getImageUrl(formData.imageUrl)!} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <button type="button" onClick={() => setFormData({...formData, imageUrl: null})} style={{ position: 'absolute', bottom: '10px', right: '10px', background: '#ef4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Trash2 size={16} /> Supprimer
                    </button>
                  </div>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: '#94a3b8' }}>
                    {uploading ? <Loader2 className="animate-spin" size={32} /> : <><Upload size={32} style={{ marginBottom: '10px' }} /> <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Cliquez pour choisir une image</span></>}
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>

            {error && <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} /> {error}
            </div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} style={{ padding: '12px 24px' }}>Annuler</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting || uploading} style={{ padding: '12px 30px', fontWeight: 700 }}>
                {isSubmitting ? 'Enregistrement...' : piece ? 'Mettre à jour' : 'Ajouter la pièce'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminPieceForm;
