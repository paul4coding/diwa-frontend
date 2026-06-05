import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Camera, 
  Car, 
  Info,
  CheckCircle,
  Hash,
  Gauge,
  User
} from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'

export default function EnregistrementTechnique() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    vehiculeImmatriculation: '',
    vehiculeNumeroChassis: '',
    vehiculeMarque: '',
    vehiculeModele: '',
    vehiculeAnnee: new Date().getFullYear(),
    vehiculeKilometrage: 0,
    vehiculeCouleur: '',
    vehiculeCarburant: 'ESSENCE',
    vehiculeBoiteVitesse: 'AUTOMATIQUE',
    photoPlaqueUrl: '',
    observationsArrivee: ''
  })

  const { data: responseTechs } = useQuery({
    queryKey: ['techniciens'],
    queryFn: () => axiosInstance.get('/api/v1/techniciens/all').then(res => res.data)
  })
  const techniciens = responseTechs?.data || []

  const { data: demande, isLoading } = useQuery({
    queryKey: ['demande-details', id],
    queryFn: () => axiosInstance.get(`/api/v1/demandes/${id}`).then(res => {
      const d = res.data
      setFormData(prev => ({
        ...prev,
        vehiculeImmatriculation: d.vehiculeImmatriculation || '',
        vehiculeMarque: d.vehiculeMarque || '',
        vehiculeModele: d.vehiculeModele || '',
        vehiculeAnnee: d.vehiculeAnnee || new Date().getFullYear(),
        vehiculeKilometrage: d.vehiculeKilometrage || 0,
        vehiculeCouleur: d.vehiculeCouleur || '',
        vehiculeNumeroChassis: d.vehiculeNumeroChassis || '',
      }))
      return d
    })
  })

  const mutation = useMutation({
    mutationFn: (data: any) => axiosInstance.put(`/api/v1/demandes/${id}/enregistrer-technique`, data),
    onSuccess: () => {
      alert("Véhicule enregistré avec succès !")
      navigate('/admin/atelier/dashboard')
    },
    onError: (err: any) => {
      console.error("Erreur enregistrement:", err)
      alert("Erreur lors de l'enregistrement : " + (err.response?.data?.message || "Le serveur a rencontré un problème."))
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
        ...formData
    })
  }

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL ?? 'http://localhost:8181'}/uploads/${url}`;
  };

  if (isLoading) return <div className="p-20 text-center">Chargement...</div>

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: 20, fontWeight: 600 }}>
        <ArrowLeft size={20} /> Retour
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 30 }}>
        <div style={{ background: '#fff', borderRadius: 32, padding: 40, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', border: '1px solid #e2e8f0' }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>📋 Fiche d'Entrée Technique</h1>
                    <p style={{ color: '#64748b', marginTop: 10 }}>Dossier {demande?.reference} — Client: <strong>{demande?.clientNom}</strong></p>
                </div>
                <div style={{ background: '#eff6ff', color: '#3b82f6', padding: '10px 20px', borderRadius: 14, fontSize: '0.8rem', fontWeight: 800 }}>
                    CHAUFFEUR: {demande?.chauffeurRecuperationNom || 'N/A'}
                </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginBottom: 40 }}>
              {/* Colonne Gauche */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="input-group">
                  <label style={{ color: '#ef4444' }}><Hash size={16} /> Immatriculation *</label>
                  <input 
                    value={formData.vehiculeImmatriculation}
                    onChange={e => setFormData({...formData, vehiculeImmatriculation: e.target.value.toUpperCase()})}
                    required
                    style={{ border: '2px solid #fed7d7' }}
                    placeholder="Ex: TG-1234-AX"
                  />
                  <small style={{ color: '#64748b', fontSize: '0.7rem' }}>Saisie obligatoire pour l'identification</small>
                </div>
                <div className="input-group">
                  <label style={{ color: '#ef4444' }}><Info size={16} /> Numéro de Châssis (VIN) *</label>
                  <input 
                    value={formData.vehiculeNumeroChassis}
                    onChange={e => setFormData({...formData, vehiculeNumeroChassis: e.target.value.toUpperCase()})}
                    required
                    style={{ border: '2px solid #fed7d7' }}
                    placeholder="Saisir les 17 caractères..."
                  />
                  <small style={{ color: '#64748b', fontSize: '0.7rem' }}>Vérifiez sur le montant de porte ou pare-brise</small>
                </div>
                <div className="input-group">
                  <label><Car size={16} /> Marque</label>
                  <input 
                    value={formData.vehiculeMarque}
                    onChange={e => setFormData({...formData, vehiculeMarque: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label><Car size={16} /> Modèle</label>
                  <input 
                    value={formData.vehiculeModele}
                    onChange={e => setFormData({...formData, vehiculeModele: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Colonne Droite */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="input-group">
                  <label><Gauge size={16} /> Kilométrage Réel</label>
                  <input 
                    type="number"
                    value={formData.vehiculeKilometrage}
                    onChange={e => setFormData({...formData, vehiculeKilometrage: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                  <div className="input-group">
                    <label>Énergie</label>
                    <select value={formData.vehiculeCarburant} onChange={e => setFormData({...formData, vehiculeCarburant: e.target.value})}>
                      <option value="ESSENCE">Essence</option>
                      <option value="DIESEL">Diesel</option>
                      <option value="HYBRIDE">Hybride</option>
                      <option value="ELECTRIQUE">Électrique</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Boîte</label>
                    <select value={formData.vehiculeBoiteVitesse} onChange={e => setFormData({...formData, vehiculeBoiteVitesse: e.target.value})}>
                      <option value="AUTOMATIQUE">Automatique</option>
                      <option value="MANUELLE">Manuelle</option>
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>Couleur</label>
                  <input value={formData.vehiculeCouleur} onChange={e => setFormData({...formData, vehiculeCouleur: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Année de mise en circulation</label>
                  <input type="number" value={formData.vehiculeAnnee} onChange={e => setFormData({...formData, vehiculeAnnee: parseInt(e.target.value)})} />
                </div>
              </div>
            </div>

            {/* Observations */}
            <div className="input-group" style={{ marginBottom: 40 }}>
              <label>Observations Techniques & État du Véhicule</label>
              <textarea 
                rows={4} 
                value={formData.observationsArrivee}
                onChange={e => setFormData({...formData, observationsArrivee: e.target.value})}
                placeholder="Décrivez l'état visuel et mécanique à l'arrivée..."
              />
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              <button 
                type="submit" 
                disabled={mutation.isPending}
                style={{ flex: 1, padding: '20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 20, fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 10px 20px rgba(15, 23, 42, 0.2)' }}
              >
                {mutation.isPending ? 'Enregistrement...' : <><CheckCircle size={22} /> CONFIRMER L'ENREGISTREMENT TECHNIQUE</>}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar : Rappel Diagnostic uniquement */}
        <div style={{ position: 'sticky', top: 40, height: 'fit-content' }}>
            <div style={{ background: '#fff', borderRadius: 24, padding: 25, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 15px', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: '#1e293b' }}>
                    <Info size={18} color="#f59e0b" /> Rappel Diagnostic
                </h3>
                <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                    {demande?.descriptionProbleme}
                </div>
            </div>
        </div>
      </div>

      <style>{`
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group label { font-size: 14px; font-weight: 700; color: #64748b; display: flex; align-items: center; gap: 6px; }
        .input-group input, .input-group select, .input-group textarea { 
          padding: 14px 18px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 15px; font-weight: 600; outline: none; transition: all 0.2s;
        }
        .input-group input:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
      `}</style>
    </div>
  )
}
