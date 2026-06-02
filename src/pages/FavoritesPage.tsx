import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { ChevronRight, Heart, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Vehicles.css';
import LoadingDots from '../components/common/LoadingDots';
import PageHero from '../components/common/PageHero';

const BASE_URL = 'http://localhost:8181';

const getImageUrl = (path: string | null) => {
    if (!path) return '/placeholder-car.jpg';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\//, '');
    return `${BASE_URL}/uploads/${cleanPath}`;
};

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchFavorites = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/favoris/my-list');
                if (response.data.statut === 200) {
                    setFavorites(response.data.data);
                }
            } catch (err) {
                console.error("Erreur chargement favoris:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, [isAuthenticated, navigate]);

    const handleRemove = async (e: React.MouseEvent, vehicleId: number) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await axiosInstance.post(`/api/v1/favoris/toggle/${vehicleId}`);
            setFavorites(prev => prev.filter(v => v.id !== vehicleId));
        } catch (err) {
            console.error("Erreur suppression favoris:", err);
        }
    };

    if (loading) return <div className="loader-full"><LoadingDots /></div>;

    return (
        <div className="favorites-page">
            <PageHero
                tag="Mon Espace"
                titleWords={['Mes', 'Véhicules', 'Favoris']}
                subtitle="Retrouvez ici les modèles qui vous ont fait craquer."
                bgImage="/paralaxCarlist.jpeg"
                height="50vh"
            />

            <div className="favorites-header">
                <button onClick={() => navigate('/vehicules')} className="btn-back-fav">
                    <ArrowLeft size={18} /> Retour au catalogue
                </button>
            </div>

            <div className="favorites-content">
                {favorites.length === 0 ? (
                    <div className="empty-state">
                        <Heart size={64} strokeWidth={1} color="#ddd" />
                        <h2>Votre liste est vide</h2>
                        <p>Parcourez notre catalogue premium et sélectionnez les modèles qui correspondent à votre style.</p>
                        <Link to="/vehicules" className="btn-explore">Explorer le catalogue</Link>
                    </div>
                ) : (
                    <div className="vehicle-premium-grid">
                        {favorites.map((vh) => (
                            <div key={vh.id} className="vehicle-grid-item">
                                <button 
                                    className="btn-like-grid active"
                                    onClick={(e) => handleRemove(e, vh.id)}
                                    style={{ 
                                        position: 'absolute', 
                                        top: '25px', 
                                        right: '25px', 
                                        zIndex: 200, 
                                        background: 'transparent', 
                                        border: 'none', 
                                        padding: '10px',
                                        cursor: 'pointer', 
                                        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Heart 
                                        size={28} 
                                        fill="#73020D" 
                                        strokeWidth={0}
                                        color="#73020D"
                                        style={{ filter: 'drop-shadow(0 0 8px rgba(115,2,13,0.35))' }}
                                    />
                                </button>
                                
                                <Link to={`/vehicules/uuid/${vh.uuid}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                                Configurer & Voir plus <ChevronRight size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .favorites-page {
                    background: var(--bg-primary); min-height: 100vh; padding: 0 0 100px;
                }
                .favorites-header {
                    margin-bottom: 50px; text-align: center; padding: 40px 4% 0;
                }
                .btn-back-fav {
                    background: transparent; border: none; cursor: pointer;
                    display: flex; align-items: center; gap: 8px; margin: 0 auto 30px;
                    font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
                    letter-spacing: 2px; color: #999; transition: all 0.3s;
                }
                .btn-back-fav:hover { color: #000; }
                
                .serif-title-fav {
                    font-family: 'Poppins', sans-serif;
                    font-size: 4rem; font-weight: 400; margin: 0; letter-spacing: -1px;
                }
                .title-divider-fav {
                    width: 50px; height: 1px; background: #000; margin: 25px auto;
                }
                .subtitle-fav { font-size: 0.9rem; letter-spacing: 0.5px; opacity: 0.5; max-width: 500px; margin: 0 auto; }

                .favorites-content { width: 100%; border-top: 1px solid #e2e8f0; }

                .empty-state {
                    text-align: center; padding: 120px 0;
                    display: flex; flex-direction: column; align-items: center; gap: 25px;
                }
                .empty-state h2 { 
                    font-family: 'Poppins', sans-serif;
                    font-size: 2rem; font-weight: 400; margin: 0; 
                }
                .empty-state p { opacity: 0.5; max-width: 350px; margin: 0; line-height: 1.8; font-size: 0.9rem; }
                .btn-explore {
                    margin-top: 20px; background: #000; color: #fff; padding: 18px 40px;
                    border-radius: 0; text-decoration: none; font-size: 0.75rem; 
                    font-weight: 800; text-transform: uppercase; letter-spacing: 2px;
                    transition: all 0.3s;
                }
                .btn-explore:hover { background: #73020D; transform: translateY(-5px); }

                @media (max-width: 768px) {
                    .serif-title-fav { font-size: 2.8rem; }
                }
            `}</style>
        </div>
    );
};

export default FavoritesPage;
