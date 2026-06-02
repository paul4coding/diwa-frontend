import React from 'react'
import { motion } from 'framer-motion'
import { useCMS } from '../../context/CMSContext'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

// ─── Variants stagger (source: ui-ux-pro-max — Motion-Driven style) ───────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } }
}

const cardVariants = {
  hidden:   { opacity: 0, y: 64, scale: 0.97 },
  visible:  { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as any }
  }
}

// Version allégée pour prefers-reduced-motion
const cardVariantsReduced = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } }
}

export const ServicesSection = () => {
  const { cmsData } = useCMS()
  const reduced = usePrefersReducedMotion()

  const defaultServices = [
    { title: "Véhicules Neufs",  desc: "Découvrez nos modèles MG, ISUZU, CHEVROLET et BAIC.", image: "/hero-1.jpg",  link: "/vehicules" },
    { title: "Configuration",    desc: "Personnalisez votre véhicule en temps réel avec nos options.", image: "/hero-2.avif", link: "/vehicules" },
    { title: "Garage & SAV",     desc: "Réservez vos entretiens et réparations facilement en ligne.", image: "/sav-bg.jpg", link: "/garage" }
  ]

  const services = cmsData.services && cmsData.services.length > 0
    ? cmsData.services
    : defaultServices

  const getImageUrl = (path: string) => {
    if (!path) return '/hero-1.jpg'
    if (path.startsWith('http') || path.startsWith('/')) return path
    return `http://localhost:8181/uploads/${path}`
  }

  // ─── Kinetic typography — titre mot par mot ──────────────────────────────────
  const titleText = cmsData.sections?.services?.title || "L'Expérience DIWA."
  const titleWords = titleText.split(' ')

  return (
    <section style={{ background: '#070707ff', color: '#fff', padding: '120px 4% 140px', position: 'relative', overflow: 'hidden' }}>

      {/* Background glow */}
      <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '50vh', background: 'radial-gradient(ellipse at center, rgba(115,2,13,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />

      {/* ── Header : kinetic typography ── */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '800px', margin: '0 auto 80px' }}>

        {/* Titre — mot par mot (source: ui-ux-pro-max — Kinetic Typography) */}
        <div style={{
          fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
          fontWeight: 800,
          letterSpacing: '-1.5px',
          lineHeight: 1.15,
          marginBottom: '22px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 0.28em'
        }}>
          {titleWords.map((word: string, i: number) => (
            <div key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
              <motion.span
                style={{ display: 'inline-block' }}
                initial={{ y: reduced ? 0 : '110%', opacity: reduced ? 0 : 1 }}
                whileInView={{ y: '0%', opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: reduced ? 0.25 : 0.85,
                  delay:    reduced ? i * 0.04 : 0.1 + i * 0.13,
                  ease:     [0.16, 1, 0.3, 1] as any
                }}
              >
                {word}
              </motion.span>
            </div>
          ))}
        </div>

        {/* Sous-titre — fade up décalé */}
        <motion.p
          initial={{ opacity: 0, y: reduced ? 0 : 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{
            duration: reduced ? 0.25 : 0.8,
            delay:    reduced ? 0 : 0.55,
            ease: 'easeOut'
          }}
          style={{ fontSize: '1.1rem', color: '#A8A29E', lineHeight: 1.6, fontWeight: 400, margin: 0 }}
        >
          {cmsData.sections?.services?.subtitle || "Plus qu'un concessionnaire, un accompagnement de prestige pour répondre à toutes vos exigences automobiles."}
        </motion.p>
      </div>

      {/* ── Cards : stagger container (source: ui-ux-pro-max — Motion-Driven) ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          position: 'relative',
          zIndex: 1,
          maxWidth: '1400px',
          margin: '0 auto'
        }}
      >
        {services.map((service: any, idx: number) => (
          <motion.div
            key={idx}
            variants={reduced ? cardVariantsReduced : cardVariants}
            style={{ minHeight: '480px' }}
          >
            <ServiceCard
              title={service.title}
              desc={service.desc}
              img={getImageUrl(service.image)}
              link={service.link || '/'}
            />
          </motion.div>
        ))}
      </motion.div>

      <style>{`
        .service-premium-card {
          position: relative;
          height: 480px;
          border-radius: 16px;
          overflow: hidden;
          background: #1C1917;
          text-decoration: none;
          display: flex;
          align-items: flex-end;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .service-premium-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          border-color: rgba(115,2,13,0.3);
        }
        .service-premium-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 0;
          opacity: 0.7;
        }
        .service-premium-card:hover .service-premium-img {
          transform: scale(1.05);
          opacity: 0.9;
        }
        .service-premium-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%);
          z-index: 1;
        }
        .service-premium-content {
          position: relative;
          z-index: 2;
          padding: 40px 30px;
          width: 100%;
          color: #fff;
        }
        .service-premium-title {
          font-size: 1.6rem;
          font-weight: 800;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }
        .service-premium-desc {
          font-size: 0.95rem;
          color: #A8A29E;
          line-height: 1.6;
          margin-bottom: 24px;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .service-premium-card:hover .service-premium-desc {
          opacity: 1;
          transform: translateY(0);
        }
        .service-premium-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #fff;
        }
        .service-premium-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .service-premium-card:hover .service-premium-icon {
          background: #73020D;
          transform: translateX(5px);
        }

        /* Respect prefers-reduced-motion (source: ui-ux-pro-max UX guidelines) */
        @media (prefers-reduced-motion: reduce) {
          .service-premium-card,
          .service-premium-img,
          .service-premium-desc,
          .service-premium-icon { transition: none !important; }
        }
      `}</style>
    </section>
  )
}

const ServiceCard = ({ title, desc, img, link }: {
  title: string; desc: string; img: string; link: string
}) => (
  <Link to={link} className="service-premium-card">
    <img src={img} alt={title} className="service-premium-img" />
    <div className="service-premium-overlay" />
    <div className="service-premium-content">
      <h3 className="service-premium-title">{title}</h3>
      <p className="service-premium-desc">{desc}</p>
      <div className="service-premium-action">
        Découvrir
        <div className="service-premium-icon">
          <ArrowRight size={16} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  </Link>
)

export default ServicesSection
