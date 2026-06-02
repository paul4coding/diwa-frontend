import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import {
    Package,
    Star,
    ChevronDown,
    X,
    ShoppingCart,
    Heart,
    Eye,
    Plus,
    Minus,
    Search
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import PageHero from '../components/common/PageHero';

interface Piece {
    id: number;
    nom: string;
    reference: string;
    prixUnitaire: number;
    quantiteStock: number;
    imageUrl: string;
    categorieLibelle: string;
    categorieId: number;
    marque?: string;
}

const ProductsListPage = () => {
    const { addToCart } = useCart();
    const [searchParams, setSearchParams] = useSearchParams();
    const [pieces, setPieces] = useState<Piece[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
    const [quantity, setQuantity] = useState(1);

    const categoryFilter = searchParams.get('cat');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [pRes, cRes] = await Promise.all([
                    axiosInstance.get('/api/v1/pieces-detachees/all'),
                    axiosInstance.get('/api/v1/categories-pieces/all')
                ]);
                if (pRes.data.statut === 200) setPieces(pRes.data.data);
                if (cRes.data.statut === 200) setCategories(cRes.data.data);
            } catch (err) {
                console.error('Erreur catalogue produits:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) return url;
        return `http://localhost:8181/uploads/${url}`;
    };

    const brands = Array.from(new Set(pieces.map(p => p.marque || 'Générique'))).map(b => ({
        name: b,
        count: pieces.filter(p => (p.marque || 'Générique') === b).length
    }));

    const filteredPieces = pieces.filter(p => {
        const matchesCat = !categoryFilter || p.categorieId.toString() === categoryFilter;
        const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             p.reference.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const openQuickView = (piece: Piece) => {
        setSelectedPiece(piece);
        setQuantity(1);
    };

    const closeQuickView = () => {
        setSelectedPiece(null);
    };

    const handleAddToCart = (piece: Piece, qty: number) => {
        for(let i = 0; i < qty; i++) {
            addToCart(piece);
        }
        closeQuickView();
    };

    return (
        <div className="shop-page" style={{ background: '#0A0908', minHeight: '100vh', color: '#E8E6E2' }}>
            <PageHero
                tag="Pièces & Accessoires"
                titleWords={['Notre', 'Boutique']}
                subtitle="Pièces détachées officielles pour vos véhicules MG, Isuzu, Chevrolet et BAIC."
                bgImage="/paralaxForShop.png"
                height="55vh"
            />

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 40px' }}>
                <div className="shop-grid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '50px' }}>

                    {/* SIDEBAR FILTERS */}
                    <aside className="shop-sidebar">

                        {/* SEARCH FILTER */}
                        <div className="filter-panel" style={{ marginBottom: '24px' }}>
                            <h3 className="filter-title">Recherche</h3>
                            <div style={{ position: 'relative' }}>
                                <Search
                                    size={16}
                                    style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#6B7280',
                                        pointerEvents: 'none'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Nom, référence…"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="shop-search-input"
                                />
                            </div>
                        </div>

                        {/* CATEGORIES FILTER */}
                        <div className="filter-panel" style={{ marginBottom: '24px' }}>
                            <h3 className="filter-title">Catégories</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        color: !categoryFilter ? '#E8E6E2' : '#6B7280',
                                        fontWeight: !categoryFilter ? 600 : 400,
                                        transition: 'color 0.2s'
                                    }}
                                    onClick={() => setSearchParams({})}
                                >
                                    <span
                                        style={{
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '4px',
                                            border: `2px solid ${!categoryFilter ? '#73020D' : 'rgba(255,255,255,0.2)'}`,
                                            background: !categoryFilter ? '#73020D' : 'transparent',
                                            flexShrink: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                    />
                                    Toutes les catégories
                                    <span style={{ marginLeft: 'auto', color: '#4B5563', fontSize: '0.8rem' }}>{pieces.length}</span>
                                </label>
                                {categories.map(cat => {
                                    const isActive = categoryFilter === cat.id.toString();
                                    const count = pieces.filter(p => p.categorieId === cat.id).length;
                                    return (
                                        <label
                                            key={cat.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                color: isActive ? '#E8E6E2' : '#6B7280',
                                                fontWeight: isActive ? 600 : 400,
                                                transition: 'color 0.2s'
                                            }}
                                            onClick={() => setSearchParams(isActive ? {} : { cat: cat.id.toString() })}
                                        >
                                            <span
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    borderRadius: '4px',
                                                    border: `2px solid ${isActive ? '#73020D' : 'rgba(255,255,255,0.2)'}`,
                                                    background: isActive ? '#73020D' : 'transparent',
                                                    flexShrink: 0,
                                                    transition: 'all 0.2s'
                                                }}
                                            />
                                            {cat.libelle}
                                            <span style={{ marginLeft: 'auto', color: '#4B5563', fontSize: '0.8rem' }}>{count}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* BRANDS FILTER */}
                        {brands.length > 0 && (
                            <div className="filter-panel">
                                <h3 className="filter-title">Marques</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {brands.map(brand => (
                                        <label
                                            key={brand.name}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                color: '#6B7280',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    borderRadius: '4px',
                                                    border: '2px solid rgba(255,255,255,0.15)',
                                                    flexShrink: 0
                                                }}
                                            />
                                            {brand.name}
                                            <span style={{ marginLeft: 'auto', color: '#4B5563', fontSize: '0.8rem' }}>({brand.count})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* PRODUCT LIST CONTENT */}
                    <main>
                        {/* TOP BAR */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '0.88rem', color: '#6B7280' }}>
                                <span style={{ color: '#E8E6E2', fontWeight: 600 }}>{filteredPieces.length}</span>
                                <span> résultat{filteredPieces.length !== 1 ? 's' : ''} sur </span>
                                <span style={{ color: '#E8E6E2', fontWeight: 600 }}>{pieces.length}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '9px 16px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    fontSize: '0.88rem',
                                    color: '#A8A29E',
                                    background: 'rgba(255,255,255,0.03)',
                                }}>
                                    Tri par défaut <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

                        {/* LOADING STATE */}
                        {loading && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '30px' }}>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} style={{ textAlign: 'center' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', height: '260px', marginBottom: '16px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '6px', height: '16px', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '6px', height: '12px', width: '60%', margin: '0 auto', animation: 'pulse 1.5s ease-in-out infinite' }} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* EMPTY STATE */}
                        {!loading && filteredPieces.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#4B5563' }}>
                                <Package size={56} style={{ marginBottom: '20px', opacity: 0.3 }} />
                                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#6B7280' }}>Aucune pièce trouvée</p>
                                <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Modifiez vos filtres ou votre recherche</p>
                            </div>
                        )}

                        {/* PRODUCT GRID */}
                        {!loading && filteredPieces.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '32px 24px' }}>
                                {filteredPieces.map(piece => (
                                    <div key={piece.id} className="shop-product-card" style={{ textAlign: 'center' }}>
                                        <div className="product-image-container" style={{
                                            background: '#141312',
                                            borderRadius: '12px',
                                            height: '260px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '30px',
                                            marginBottom: '18px',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            {piece.imageUrl ? (
                                                <img
                                                    src={getImageUrl(piece.imageUrl)!}
                                                    alt={piece.nom}
                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <Package size={72} color="rgba(255,255,255,0.12)" />
                                            )}
                                            {piece.quantiteStock <= 3 && piece.quantiteStock > 0 && (
                                                <div style={{
                                                    position: 'absolute', top: '12px', right: '12px',
                                                    background: '#ef4444', color: '#fff',
                                                    fontSize: '0.65rem', fontWeight: 800,
                                                    padding: '3px 8px', borderRadius: '100px',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    STOCK BAS
                                                </div>
                                            )}
                                            {piece.quantiteStock === 0 && (
                                                <div style={{
                                                    position: 'absolute', top: '12px', right: '12px',
                                                    background: 'rgba(0,0,0,0.7)', color: '#9CA3AF',
                                                    fontSize: '0.65rem', fontWeight: 800,
                                                    padding: '3px 8px', borderRadius: '100px',
                                                    letterSpacing: '0.5px', border: '1px solid rgba(255,255,255,0.1)'
                                                }}>
                                                    ÉPUISÉ
                                                </div>
                                            )}

                                            {/* HOVER ACTIONS */}
                                            <div className="shop-hover-actions">
                                                <button className="shop-action-btn" onClick={() => openQuickView(piece)} title="Aperçu rapide">
                                                    <Eye size={17} />
                                                </button>
                                                <button className="shop-action-btn main" onClick={() => addToCart(piece)} title="Ajouter au panier">
                                                    <ShoppingCart size={17} />
                                                </button>
                                                <button className="shop-action-btn" title="Favoris">
                                                    <Heart size={17} />
                                                </button>
                                            </div>
                                        </div>

                                        <h3
                                            onClick={() => openQuickView(piece)}
                                            className="shop-product-name"
                                        >
                                            {piece.nom}
                                        </h3>

                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', color: '#ffb400', marginBottom: '8px' }}>
                                            {[1,2,3,4,5].map(s => <Star key={s} size={13} fill="#ffb400" />)}
                                        </div>

                                        <div style={{ fontSize: '0.82rem', color: '#4B5563', fontStyle: 'italic' }}>
                                            Prix sur demande
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>

                </div>
            </div>

            {/* QUICK VIEW MODAL */}
            {selectedPiece && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000, padding: '20px',
                    backdropFilter: 'blur(6px)'
                }}>
                    <div style={{
                        maxWidth: '860px',
                        width: '100%',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        position: 'relative',
                        background: '#111010',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
                    }}>
                        {/* CLOSE BUTTON */}
                        <button
                            onClick={closeQuickView}
                            style={{
                                position: 'absolute', top: '16px', right: '16px',
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '50%',
                                width: '36px', height: '36px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', zIndex: 10,
                                color: '#A8A29E',
                                transition: 'all 0.2s'
                            }}
                        >
                            <X size={18} />
                        </button>

                        <div className="quick-view-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                            {/* IMAGE SIDE */}
                            <div style={{
                                background: '#0A0908',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '60px 40px',
                                minHeight: '400px',
                                borderRight: '1px solid rgba(255,255,255,0.06)'
                            }}>
                                {selectedPiece.imageUrl ? (
                                    <img
                                        src={getImageUrl(selectedPiece.imageUrl)!}
                                        alt={selectedPiece.nom}
                                        style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <Package size={80} color="rgba(255,255,255,0.1)" />
                                )}
                            </div>

                            {/* INFO SIDE */}
                            <div style={{ padding: '50px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                {/* Category pill */}
                                <div style={{ marginBottom: '14px' }}>
                                    <span style={{
                                        background: 'rgba(115,2,13,0.15)',
                                        color: '#73020D',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        padding: '4px 12px',
                                        borderRadius: '100px',
                                        letterSpacing: '0.8px',
                                        textTransform: 'uppercase',
                                        border: '1px solid rgba(115,2,13,0.25)'
                                    }}>
                                        {selectedPiece.categorieLibelle}
                                    </span>
                                </div>

                                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '10px', color: '#F5F4F2', lineHeight: 1.2 }}>
                                    {selectedPiece.nom}
                                </h2>

                                <div style={{ display: 'flex', gap: '2px', color: '#ffb400', marginBottom: '16px' }}>
                                    {[1,2,3,4,5].map(s => <Star key={s} size={15} fill="#ffb400" />)}
                                    <span style={{ color: '#4B5563', fontSize: '0.82rem', marginLeft: '8px', alignSelf: 'center' }}>Référence : {selectedPiece.reference}</span>
                                </div>

                                <p style={{ color: '#6B7280', lineHeight: 1.7, marginBottom: '28px', fontSize: '0.9rem' }}>
                                    Pièce de haute qualité {selectedPiece.marque ? `${selectedPiece.marque}` : ''}.
                                    Performance et durabilité garanties.
                                </p>

                                {/* Marque */}
                                {selectedPiece.marque && (
                                    <div style={{ marginBottom: '24px', fontSize: '0.88rem', color: '#6B7280' }}>
                                        <span style={{ fontWeight: 600, color: '#A8A29E' }}>Marque : </span>
                                        <span style={{ color: '#116BAB', fontWeight: 700 }}>{selectedPiece.marque}</span>
                                    </div>
                                )}

                                {/* QUANTITY SELECTOR */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        background: 'rgba(255,255,255,0.04)'
                                    }}>
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            style={{
                                                padding: '11px 14px',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#A8A29E',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'color 0.2s'
                                            }}
                                        >
                                            <Minus size={15} />
                                        </button>
                                        <span style={{ width: '36px', textAlign: 'center', fontWeight: 700, color: '#F5F4F2', fontSize: '0.95rem' }}>
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            style={{
                                                padding: '11px 14px',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#A8A29E',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'color 0.2s'
                                            }}
                                        >
                                            <Plus size={15} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleAddToCart(selectedPiece, quantity)}
                                        style={{
                                            flex: 1,
                                            background: '#73020D',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '13px 24px',
                                            borderRadius: '8px',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            fontSize: '0.88rem',
                                            letterSpacing: '0.5px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <ShoppingCart size={16} />
                                        AJOUTER AU PANIER
                                    </button>
                                </div>

                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '16px', fontSize: '0.85rem', color: '#6B7280' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Disponibilité :</span>
                                        <span style={{
                                            color: selectedPiece.quantiteStock > 3 ? '#22c55e' : selectedPiece.quantiteStock > 0 ? '#f59e0b' : '#ef4444',
                                            fontWeight: 700,
                                            fontSize: '0.82rem'
                                        }}>
                                            {selectedPiece.quantiteStock > 3 ? '✓ En stock' : selectedPiece.quantiteStock > 0 ? `⚠ Stock bas (${selectedPiece.quantiteStock})` : '✗ Épuisé'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                /* FILTER PANELS */
                .filter-panel {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 12px;
                    padding: 24px;
                }
                .filter-title {
                    font-size: 0.72rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: #4B5563;
                    margin: 0 0 18px 0;
                }

                /* SEARCH INPUT */
                .shop-search-input {
                    width: 100%;
                    padding: 10px 14px 10px 38px;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.06);
                    color: #E8E6E2;
                    font-size: 0.88rem;
                    font-family: inherit;
                    outline: none;
                    box-sizing: border-box;
                    transition: border-color 0.2s;
                }
                .shop-search-input::placeholder { color: #4B5563; }
                .shop-search-input:focus { border-color: rgba(115,2,13,0.5); }

                /* PRODUCT CARD */
                .shop-product-name {
                    font-size: 0.92rem;
                    font-weight: 700;
                    margin: 0 0 10px 0;
                    height: 2.4rem;
                    overflow: hidden;
                    cursor: pointer;
                    color: #A8A29E;
                    transition: color 0.25s;
                    line-height: 1.3;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }
                .shop-product-card:hover .shop-product-name { color: #E8E6E2; }
                .product-image-container:hover { background: #1E1C1A !important; }

                /* HOVER ACTIONS */
                .shop-hover-actions {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -40%);
                    display: flex;
                    gap: 12px;
                    opacity: 0;
                    transition: all 0.35s;
                    z-index: 100;
                }
                .product-image-container:hover .shop-hover-actions {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
                .shop-action-btn {
                    width: 40px; height: 40px; border-radius: 50%;
                    background: rgba(15,13,12,0.9);
                    color: #E8E6E2;
                    border: 1px solid rgba(255,255,255,0.15);
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                    transition: all 0.25s;
                    padding: 0;
                }
                .shop-action-btn:hover { background: #73020D; border-color: transparent; transform: scale(1.12); }
                .shop-action-btn.main {
                    width: 50px; height: 50px;
                    background: #73020D;
                    border: 2px solid rgba(255,255,255,0.2);
                }
                .shop-action-btn.main:hover { background: #8B0311; transform: scale(1.12); }
                .shop-action-btn svg { display: block; color: inherit; stroke: currentColor; }

                /* LOADING PULSE */
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }

                /* QUICK VIEW CLOSE BTN HOVER */
                button[title="Fermer"]:hover,
                .quick-view-close:hover { background: rgba(255,255,255,0.14) !important; }

                /* RESPONSIVE */
                @media (max-width: 1024px) {
                    .shop-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
                    .shop-sidebar { order: 2; }
                    main { order: 1; }
                }
                @media (max-width: 768px) {
                    .shop-grid { padding: 0 !important; }
                    .quick-view-grid { grid-template-columns: 1fr !important; }
                    .quick-view-grid > div:first-child { min-height: 200px !important; padding: 30px 20px !important; }
                    .quick-view-grid > div:last-child { padding: 30px 24px !important; }
                }
                @media (max-width: 480px) {
                    .shop-product-name { font-size: 0.85rem !important; }
                    .shop-action-btn { width: 34px; height: 34px; }
                    .shop-action-btn.main { width: 42px; height: 42px; }
                }
            `}</style>
        </div>
    );
};

export default ProductsListPage;
