import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Vehicle360Viewer from '../components/common/Vehicle360Viewer';
import axiosInstance from '../utils/axiosInstance';
import { ChevronRight, ArrowLeft, Heart, Share2, Download, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthFavorisModal from '../components/common/AuthFavorisModal';
import LoadingDots from '../components/common/LoadingDots';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8181';

const VehiclePage = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [vehicle, setVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const [activeView, setActiveView] = useState('360');
    const [parsedColors, setParsedColors] = useState<any[]>([]);
    const [activeColorObj, setActiveColorObj] = useState<any>(null);
    const [prevColorObj, setPrevColorObj] = useState<any>(null);
    const [isAnimatingColor, setIsAnimatingColor] = useState(false);
    const [isInteriorOpen, setIsInteriorOpen] = useState(false);
    const [isFinitionOpen, setIsFinitionOpen] = useState(false);
    const [isMotorisationOpen, setIsMotorisationOpen] = useState(false);

    // Configurator State
    const [finitions, setFinitions] = useState<any[]>([]);
    const [motorisations, setMotorisations] = useState<any[]>([]);
    const [options, setOptions] = useState<any[]>([]);

    const [selectedFinition, setSelectedFinition] = useState<any>(null);
    const [selectedMotorisation, setSelectedMotorisation] = useState<any>(null);
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

    const location = useLocation();
    const isConfiguratorOpen = location.pathname.endsWith('/configuration');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    useEffect(() => {
        const fetchVehicleDetail = async () => {
            try {
                const response = await axiosInstance.get(`/api/v1/vehicules/uuid/${uuid}`);
                if (response.data.statut === 200) {
                    const vData = response.data.data;
                    setVehicle(vData);

                    if (vData.couleursDispo && vData.couleursDispo.length > 0) {
                        const colors = vData.couleursDispo.map((c: string) => {
                            try { return JSON.parse(c); } catch (e) { return { hex: c, name: c, image: '' }; }
                        }).filter((c: any) => c.image);
                        setParsedColors(colors);
                        if (colors.length > 0) {
                            setActiveColorObj(colors[0]);
                            setActiveView('color_view');
                        }
                    }

                    if (isAuthenticated) {
                        const favStatus = await axiosInstance.get(`/api/v1/favoris/status/${vData.id}`);
                        setIsLiked(favStatus.data.data);
                    }

                    // Fetch Configurator Data
                    try {
                        const [finRes, motRes, optRes] = await Promise.all([
                            axiosInstance.get(`/api/v1/finitions/vehicule/${vData.id}`),
                            axiosInstance.get(`/api/v1/motorisations/vehicule/${vData.id}`),
                            axiosInstance.get(`/api/v1/options-vehicule/vehicule/${vData.id}`)
                        ]);
                        if (finRes.data?.statut === 200 && finRes.data.data) {
                            setFinitions(finRes.data.data);
                            if (finRes.data.data.length > 0) setSelectedFinition(finRes.data.data[0]);
                        }
                        if (motRes.data?.statut === 200 && motRes.data.data) {
                            setMotorisations(motRes.data.data);
                            if (motRes.data.data.length > 0) setSelectedMotorisation(motRes.data.data[0]);
                        }
                        if (optRes.data?.statut === 200 && optRes.data.data) {
                            setOptions(optRes.data.data);
                        }
                    } catch (e) { console.error("Erreur fetch configurator data:", e); }

                }
            } catch (err) {
                console.error("Erreur détails véhicule:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicleDetail();
    }, [uuid, isAuthenticated]);

    const handleColorClick = (colorObj: any) => {
        if (activeColorObj?.hex === colorObj.hex) return;
        setPrevColorObj(activeColorObj);
        setActiveColorObj(colorObj);
        setIsAnimatingColor(true);
        setActiveView('color_view');
        setTimeout(() => {
            setIsAnimatingColor(false);
            setPrevColorObj(null);
        }, 1500);
    };

    const handleToggleLike = async () => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }
        try {
            await axiosInstance.post(`/api/v1/favoris/toggle/${vehicle.id}`);
            setIsLiked(!isLiked);
        } catch (err) {
            console.error("Erreur favoris:", err);
        }
    };

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        if (path.startsWith('/')) return path; // Asset local
        return `${import.meta.env.VITE_API_URL ?? 'http://localhost:8181'}/uploads/${path}`;
    };

    const totalPrix = (vehicle?.prixBase || 0) +
        (selectedFinition?.prixSupplement || 0) +
        (selectedMotorisation?.prix || 0) +
        (selectedOptions.reduce((acc, optId) => {
            const opt = options.find(o => o.id === optId);
            return acc + (opt?.prix || 0);
        }, 0));

    const generatePDF = async () => {
        setIsGeneratingPdf(true);
        try {
            const content = document.getElementById('pdf-print-template');
            if (!content) return;

            const canvas = await html2canvas(content, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

            pdf.save(`Configuration_${vehicle.marque}_${vehicle.modele}.pdf`);
        } catch (error) {
            console.error("Erreur génération PDF:", error);
            alert("Erreur lors de la génération de la fiche technique.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const [isSavingConfig, setIsSavingConfig] = useState(false);
    const handleSaveConfig = async () => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        if (isSavingConfig) return;
        setIsSavingConfig(true);

        try {
            const nomConfig = prompt("Donnez un nom à votre configuration :", `Ma config ${vehicle.marque} ${vehicle.modele}`);
            if (!nomConfig) {
                setIsSavingConfig(false);
                return;
            }

            const payload = {
                nomConfig,
                vehiculeId: vehicle.id,
                finitionId: selectedFinition?.id,
                motorisationId: selectedMotorisation?.id,
                optionsIds: selectedOptions
            };

            const response = await axiosInstance.post('/api/v1/configuration/save', payload);
            
            const localConfigs = JSON.parse(localStorage.getItem('diwa_local_configs') || '[]');
            const newLocalConfig = {
                ...payload,
                id: Date.now(),
                createdAt: new Date().toISOString(),
                vehicule: vehicle
            };
            localStorage.setItem('diwa_local_configs', JSON.stringify([newLocalConfig, ...localConfigs].slice(0, 5)));

            if (response.data.statut === 201 || response.data.statut === 200) {
                alert("Configuration sauvegardée avec succès ! Redirection vers votre espace...");
                setTimeout(() => {
                    navigate('/mon-espace');
                }, 500);
            } else {
                alert("La sauvegarde a répondu avec un statut inattendu : " + response.data.statut);
            }
        } catch (error: any) {
            console.error("Erreur sauvegarde config:", error);
            const msg = error.response?.data?.message || "Erreur lors de la sauvegarde.";
            alert(msg);
        } finally {
            setIsSavingConfig(false);
        }
    };

    if (loading) return <div className="loader-full"><LoadingDots /></div>;
    if (!vehicle) return <div className="error-full">Modèle non disponible.</div>;

    const imagesPath360 = vehicle.dossier360
        ? `${BASE_URL}/uploads/assets/360/${vehicle.dossier360.replace(/^\//, '')}/`
        : `/assets/360/bj80/bj80_`;



    return (
        <div style={{ position: 'relative', width: '100%', minHeight: 'calc(100vh - 80px)', background: '#fff' }}>
            {/* GOOGLE FONTS IMPORT */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
            `}</style>

            {!isConfiguratorOpen ? (
                <div className="showroom-container">


                    {/* NAVIGATION SECONDAIRE */}
                    <div className="showroom-nav">
                        <button onClick={() => navigate('/vehicules')} className="btn-back">
                            <ArrowLeft size={18} />
                        </button>
                        <div className="nav-actions">
                            <button className={`btn-icon ${isLiked ? 'active' : ''}`} onClick={handleToggleLike}>
                                <Heart size={20} fill={isLiked ? '#ff3b30' : 'none'} color={isLiked ? '#ff3b30' : '#000'} />
                            </button>
                            <button className="btn-icon"><Share2 size={20} /></button>
                        </div>
                    </div>

                    <div className="showroom-main">
                        {/* TITRE ET BADGE (Style Mercedes) */}
                        <div className="vehicle-header">
                            <h1 className="vehicle-title-serif">{vehicle.modele}</h1>
                            <div className="vehicle-badge">{vehicle.typeVehicule || 'Premium'}</div>
                        </div>

                        {/* VISUALISEUR CENTRAL (HYBRIDE 360 / GALERIE) */}
                        <div className="visualizer-wrapper">
                            <div className="studio-background"></div>
                            <div className="viewer-container">
                                {activeView === '360' ? (
                                    <Vehicle360Viewer
                                        imagePath={imagesPath360}
                                        totalFrames={23}
                                        extension="jpeg"
                                    />
                                ) : activeView === 'color_view' ? (
                                    <div className="gallery-main-view" style={{ position: 'relative', overflow: 'hidden' }}>
                                        {/* Image de base / précédente */}
                                        <img
                                            src={getImageUrl(prevColorObj ? prevColorObj.image : activeColorObj?.image || vehicle.imagePrincipale)}
                                            alt="Vehicle Detail Base"
                                        />

                                        {/* Image superposée avec animation Wipe */}
                                        {isAnimatingColor && activeColorObj && (
                                            <img
                                                src={getImageUrl(activeColorObj.image)}
                                                alt="Vehicle Detail Wipe"
                                                className="wipe-animation"
                                                style={{
                                                    position: 'absolute', top: 0, left: 0,
                                                    width: '100%', height: '100%', objectFit: 'contain'
                                                }}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="gallery-main-view">
                                        <img src={getImageUrl(activeView)} alt="Vehicle Detail" />
                                    </div>
                                )}
                            </div>

                            {/* BARRE DE VIGNETTES (THUMBNAILS) */}
                            <div className="view-selector-bar">
                                <div
                                    className={`thumb-item ${activeView === '360' ? 'active' : ''}`}
                                    onClick={() => setActiveView('360')}
                                >
                                    <div className="thumb-icon-360">360°</div>
                                    <span>Extérieur</span>
                                </div>

                                {parsedColors.length > 0 && (
                                    <div
                                        className={`thumb-item ${activeView === 'color_view' ? 'active' : ''}`}
                                        onClick={() => setActiveView('color_view')}
                                    >
                                        <img src={getImageUrl(activeColorObj?.image || vehicle.imagePrincipale)} alt="Couleur" />
                                        <span>Teinte</span>
                                    </div>
                                )}

                            </div>

                            {/* SELECTEUR DE COULEURS */}
                            {parsedColors.length > 0 && (
                                <div className="color-selector" style={{ position: 'absolute', bottom: '115px', right: '4%', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px', color: '#1a1a1a', letterSpacing: '0.5px' }}>Teintes Disponibles</p>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        {parsedColors.map((c, i) => (
                                            <div
                                                key={i}
                                                onClick={() => handleColorClick(c)}
                                                style={{
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                                                    cursor: 'pointer', opacity: activeColorObj?.hex === c.hex ? 1 : 0.6,
                                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transform: activeColorObj?.hex === c.hex ? 'scale(1.15)' : 'scale(1)'
                                                }}
                                            >
                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: c.hex, border: activeColorObj?.hex === c.hex ? '2px solid #0078d4' : '2px solid transparent', boxShadow: '0 4px 6px rgba(0,0,0,0.15)' }} />
                                                <span style={{ fontSize: '0.6rem', fontWeight: 800, whiteSpace: 'nowrap', color: '#000' }}>{c.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PANNEAU DE CONFIGURATION FLOTTANT */}
                        <div className="config-panel">
                            <div className="config-tabs" style={{ background: 'transparent', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {vehicle.imagesGalerie && vehicle.imagesGalerie.length > 0 && (
                                    <span
                                        className="tab-item active"
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.8rem', background: '#000', color: '#fff', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}
                                        onClick={() => setIsInteriorOpen(true)}
                                    >
                                        Habitacle
                                    </span>
                                )}
                                {finitions.length > 0 && (
                                    <span
                                        className="tab-item active"
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.8rem', background: '#000', color: '#fff', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}
                                        onClick={() => setIsFinitionOpen(true)}
                                    >
                                        Finitions
                                    </span>
                                )}
                                {motorisations.length > 0 && (
                                    <span
                                        className="tab-item active"
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.8rem', background: '#000', color: '#fff', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}
                                        onClick={() => setIsMotorisationOpen(true)}
                                    >
                                        Motorisations
                                    </span>
                                )}
                            </div>

                            <div className="config-summary">
                                <div className="price-tag">
                                    <span className="label">Tarification</span>
                                    {/* <span className="value">{totalPrix.toLocaleString()} FCFA</span> */}
                                    <span className="value" style={{ fontSize: '1.2rem', color: '#64748b' }}>Sur devis</span>
                                </div>
                                <div className="config-btn-group">
                                    {vehicle.ficheTechnique && (
                                        <a 
                                            href={getImageUrl(vehicle.ficheTechnique)} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="btn-config-outline"
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                                        >
                                            <Info size={16} /> Fiche Technique
                                        </a>
                                    )}
                                    <button className="btn-config-outline" onClick={() => navigate(`/vehicules/${vehicle.uuid}/configuration`)}>Configurez votre véhicule</button>
                                    <button className="btn-reserve-blue">Trouvez un véhicule neuf en stock</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PANNEAU INTERIEUR COULISSANT HORIZONTAL */}
                    <div className={`interior-side-panel ${isInteriorOpen ? 'open' : ''}`}>
                        <div className="panel-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <button className="back-arrow-btn" onClick={() => setIsInteriorOpen(false)}>
                                    <ArrowLeft color="#ffffff" size={32} strokeWidth={2.5} />
                                </button>
                                <h3>L'Habitacle</h3>
                            </div>
                        </div>
                        <div className="panel-content-horizontal">
                            {vehicle.imagesGalerie?.map((img: any, i: number) => (
                                <div key={i} className="interior-slide-item">
                                    <img src={getImageUrl(img.url)} alt={`Intérieur ${i}`} />
                                    <div className="img-caption">{img.vue || 'Détail Intérieur'}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PANNEAU FINITIONS COULISSANT HORIZONTAL */}
                    <div className={`interior-side-panel ${isFinitionOpen ? 'open' : ''}`}>
                        <div className="panel-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <button className="back-arrow-btn" onClick={() => setIsFinitionOpen(false)}>
                                    <ArrowLeft color="#ffffff" size={32} strokeWidth={2.5} />
                                </button>
                                <h3>Les Finitions</h3>
                            </div>
                        </div>
                        <div className="panel-content-horizontal">
                            {finitions.map((f, i) => (
                                <div key={i} className="interior-slide-item">
                                    {f.image ? <img src={getImageUrl(f.image)} alt={f.nom} /> : <div style={{ width: '100%', height: '100%', background: '#333' }} />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PANNEAU MOTORISATIONS COULISSANT HORIZONTAL */}
                    <div className={`interior-side-panel ${isMotorisationOpen ? 'open' : ''}`}>
                        <div className="panel-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <button className="back-arrow-btn" onClick={() => setIsMotorisationOpen(false)}>
                                    <ArrowLeft color="#ffffff" size={32} strokeWidth={2.5} />
                                </button>
                                <h3>Les Motorisations</h3>
                            </div>
                        </div>
                        <div className="panel-content-horizontal">
                            {motorisations.map((m, i) => (
                                <div key={i} className="interior-slide-item" style={{ justifyContent: 'center', alignItems: 'center', background: '#111' }}>
                                    <div style={{ textAlign: 'center', padding: '40px' }}>
                                        <h2 style={{ fontSize: '3rem', color: '#fff', marginBottom: '10px' }}>{m.moteur || m.type}</h2>
                                        <h4 style={{ fontSize: '1.5rem', color: '#0078d4' }}>{m.puissance} ch • {m.couple} Nm</h4>
                                        <p style={{ fontSize: '1rem', color: '#aaa', marginTop: '20px', letterSpacing: '1px' }}>Prix sur demande</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (<>

                {/* PANNEAU DE CONFIGURATION COMPLET */}
                <div className="configurator-overlay">
                    <div className="configurator-header">
                        <h2>Configuration : {vehicle.marque} {vehicle.modele}</h2>
                        <button className="close-btn" onClick={() => navigate(`/vehicules/${vehicle.uuid}`)}>
                            <ArrowLeft size={18} /> Retour au véhicule
                        </button>
                    </div>

                    <div className="configurator-content">
                        {/* Colonne Gauche : Aperçu visuel et Footer */}
                        <div className="config-preview-content">
                            <img
                                src={getImageUrl(activeColorObj?.image || vehicle.imagePrincipale)}
                                alt="Configuration"
                                crossOrigin="anonymous"
                            />
                            <div className="config-preview-details">
                                <h3>Ma Configuration</h3>
                                <p><strong>Couleur :</strong> {activeColorObj?.name || 'Standard'}</p>
                                <p><strong>Finition :</strong> {selectedFinition?.nom || 'Aucune'}</p>
                                <p><strong>Motorisation :</strong> {selectedMotorisation ? `${selectedMotorisation.moteur || ''} ${selectedMotorisation.puissance}ch` : 'Standard'}</p>

                                <div className="configurator-footer-in-details">
                                    <div className="total-price-small">
                                        <span>Prix Total Estimé</span>
                                        {/* <h3>{totalPrix.toLocaleString()} FCFA</h3> */}
                                        <h3 style={{ fontSize: '1.2rem', color: '#A8A29E', marginTop: '4px' }}>Sur devis</h3>
                                    </div>
                                    <div className="config-actions-details">
                                        <button
                                            className="btn-save-mini"
                                            onClick={handleSaveConfig}
                                            disabled={isSavingConfig}
                                        >
                                            <Heart size={16} /> {isSavingConfig ? 'Enregistrement...' : 'Sauvegarder'}
                                        </button>
                                        <button
                                            className="btn-download-mini"
                                            onClick={generatePDF}
                                            disabled={isGeneratingPdf}
                                        >
                                            {isGeneratingPdf ? '...' : <><Download size={16} /> PDF</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Colonne Droite : Sélections */}
                        <div className="config-options-scroll">
                            <div className="config-section">
                                <h4>Couleur Extérieure</h4>
                                <div className="color-options-grid">
                                    {parsedColors.map((c, i) => (
                                        <div
                                            key={i}
                                            className={`color-choice-btn ${activeColorObj?.hex === c.hex ? 'active' : ''}`}
                                            onClick={() => handleColorClick(c)}
                                        >
                                            <div className="color-swatch" style={{ background: c.hex }} />
                                            <span>{c.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {finitions.length > 0 && (
                                <div className="config-section">
                                    <h4>Finitions</h4>
                                    <div className="card-options-grid">
                                        {finitions.map((f, i) => (
                                            <div
                                                key={i}
                                                className={`config-card ${selectedFinition?.id === f.id ? 'active' : ''}`}
                                                onClick={() => setSelectedFinition(f)}
                                            >
                                                {f.image && <img src={getImageUrl(f.image)} alt={f.nom} crossOrigin="anonymous" />}
                                                <div className="config-card-info">
                                                    <h5>{f.nom}</h5>
                                                    <span style={{ color: '#A8A29E' }}>Prix sur demande</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {motorisations.length > 0 && (
                                <div className="config-section">
                                    <h4>Motorisations</h4>
                                    <div className="card-options-grid">
                                        {motorisations.map((m, i) => (
                                            <div
                                                key={i}
                                                className={`config-card ${selectedMotorisation?.id === m.id ? 'active' : ''}`}
                                                onClick={() => setSelectedMotorisation(m)}
                                            >
                                                <div className="config-card-info">
                                                    <h5>{m.moteur || m.type}</h5>
                                                    <p>{m.puissance} ch • {m.couple} Nm</p>
                                                    <span style={{ color: '#A8A29E' }}>Prix sur demande</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {options.length > 0 && (
                                <div className="config-section">
                                    <h4>Options & Accessoires</h4>
                                    <div className="options-list">
                                        {options.map((opt, i) => (
                                            <label key={i} className="option-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOptions.includes(opt.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedOptions([...selectedOptions, opt.id]);
                                                        else setSelectedOptions(selectedOptions.filter(id => id !== opt.id));
                                                    }}
                                                />
                                                <span className="opt-name">{opt.nom}</span>
                                                {/* <span className="opt-price">+{opt.prix?.toLocaleString()} FCFA</span> */}
                                                <span className="opt-price" style={{ color: '#A8A29E' }}>Sur devis</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </>)
            }

            {/* TEMPLATE PDF CACHÉ POUR EXPORT PROPRE (New Gen) */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div id="pdf-print-template" style={{ width: '800px', backgroundColor: '#FAFAF9', padding: '50px', fontFamily: '"Inter", sans-serif', boxSizing: 'border-box' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E8E6E2', paddingBottom: '30px', marginBottom: '40px' }}>
                        <div>
                            <img src="/logo-clean.png" alt="DIWA Logo" style={{ height: '40px', objectFit: 'contain', marginBottom: '15px' }} />
                            <h1 style={{ margin: 0, color: '#73020D', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 800 }}>DIWA Elite</h1>
                            <p style={{ margin: '5px 0 0 0', color: '#A8A29E', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>Automobiles & Services</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#A8A29E', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Fiche de Configuration</div>
                            <div style={{ fontSize: '28px', fontWeight: 900, color: '#1C1917', letterSpacing: '-1px' }}>{vehicle.marque}</div>
                            <div style={{ fontSize: '28px', fontWeight: 300, color: '#1C1917', letterSpacing: '-1px', marginTop: '-5px' }}>{vehicle.modele}</div>
                            <div style={{ color: '#78716C', fontSize: '11px', marginTop: '15px' }}>Date : {new Date().toLocaleDateString('fr-FR')}</div>
                        </div>
                    </div>

                    {/* Images Section */}
                    <div style={{ display: 'flex', gap: '30px', marginBottom: '50px' }}>
                        <div style={{ flex: 1.5 }}>
                            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', color: '#A8A29E', marginBottom: '15px' }}>Aperçu Extérieur</div>
                            <img src={getImageUrl(activeColorObj?.image || vehicle.imagePrincipale)} alt="Vehicle" style={{ width: '100%', height: '280px', objectFit: 'contain', background: '#fff', border: '1px solid #E8E6E2', borderRadius: '12px', padding: '20px' }} crossOrigin="anonymous" />
                        </div>
                        {selectedFinition?.image && (
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', color: '#A8A29E', marginBottom: '15px' }}>Finition : {selectedFinition.nom}</div>
                                <img src={getImageUrl(selectedFinition.image)} alt="Finition" style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #E8E6E2' }} crossOrigin="anonymous" />
                            </div>
                        )}
                    </div>

                    {/* Configuration Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '50px' }}>
                        {/* Specs */}
                        <div>
                            <h3 style={{ color: '#1C1917', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px', borderBottom: '1px solid #E8E6E2', paddingBottom: '10px' }}>Spécifications</h3>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <span style={{ color: '#78716C', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Couleur Extérieure</span>
                                <strong style={{ fontSize: '15px', color: '#1C1917', fontWeight: 600 }}>{activeColorObj?.name || 'Standard'}</strong>
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <span style={{ color: '#78716C', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Finition</span>
                                <strong style={{ fontSize: '15px', color: '#1C1917', fontWeight: 600 }}>{selectedFinition?.nom || 'Standard'}</strong>
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <span style={{ color: '#78716C', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Motorisation</span>
                                <strong style={{ fontSize: '15px', color: '#1C1917', fontWeight: 600 }}>{selectedMotorisation ? `${selectedMotorisation.moteur || ''} ${selectedMotorisation.puissance}ch` : 'Standard'}</strong>
                            </div>
                        </div>

                        {/* Options */}
                        <div>
                            <h3 style={{ color: '#1C1917', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px', borderBottom: '1px solid #E8E6E2', paddingBottom: '10px' }}>Équipements Additionnels</h3>
                            {selectedOptions.length === 0 ? (
                                <p style={{ color: '#A8A29E', fontStyle: 'italic', fontSize: '13px' }}>Aucune option supplémentaire sélectionnée.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {options.filter(o => selectedOptions.includes(o.id)).map((opt, i) => (
                                        <li key={i} style={{ marginBottom: '12px', fontSize: '13px', color: '#444', display: 'flex', alignItems: 'center' }}>
                                            <span style={{ width: '4px', height: '4px', background: '#73020D', borderRadius: '50%', marginRight: '10px' }} />
                                            {opt.nom}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Footer / Contact */}
                    <div style={{ backgroundColor: '#1C1917', color: '#fff', padding: '30px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#A8A29E', marginBottom: '5px' }}>Prochaine Étape</div>
                            <div style={{ fontSize: '16px', fontWeight: 600 }}>Contactez votre conseiller DIWA</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#A8A29E', marginBottom: '5px' }}>Tarification</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Sur devis personnalisé</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '9px', color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        © {new Date().getFullYear()} DIWA Automobiles. Ce document est non contractuel.
                    </div>
                </div>
            </div>

            <AuthFavorisModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

            <style>{`
                .showroom-container {
                    background: #fff; min-height: 100vh; position: relative;
                    padding-top: 80px; overflow: hidden;
                    font-family: 'Poppins', sans-serif;
                }
                .showroom-nav {
                    position: absolute; top: 100px; left: 0; width: 100%;
                    padding: 0 4%; display: flex; justify-content: space-between; z-index: 100;
                }
                .btn-back, .btn-icon {
                    width: 45px; height: 45px; border-radius: 50%;
                    background: rgba(255,255,255,0.8); border: 1px solid #eee;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.3s;
                }
                .btn-back:hover, .btn-icon:hover { background: #f8f8f8; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .nav-actions { display: flex; gap: 12px; }

                .showroom-main {
                    display: flex; flex-direction: column; align-items: center;
                    height: calc(100vh - 80px); position: relative;
                }

                .vehicle-header {
                    text-align: center; margin-top: 20px; z-index: 10;
                }
                .vehicle-title-serif {
                    font-family: 'Poppins', sans-serif;
                    font-size: 5.5rem; font-weight: 500; margin: 0; letter-spacing: -2px;
                    color: #1a1a1a;
                }
                .vehicle-badge {
                    display: inline-block; background: #0078d4; color: #fff;
                    padding: 5px 20px; border-radius: 4px; font-size: 0.65rem;
                    font-weight: 800; margin-top: 5px; text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .visualizer-wrapper {
                    flex: 1; width: 100%; position: relative;
                    display: flex; align-items: center; justify-content: center;
                    margin-top: -50px;
                }
                .studio-background {
                    position: absolute; inset: 0;
                    background: radial-gradient(circle at center, #ffffff 0%, #f7f7f7 60%, #ededed 100%);
                    z-index: 0;
                }
                .viewer-container {
                    width: 90%; max-width: 1000px; z-index: 5;
                    filter: drop-shadow(0 30px 60px rgba(0,0,0,0.12));
                }

                .view-selector-bar {
                    position: absolute; bottom: 115px; left: 4%;
                    display: flex; gap: 12px;
                    z-index: 2000; padding: 10px;
                    background: rgba(255,255,255,0.3);
                    backdrop-filter: blur(8px);
                    border-radius: 12px;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .thumb-item {
                    display: flex; flex-direction: column; align-items: center; gap: 4px;
                    cursor: pointer; opacity: 0.7; transition: all 0.3s;
                }
                .thumb-item:hover, .thumb-item.active { opacity: 1; transform: scale(1.05); }
                .thumb-item img, .thumb-icon-360 {
                    width: 60px; height: 38px; object-fit: cover;
                    border-radius: 4px; border: 1px solid #fff;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
                }
                .thumb-icon-360 {
                    background: #000; color: #fff; font-size: 0.8rem;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 800;
                }
                .thumb-item span { font-size: 0.6rem; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
                .thumb-item.active img { border: 2px solid #0078d4; }
                .thumb-item.active .thumb-icon-360 { background: #0078d4; border: 2px solid #0078d4; }

                .gallery-main-view {
                    width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
                }
                .gallery-main-view img {
                    width: 100%; height: auto; border-radius: 8px;
                    animation: fadeIn 0.5s ease-out;
                }

                .wipe-animation {
                    -webkit-mask-image: linear-gradient(to right, black 0%, black 40%, transparent 60%, transparent 100%);
                    mask-image: linear-gradient(to right, black 0%, black 40%, transparent 60%, transparent 100%);
                    -webkit-mask-size: 300% 100%;
                    mask-size: 300% 100%;
                    animation: softPaint 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }
                @keyframes softPaint {
                    0% { 
                        -webkit-mask-position: 100% 0;
                        mask-position: 100% 0;
                    }
                    100% { 
                        -webkit-mask-position: 0% 0;
                        mask-position: 0% 0;
                    }
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                .config-panel {
                    position: absolute; bottom: 0; left: 0;
                    width: 100%; background: rgba(240, 240, 240, 0.95);
                    backdrop-filter: blur(10px);
                    padding: 15px 4%;
                    display: flex; flex-direction: column; gap: 15px;
                    z-index: 1000;
                    border-top: 1px solid #ddd;
                }
                
                .config-tabs { 
                    display: flex; justify-content: center; gap: 2px; 
                    background: #ddd; width: fit-content; margin: 0 auto;
                    border-radius: 4px; overflow: hidden;
                }
                .tab-item {
                    font-size: 0.7rem; font-weight: 700; text-transform: none;
                    background: #eee; color: #666; padding: 10px 25px; cursor: pointer;
                }
                .tab-item.active { background: #000; color: #fff; }

                .config-summary { display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 1400px; margin: 0 auto; }
                .price-tag { display: flex; flex-direction: column; border-left: 4px solid #ddd; padding-left: 20px; }
                .price-tag .label { font-size: 0.75rem; color: #666; }
                .price-tag .value { font-size: 1.4rem; font-weight: 800; color: #000; }

                .config-btn-group { display: flex; gap: 15px; }
                
                .btn-config-outline {
                    background: #fff; color: #000; border: 1px solid #ddd;
                    padding: 12px 30px; border-radius: 4px; font-weight: 700;
                    font-size: 0.85rem; cursor: pointer; transition: all 0.3s;
                }
                .btn-reserve-blue {
                    background: #0078d4; color: #fff; border: none;
                    padding: 12px 30px; border-radius: 4px; font-weight: 700;
                    font-size: 0.85rem; cursor: pointer; transition: all 0.3s;
                }
                .btn-reserve-blue:hover { background: #006abc; }
                
                /* PANNEAU HABITACLE COULISSANT DROIT */
                .interior-side-panel {
                    position: absolute; top: 0; right: -100vw; left: auto;
                    width: 100vw; height: 100vh;
                    background: #0a0a0a; z-index: 3000;
                    transition: right 0.6s cubic-bezier(0.25, 1, 0.5, 1);
                    display: flex; flex-direction: column;
                }
                .interior-side-panel.open { right: 0; }
                
                .panel-header {
                    padding: 30px 4%; display: flex; align-items: center;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); color: #fff;
                    position: absolute; top: 0; left: 0; width: 100%; z-index: 3100;
                }
                .panel-header h3 { font-family: 'Playfair Display', serif; font-size: 2.5rem; margin: 0; font-weight: 400; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
                .back-arrow-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; color: #ffffff; z-index: 5000; }
                .back-arrow-btn:hover { background: rgba(255,255,255,0.35); transform: scale(1.1); }
                
                .panel-content-horizontal {
                    flex: 1; display: flex; overflow-x: auto; gap: 40px; padding: 0 5vw;
                    scroll-snap-type: x mandatory; background: #0a0a0a;
                    align-items: center;
                }
                .panel-content-horizontal::-webkit-scrollbar { height: 8px; }
                .panel-content-horizontal::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
                
                .interior-slide-item {
                    flex: 0 0 65vw; scroll-snap-align: center; max-width: 1000px;
                    position: relative; border-radius: 16px; overflow: hidden;
                    box-shadow: 0 15px 40px rgba(0,0,0,0.6);
                    height: 65vh; max-height: 800px; display: flex; flex-direction: column;
                }
                .interior-slide-item img {
                    width: 100%; height: 100%; object-fit: cover;
                }
                .img-caption {
                    position: absolute; bottom: 0; left: 0; width: 100%;
                    padding: 60px 40px 40px; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
                    color: #fff; font-weight: 500; text-transform: uppercase; font-size: 1.2rem; letter-spacing: 2px;
                }

                @media (max-width: 768px) {
                    .config-panel { padding: 15px; }
                    .config-summary { flex-direction: column; gap: 15px; align-items: flex-start; }
                    .config-btn-group { flex-direction: column; width: 100%; }
                    .config-btn-group button { width: 100%; }
                    .interior-side-panel { width: 100%; }
                    .interior-slide-item { flex: 0 0 95%; height: 60%; }
                }
                .btn-reserve-blue {
                    background: #0078d4; color: #fff; border: none;
                    padding: 12px 30px; border-radius: 4px; font-weight: 700;
                    font-size: 0.85rem; cursor: pointer; transition: all 0.3s;
                }
                .btn-reserve-blue:hover { background: #005a9e; }

                /* CONFIGURATOR MAIN PAGE */
                .configurator-overlay {
                    position: relative; width: 100%; min-height: calc(100vh - 80px);
                    background: #f8f9fa; z-index: 10; display: flex; flex-direction: column;
                }
                
                .configurator-header {
                    width: 100%; height: 80px;
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 0 4%; background: #fff; border-bottom: 1px solid #eaeaea; z-index: 10;
                    box-sizing: border-box; flex: none;
                }
                .configurator-header h2 { margin: 0; font-family: 'Playfair Display', serif; font-size: 1.5rem; }
                .close-btn { 
                    display: flex; align-items: center; gap: 8px; background: #f1f5f9; border: none; 
                    cursor: pointer; padding: 10px 20px; border-radius: 8px; font-weight: 700; color: #333; transition: background 0.3s;
                }
                .close-btn:hover { background: #e2e8f0; }
                
                .configurator-content {
                    flex: 1; display: flex; overflow: hidden; padding: 0; box-sizing: border-box;
                    background: #fff;
                }
                .config-preview-container {
                    flex: 1.5; display: flex; flex-direction: column; border-right: 1px solid #eaeaea; background: #fff;
                }
                .config-preview-content {
                    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 40px; overflow-y: auto; height: 100%;
                }
                .config-preview-content img { width: 100%; max-width: 800px; height: auto; object-fit: contain; }
                .config-preview-details {
                    margin-top: 30px; text-align: left; width: 100%; max-width: 600px;
                    background: #f1f5f9; padding: 25px; border-radius: 12px;
                }
                .config-preview-details h3 { margin-top: 0; color: #0078d4; font-size: 1.2rem; margin-bottom: 15px; }
                .config-preview-details p { margin: 8px 0; font-size: 0.95rem; color: #333; }
                
                .config-options-scroll {
                    flex: 1; overflow-y: auto; padding: 40px; background: #fafafa; height: 100%;
                }
                .config-section { margin-bottom: 40px; }
                .config-section h4 { font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }
                
                .color-options-grid { display: flex; flex-wrap: wrap; gap: 15px; }
                .color-choice-btn {
                    display: flex; flex-direction: column; align-items: center; gap: 8px;
                    cursor: pointer; padding: 10px; border-radius: 8px; border: 2px solid transparent;
                    transition: all 0.2s;
                }
                .color-choice-btn.active { border-color: #0078d4; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .color-swatch { width: 40px; height: 40px; border-radius: 50%; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
                .color-choice-btn span { font-size: 0.75rem; font-weight: 600; color: #333; }
                
                .card-options-grid { display: grid; grid-template-columns: 1fr; gap: 15px; }
                .config-card {
                    display: flex; align-items: center; background: #fff; border: 2px solid #eaeaea;
                    border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.2s;
                }
                .config-card:hover { border-color: #ccc; }
                .config-card.active { border-color: #0078d4; box-shadow: 0 8px 20px rgba(0,120,212,0.1); }
                .config-card img { width: 120px; height: 100px; object-fit: cover; }
                .config-card-info { padding: 20px; flex: 1; }
                .config-card-info h5 { margin: 0 0 5px 0; font-size: 1.1rem; color: #1a1a1a; }
                .config-card-info p { margin: 0 0 10px 0; font-size: 0.85rem; color: #666; }
                .config-card-info span { font-weight: 700; color: #0078d4; font-size: 0.95rem; }
                
                .options-list { display: flex; flex-direction: column; gap: 10px; }
                .option-checkbox {
                    display: flex; alignItems: center; padding: 15px 20px; background: #fff;
                    border: 1px solid #eaeaea; border-radius: 8px; cursor: pointer; transition: all 0.2s;
                }
                .option-checkbox:hover { border-color: #ccc; }
                .option-checkbox input { margin-right: 15px; transform: scale(1.2); }
                .opt-name { flex: 1; font-weight: 500; color: #333; }
                .opt-price { font-weight: 700; color: #0078d4; }
                
                .configurator-footer {
                    display: flex; justify-content: space-between; align-items: center; flex: none;
                    padding: 20px; background: #fff; border-top: 1px solid #eaeaea; z-index: 10;
                    box-sizing: border-box;
                }
                .configurator-footer-in-details {
                    margin-top: 25px; padding-top: 20px; border-top: 1px solid #ddd;
                    display: flex; flex-direction: column; gap: 15px;
                }
                .total-price-small span { font-size: 0.8rem; color: #666; text-transform: uppercase; }
                .total-price-small h3 { font-size: 1.5rem; color: #0078d4; margin: 5px 0 0 0; }
                .config-actions-details { display: flex; gap: 10px; }
                .btn-save-mini, .btn-download-mini {
                    flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
                    padding: 12px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.3s;
                    border: none; font-size: 0.9rem;
                }
                .btn-save-mini { background: #1a1a1a; color: #fff; }
                .btn-download-mini { background: #eee; color: #333; }
                .btn-save-mini:hover { background: #000; }
                .btn-download-mini:hover { background: #ddd; }

                .total-price span { font-size: 0.9rem; color: #666; text-transform: uppercase; letter-spacing: 1px; }
                .total-price h2 { margin: 5px 0 0 0; font-size: 2rem; color: #1a1a1a; }
                .btn-download-pdf {
                    display: flex; alignItems: center; gap: 10px; background: #0078d4; color: #fff;
                    border: none; padding: 15px 30px; border-radius: 8px; font-weight: 700; font-size: 1rem;
                    cursor: pointer; transition: background 0.3s;
                }
                .btn-download-pdf:hover { background: #005a9e; }
                .btn-download-pdf:disabled { background: #ccc; cursor: not-allowed; }

                @media (max-width: 1024px) {
                    .vehicle-title-serif { font-size: 3.5rem; }
                    .config-summary { flex-direction: column; gap: 20px; text-align: center; }
                    .price-tag { border-left: none; padding-left: 0; }
                    
                    /* SCROLL FIX MOBILE */
                    .configurator-header { padding: 0 15px; }
                    .configurator-header h2 { font-size: 1.3rem; }
                    .configurator-footer { padding: 15px; flex-direction: column; gap: 15px; align-items: flex-start; }
                    .config-actions-group { width: 100%; flex-direction: column; }
                    .config-actions-group button { width: 100%; justify-content: center; }
                    
                    .configurator-content { bottom: 0; flex-direction: column; overflow-y: auto; display: block; }
                    .config-preview-container { border-right: none; border-bottom: 1px solid #eaeaea; display: block; }
                    .config-preview-content { height: auto; padding: 20px; overflow: visible; }
                    .config-options-scroll { height: auto; overflow-y: visible; padding: 20px; }
                }

                @media (max-width: 768px) {
                    .vehicle-title-serif { font-size: 2.2rem; }
                    .showroom-nav { top: 90px; }
                    .view-selector-bar { bottom: 200px; left: 50%; transform: translateX(-50%); width: 90%; justify-content: center; }
                    .color-selector { bottom: 260px !important; right: 50% !important; transform: translateX(50%) !important; width: 90%; }
                    .config-panel { padding: 10px; position: fixed; }
                    .config-tabs { scale: 0.8; }
                    .price-tag .value { font-size: 1.1rem; }
                    .btn-config-outline, .btn-reserve-blue { padding: 10px 15px; font-size: 0.75rem; }
                    
                    .viewer-container { width: 100%; margin-top: 0; }
                    .visualizer-wrapper { margin-top: 0; }

                    .interior-slide-item { flex: 0 0 90vw; height: 50vh; }
                    .panel-header h3 { font-size: 1.5rem; }
                }
                
                @media (max-width: 480px) {
                    .vehicle-title-serif { font-size: 1.8rem; }
                    .config-btn-group { gap: 8px; }
                    .tab-item { padding: 8px 15px; }
                }
            `}</style>
        </div >
    );
};

export default VehiclePage;
