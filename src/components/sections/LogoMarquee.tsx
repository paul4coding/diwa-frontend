import React from 'react';
import { motion } from 'framer-motion';

const productLogos = [
  { name: 'Engen', logo: '/assets/product-brands/Engen-logo-removebg-preview.png' },
  { name: 'Numax', logo: '/assets/product-brands/NumaxLogo.png' },
  { name: 'Texaco', logo: '/assets/product-brands/Texaco-Logo.png' },
  { name: 'Continental', logo: '/assets/product-brands/continental-logo-NoBack-removebg-preview.png' },
];

const LogoMarquee = () => {
  const marqueeLogos = [...productLogos, ...productLogos, ...productLogos, ...productLogos, ...productLogos];

  return (
    <div style={{
      background: '#838383ff',
      padding: '40px 0',
      overflow: 'hidden',
      borderTop: '1px solid rgba(0,0,0,0.05)',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      position: 'relative'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <p style={{
          fontSize: '0.7rem',
          fontWeight: 800,
          letterSpacing: '3px',
          opacity: 0.5,
          textTransform: 'uppercase',
          color: 'var(--text-primary)'
        }}>Nos Partenaires & Marques</p>
      </div>

      <div style={{ display: 'flex', width: 'fit-content' }}>
        <motion.div
          animate={{ x: [0, -2400] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '80px', paddingLeft: '80px' }}
        >
          {marqueeLogos.map((brand, index) => (
            <div key={index} className="marquee-logo-item">
              <img
                src={brand.logo}
                alt={brand.name}
                style={{
                  maxHeight: '100%',
                  maxWidth: '180px',
                  objectFit: 'contain',
                  transition: 'all 0.3s'
                }}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Style déclaré DANS le return pour être bien rendu par React */}
      <style>{`
        .marquee-logo-item {
          height: 70px;
          min-width: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 768px) {
          .marquee-logo-item {
            height: 40px !important;
            min-width: 100px !important;
          }
          .marquee-logo-item + .marquee-logo-item {
            margin-left: 40px;
          }
        }
      `}</style>
    </div>
  );
};

export default LogoMarquee;
