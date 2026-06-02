import React, { useState, useEffect } from 'react';
import { 
  Wrench, Calendar, Clock, Car, ChevronRight, 
  CheckCircle, ChevronLeft, MapPin, Phone, ShieldCheck,
  ClipboardList, Settings, Zap, Shield, Package,
  AlertCircle, AlertTriangle, AlertOctagon
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import PageHero from '../components/common/PageHero';
import './GaragePage.css';

const SAV_CATEGORIES = [
  {
    id: "mecanique",
    label: "Mécanique & Moteur",
    icon: <Wrench size={24} strokeWidth={1.5} />,
    details: [
      "Démarrage difficile ou impossible",
      "Bruit suspect au roulage",
      "Perte de puissance moteur",
      "Fuite de liquide (huile, eau)",
      "Problème de freinage"
    ]
  },
  {
    id: "electronique",
    label: "Électronique & Bord",
    icon: <Zap size={24} strokeWidth={1.5} />,
    details: [
      "Voyant allumé sur le tableau de bord",
      "Dysfonctionnement des phares/LED",
      "Problème d'écran tactile ou GPS",
      "Caméra de recul ou radars HS",
      "Verrouillage centralisé défaillant"
    ]
  },
  {
    id: "entretien",
    label: "Entretien & Révision",
    icon: <Settings size={24} strokeWidth={1.5} />,
    details: [
      "Vidange et filtres",
      "Révision périodique (10k, 20k, 50k km)",
      "Remplacement de batterie",
      "Parallélisme et pneumatiques"
    ]
  },
  {
    id: "carrosserie",
    label: "Carrosserie & Esthétique",
    icon: <Shield size={24} strokeWidth={1.5} />,
    details: [
      "Réparation suite à un choc",
      "Peinture et rayures",
      "Bris de glace (pare-brise, vitres)",
      "Problème d'étanchéité"
    ]
  },
  {
    id: "pieces",
    label: "Pièces Détachées",
    icon: <Package size={24} strokeWidth={1.5} />,
    details: [
      "Demande de devis pour pièce spécifique",
      "Suivi de commande de pièce",
      "Retour de pièce défectueuse"
    ]
  },
  {
    id: "autre",
    label: "Autre",
    icon: <ClipboardList size={24} strokeWidth={1.5} />,
    details: [
      "Autre problème non listé",
      "Demande de renseignement technique",
      "Prise de contact générale"
    ]
  }
];

const URGENCY_LEVELS = [
  { id: "NORMALE", label: "Normal - Entretien à planifier", icon: <AlertCircle size={28} strokeWidth={1.5} /> },
  { id: "URGENTE", label: "Important - Défaut constaté", icon: <AlertTriangle size={28} strokeWidth={1.5} /> },
  { id: "TRES_URGENTE", label: "Urgent - Véhicule immobilisé", icon: <AlertOctagon size={28} strokeWidth={1.5} /> }
];

const GaragePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<any[]>([]);
  const [creneaux, setCreneaux] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedTheme, setSelectedTheme] = useState<any>(null);
  const [selectedDetails, setSelectedDetails] = useState<string[]>([]);
  const [urgency, setUrgency] = useState("NORMALE");
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [technicalInfo, setTechnicalInfo] = useState({ 
    immat: '', 
    marque: '',
    modele: '', 
    vin: '', 
    kilometrage: '',
    description: '',
    adresseRecuperation: '',
    contactRecuperation: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servRes = await axiosInstance.get('/api/v1/servicesav/all');
        if (servRes.data.statut === 200) {
            setServices(servRes.data.data);
        }
      } catch (err) {
        console.error("Erreur services SAV:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const fetchSlotsForDate = async (date: string) => {
    try {
      const res = await axiosInstance.get(`/api/v1/creneaux/disponibles?date=${date}`);
      setCreneaux(res.data.slots || []);
    } catch (err) {
      console.error("Erreur slots:", err);
      setCreneaux([]);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchSlotsForDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    gsap.fromTo('.step-content', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5 });
  }, [step]);

  const toggleDetail = (detail: string) => {
    if (selectedDetails.includes(detail)) {
      setSelectedDetails(selectedDetails.filter(d => d !== detail));
    } else {
      setSelectedDetails([...selectedDetails, detail]);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot || !selectedTheme) return;
    setIsSubmitting(true);
    try {
      const problemDesc = `Catégorie: ${selectedTheme.label}\nDétails: ${selectedDetails.join(', ')}\nNotes: ${technicalInfo.description}`;
      
      const payload = {
        vehiculeMarque: technicalInfo.marque || 'À préciser',
        vehiculeModele: technicalInfo.modele || 'À préciser',
        vehiculeImmatriculation: technicalInfo.immat || 'INCONNU',
        vehiculeNumeroChassis: technicalInfo.vin,
        vehiculeKilometrage: parseInt(technicalInfo.kilometrage) || 0,
        descriptionProbleme: problemDesc,
        urgence: urgency,
        demandeRecuperation: true, 
        dateRecuperation: selectedDate,
        creneauId: selectedSlot.id,
        adresseRecuperation: technicalInfo.adresseRecuperation,
        contactRecuperation: technicalInfo.contactRecuperation,
        noteDisponibiliteClient: "Demande faite via le portail web"
      };

      const response = await axiosInstance.post('/api/v1/demandes', payload);
      if (response.status === 201) {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Erreur lors de la réservation:", err);
      alert("Une erreur est survenue lors de la création de votre demande d'intervention.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Générer les 7 prochains jours
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });

  if (success) {
    return (
      <div className="garage-success-container">
        <div className="success-card">
          <div className="success-icon-box">
            <CheckCircle size={80} color="#10b981" />
          </div>
          <h1 className="serif">Demande SAV Transmise</h1>
          <p>Nos experts techniques analysent vos informations pour préparer votre accueil.</p>
          <div className="summary-box">
            <div className="summary-item"><span>Catégorie:</span> <strong>{selectedTheme?.label}</strong></div>
            <div className="summary-item"><span>Urgence:</span> <strong>{URGENCY_LEVELS.find(u => u.id === urgency)?.label}</strong></div>
            <div className="summary-item"><span>Rendez-vous:</span> <strong>{new Date(selectedDate).toLocaleDateString()} à {selectedSlot?.debut}</strong></div>
          </div>
          <Button variant="primary" onClick={() => window.location.href = '/'}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="garage-page-wrapper">
      <PageHero
        tag="Service Après-Vente"
        titleWords={['Expertise', 'Technique', 'Elite']}
        subtitle="Diagnostiquez votre besoin et réservez l'excellence technique en quelques clics."
        bgImage="/paralax1.png"
        height="60vh"
      />

      <div className="garage-container">
        <div className="booking-wizard">
          <div className="wizard-steps">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`step-dot ${step >= s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
                {step > s ? <CheckCircle size={16} /> : s}
                <span className="step-label">{s === 1 ? 'Besoin' : s === 2 ? 'Diagnostic' : s === 3 ? 'Planning' : 'Final'}</span>
              </div>
            ))}
          </div>

          <div className="step-content">
            {/* STEP 1: CATEGORY */}
            {step === 1 && (
              <div className="step-inner">
                <h2 className="step-title">Quelle est la thématique principale ?</h2>
                <div className="themes-grid">
                  {SAV_CATEGORIES.map(category => (
                    <div 
                      key={category.id} 
                      className={`theme-card ${selectedTheme?.id === category.id ? 'selected' : ''}`}
                      onClick={() => { setSelectedTheme(category); setSelectedDetails([]); }}
                    >
                      <div className="theme-label">
                        <div className="theme-icon-container">{category.icon}</div>
                        <span>{category.label}</span>
                      </div>
                      {selectedTheme?.id === category.id && <div className="selected-badge"><CheckCircle size={16} /></div>}
                    </div>
                  ))}
                </div>
                <div className="wizard-actions">
                  <Button variant="primary" disabled={!selectedTheme} onClick={() => setStep(2)}>
                    Diagnostiquer <ChevronRight size={18} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: DIAGNOSTIC DETAILS */}
            {step === 2 && (
              <div className="step-inner">
                <h2 className="step-title">Détails du diagnostic</h2>
                
                <div className="diagnostic-section">
                   <h4 className="sub-header">Précisions sur le problème</h4>
                   <div className="details-checklist">
                      {selectedTheme?.details.map((detail: string) => (
                        <label key={detail} className={`detail-item ${selectedDetails.includes(detail) ? 'checked' : ''}`}>
                           <input 
                               type="checkbox" 
                               checked={selectedDetails.includes(detail)}
                               onChange={() => toggleDetail(detail)}
                           />
                           <span>{detail}</span>
                        </label>
                      ))}
                   </div>
                </div>

                <div className="diagnostic-section" style={{ marginTop: '30px' }}>
                   <h4 className="sub-header">Degré d'urgence</h4>
                   <div className="urgency-selector">
                      {URGENCY_LEVELS.map(level => (
                        <div 
                          key={level.id} 
                          className={`urgency-item ${urgency === level.id ? 'active' : ''} ${level.id}`}
                          onClick={() => setUrgency(level.id)}
                        >
                           <span className="u-icon">{level.icon}</span>
                           <span className="u-label">{level.label.split(' - ')[0]}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="technical-grid-elite" style={{ marginTop: '30px' }}>
                    <div className="form-group-elite">
                       <label>Marque du véhicule</label>
                       <input 
                         type="text" 
                         placeholder="Ex: Toyota, Mercedes..." 
                         value={technicalInfo.marque}
                         onChange={(e) => setTechnicalInfo({...technicalInfo, marque: e.target.value})}
                       />
                    </div>
                    <div className="form-group-elite">
                       <label>Modèle du véhicule</label>
                       <input 
                         type="text" 
                         placeholder="Ex: Corolla, Classe C..." 
                         value={technicalInfo.modele}
                         onChange={(e) => setTechnicalInfo({...technicalInfo, modele: e.target.value})}
                       />
                    </div>
                    <div className="form-group-elite">
                       <label>Immatriculation</label>
                       <input 
                         type="text" 
                         placeholder="Ex: TG-0000-AZ" 
                         value={technicalInfo.immat}
                         onChange={(e) => setTechnicalInfo({...technicalInfo, immat: e.target.value.toUpperCase()})}
                       />
                    </div>
                    <div className="form-group-elite">
                       <label>Numéro de Châssis (VIN)</label>
                       <input 
                         type="text" 
                         placeholder="17 caractères..." 
                         value={technicalInfo.vin}
                         onChange={(e) => setTechnicalInfo({...technicalInfo, vin: e.target.value.toUpperCase()})}
                         maxLength={17}
                       />
                    </div>
                    <div className="form-group-elite">
                       <label>Kilométrage actuel</label>
                       <input 
                         type="number" 
                         placeholder="Ex: 45000" 
                         value={technicalInfo.kilometrage}
                         onChange={(e) => setTechnicalInfo({...technicalInfo, kilometrage: e.target.value})}
                       />
                    </div>
                    <div className="form-group-elite full-width">
                       <label>Adresse de récupération</label>
                       <input 
                         type="text" 
                         placeholder="Quartier, Rue, Maison..." 
                         value={technicalInfo.adresseRecuperation}
                         onChange={(e) => setTechnicalInfo({...technicalInfo, adresseRecuperation: e.target.value})}
                       />
                    </div>
                    <div className="form-group-elite full-width">
                       <label>Contact sur place (Téléphone)</label>
                       <input 
                         type="text" 
                         placeholder="Ex: (+228) 90 00 00 00" 
                         value={technicalInfo.contactRecuperation}
                         onChange={(e) => setTechnicalInfo({...technicalInfo, contactRecuperation: e.target.value})}
                       />
                    </div>
                    <div className="form-group-elite full-width">
                       <label>Description libre</label>
                       <textarea 
                         placeholder="Expliquez ici avec vos propres mots..." 
                         value={technicalInfo.description}
                         onChange={(e) => setTechnicalInfo({...technicalInfo, description: e.target.value})}
                         rows={3}
                       />
                    </div>
                </div>

                <div className="wizard-actions">
                  <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft size={18} /> Retour</Button>
                  <Button variant="primary" onClick={() => setStep(3)}>
                    Choisir un créneau <ChevronRight size={18} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: DATE & TIME */}
            {step === 3 && (
              <div className="step-inner">
                <h2 className="step-title">Planifiez votre visite</h2>
                <div style={{ marginBottom: '30px' }}>
                  <h4 className="sub-header">1. Choisir une date de passage</h4>
                  <div className="date-scroll">
                  {availableDates.length > 0 ? availableDates.map((date: any) => (
                    <button 
                      key={date} 
                      className={`date-btn ${selectedDate === date ? 'active' : ''}`}
                      onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                    >
                      <span className="day-name">{new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                      <span className="day-num">{new Date(date).getDate()}</span>
                      <span className="month-name">{new Date(date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                    </button>
                  )) : (
                    <div className="no-dates-error" style={{ textAlign: 'center', padding: '40px', background: '#fef2f2', borderRadius: '20px', color: '#ef4444', border: '1px dashed #ef4444' }}>
                        <Clock size={40} style={{ marginBottom: '15px' }} />
                        <p>Désolé, aucun créneau n'est disponible pour le moment.<br/>Veuillez nous contacter par téléphone au (+228) 90 90 90 90.</p>
                    </div>
                  )}
                  </div>
                </div>

                {!selectedDate && (
                  <div style={{ textAlign: 'center', padding: '30px', border: '1px dashed #cbd5e1', borderRadius: '15px', color: '#64748b', marginTop: '20px' }}>
                     <Calendar size={30} style={{ marginBottom: '10px', opacity: 0.5 }} />
                     <p style={{ margin: 0, fontWeight: 600 }}>Veuillez sélectionner une date ci-dessus pour afficher les horaires disponibles.</p>
                  </div>
                )}

                {selectedDate && (
                  <div style={{ marginTop: '40px' }}>
                    <h4 className="sub-header">2. Choisir un créneau horaire</h4>
                    {loadingSlots ? (
                      <p style={{ textAlign: 'center', padding: '20px' }}>Chargement des créneaux...</p>
                    ) : creneaux.length > 0 ? (
                      <div className="slots-grid">
                        {creneaux.map(slot => (
                          <button 
                            key={slot.id} 
                            className={`slot-btn ${selectedSlot?.id === slot.id ? 'active' : ''} ${slot.statut !== 'DISPONIBLE' ? 'disabled-style' : ''}`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            <div className="slot-time">{slot.libelle}</div>
                            <div className={`slot-status-badge ${slot.statut}`}>
                              {slot.statut === 'DISPONIBLE' ? 'Libre' : (slot.statut === 'COMPLET' ? 'Complet' : 'Fermé')}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '30px', background: '#fef2f2', borderRadius: '15px', color: '#ef4444', border: '1px solid #fecaca' }}>
                        <AlertCircle size={30} style={{ marginBottom: '10px' }} />
                        <p style={{ margin: 0, fontWeight: 600 }}>Désolé, aucune plage horaire n'est configurée pour ce jour.</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>La réception doit configurer les plages dans "Horaires de Travail".</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flexible-planning-notice" style={{ marginTop: '30px', textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                   <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                      Aucun horaire ne vous convient ? Soumettez votre diagnostic et nos équipes vous rappelleront pour convenir d'un rendez-vous.
                   </p>
                   <Button 
                      variant="outline" 
                      style={{ marginTop: '15px' }}
                      onClick={() => { setSelectedSlot({ id: null, debut: 'À confirmer' }); setStep(4); }}
                   >
                      Soumettre sans horaire
                   </Button>
                </div>

                <div className="wizard-actions">
                  <Button variant="outline" onClick={() => setStep(2)}><ChevronLeft size={18} /> Retour</Button>
                  <Button variant="primary" disabled={!selectedSlot} onClick={() => setStep(4)}>
                    Récapitulatif <ChevronRight size={18} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: FINAL SUMMARY */}
            {step === 4 && (
              <div className="step-inner">
                <h2 className="step-title">Résumé de votre demande</h2>
                <Card className="summary-card-elite" padding="lg">
                    <div className="summary-section">
                       <div className="summary-row">
                          <label>Motif SAV</label>
                          <div className="summary-val">{selectedTheme?.label}</div>
                       </div>
                       <div className="summary-row">
                          <label>Urgence</label>
                          <div className={`summary-val urg-label ${urgency}`}>{URGENCY_LEVELS.find(u => u.id === urgency)?.label}</div>
                       </div>
                        <div className="summary-row">
                           <label>Véhicule</label>
                           <div className="summary-val">
                              {technicalInfo.marque || technicalInfo.modele ? 
                                `${technicalInfo.marque} ${technicalInfo.modele} (${technicalInfo.immat || 'S/N'})` : 
                                'Non renseigné'}
                           </div>
                        </div>
                        <div className="summary-row">
                           <label>Châssis (VIN)</label>
                           <div className="summary-val">{technicalInfo.vin || 'Non renseigné'}</div>
                        </div>
                       <div className="summary-row">
                          <label>Rendez-vous</label>
                          <div className="summary-val">
                             {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {selectedSlot?.libelle || selectedSlot?.debut || 'Heure à confirmer'}
                          </div>
                       </div>
                    </div>
                </Card>

                <div className="wizard-actions">
                  <Button variant="outline" onClick={() => setStep(3)}><ChevronLeft size={18} /> Retour</Button>
                  <Button variant="primary" onClick={handleBooking} disabled={isSubmitting}>
                    {isSubmitting ? 'Traitement...' : 'Confirmer le Rendez-vous'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="garage-side-info">
           <Card padding="lg" className="info-card" style={{ borderLeft: '5px solid var(--diwa-blue)', boxShadow: '0 15px 35px rgba(0,0,0,0.05)' }}>
              <h3 style={{ color: 'var(--diwa-blue)', fontWeight: 800, fontSize: '1.2rem', marginBottom: '20px' }}>SAV Haute-Performance</h3>
              <ul className="perks-list">
                 <li><CheckCircle size={16} color="var(--diwa-blue)" /> <span>Prise en charge prioritaire</span></li>
                 <li><CheckCircle size={16} color="var(--diwa-blue)" /> <span>Rapport de diagnostic numérique</span></li>
                 <li><CheckCircle size={16} color="var(--diwa-blue)" /> <span>Expertise Multi-marques</span></li>
                 <li><ShieldCheck size={16} color="var(--diwa-blue)" /> <span>Travaux garantis 12 mois</span></li>
              </ul>
           </Card>


           <div className="contact-mini-card" style={{ 
              marginTop: '20px', 
              background: '#116BAB', 
              color: '#fff', 
              padding: '25px', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              boxShadow: '0 20px 40px rgba(17, 107, 171, 0.22)'
           }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '50%' }}>
                 <Phone size={24} color="#fff" />
              </div>
              <div>
                 <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, margin: 0, fontWeight: 700 }}>SAV Direct</p>
                 <p style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>(+228) 93 25 96 96</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
export default GaragePage;
