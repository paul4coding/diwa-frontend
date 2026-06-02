import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Car, 
  CheckCircle2, 
  Clock, 
  User, 
  Gauge, 
  Info, 
  Hash,
  Camera,
  ClipboardList
} from 'lucide-react'
import axiosInstance from '../../../utils/axiosInstance'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'

export default function DemandeDetailsAdmin() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: demande, isLoading } = useQuery({
    queryKey: ['demande-admin-details', id],
    queryFn: () => axiosInstance.get(`/api/v1/demandes/${id}`).then(res => res.data)
  })

  const mutationValider = useMutation({
    mutationFn: () => axiosInstance.put(`/api/v1/demandes/${id}/valider-reception`),
    onSuccess: () => {
      alert("Enregistrement technique validé ! Le véhicule est maintenant en diagnostic.")
      queryClient.invalidateQueries({ queryKey: ['demandes-reception'] })
      navigate('/admin/sav')
    }
  })

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8181/uploads/${url}`;
  }

  if (isLoading) return <div className="p-20 text-center">Chargement des détails...</div>
  if (!demande) return <div className="p-20 text-center">Dossier introuvable.</div>

  const isAValider = demande.statut === 'EN_ENREGISTREMENT'

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: 25, fontWeight: 700 }}
      >
        <ArrowLeft size={18} /> Retour au SAV
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 30 }}>
        {/* COLONNE GAUCHE : INFOS TECHNIQUES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 40, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
             <header style={{ marginBottom: 35, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>Dossier {demande.reference}</h2>
                    <p style={{ color: '#64748b', marginTop: 5 }}>Client: <strong>{demande.clientNom}</strong></p>
                </div>
                <Badge variant={isAValider ? 'warning' : 'primary'}>{demande.statut}</Badge>
             </header>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <InfoItem icon={<Hash size={16} />} label="Immatriculation" value={demande.vehiculeImmatriculation} color="#ef4444" />
                    <InfoItem icon={<Info size={16} />} label="N° de Châssis (VIN)" value={demande.vehiculeNumeroChassis} />
                    <InfoItem icon={<Car size={16} />} label="Marque & Modèle" value={`${demande.vehiculeMarque} ${demande.vehiculeModele}`} />
                    <InfoItem icon={<Gauge size={16} />} label="Kilométrage" value={`${demande.vehiculeKilometrage?.toLocaleString()} KM`} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <InfoItem icon={<Clock size={16} />} label="Année" value={demande.vehiculeAnnee} />
                    <InfoItem icon={<Info size={16} />} label="Énergie / Boîte" value={`${demande.vehiculeCarburant} / ${demande.vehiculeBoiteVitesse}`} />
                    <InfoItem icon={<User size={16} />} label="Expert Assigné" value={demande.technicienNom || 'Non assigné'} color="#3b82f6" />
                    <InfoItem icon={<User size={16} />} label="Chef Tech" value={demande.chefTechnicienNom} />
                </div>
             </div>

             <div style={{ marginTop: 35, padding: 25, background: '#f8fafc', borderRadius: 20, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: 800, color: '#475569' }}>Observations Techniques</h4>
                <p style={{ margin: 0, color: '#1e293b', lineHeight: 1.6 }}>{demande.observationsArrivee || "Aucune observation technique n'a été saisie."}</p>
             </div>

             {isAValider && (
                <div style={{ marginTop: 40, borderTop: '1px solid #e2e8f0', paddingTop: 30, textAlign: 'right' }}>
                    <Button 
                        variant="success" 
                        size="lg" 
                        icon={<CheckCircle2 size={20} />} 
                        onClick={() => mutationValider.mutate()}
                        disabled={mutationValider.isPending}
                    >
                        {mutationValider.isPending ? 'Validation...' : 'Valider la Réception & Mise en Atelier'}
                    </Button>
                </div>
             )}
          </div>

          {/* PHOTOS RÉCEPTION */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 30, border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 25px', fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Camera size={22} color="#ec4899" /> Photos de Réception (Atelier)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 15 }}>
                <BigPhotoBox label="AVANT" url={demande.receptionPhotoAvant} getUrl={getImageUrl} />
                <BigPhotoBox label="ARRIÈRE" url={demande.receptionPhotoArriere} getUrl={getImageUrl} />
                <BigPhotoBox label="GAUCHE" url={demande.receptionPhotoGauche} getUrl={getImageUrl} />
                <BigPhotoBox label="DROIT" url={demande.receptionPhotoDroit} getUrl={getImageUrl} />
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : RAPPEL CHAUFFEUR & CLIENT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            {/* RAPPEL CLIENT */}
            <div style={{ background: '#fff', borderRadius: 24, padding: 30, border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>Demande Initiale</h3>
                <div style={{ background: '#fef2f2', padding: 20, borderRadius: 16, border: '1px solid #fee2e2' }}>
                    <div style={{ fontWeight: 800, color: '#b91c1c', fontSize: '0.75rem', marginBottom: 8, textTransform: 'uppercase' }}>Problème déclaré :</div>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#7f1d1d', lineHeight: 1.5 }}>{demande.descriptionProbleme}</p>
                </div>
            </div>

            {/* PHOTOS CHAUFFEUR */}
            <div style={{ background: '#fff', borderRadius: 24, padding: 30, border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>État au départ (Chauffeur)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                    <SmallPhotoBox url={demande.checkingPhotoAvant} getUrl={getImageUrl} />
                    <SmallPhotoBox url={demande.checkingPhotoArriere} getUrl={getImageUrl} />
                    <SmallPhotoBox url={demande.checkingPhotoGauche} getUrl={getImageUrl} />
                    <SmallPhotoBox url={demande.checkingPhotoDroit} getUrl={getImageUrl} />
                </div>
                <div style={{ background: '#f8fafc', padding: 15, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                        "{demande.checkingObservations || 'Pas de note chauffeur.'}"
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon, label, value, color }: any) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color || '#64748b' }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{value || 'N/A'}</div>
            </div>
        </div>
    )
}

function BigPhotoBox({ label, url, getUrl }: any) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ height: 180, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer' }} onClick={() => window.open(getUrl(url), '_blank')}>
                {url ? <img src={getUrl(url)} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}><Camera size={30} /></div>}
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginTop: 10, display: 'block' }}>{label}</span>
        </div>
    )
}

function SmallPhotoBox({ url, getUrl }: any) {
    return (
        <div style={{ height: 60, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer' }} onClick={() => window.open(getUrl(url), '_blank')}>
            {url ? <img src={getUrl(url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}><Camera size={16} /></div>}
        </div>
    )
}
