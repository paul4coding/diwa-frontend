import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { ChevronLeft, ChevronRight, Eye, ShoppingCart, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import LoadingDots from '../common/LoadingDots'
import { useCMS } from '../../context/CMSContext'

const BASE_URL = 'http://localhost:8181';

export const ProductsSection = () => {
  const { cmsData } = useCMS();
  const prodData = cmsData.products || { title: 'Pièces & Accessoires', subtitle: 'Le meilleur pour votre moteur', bgImage: '/ribbon.png' };

  const sliderRef = React.useRef<HTMLDivElement>(null)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          axiosInstance.get('/api/v1/pieces-detachees/all'),
          axiosInstance.get('/api/v1/categories-pieces/all')
        ]);
        if (pRes.data.statut === 200) setProducts(pRes.data.data.slice(0, 10)); // Top 10
        if (cRes.data.statut === 200) setCategories(cRes.data.data);
      } catch (err) {
        console.error('Erreur chargement produits accueil:', err);
      }
    };
    fetchData();
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 400
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder-car.jpg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return `${BASE_URL}/uploads/${url}`;
  };

  const catLibelles = categories.map(c => c.libelle).join(', ');

  return (
    <section style={{
      backgroundImage: `url(${getImageUrl(prodData.bgImage)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '100px 8%',
      position: 'relative',
      transition: 'background-color 0.4s ease'
    }}>
      {/* Overlay pour assurer la lisibilité si l'image est trop claire/sombre */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        backgroundColor: 'var(--bg-primary)', 
        opacity: 0.85, 
        zIndex: 1,
        transition: 'background-color 0.4s ease'
      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>

      <motion.div 
        style={{ textAlign: 'center', marginBottom: '50px' }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="serif" style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '15px' }}>
          {prodData.title}
        </h2>
        <p style={{ opacity: 0.6, color: 'var(--text-primary)' }}>{prodData.subtitle}</p>
      </motion.div>

      <div style={{ position: 'relative' }}>
        <button className="slider-nav-btn prev" style={{ left: '-50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => scroll('left')}><ChevronLeft size={24} strokeWidth={2} color="#000" /></button>
        <button className="slider-nav-btn next" style={{ right: '-50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => scroll('right')}><ChevronRight size={24} strokeWidth={2} color="#000" /></button>

        <div className="products-slider" ref={sliderRef} style={{ display: 'flex', gap: '30px', overflowX: 'auto', scrollbarWidth: 'none', padding: '20px 0' }}>
          {products.length > 0 ? products.map((prod, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (idx % 4) * 0.1, ease: "easeOut" }}
              style={{ minWidth: '280px', flex: '0 0 auto' }}
            >
              <Link to={`/produits?cat=${prod.categorieId}`} style={{ textDecoration: 'none' }}>
                <div className="product-card" style={{ background: 'transparent' }}>
                  <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', overflow: 'hidden', padding: '10px' }}>
                    <img 
                      src={getImageUrl(prod.imageUrl)}
                      alt={prod.nom}
                      style={{
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'contain',
                        mixBlendMode: 'multiply',
                        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))'
                      }} 
                    />
                    
                    {/* OVERLAY AVEC ICONES AU SURVOL */}
                    <div className="product-actions-overlay">
                      <button className="action-btn"><Eye size={18} /></button>
                      <button className="action-btn main"><ShoppingCart size={20} /></button>
                      <button className="action-btn"><Heart size={18} /></button>
                    </div>
                  </div>
                  <div className="price-tag-red" style={{ background: '#b71c1c', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontWeight: 900, display: 'inline-block', marginBottom: '10px', fontSize: '0.85rem' }}>
                     <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Prix sur demande</span>
                  </div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 800, height: '3rem', overflow: 'hidden' }}>{prod.nom}</h4>
                </div>
              </Link>
            </motion.div>
          )) : (
            <div style={{ width: '100%', textAlign: 'center', padding: '40px', color: '#94a3b8' }}><LoadingDots /></div>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <Link to="/produits">
          <button className="btn-commencer" style={{ padding: '15px 60px', background: '#b71c1c', color: '#fff', border: 'none', borderRadius: '30px', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}>
             ACCÉDER AUX PRODUITS
          </button>
        </Link>
      </div>

      <style>{`
        .products-slider::-webkit-scrollbar { display: none; }
        .product-card { transition: 0.3s; padding: 15px; border-radius: 20px; background: transparent; }
        .product-card:hover { transform: translateY(-10px); background: rgba(0,0,0,0.03); }
        
        .product-card .product-actions-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -40%);
            display: flex;
            gap: 15px;
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            z-index: 100;
        }
        .product-card:hover .product-actions-overlay {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
        .action-btn {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            border: 1.5px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 15px 35px rgba(0,0,0,0.3);
            transition: all 0.3s;
            padding: 0;
        }
        .action-btn:hover { background: #b71c1c; color: #fff; transform: scale(1.15); }
        .action-btn.main { 
            width: 52px; 
            height: 52px; 
            background: #b71c1c; 
            border: 2px solid #fff;
        }
        .action-btn.main:hover { background: #000; }
        
        .action-btn svg {
            display: block;
            color: #fff !important;
            stroke: #fff !important;
        }

        .slider-nav-btn {
            position: absolute; top: 50%; transform: translateY(-50%);
            width: 50px; height: 50px; border-radius: 50%; background: var(--bg-primary);
            border: 1px solid var(--bg-secondary); cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            z-index: 10; font-size: 1.2rem;
            display: flex; align-items: center; justify-content: center;
        }
        .slider-nav-btn:hover { background: var(--text-primary); color: var(--bg-primary); transform: translateY(-50%) scale(1.1); }
        .slider-nav-btn svg { stroke: var(--text-primary) !important; }
        .slider-nav-btn:hover svg { stroke: var(--bg-primary) !important; }
      `}</style>
      </div>
    </section>
  )
}

export default ProductsSection
