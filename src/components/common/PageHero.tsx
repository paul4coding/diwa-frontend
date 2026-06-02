import React from 'react';

interface PageHeroProps {
  /** Texte du tag (ex: "Expertise", "Contact") */
  tag?: string;
  /** Tableau de mots du titre principal — animés mot par mot */
  titleWords: string[];
  /** Sous-titre descriptif */
  subtitle?: string;
  /** URL de l'image de fond */
  bgImage?: string;
  /** Couleur de fond fallback (si pas d'image) */
  bgColor?: string;
  /** Hauteur du hero. Default: '70vh' */
  height?: string;
  /** Aligner le contenu : 'left' | 'center' */
  align?: 'left' | 'center';
}

/**
 * Hero réutilisable new-gen pour toutes les pages internes.
 * Même ADN que le Hero de la Home : split-text, gradient cinématique, scroll indicator.
 */
const PageHero: React.FC<PageHeroProps> = ({
  tag,
  titleWords,
  subtitle,
  bgImage,
  bgColor = '#0C0A09',
  height = '70vh',
  align = 'left',
}) => {
  return (
    <>
      <div
        className="ph-hero"
        style={{
          height,
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundColor: bgColor,
        }}
      >
        {/* Ken Burns zoom */}
        {bgImage && <div className="ph-bg-zoom" style={{ backgroundImage: `url(${bgImage})` }} />}

        {/* Gradient */}
        <div className="ph-gradient" />

        {/* Content */}
        <div className={`ph-content ${align === 'center' ? 'ph-center' : ''}`}>
          {tag && (
            <div className="ph-tag">
              <span className="ph-dot" />
              {tag}
            </div>
          )}

          <div className="ph-title-wrap">
            {titleWords.map((word, i) => (
              <div key={i} className="ph-word-overflow">
                <span
                  className="ph-word"
                  style={{ animationDelay: `${0.08 + i * 0.12}s` }}
                >
                  {word}
                </span>
              </div>
            ))}
          </div>

          {subtitle && <p className="ph-subtitle">{subtitle}</p>}
        </div>

        {/* Scroll indicator (hidden on mobile) */}
        <div className="ph-scroll-ind">
          <div className="ph-scroll-line" />
          <span className="ph-scroll-txt">SCROLL</span>
        </div>
      </div>

      <style>{`
        /* ============================================
         * PageHero — Composant Hero Réutilisable
         * ============================================ */
        .ph-hero {
          position: relative;
          width: 100%;
          min-height: 400px;
          overflow: hidden;
          background-color: #0C0A09;
        }

        /* Ken Burns bg */
        .ph-bg-zoom {
          position: absolute; inset: 0;
          background-size: cover;
          background-position: center 40%;
          filter: brightness(0.65);
          animation: phKbZoom 10s ease-out forwards;
        }
        @keyframes phKbZoom {
          from { transform: scale(1.06); }
          to   { transform: scale(1.0); }
        }

        /* Gradient layers */
        .ph-gradient {
          position: absolute; inset: 0; z-index: 1;
          background:
            linear-gradient(to top,  rgba(12,10,9,0.96) 0%, rgba(12,10,9,0.55) 50%, rgba(12,10,9,0.15) 100%),
            linear-gradient(to right, rgba(12,10,9,0.55) 0%, transparent 65%);
        }

        /* Content */
        .ph-content {
          position: absolute;
          bottom: 90px;
          left: 8%;
          z-index: 2;
          max-width: 680px;
        }
        .ph-content.ph-center {
          left: 50%; transform: translateX(-50%);
          text-align: center;
          max-width: 800px;
        }
        .ph-content.ph-center .ph-tag { justify-content: center; }
        .ph-content.ph-center .ph-title-wrap { justify-content: center; }

        /* Tag */
        .ph-tag {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 4px; color: rgba(255,255,255,0.6); margin-bottom: 22px;
        }
        .ph-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #73020D; flex-shrink: 0;
        }

        /* Title */
        .ph-title-wrap { display: flex; flex-wrap: wrap; gap: 0 14px; margin-bottom: 18px; }
        .ph-word-overflow { overflow: hidden; display: inline-block; }
        .ph-word {
          display: inline-block;
          font-size: clamp(2.5rem, 6vw, 6rem);
          font-weight: 200;
          color: #fff;
          letter-spacing: -2px;
          line-height: 0.92;
          font-family: 'Poppins', sans-serif;
          animation: phWordIn 0.85s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes phWordIn {
          from { transform: translateY(110%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        /* Subtitle */
        .ph-subtitle {
          font-size: 0.92rem;
          color: rgba(255,255,255,0.52);
          line-height: 1.75;
          max-width: 480px;
          margin: 0;
        }
        .ph-content.ph-center .ph-subtitle { max-width: 100%; }

        /* Scroll indicator */
        .ph-scroll-ind {
          position: absolute; right: 36px; top: 50%; transform: translateY(-50%);
          z-index: 10; display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .ph-scroll-line {
          width: 1px; height: 70px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.4));
          animation: scrollPulse 2s ease-in-out infinite;
        }
        .ph-scroll-txt {
          font-size: 0.48rem; font-weight: 800; letter-spacing: 4px;
          color: rgba(255,255,255,0.3); writing-mode: vertical-rl;
        }

        @media (max-width: 768px) {
          .ph-content { bottom: 60px; left: 6%; right: 6%; }
          .ph-content.ph-center { left: 50%; transform: translateX(-50%); }
          .ph-word { font-size: clamp(2rem, 9vw, 3.5rem); letter-spacing: -1px; }
          .ph-scroll-ind { display: none; }
        }
      `}</style>
    </>
  );
};

export default PageHero;
