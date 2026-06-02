import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCMS } from '../../context/CMSContext'

export const ConfiguratorSection = () => {
  const { cmsData } = useCMS();
  const configData = cmsData.configurator || { 
    title: 'Créez votre véhicule idéal', 
    desc: 'Visualisez votre voiture sous tous les angles...' 
  };
  
  const images = ['/baic-bj80.webp', '/hero-2.avif', '/hero-3.webp']
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <section style={{ padding: '80px 4% 150px 4%', position: 'relative', backgroundColor: 'var(--bg-primary)' }}>
      
      {/* BACKGROUND NOIR AVEC MOTIF */}
      <div style={{
        backgroundColor: '#0a0a0a',
        backgroundImage: 'url("/dark-section-bg-image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '24px',
        padding: '80px 20px 240px 20px', // Plus de padding en bas pour laisser l'image déborder
        textAlign: 'center',
        color: '#fff',
        position: 'relative'
      }}>
        
        {/* PETIT BOUTON TAG */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <span style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            padding: '6px 16px', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 600 
          }}>
            <Play size={14} fill="#eab308" color="#eab308" /> Découvrir le Configurateur
          </span>
        </div>

        <h2 className="serif" style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '20px' }}>
          {configData.title}
        </h2>
        
        <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto 30px auto', lineHeight: '1.6' }}>
          {configData.desc}
        </p>


        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
            <CheckCircle2 size={18} color="#eab308" /> Visualisation HD
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
            <CheckCircle2 size={18} color="#eab308" /> Personnalisation sur mesure
          </span>
        </div>

      </div>

      {/* IMAGE SUPERPOSÉE (OVERLAP) AVEC SLIDER */}
      <div style={{
        marginTop: '-180px', // Fait remonter l'image sur la section noire
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
        padding: '0 5%'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '720px', // Taille encore réduite
          height: '420px', // Hauteur fixe pour éviter les sauts pendant le carrousel
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
          backgroundColor: '#000'
        }}>
          {/* IMAGE PRINCIPALE EN SLIDER */}
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt="Configuration Véhicule"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 0.8, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </AnimatePresence>
          
          {/* BOUTON PLAY AU CENTRE */}
          <Link to="/vehicules" style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(234, 179, 8, 0.95)', // Couleur jaune
            borderRadius: '50%',
            width: '54px', height: '54px',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 0 8px rgba(234, 179, 8, 0.2)',
            transition: 'all 0.3s ease',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
            e.currentTarget.style.boxShadow = '0 0 0 12px rgba(234, 179, 8, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
            e.currentTarget.style.boxShadow = '0 0 0 8px rgba(234, 179, 8, 0.2)';
          }}
          >
            <Play size={24} fill="#000" color="#000" style={{ marginLeft: '4px' }} />
          </Link>

          {/* DÉGRADÉ EN BAS POUR LES NOMS DE MARQUES */}
          <div style={{
            position: 'absolute', bottom: '0', left: '0', width: '100%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
            display: 'flex', justifyContent: 'center', gap: '40px', alignItems: 'center',
            padding: '50px 20px 20px 20px',
            color: '#fff',
            fontFamily: 'serif',
            fontSize: '1.1rem',
            letterSpacing: '2px'
          }}>
            <span>BAIC</span>
            <span>MG MOTOR</span>
            <span>CHEVROLET</span>
            <span>ISUZU</span>
          </div>
        </div>
      </div>

    </section>
  )
}

export default ConfiguratorSection
