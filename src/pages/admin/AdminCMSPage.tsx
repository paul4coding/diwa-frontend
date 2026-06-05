import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  Layout, 
  Image as ImageIcon, 
  Type, 
  Save, 
  Plus, 
  Trash2,
  ChevronRight,
  Monitor,
  Sparkles,
  Layers,
  MessageCircle,
  Phone,
  Settings,
  Upload,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  MapPin,
  Loader2,
  Calendar,
  Zap,
  Cog,
  Inbox,
  Send as SendIcon,
  CheckCircle,
  Clock,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const AdminCMSPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [cmsData, setCmsData] = useState<any>({
    hero: [
      { id: 1, image: '/MGRX8.png', title: "MG RX8 : Dominez la Route", subtitle: "L'élégance SUV et la puissance réunies." },
      { id: 2, image: '/chevrolet.png', title: "Chevrolet Equinox", subtitle: "Confort Urbain et Technologie." }
    ],
    services: [
      { title: "Véhicules Neufs", desc: "Découvrez nos modèles MG, ISUZU, CHEVROLET et BAIC.", image: "/hero-1.jpg" },
      { title: "Modifier ma voiture", desc: "Personnalisez votre véhicule en temps réel avec nos options.", image: "/hero-2.avif" },
      { title: "Garage & SAV", desc: "Réservez vos entretiens et réparations facilement en ligne.", image: "/sav-bg.jpg" }
    ],
    footer: {
      address: '2556, Boulevard de la paix, Tokoin Aéroport - 08 BP 8535, Lomé-Togo',
      phone: '(+228) 22 61 27 76 / 77 / 78',
      email: 'info@diwatg.com',
      socials: { facebook: 'https://facebook.com/Diwainternational', instagram: 'https://instagram.com/Diwainternational', linkedin: 'https://linkedin.com/company/Diwainternational', twitter: 'https://twitter.com/Diwainternational' }
    },
    about: { 
      title: "L'Excellence Automobile, de l'Intérieur à l'Extérieur", 
      text: "Chez DIWA Internationale, nous sommes passionnés par l'idée de sublimer chaque véhicule...", 
      parallaxImage: '/paralaxForAboutUs.webp',
      image1: '/p1.webp',
      image2: '/p2.webp',
      stats: [
        { label: 'Heures de Travail', value: '1850+' },
        { label: 'Clients Satisfaits', value: '2138+' },
        { label: 'Experts Qualifiés', value: '150+' },
        { label: 'Années d\'Expérience', value: '20+' }
      ]
    },
    products: { title: 'Pièces & Accessoires', subtitle: 'Le meilleur pour votre moteur', bgImage: '/ribbon.png' },
    appointment: { 
      title: "PRENEZ RENDEZ-VOUS", 
      desc: "Réservez votre entretien en ligne dans le confort de votre foyer. Offrez à votre véhicule les meilleurs soins grâce à nos experts DIWA Elite.", 
      bgImage: '/paralaxPrenezRendezVous.webp', 
      sideImage: '/mechanic.jpg' 
    },
    configurator: { 
      title: "Créez votre véhicule idéal", 
      desc: "Visualisez votre voiture sous tous les angles et personnalisez chaque détail grâce à notre configurateur 3D avancé." 
    },
    testimonials: [
      { name: "Jean-Paul M.", role: "Chef d'entreprise", quote: "Une expérience d'achat inégalée au Togo.", avatar: "/assets/profiles/profil1.jpg" },
      { name: "Marc L.", role: "Entrepreneur", quote: "Le service après-vente est exceptionnel.", avatar: "/assets/profiles/profil2.avif" }
    ],
    brands: [
      { name: 'MG', logo: '/assets/brands/MG_Logo.png' },
      { name: 'BAIC', logo: '/assets/brands/BAIC_Logo.png' },
      { name: 'ISUZU', logo: '/assets/brands/ISUZU_Logo.png' },
      { name: 'CHEVROLET', logo: '/assets/brands/CHEVROLET_Logo.png' }
    ]
  });

  // Fetch all CMS data
  const fetchAllCMS = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/v1/cms/all');
      if (response.data.statut === 200) {
        const rawData = response.data.data;
        const mappedData: any = { ...cmsData };
        rawData.forEach((item: any) => {
          try {
            const parsed = JSON.parse(item.jsonContent);
            if (parsed) {
               mappedData[item.contentKey] = parsed;
            }
          } catch (e) {
            console.error(`Erreur parsing CMS ${item.contentKey}`, e);
          }
        });
        setCmsData(mappedData);
      }
    } catch (error) {
      console.error("Erreur chargement CMS:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchAllCMS();
  }, [isAdmin]);

  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await axiosInstance.get('/api/contact/admin/all');
      setMessages(res.data);
    } catch (e) {
      console.error("Erreur messages:", e);
    }
  };

  useEffect(() => {
    if (isAdmin && activeTab === 'messages') {
      fetchMessages();
    }
  }, [isAdmin, activeTab]);

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    setReplyLoading(true);
    try {
      await axiosInstance.post('/api/contact/admin/reply', {
        id: selectedMessage.id,
        reponse: replyText
      });
      alert("Réponse envoyée avec succès !");
      setReplyText("");
      setSelectedMessage(null);
      fetchMessages();
    } catch (e) {
      alert("Erreur lors de l'envoi de la réponse.");
    } finally {
      setReplyLoading(false);
    }
  };

  const handleSaveSection = async (key: string) => {
    setSaveLoading(true);
    try {
      const payload = {
        contentKey: key,
        jsonContent: JSON.stringify(cmsData[key])
      };
      const response = await axiosInstance.post('/api/v1/cms/save', payload);
      if (response.data.statut === 200) {
        alert(`Section ${key} enregistrée avec succès !`);
      }
    } catch (error) {
      console.error(`Erreur sauvegarde ${key}:`, error);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosInstance.post('/api/v1/admin/media/vehicule/image', formData);
      if (response.data.statut === 201) {
        callback(response.data.data.url);
      }
    } catch (error) {
      console.error("Erreur upload image CMS:", error);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <Shield size={64} color="#ef4444" style={{ marginBottom: '20px' }} />
        <h2 style={{ color: '#1e293b' }}>Accès Restreint</h2>
        <p style={{ color: '#64748b' }}>Seuls les administrateurs système peuvent gérer le contenu du site.</p>
      </div>
    );
  }

  const menuItems = [
    { id: 'hero', label: 'Slider Hero', icon: <Monitor size={18} /> },
    { id: 'services', label: 'Services', icon: <Sparkles size={18} /> },
    { id: 'products', label: 'Section Produits', icon: <Layers size={18} /> },
    { id: 'about', label: 'À Propos', icon: <Layout size={18} /> },
    { id: 'appointment', label: 'Section RDV', icon: <Calendar size={18} /> },
    { id: 'configurator', label: 'Configurateur', icon: <Zap size={18} /> },
    { id: 'testimonials', label: 'Témoignages', icon: <MessageCircle size={18} /> },
    { id: 'brands', label: 'Marques & Logos', icon: <Sparkles size={18} /> },
    { id: 'footer', label: 'Infos Footer', icon: <Phone size={18} /> },
    { id: 'messages', label: 'Messages Clients', icon: <Inbox size={18} /> },
  ];

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return path; // Asset local
    return `${import.meta.env.VITE_API_URL ?? 'http://localhost:8181'}/uploads/${path}`;
  };

  return (
    <div className="cms-clean-container">
      <div className="cms-fixed-header">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>Gestion de Contenu</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Interface de personnalisation DIWA.</p>
        </div>
        <button onClick={() => handleSaveSection(activeTab)} className="cms-btn-save" disabled={saveLoading}>
          {saveLoading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Enregistrer cette section</>}
        </button>
      </div>

      <div className="cms-layout-grid">
        <aside className="cms-nav-sidebar">
          {menuItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              className={`cms-tab-btn ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <main className="cms-main-content">
          <AnimatePresence mode="wait">
            {activeTab === 'hero' && (
              <motion.div key="hero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {(cmsData.hero || []).map((slide: any, idx: number) => (
                    <Card key={idx} style={{ padding: '20px' }}>
                      <div className="cms-row">
                         <div className="cms-img-box">
                            <img src={getImageUrl(slide?.image)} alt="" />
                            <input type="file" onChange={(e) => handleImageUpload(e, (url) => {
                                const newHero = [...cmsData.hero];
                                newHero[idx].image = url;
                                setCmsData({...cmsData, hero: newHero});
                            })} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                         </div>
                         <div style={{ flex: 1 }}>
                            <label className="cms-input-label">Titre Slide #{idx + 1}</label>
                            <input 
                              className="cms-input-field" 
                              value={slide?.title || ''} 
                              onChange={(e) => {
                                const newHero = [...cmsData.hero];
                                newHero[idx].title = e.target.value;
                                setCmsData({...cmsData, hero: newHero});
                              }}
                            />
                            <label className="cms-input-label">Sous-titre</label>
                            <textarea 
                              className="cms-text-field" 
                              value={slide?.subtitle || ''} 
                              onChange={(e) => {
                                const newHero = [...cmsData.hero];
                                newHero[idx].subtitle = e.target.value;
                                setCmsData({...cmsData, hero: newHero});
                              }}
                            />
                         </div>
                         <button className="cms-btn-del" onClick={() => {
                           const newHero = cmsData.hero.filter((_: any, i: number) => i !== idx);
                           setCmsData({...cmsData, hero: newHero});
                         }}><Trash2 size={18} /></button>
                      </div>
                    </Card>
                  ))}
                  <button className="cms-btn-add" onClick={() => setCmsData({...cmsData, hero: [...(cmsData.hero || []), { image: '', title: '', subtitle: '' }]})}>
                    <Plus size={18} /> Ajouter une slide
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'services' && (
              <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="cms-grid-2">
                  {(cmsData.services || []).map((service: any, idx: number) => (
                    <Card key={idx} style={{ padding: '20px', position: 'relative' }}>
                       <button className="cms-btn-del" style={{ position: 'absolute', top: 5, right: 5, padding: '5px' }} onClick={() => {
                          const newServices = cmsData.services.filter((_: any, i: number) => i !== idx);
                          setCmsData({...cmsData, services: newServices});
                       }}><Trash2 size={14} /></button>
                       <div style={{ display: 'flex', gap: '15px' }}>
                          <div className="cms-img-box" style={{ width: '100px', height: '80px', flexShrink: 0 }}>
                             <img src={getImageUrl(service?.image)} alt="" />
                             <input type="file" onChange={(e) => handleImageUpload(e, (url) => {
                                const newServices = [...cmsData.services];
                                newServices[idx].image = url;
                                setCmsData({...cmsData, services: newServices});
                             })} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                             <input 
                              className="cms-input-field bold" 
                              style={{ marginBottom: '8px' }}
                              value={service?.title || ''} 
                              onChange={(e) => {
                                const newServices = [...cmsData.services];
                                newServices[idx].title = e.target.value;
                                setCmsData({...cmsData, services: newServices});
                              }}
                              placeholder="Titre du service"
                             />
                             <textarea 
                              className="cms-text-field" 
                              style={{ minHeight: '60px' }}
                              value={service?.desc || ''} 
                              onChange={(e) => {
                                const newServices = [...cmsData.services];
                                newServices[idx].desc = e.target.value;
                                setCmsData({...cmsData, services: newServices});
                              }}
                              placeholder="Description courte"
                             />
                          </div>
                       </div>
                    </Card>
                  ))}
                  <button className="cms-btn-add" style={{ gridColumn: '1 / -1' }} onClick={() => setCmsData({...cmsData, services: [...(cmsData.services || []), { title: '', desc: '', image: '' }]})}>
                    <Plus size={18} /> Ajouter un service
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'brands' && (
              <motion.div key="brands" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="cms-grid-2">
                  {(cmsData.brands || []).map((brand: any, idx: number) => (
                    <Card key={idx} style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="cms-img-box" style={{ width: '80px', height: '80px' }}>
                           <img src={getImageUrl(brand.logo)} alt={brand.name} />
                           <input type="file" onChange={(e) => handleImageUpload(e, (url) => {
                              const newBrands = [...cmsData.brands];
                              newBrands[idx].logo = url;
                              setCmsData({...cmsData, brands: newBrands});
                           })} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                           <label className="cms-input-label">Nom de la marque</label>
                           <input 
                            className="cms-input-field" 
                            value={brand.name} 
                            onChange={(e) => {
                              const newBrands = [...cmsData.brands];
                              newBrands[idx].name = e.target.value;
                              setCmsData({...cmsData, brands: newBrands});
                            }}
                           />
                        </div>
                        <button className="cms-btn-del" onClick={() => {
                          const newBrands = cmsData.brands.filter((_: any, i: number) => i !== idx);
                          setCmsData({...cmsData, brands: newBrands});
                        }}><Trash2 size={18} /></button>
                      </div>
                    </Card>
                  ))}
                  <button className="cms-btn-add" style={{ gridColumn: '1 / -1' }} onClick={() => setCmsData({...cmsData, brands: [...(cmsData.brands || []), { name: '', logo: '' }]})}>
                    <Plus size={18} /> Ajouter une marque
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'appointment' && (
              <motion.div key="appointment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card style={{ padding: '25px' }}>
                  <div className="cms-grid-2">
                    <div>
                      <label className="cms-input-label">Image de fond (Parallaxe)</label>
                      <div className="cms-banner-preview" style={{ height: '200px' }}>
                        <img src={getImageUrl(cmsData.appointment?.bgImage)} alt="" />
                        <label className="cms-img-edit" style={{ cursor: 'pointer' }}>
                          Changer le fond
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, (url) => setCmsData({...cmsData, appointment: {...cmsData.appointment, bgImage: url}}))} />
                        </label>
                      </div>
                      <label className="cms-input-label" style={{ marginTop: '20px' }}>Titre Section</label>
                      <input className="cms-input-field" value={cmsData.appointment?.title || ''} onChange={(e) => setCmsData({...cmsData, appointment: {...cmsData.appointment, title: e.target.value}})} />
                    </div>
                    <div>
                      <label className="cms-input-label">Image du mécanicien (Côté)</label>
                      <div className="cms-img-box large" style={{ height: '200px' }}>
                        <img src={getImageUrl(cmsData.appointment?.sideImage)} alt="" />
                        <label className="cms-img-edit" style={{ cursor: 'pointer' }}>
                          Changer l'image
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, (url) => setCmsData({...cmsData, appointment: {...cmsData.appointment, sideImage: url}}))} />
                        </label>
                      </div>
                      <label className="cms-input-label" style={{ marginTop: '20px' }}>Description</label>
                      <textarea className="cms-text-field" value={cmsData.appointment?.desc || ''} onChange={(e) => setCmsData({...cmsData, appointment: {...cmsData.appointment, desc: e.target.value}})} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'configurator' && (
              <motion.div key="configurator" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card style={{ padding: '25px' }}>
                  <label className="cms-input-label">Titre Configurateur</label>
                  <input className="cms-input-field" value={cmsData.configurator?.title || ''} onChange={(e) => setCmsData({...cmsData, configurator: {...cmsData.configurator, title: e.target.value}})} />
                  <label className="cms-input-label">Description d'accroche</label>
                  <textarea className="cms-text-field" value={cmsData.configurator?.desc || ''} onChange={(e) => setCmsData({...cmsData, configurator: {...cmsData.configurator, desc: e.target.value}})} />
                </Card>
              </motion.div>
            )}

            {activeTab === 'testimonials' && (
              <motion.div key="testimonials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="cms-grid-2">
                  {(cmsData.testimonials || []).map((t: any, idx: number) => (
                    <Card key={idx} style={{ padding: '20px', position: 'relative' }}>
                       <button className="cms-btn-del" style={{ position: 'absolute', top: 5, right: 5 }} onClick={() => {
                          const newT = cmsData.testimonials.filter((_: any, i: number) => i !== idx);
                          setCmsData({...cmsData, testimonials: newT});
                       }}><Trash2 size={14} /></button>
                       <div style={{ display: 'flex', gap: '15px' }}>
                          <div className="cms-img-box" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                             <img src={getImageUrl(t?.avatar)} alt="" />
                             <input type="file" onChange={(e) => handleImageUpload(e, (url) => {
                                const newT = [...cmsData.testimonials];
                                newT[idx].avatar = url;
                                setCmsData({...cmsData, testimonials: newT});
                             })} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                             <input className="cms-input-field bold" style={{ marginBottom: '5px' }} value={t?.name || ''} onChange={(e) => {
                                const newT = [...cmsData.testimonials];
                                newT[idx].name = e.target.value;
                                setCmsData({...cmsData, testimonials: newT});
                             }} placeholder="Nom du client" />
                             <input className="cms-input-field" style={{ marginBottom: '10px', fontSize: '0.8rem' }} value={t?.role || ''} onChange={(e) => {
                                const newT = [...cmsData.testimonials];
                                newT[idx].role = e.target.value;
                                setCmsData({...cmsData, testimonials: newT});
                             }} placeholder="Rôle / Titre" />
                             <textarea className="cms-text-field" style={{ minHeight: '80px' }} value={t?.quote || ''} onChange={(e) => {
                                const newT = [...cmsData.testimonials];
                                newT[idx].quote = e.target.value;
                                setCmsData({...cmsData, testimonials: newT});
                             }} placeholder="Témoignage" />
                          </div>
                       </div>
                    </Card>
                  ))}
                  <button className="cms-btn-add" style={{ gridColumn: '1 / -1' }} onClick={() => setCmsData({...cmsData, testimonials: [...(cmsData.testimonials || []), { name: '', role: '', quote: '', avatar: '' }]})}>
                    <Plus size={18} /> Ajouter un témoignage
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div key="messages" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', height: 'calc(100vh - 250px)' }}>
                  {/* LISTE DES MESSAGES */}
                  <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflowY: 'auto' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Boîte de réception</h3>
                    </div>
                    {messages.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Aucun message reçu.</div>
                    ) : (
                      messages.map((m: any) => (
                        <div 
                          key={m.id} 
                          onClick={() => setSelectedMessage(m)}
                          style={{ 
                            padding: '15px 20px', 
                            borderBottom: '1px solid #f1f5f9', 
                            cursor: 'pointer',
                            background: selectedMessage?.id === m.id ? '#f1f5f9' : (m.lu ? '#fff' : '#eff6ff'),
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.nom}</span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(m.createDate).toLocaleDateString()}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.message}
                          </div>
                          {m.repondu && (
                            <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#10b981' }}>
                              <CheckCircle size={12} /> Répondu
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* DETAILS ET REPONSE */}
                  <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                    {selectedMessage ? (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <h2 style={{ margin: '0 0 5px 0' }}>{selectedMessage.nom}</h2>
                              <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#64748b' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={14} /> {selectedMessage.email}</span>
                                {selectedMessage.telephone && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={14} /> {selectedMessage.telephone}</span>}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Clock size={14} /> Reçu le {new Date(selectedMessage.createDate).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                            <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{selectedMessage.message}</p>
                          </div>

                          {selectedMessage.repondu && (
                            <div style={{ background: '#ecfdf5', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#065f46', fontWeight: 600 }}>
                                <SendIcon size={16} /> Votre réponse ({new Date(selectedMessage.dateReponse).toLocaleString()})
                              </div>
                              <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#065f46' }}>{selectedMessage.reponse}</p>
                            </div>
                          )}
                        </div>

                        {!selectedMessage.repondu && (
                          <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                            <h4 style={{ margin: '0 0 12px 0' }}>Répondre au client</h4>
                            <textarea 
                              className="cms-text-field" 
                              style={{ minHeight: '120px', background: '#fff', marginBottom: '15px' }}
                              placeholder="Tapez votre réponse ici... Elle sera envoyée par mail au client."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Button 
                                onClick={handleReply} 
                                disabled={replyLoading || !replyText.trim()}
                                style={{ background: 'var(--accent-color)', color: '#fff', padding: '10px 24px' }}
                              >
                                {replyLoading ? <Loader2 className="animate-spin" /> : <><SendIcon size={18} style={{ marginRight: '8px' }} /> Envoyer la réponse</>}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                        <Inbox size={48} strokeWidth={1} style={{ marginBottom: '15px' }} />
                        <p>Sélectionnez un message pour le lire et y répondre.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'footer' && (
              <motion.div key="footer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <Card title="Coordonnées de l'entreprise" style={{ padding: '24px' }}>
                     <div className="cms-form-group">
                        <label className="cms-input-label"><MapPin size={14} /> Adresse physique</label>
                        <input className="cms-input-field" value={cmsData.footer.address} onChange={(e) => setCmsData({...cmsData, footer: {...cmsData.footer, address: e.target.value}})} />
                     </div>
                     <div className="cms-form-group">
                        <label className="cms-input-label"><Phone size={14} /> Téléphone</label>
                        <input className="cms-input-field" value={cmsData.footer.phone} onChange={(e) => setCmsData({...cmsData, footer: {...cmsData.footer, phone: e.target.value}})} />
                     </div>
                     <div className="cms-form-group">
                        <label className="cms-input-label"><Mail size={14} /> Email de contact</label>
                        <input className="cms-input-field" value={cmsData.footer.email} onChange={(e) => setCmsData({...cmsData, footer: {...cmsData.footer, email: e.target.value}})} />
                     </div>
                  </Card>

                  <Card title="Réseaux Sociaux" style={{ padding: '24px' }}>
                     <div className="cms-form-group">
                        <label className="cms-input-label"><Facebook size={14} /> Facebook URL</label>
                        <input className="cms-input-field" value={cmsData.footer.socials.facebook} onChange={(e) => setCmsData({...cmsData, footer: {...cmsData.footer, socials: {...cmsData.footer.socials, facebook: e.target.value}}})} />
                     </div>
                     <div className="cms-form-group">
                        <label className="cms-input-label"><Instagram size={14} /> Instagram URL</label>
                        <input className="cms-input-field" value={cmsData.footer.socials.instagram} onChange={(e) => setCmsData({...cmsData, footer: {...cmsData.footer, socials: {...cmsData.footer.socials, instagram: e.target.value}}})} />
                     </div>
                     <div className="cms-form-group">
                        <label className="cms-input-label"><Linkedin size={14} /> LinkedIn URL</label>
                        <input className="cms-input-field" value={cmsData.footer.socials.linkedin} onChange={(e) => setCmsData({...cmsData, footer: {...cmsData.footer, socials: {...cmsData.footer.socials, linkedin: e.target.value}}})} />
                     </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'products' && (
              <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card style={{ padding: '25px' }}>
                  <label className="cms-input-label">Image de fond (Section Produits)</label>
                  <div className="cms-banner-preview">
                    <img src={getImageUrl(cmsData.products?.bgImage)} alt="" />
                    <label className="cms-img-edit" style={{ cursor: 'pointer' }}>
                      Changer le fond
                      <input type="file" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, (url) => setCmsData({...cmsData, products: {...cmsData.products, bgImage: url}}))} />
                    </label>
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <label className="cms-input-label">Titre de section</label>
                    <input className="cms-input-field" value={cmsData.products?.title || ''} onChange={(e) => setCmsData({...cmsData, products: {...cmsData.products, title: e.target.value}})} />
                    <label className="cms-input-label">Sous-titre</label>
                    <input className="cms-input-field" value={cmsData.products?.subtitle || ''} onChange={(e) => setCmsData({...cmsData, products: {...cmsData.products, subtitle: e.target.value}})} />
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'about' && (
              <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card style={{ padding: '25px' }}>
                  <div className="cms-grid-2">
                    <div>
                      <label className="cms-input-label">Titre À Propos</label>
                      <input className="cms-input-field" value={cmsData.about?.title || ''} onChange={(e) => setCmsData({...cmsData, about: {...cmsData.about, title: e.target.value}})} />
                      <label className="cms-input-label">Texte de présentation</label>
                      <textarea className="cms-text-field" style={{ minHeight: '120px' }} value={cmsData.about?.text || ''} onChange={(e) => setCmsData({...cmsData, about: {...cmsData.about, text: e.target.value}})} />
                      
                      <label className="cms-input-label" style={{ marginTop: '20px' }}>Statistiques (Compteurs)</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {(cmsData.about?.stats || []).map((s: any, idx: number) => (
                          <div key={idx} style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px' }}>
                            <input className="cms-input-field" style={{ marginBottom: '5px', fontWeight: 700 }} value={s?.value || ''} onChange={(e) => {
                              const newStats = [...cmsData.about.stats];
                              newStats[idx].value = e.target.value;
                              setCmsData({...cmsData, about: {...cmsData.about, stats: newStats}});
                            }} />
                            <input className="cms-input-field" style={{ marginBottom: 0, fontSize: '0.8rem' }} value={s?.label || ''} onChange={(e) => {
                              const newStats = [...cmsData.about.stats];
                              newStats[idx].label = e.target.value;
                              setCmsData({...cmsData, about: {...cmsData.about, stats: newStats}});
                            }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="cms-input-label">Image Parallaxe (Fond)</label>
                      <div className="cms-img-box large" style={{ position: 'relative', height: '180px', marginBottom: '20px' }}>
                        <img src={getImageUrl(cmsData.about?.parallaxImage)} alt="" />
                        <label className="cms-img-edit" style={{ cursor: 'pointer' }}>
                          Changer le fond
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, (url) => setCmsData({...cmsData, about: {...cmsData.about, parallaxImage: url}}))} />
                        </label>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                          <label className="cms-input-label">Image 1 (Flottante)</label>
                          <div className="cms-img-box" style={{ width: '100%', height: '120px' }}>
                            <img src={getImageUrl(cmsData.about?.image1)} alt="" />
                            <input type="file" onChange={(e) => handleImageUpload(e, (url) => setCmsData({...cmsData, about: {...cmsData.about, image1: url}}))} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                          </div>
                        </div>
                        <div>
                          <label className="cms-input-label">Image 2 (Flottante)</label>
                          <div className="cms-img-box" style={{ width: '100%', height: '120px' }}>
                            <img src={getImageUrl(cmsData.about?.image2)} alt="" />
                            <input type="file" onChange={(e) => handleImageUpload(e, (url) => setCmsData({...cmsData, about: {...cmsData.about, image2: url}}))} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <style>{`
        .cms-clean-container { color: #1e293b; max-width: 1200px; margin: 0 auto; padding-bottom: 50px; }
        
        .cms-fixed-header { 
          display: flex; justify-content: space-between; align-items: center; 
          margin-bottom: 30px; background: #fff; padding: 20px 30px; border-radius: 12px;
          border: 1px solid #e2e8f0; position: sticky; top: 100px; z-index: 100;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }

        .cms-btn-save { 
          background: #b71c1c; color: #fff; border: none; padding: 12px 25px; 
          border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px;
          transition: all 0.3s;
        }
        .cms-btn-save:hover { background: #9a1616; transform: translateY(-2px); }
        .cms-btn-save:disabled { opacity: 0.7; cursor: not-allowed; }

        .cms-layout-grid { display: grid; grid-template-columns: 260px 1fr; gap: 30px; align-items: flex-start; }
        
        .cms-nav-sidebar { display: flex; flex-direction: column; gap: 8px; position: sticky; top: 180px; }
        .cms-tab-btn { 
          display: flex; align-items: center; gap: 12px; padding: 16px 20px; 
          border: none; background: #fff; border-radius: 12px; cursor: pointer; 
          color: #64748b; font-weight: 600; text-align: left; transition: 0.3s;
          border: 1px solid #f1f5f9;
        }
        .cms-tab-btn:hover { background: #f8fafc; border-color: #e2e8f0; color: #1e293b; }
        .cms-tab-btn.active { background: #b71c1c; color: #fff; box-shadow: 0 8px 20px rgba(183, 28, 28, 0.2); }

        .cms-row { display: flex; gap: 24px; align-items: flex-start; }
        .cms-img-box { width: 180px; height: 120px; border-radius: 10px; overflow: hidden; background: #f1f5f9; position: relative; border: 1px solid #e2e8f0; }
        .cms-img-box.large { width: 100%; height: 350px; }
        .cms-img-box img { width: 100%; height: 100%; object-fit: cover; }

        .cms-input-label { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 10px; color: #94a3b8; }
        .cms-input-field { width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 20px; font-size: 0.95rem; background: #f8fafc; }
        .cms-input-field:focus { outline: none; border-color: #b71c1c; background: #fff; }
        .cms-input-field.bold { font-weight: 700; }
        .cms-text-field { width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; min-height: 100px; resize: vertical; background: #f8fafc; }
        .cms-text-field:focus { outline: none; border-color: #b71c1c; background: #fff; }

        .cms-btn-del { background: #fee2e2; border: none; color: #ef4444; cursor: pointer; padding: 12px; border-radius: 8px; transition: 0.2s; }
        .cms-btn-del:hover { background: #fecaca; }
        .cms-btn-add { width: 100%; padding: 20px; border: 2px dashed #e2e8f0; background: #fff; border-radius: 12px; color: #64748b; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .cms-btn-add:hover { border-color: #b71c1c; color: #b71c1c; background: #fff5f5; }
        
        .cms-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        
        .cms-banner-preview { height: 250px; border-radius: 15px; overflow: hidden; position: relative; border: 1px solid #e2e8f0; }
        .cms-banner-preview img { width: 100%; height: 100%; object-fit: cover; }
        .cms-img-edit { position: absolute; bottom: 15px; right: 15px; background: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
};

export default AdminCMSPage;

