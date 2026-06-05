import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { ArrowRight, ChevronRight, Filter, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthFavorisModal from '../components/common/AuthFavorisModal';
import './Vehicles.css';
import LoadingDots from '../components/common/LoadingDots';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8181';

const getImageUrl = (path: string | null) => {
    if (!path) return '/placeholder-car.jpg';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return path;
    return `${BASE_URL}/uploads/${path}`;
};

const VehiclesListPage = () => {
    const [searchParams] = useSearchParams();
    const brandParam = searchParams.get('brand');
    
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeBrand, setActiveBrand] = useState(brandParam?.toUpperCase() || 'ALL');
    const [likedIds, setLikedIds] = useState<number[]>([]);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { isAuthenticated } = useAuth();

    const brands = [
        { name: 'ALL', logo: null },
        { name: 'MG', logo: '/assets/brands/MG_Logo.png' },
        { name: 'BAIC', logo: '/assets/brands/BAIC_Logo.png' },
        { name: 'ISUZU', logo: '/assets/brands/ISUZU_Logo.png' },
        { name: 'CHEVROLET', logo: '/assets/brands/CHEVROLET_Logo.png' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Chargement des véhicules (Priorité)
            try {
                const vResponse = await axiosInstance.get('/api/v1/vehicules/all');
                if (vResponse.data.statut === 200) {
                    setVehicles(vResponse.data.data);
                    setFilteredVehicles(vResponse.data.data);
                }
            } catch (err) {
                console.error("Erreur chargement véhicules:", err);
            }

            // Chargement des favoris (Optionnel, ne doit pas bloquer l'affichage)
            if (isAuthenticated) {
                try {
                    const fResponse = await axiosInstance.get('/api/v1/favoris/my-list');
                    if (fResponse.data && fResponse.data.data) {
                        setLikedIds(fResponse.data.data.map((v: any) => v.id));
                    }
                } catch (err) {
                    console.error("Erreur chargement favoris (non bloquant):", err);
                }
            }

            setLoading(false);
        };
        fetchData();
    }, [isAuthenticated]);

    const toggleLike = async (e: React.MouseEvent, vehicleId: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            console.log("Tentative de Like sans être authentifié");
            setShowAuthModal(true);
            return;
        }

        // Mise à jour optimiste (Visuel immédiat)
        const isCurrentlyLiked = likedIds.includes(vehicleId);
        setLikedIds(prev =>
            isCurrentlyLiked
                ? prev.filter(id => id !== vehicleId)
                : [...prev, vehicleId]
        );

        try {
            console.log(`Envoi toggle favori pour véhicule ID: ${vehicleId}`);
            await axiosInstance.post(`/api/v1/favoris/toggle/${vehicleId}`);
        } catch (err) {
            console.error("Erreur serveur lors du toggle favoris:", err);
            // Annulation de la mise à jour optimiste en cas d'erreur
            setLikedIds(prev =>
                isCurrentlyLiked ? [...prev, vehicleId] : prev.filter(id => id !== vehicleId)
            );
            // Optionnel : afficher une alerte si c'est une erreur 403 (session expirée)
        }
    };

    const filterByBrand = (brand: string) => {
        setActiveBrand(brand);
        if (brand === 'ALL') {
            setFilteredVehicles(vehicles);
        } else {
            setFilteredVehicles(vehicles.filter(v => v.marque.toUpperCase() === brand));
        }
    };

    const getParallaxImage = (brand: string) => {
        switch (brand) {
            case 'ISUZU': return '/paralax-ISUZU.png';
            case 'MG': return '/paralax1.png'; // Ou MG5.png selon votre préférence
            case 'BAIC': return '/baic-bj80.webp';
            case 'CHEVROLET': return '/chevrolet.png';
            default: return '/paralaxCarlist.jpeg';
        }
    };

    return (
        <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingTop: '80px', transition: 'background 0.4s ease, color 0.4s ease' }}>

            {/* ── BANNÈRE NEW GEN ── */}
            <div className="vlp-hero" style={{ backgroundImage: `url("${getParallaxImage(activeBrand)}")` }}>
                <div className="vlp-hero-gradient" />

                {/* Watermark */}
                <div className="vlp-watermark">DIWA</div>

                {/* Content */}
                <div className="vlp-hero-content">
                    <div className="vlp-tag">
                        <span className="vlp-dot" />
                        {activeBrand === 'ALL' ? 'Toute la Gamme' : activeBrand}
                    </div>

                    {/* Split title word by word */}
                    <div className="vlp-title-wrap">
                        {['Gamme', 'de', 'Véhicules'].map((word, i) => (
                            <div key={word} className="vlp-word-overflow">
                                <span className="vlp-word" style={{ animationDelay: `${0.1 + i * 0.13}s` }}>{word}</span>
                            </div>
                        ))}
                    </div>

                    <p className="vlp-subtitle">Découvrez notre sélection de voitures d'exception, prêtes à prendre la route.</p>
                </div>

                {/* Scroll indicator */}
                <div className="vlp-scroll-ind">
                    <div className="vlp-scroll-line" />
                    <span className="vlp-scroll-txt">SCROLL</span>
                </div>
            </div>

            {/* BARRE DES MARQUES STATIQUE (STICKY) */}
            <div className="brand-sticky-bar">
                <div className="brand-list">
                    {brands.map(brand => (
                        <button
                            key={brand.name}
                            className={`brand-btn ${activeBrand === brand.name ? 'active' : ''}`}
                            onClick={() => filterByBrand(brand.name)}
                        >
                            {brand.logo ? (
                                <div className="brand-logo-wrapper">
                                    <img src={brand.logo} alt={brand.name} className="brand-logo-img" />
                                </div>
                            ) : (
                                <span className="all-text">TOUT VOIR</span>
                            )}
                            <span className="brand-name-text">{brand.name !== 'ALL' ? brand.name : ''}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ padding: '40px 4% 100px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <span className="staggered-title">EXPLOREZ NOTRE GAMME</span>
                    <h1 className="serif" style={{ fontSize: '3rem', fontWeight: 900 }}>Tous nos Véhicules</h1>
                </div>
                {loading ? (
                    <div style={{ padding: '100px 0', textAlign: 'center', opacity: 0.5 }}>
                        <LoadingDots />
                    </div>
                ) : (
                    <div className="vehicle-premium-grid">
                        {filteredVehicles.map((vh) => (
                            <div key={vh.id} className="vehicle-grid-item" style={{ position: 'relative' }}>
                                <button
                                    className={`btn-like-grid ${likedIds.includes(vh.id) ? 'active' : ''}`}
                                    onClick={(e) => toggleLike(e, vh.id)}
                                    style={{
                                        position: 'absolute', top: '20px', right: '25px', zIndex: 200,
                                        background: 'transparent', border: 'none', padding: '10px', cursor: 'pointer',
                                        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Heart
                                        size={28}
                                        fill={likedIds.includes(vh.id) ? '#73020D' : 'rgba(0,0,0,0.1)'}
                                        strokeWidth={likedIds.includes(vh.id) ? 0 : 2}
                                        color={likedIds.includes(vh.id) ? '#73020D' : '#fff'}
                                        style={{ filter: likedIds.includes(vh.id) ? 'drop-shadow(0 0 8px rgba(115,2,13,0.4))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                                    />
                                </button>

                                <Link to={`/vehicules/${vh.uuid}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="vehicle-image-container">
                                        <img src={getImageUrl(vh.imagePrincipale)} alt={vh.modele} />
                                        <div className="vehicle-hover-overlay">
                                            <div className="vehicle-hover-info">
                                                <p className="hover-brand">{vh.marque}</p>
                                                <h3 className="hover-model">{vh.modele}</h3>
                                                <div className="hover-divider" />
                                                <p className="hover-price" style={{ letterSpacing: '1px' }}>Prix sur demande</p>
                                            </div>
                                            <div className="btn-view-config">
                                                Configurer &amp; Voir plus <ChevronRight size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AuthFavorisModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

            <style>{`
                /* ── NEW GEN HERO BANNER ── */
                .vlp-hero {
                    height: 100vh; min-height: 500px;
                    background-attachment: fixed;
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: cover;
                    position: relative;
                    overflow: hidden;
                }
                .vlp-hero-gradient {
                    position: absolute; inset: 0;
                    background:
                        linear-gradient(to top, rgba(12,10,9,0.95) 0%, rgba(12,10,9,0.5) 50%, rgba(12,10,9,0.1) 100%),
                        linear-gradient(to right, rgba(12,10,9,0.5) 0%, transparent 60%);
                }
                .vlp-watermark {
                    position: absolute; right: 4%; bottom: 8%;
                    font-size: clamp(6rem,18vw,14rem); font-weight: 900;
                    color: rgba(255,255,255,0.03); pointer-events: none;
                    user-select: none; font-family: 'Poppins', sans-serif; z-index: 1;
                }
                .vlp-hero-content {
                    position: absolute; bottom: 120px; left: 8%; z-index: 2; max-width: 700px;
                }
                .vlp-tag {
                    display: inline-flex; align-items: center; gap: 10px;
                    font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
                    letter-spacing: 4px; color: rgba(255,255,255,0.6); margin-bottom: 24px;
                }
                .vlp-dot { width: 7px; height: 7px; border-radius: 50%; background: #73020D; flex-shrink: 0; }
                .vlp-title-wrap { display: flex; flex-wrap: wrap; gap: 0 16px; margin-bottom: 20px; }
                .vlp-word-overflow { overflow: hidden; display: inline-block; }
                .vlp-word {
                    display: inline-block;
                    font-size: clamp(3rem, 7vw, 7rem); font-weight: 200; color: #fff;
                    letter-spacing: -2px; line-height: 0.92; font-family: 'Poppins', sans-serif;
                    animation: vlpWordIn 0.85s cubic-bezier(0.16,1,0.3,1) both;
                }
                @keyframes vlpWordIn {
                    from { transform: translateY(110%); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                .vlp-subtitle {
                    font-size: 0.95rem; color: rgba(255,255,255,0.55);
                    line-height: 1.75; max-width: 480px; margin: 0;
                }
                .vlp-scroll-ind {
                    position: absolute; right: 36px; top: 50%; transform: translateY(-50%);
                    z-index: 10; display: flex; flex-direction: column; align-items: center; gap: 12px;
                }
                .vlp-scroll-line {
                    width: 1px; height: 80px;
                    background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.4));
                    animation: scrollPulse 2s ease-in-out infinite;
                }
                .vlp-scroll-txt {
                    font-size: 0.5rem; font-weight: 800; letter-spacing: 4px;
                    color: rgba(255,255,255,0.3); writing-mode: vertical-rl;
                }

                /* ── BRAND BAR ── */
                .brand-sticky-bar {
                    position: sticky; top: 80px; z-index: 500;
                    background: var(--bg-primary);
                    border-bottom: 1px solid var(--border-color, #E8E6E2);
                    padding: 0 4%; transition: background 0.4s ease;
                }
                .brand-list { display: flex; gap: 40px; height: 70px; align-items: center; justify-content: center; }
                .brand-btn {
                    background: transparent; border: none; cursor: pointer; color: var(--neutral-400, #A8A29E);
                    transition: all 0.3s; position: relative; padding: 10px 0;
                    display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 100px;
                }
                .brand-logo-wrapper {
                    height: 35px; display: flex; align-items: center; justify-content: center;
                    transition: all 0.3s cubic-bezier(0.4,0,0.2,1); filter: grayscale(1) opacity(0.4);
                }
                .brand-logo-img { max-height: 100%; max-width: 60px; object-fit: contain; }
                .brand-name-text { font-size: 0.6rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
                .all-text { font-size: 0.65rem; font-weight: 900; letter-spacing: 1px; }
                .brand-btn.active .brand-logo-wrapper { filter: grayscale(0) opacity(1); transform: scale(1.08); }
                .brand-btn.active { color: var(--text-primary, #1C1917); }
                .brand-btn.active::after {
                    content: ''; position: absolute; bottom: -1px; left: 20%; width: 60%; height: 3px; background: #73020D;
                }
                .brand-btn:hover .brand-logo-wrapper { filter: grayscale(0) opacity(0.8); }
                .brand-btn:hover { color: var(--text-primary, #1C1917); }

                @media (max-width: 1024px) { .brand-list { gap: 20px; } }
                @media (max-width: 768px) {
                    .vlp-hero { height: 80vh; background-attachment: scroll; }
                    .vlp-hero-content { bottom: 80px; left: 6%; right: 6%; }
                    .vlp-scroll-ind { display: none; }
                    .vlp-watermark { display: none; }
                    .brand-sticky-bar { overflow-x: auto; -webkit-overflow-scrolling: touch; top: 70px; }
                    .brand-list { justify-content: flex-start; padding: 0 10px; width: max-content; }
                }
            `}</style>

        </div>
    );
};

export default VehiclesListPage;
