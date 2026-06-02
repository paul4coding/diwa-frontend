import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { 
  Car, 
  Clock, 
  MapPin, 
  FileText, 
  Download, 
  ArrowLeft,
  Activity,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Settings,
  ChevronRight,
  User,
  Phone,
  Mail,
  Check,
  X,
  Eye
} from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import axiosInstance from '../../utils/axiosInstance'
import Badge from '../../components/ui/Badge'
import ChatAtelier from '../../components/atelier/ChatAtelier'

export default function DemandeSuiviPage() {
  const { uuid } = useParams()
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  
  // Effet Parallaxe pour le header
  const y1 = useTransform(scrollY, [0, 500], [0, 200])

  const { data: demande, isLoading, refetch } = useQuery({
    queryKey: ['demande-client', uuid],
    queryFn: () => axiosInstance.get(`/api/v1/demandes/${uuid}`).then(res => res.data)
  })

  const mutationApprouver = useMutation({
    mutationFn: (data: { approuve: boolean, motifRefus?: string }) => 
      axiosInstance.put(`/api/v1/atelier/missions/${demande.missionId}/approbation?approuve=${data.approuve}${data.motifRefus ? `&motifRefus=${data.motifRefus}` : ''}`),
    onSuccess: () => refetch()
  })

  const getFullUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${axiosInstance.defaults.baseURL?.replace('/api', '')}${path}`;
  };

  const getStatutInfo = (statut: string) => {
    switch (statut) {
      case 'SOUMISE': return { label: 'Demande envoyée', color: '#64748b' }
      case 'CHAUFFEUR_ASSIGNE': return { label: 'Chauffeur assigné', color: '#3b82f6' }
      case 'CHAUFFEUR_EN_ROUTE': return { label: 'Chauffeur en route', color: '#3b82f6' }
      case 'CHAUFFEUR_ARRIVE_CHEZ_CLIENT': return { label: 'Chauffeur sur place', color: '#10b981' }
      case 'VEHICULE_EN_TRANSIT': return { label: 'Véhicule en transit', color: '#10b981' }
      case 'VEHICULE_RECU': return { label: 'Arrivé à DIWA', color: '#10b981' }
      case 'EN_ENREGISTREMENT': return { label: 'Mise en atelier', color: '#3b82f6' }
      case 'EN_RECEPTION': return { label: 'Mise en atelier', color: '#3b82f6' }
      case 'EN_DIAGNOSTIC': return { label: 'Expertise & Diagnostic', color: '#f59e0b' }
      case 'EN_ATTENTE_CLIENT': return { label: 'Validation du Devis', color: '#ef4444' }
      case 'SELECTION_RECUE': return { label: 'Facture en attente de validation', color: '#f59e0b' }
      case 'PROFORMA_VALIDE': return { label: 'Prêt pour affectation', color: '#3b82f6' }
      case 'CONFIRME': return { label: 'Prêt pour affectation', color: '#3b82f6' }
      case 'EN_COURS_REPARATION': return { label: 'Travaux en cours', color: '#3b82f6' }
      case 'PRET': return { label: 'Véhicule prêt ✅', color: '#10b981' }
      case 'EN_LIVRAISON': return { label: 'Véhicule en cours de livraison 🚚', color: '#3b82f6' }
      case 'CLOTURE': return { label: 'Dossier clôturé', color: '#10b981' }
      default: return { label: statut, color: '#3b82f6' }
    }
  }

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (isLoading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
       <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 40, height: 40, border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  )
  
  if (!demande) return <div className="p-20 text-center">Dossier introuvable.</div>

  const statutInfo = getStatutInfo(demande.statut)
  const hasProForma = !!demande.proFormaId

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
      
      {/* Header Parallaxe */}
      <div style={{ position: 'relative', height: isMobile ? '350px' : '450px', overflow: 'hidden', background: '#0f172a' }}>
        <motion.div style={{ y: y1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
          <div style={{ 
            width: '100%', height: '120%', 
            backgroundImage: 'url("https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4
          }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, #f8fafc, transparent)' }} />
        </motion.div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '0 20px' : '0 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: isMobile ? 30 : 60 }}>
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/mon-espace')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', padding: isMobile ? '10px 18px' : '12px 24px', borderRadius: '14px', cursor: 'pointer',
              marginBottom: isMobile ? 20 : 40, width: 'fit-content', fontWeight: 700, fontSize: isMobile ? 12 : 14
            }}
          >
            <ArrowLeft size={18} /> Retour à mon espace
          </motion.button>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 10 }}>
              <Badge style={{ background: statutInfo.color, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 900, fontSize: isMobile ? 10 : 12 }}>
                {statutInfo.label.toUpperCase()}
              </Badge>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: isMobile ? 12 : 14 }}>Ref: {demande.reference}</span>
            </div>
            <h1 style={{ fontSize: isMobile ? '2.2rem' : '4rem', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1 }}>
                {demande.vehiculeMarque} <span style={{ color: '#3b82f6' }}>{demande.vehiculeModele}</span>
            </h1>
            {!isMobile && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', marginTop: 15, maxWidth: 600 }}>Suivez l'évolution technique de votre véhicule en temps réel avec nos experts DIWA.</p>}
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '-40px auto 0', padding: isMobile ? '0 15px' : '0 24px', position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 30 }}>
          
          {/* Main Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 30 }}>
            
            {/* Quick Actions / Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 15 }}>
              <StatCard icon={<Calendar size={20} />} label="Date de demande" value={demande.createDate ? new Date(demande.createDate).toLocaleDateString() : 'En attente'} />
              <StatCard icon={<Settings size={20} />} label="Immatriculation" value={demande.vehiculeImmatriculation || 'En attente'} />
              <StatCard icon={<Activity size={20} />} label="Niveau d'urgence" value={demande.urgence} />
            </div>

            {/* Section Approbation Checking */}
            {demande.missionStatut === 'CHECKING_SOUMIS' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ background: '#fff', borderRadius: 32, padding: isMobile ? 25 : 40, border: '2px solid #3b82f6', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.1)' }}
              >
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 15, marginBottom: 30 }}>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: isMobile ? '1.2rem' : '1.5rem' }}>📸 Validation de l'état</h3>
                    <p style={{ color: '#64748b', margin: '5px 0 0', fontSize: 13 }}>Vérifiez les photos prises par le chauffeur.</p>
                  </div>
                  <Badge variant="warning">ATTENTE VALIDATION</Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 10, marginBottom: 30 }}>
                  {[
                    { label: 'AVANT', url: demande.checkingPhotoAvant },
                    { label: 'ARRIÈRE', url: demande.checkingPhotoArriere },
                    { label: 'GAUCHE', url: demande.checkingPhotoGauche },
                    { label: 'DROITE', url: demande.checkingPhotoDroit }
                  ].map((img, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3', background: '#f1f5f9' }}>
                      <img src={getFullUrl(img.url)} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 15 }}>
                  <button 
                    onClick={() => mutationApprouver.mutate({ approuve: true })}
                    disabled={mutationApprouver.isPending}
                    style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', padding: '16px', borderRadius: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                  >
                    <Check size={20} /> Valider
                  </button>
                  <button 
                    onClick={() => {
                      const motif = prompt("Motif du refus ?");
                      if (motif) mutationApprouver.mutate({ approuve: false, motifRefus: motif });
                    }}
                    disabled={mutationApprouver.isPending}
                    style={{ background: '#fff', color: '#ef4444', border: '2px solid #ef4444', padding: '16px', borderRadius: 16, fontWeight: 800, cursor: 'pointer' }}
                  >
                    Refuser
                  </button>
                </div>
              </motion.div>
            )}

            {/* Timeline Wrapper */}
            <div style={{ background: '#fff', borderRadius: isMobile ? 24 : 32, padding: isMobile ? 25 : 40, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
               <Timeline demande={demande} isMobile={isMobile} />
            </div>

            {hasProForma && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', borderRadius: 24, padding: isMobile ? 20 : 30, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', color: '#fff', gap: 20 }}
              >
                <div>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: isMobile ? '1.1rem' : '1.25rem' }}>Devis Pro Forma Disponible</h3>
                  <p style={{ opacity: 0.8, margin: '5px 0 0', fontSize: isMobile ? 13 : 14 }}>Veuillez consulter et valider le devis.</p>
                </div>
                <Link to={`/mes-demandes/${uuid}/proforma/${demande.proFormaId}`} style={{ background: '#fff', color: '#1e40af', padding: isMobile ? '12px 20px' : '16px 32px', borderRadius: 16, fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                  <FileText size={18} /> Voir le Devis <ChevronRight size={16} />
                </Link>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ width: isMobile ? '100%' : '380px', display: 'flex', flexDirection: 'column', gap: 30 }}>
            <div style={{ background: '#fff', borderRadius: isMobile ? 24 : 32, padding: 25, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
               <h3 style={{ margin: '0 0 20px', fontWeight: 800, fontSize: '1.2rem' }}>Chat Technique</h3>
               <ChatAtelier demandeId={demande.id} />
            </div>

            {(demande.chauffeurRecuperationNom || demande.chauffeurLivraisonNom) && (
              <div style={{ background: '#fff', borderRadius: 24, padding: 25, border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.1rem' }}>
                  <User size={18} color="#3b82f6" /> Votre Chauffeur
                </h3>
                
                {demande.chauffeurRecuperationNom && (
                  <div style={{ marginBottom: 15 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Récupération</div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{demande.chauffeurRecuperationNom}</div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: any) {
  return (
    <div style={{ background: '#fff', padding: 25, borderRadius: 24, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 15 }}>
      <div style={{ background: '#f1f5f9', padding: 12, borderRadius: 12, color: '#3b82f6' }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{value}</div>
      </div>
    </div>
  )
}

function Timeline({ demande, isMobile }: { demande: any, isMobile?: boolean }) {
  const statut = demande.statut;
  const steps = [
    { key: 'SOUMISE', label: 'Demande envoyée', desc: 'Votre demande a été réceptionnée par DIWA.' },
    { key: 'CHAUFFEUR_ASSIGNE', label: 'Chauffeur assigné', desc: 'Un chauffeur a été désigné pour récupérer votre véhicule.' },
    { key: 'CHAUFFEUR_EN_ROUTE', label: 'Chauffeur en route', desc: 'Le chauffeur est en déplacement vers votre position.' },
    { key: 'CHAUFFEUR_ARRIVE_CHEZ_CLIENT', label: 'Chauffeur sur place', desc: 'Le chauffeur est arrivé pour le checking du véhicule.' },
    { key: 'VEHICULE_EN_TRANSIT', label: 'Véhicule en transit', desc: 'Votre véhicule est en route vers notre centre technique.' },
    { key: 'VEHICULE_RECU', label: 'Arrivé à DIWA', desc: 'Votre véhicule est bien arrivé au centre technique.' },
    { key: 'EN_RECEPTION', label: 'Mise en atelier', desc: 'Prise en charge officielle par l\'équipe de réception.' },
    { key: 'EN_DIAGNOSTIC', label: 'Expertise & Diagnostic', desc: 'Nos techniciens analysent l\'état complet du véhicule.' },
    { key: 'EN_ATTENTE_CLIENT', label: 'Validation du Devis', desc: 'Le devis est prêt. Veuillez valider les travaux à effectuer.' },
    { key: 'SELECTION_RECUE', label: 'Facture en attente de validation', desc: 'Nous avons bien reçu vos choix. La facture est en cours de validation finale.' },
    { key: 'PROFORMA_VALIDE', label: 'Prêt pour affectation', desc: 'Votre facture est validée. Nous planifions l\'intervention.' },
    { key: 'EN_COURS_REPARATION', label: 'Travaux en cours', desc: 'Les réparations validées sont en cours de réalisation.' },
    { key: 'PRET', label: 'Véhicule prêt', desc: 'Le véhicule est prêt.' },
    ...(demande.demandeLivraison ? [
      { key: 'EN_LIVRAISON', label: 'Véhicule en livraison', desc: 'Le chauffeur ramène votre véhicule à votre domicile.' }
    ] : [])
  ]

  const getCurrentStepIndex = () => {
    if (statut === 'CLOTURE') return steps.length
    if (statut === 'EN_LIVRAISON') return steps.findIndex(s => s.key === 'EN_LIVRAISON')
    if (statut === 'PRET') return steps.findIndex(s => s.key === 'PRET')
    if (statut === 'EN_COURS_REPARATION') return steps.findIndex(s => s.key === 'EN_COURS_REPARATION')
    
    if (demande.proFormaStatut === 'VALIDE_FINAL') return steps.findIndex(s => s.key === 'PROFORMA_VALIDE')
    if (demande.proFormaStatut === 'CONFIRME_CLIENT') return steps.findIndex(s => s.key === 'SELECTION_RECUE')
    if (statut === 'EN_ATTENTE_CLIENT') return steps.findIndex(s => s.key === 'EN_ATTENTE_CLIENT')

    const idx = steps.findIndex(s => s.key === statut)
    if (idx !== -1) return idx
    
    if (statut === 'CHECKING_SOUMIS' || statut === 'CHECKING_APPROUVE') return 3
    if (statut === 'EN_ENREGISTREMENT' || statut === 'EN_RECEPTION') return 6
    if (statut === 'PROFORMA_V1' || statut === 'PROFORMA_V2') return 8
    
    return 0
  }

  const currentIdx = getCurrentStepIndex()

  return (
    <div>
      <h3 style={{ marginBottom: isMobile ? 25 : 40, fontWeight: 900, color: '#0f172a', fontSize: isMobile ? '1.2rem' : '1.5rem' }}>État d'avancement</h3>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {steps.map((step, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ display: 'flex', gap: isMobile ? 15 : 25, minHeight: isMobile ? 70 : 90 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ 
                width: isMobile ? 20 : 28, height: isMobile ? 20 : 28, borderRadius: '50%', 
                background: i <= currentIdx ? '#3b82f6' : '#fff',
                border: i <= currentIdx ? (isMobile ? '4px solid #dbeafe' : '6px solid #dbeafe') : '2px solid #e2e8f0',
                zIndex: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {i < currentIdx && <CheckCircle2 size={isMobile ? 10 : 14} color="#fff" />}
              </div>
              {i < steps.length - 1 && <div style={{ width: 2, flex: 1, background: i < currentIdx ? '#3b82f6' : '#f1f5f9', margin: '4px 0' }}></div>}
            </div>
            <div style={{ paddingBottom: isMobile ? 20 : 40 }}>
              <div style={{ fontWeight: 800, fontSize: isMobile ? 14 : 17, color: i <= currentIdx ? '#0f172a' : '#94a3b8' }}>{step.label}</div>
              {!isMobile && <div style={{ fontSize: 14, color: i <= currentIdx ? '#64748b' : '#cbd5e1', marginTop: 4 }}>{step.desc}</div>}
              {i === currentIdx && <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} style={{ display: 'inline-block', marginTop: 5, background: '#dbeafe', color: '#1e40af', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Actuel</motion.div>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
