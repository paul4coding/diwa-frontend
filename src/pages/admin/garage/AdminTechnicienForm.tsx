import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, Calendar } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface AdminTechnicienFormProps {
  technicien?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminTechnicienForm: React.FC<AdminTechnicienFormProps> = ({ technicien, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: technicien?.nom || '',
    prenom: technicien?.prenom || '',
    email: technicien?.email || '',
    tel: technicien?.tel || '',
    specialite: technicien?.specialite || 'Moteur',
    grade: technicien?.grade || 'Junior',
    chargeTravailMax: technicien?.chargeTravailMax || 8,
    actif: technicien?.actif ?? true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleInitPlanning = async () => {
    if (!technicien?.id) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8181'}/api/garage/techniciens/${technicien.id}/planning/init`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      alert("Planning par défaut (Lundi-Samedi) initialisé avec succès.");
    } catch (err) { alert("Erreur lors de l'initialisation."); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const method = technicien ? 'PUT' : 'POST';
    const url = technicien 
      ? `${import.meta.env.VITE_API_URL ?? 'http://localhost:8181'}/api/v1/techniciens/update/${technicien.id}` 
      : `${import.meta.env.VITE_API_URL ?? 'http://localhost:8181'}/api/v1/techniciens/save`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
      } else {
        const result = await response.json();
        setError(result.message || "Erreur enregistrement.");
      }
    } catch (err) {
      setError("Erreur réseau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '600px' }}>
        <Card padding="none">
          <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>{technicien ? 'Détails du Technicien' : 'Nouveau Technicien'}</h3>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
               <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Prénom</label>
                  <input name="prenom" value={formData.prenom} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} required />
               </div>
               <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Nom</label>
                  <input name="nom" value={formData.nom} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} required />
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
               <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} required />
               </div>
               <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Téléphone</label>
                  <input name="tel" value={formData.tel} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} required />
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
               <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Spécialité</label>
                  <select name="specialite" value={formData.specialite} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <option value="Moteur">Moteur / Mécanique</option>
                    <option value="Electrique">Électrique / Électronique</option>
                    <option value="Carrosserie">Carrosserie / Peinture</option>
                    <option value="Diagnostic">Diagnostic / IA</option>
                  </select>
               </div>
               <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Grade</label>
                  <select name="grade" value={formData.grade} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <option value="Junior">Technicien Junior</option>
                    <option value="Confirme">Technicien Confirmé</option>
                    <option value="Expert">Expert Master</option>
                  </select>
               </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
               <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Charge Max (Interv/jour)</label>
                  <input type="number" name="chargeTravailMax" value={formData.chargeTravailMax} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
               </div>
               <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                  <input type="checkbox" name="actif" checked={formData.actif} onChange={(e) => setFormData({...formData, actif: e.target.checked})} />
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>En service / Actif</label>
               </div>
            </div>

            {technicien && (
              <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                 <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#64748b' }}>Actions Rapides</p>
                 <Button type="button" variant="outline" size="sm" fullWidth icon={<Calendar size={16} />} onClick={handleInitPlanning}>
                    Réinitialiser Planning Hebdomadaire
                 </Button>
              </div>
            )}

            {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <AlertCircle size={16} /> {error}
            </div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
               <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
               <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? '...' : technicien ? 'Sauvegarder' : 'Inscrire Technicien'}
               </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminTechnicienForm;
