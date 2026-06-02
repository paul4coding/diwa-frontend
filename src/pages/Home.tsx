import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ServicesSection from '../components/sections/ServicesSection'
import ProductsSection from '../components/sections/ProductsSection'
import ConfiguratorSection from '../components/sections/ConfiguratorSection'
import AboutUsSection from '../components/sections/AboutUsSection'
import LogoMarquee from '../components/sections/LogoMarquee'
import AppointmentSection from '../components/sections/AppointmentSection'
import TestimonialsSection from '../components/sections/TestimonialsSection'
import FloatingContact from '../components/common/FloatingContact'
import { ScrollExperience } from '../ScrollExperience'
import axiosInstance from '../utils/axiosInstance'
import { ArrowRight, ChevronLeft, ChevronRight, Gauge, Zap, Cog } from 'lucide-react'
import { motion } from 'framer-motion'
import ScrollReveal from '../components/common/ScrollReveal'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const BASE_URL = 'http://localhost:8181';

const getImageUrl = (path: string | null) => {
  if (!path) return '/placeholder-car.jpg';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return path; // Asset local (public/)
  return `${BASE_URL}/uploads/${path}`;
};

import { useCMS } from '../context/CMSContext'

const HeroSlider = () => {
  const { cmsData } = useCMS()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const SLIDE_DURATION = 7000

  const defaultSlides = [
    { id: 1, image: '/MGRX8.png', title: "MG RX8", subtitle: "Dominez la Route", desc: "L'élégance SUV et la puissance réunies.", tag: "SUV Premium" },
    { id: 2, image: '/chevrolet.png', title: "Chevrolet", subtitle: "Equinox", desc: "Confort urbain et technologie avancée.", tag: "Crossover" }
  ]

  const slides = (cmsData.hero && cmsData.hero.length > 0 ? cmsData.hero : defaultSlides)

  const goToSlide = (idx: number) => { setCurrentSlide(idx); setProgress(0); }
  const goNext = () => goToSlide((currentSlide + 1) % slides.length)
  const goPrev = () => goToSlide((currentSlide - 1 + slides.length) % slides.length)

  useEffect(() => {
    setProgress(0)
    const start = Date.now()
    const iv = setInterval(() => setProgress(Math.min(((Date.now() - start) / SLIDE_DURATION) * 100, 100)), 40)
    const t = setTimeout(goNext, SLIDE_DURATION)
    return () => { clearInterval(iv); clearTimeout(t) }
  }, [currentSlide, slides.length])

  const getImg = (img: string) => {
    if (!img) return ''; if (img.startsWith('http') || img.startsWith('/')) return img;
    return `http://localhost:8181/uploads/${img}`
  }

  const slide = slides[currentSlide]
  const pad = (n: number) => String(n + 1).padStart(2, '0')
  const words = (slide.title || '').split(' ')

  return (
    <section className="ng-hero">
      {/* Ken Burns backgrounds */}
      {slides.map((s: any, i: number) => (
        <div key={i} className={`ng-bg ${i === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url(${getImg(s.image)})` }} />
      ))}

      {/* Gradient */}
      <div className="ng-gradient" />

      {/* Watermark number */}
      <motion.div key={`wm-${currentSlide}`} className="ng-watermark"
        initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
        {pad(currentSlide)}
      </motion.div>

      {/* Content */}
      <div className="ng-content">
        <motion.div key={`tag-${currentSlide}`} className="ng-tag"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <span className="ng-dot" /> {slide.tag || 'Premium'}
        </motion.div>

        {/* Split title — word by word */}
        <div className="ng-title-wrap">
          {words.map((word: string, i: number) => (
            <div key={`${currentSlide}-${i}`} className="ng-overflow">
              <motion.span className="ng-word"
                initial={{ y: '110%' }} animate={{ y: '0%' }}
                transition={{ duration: 0.85, delay: 0.1 + i * 0.13, ease: [0.16, 1, 0.3, 1] }}>
                {word}
              </motion.span>
            </div>
          ))}
        </div>

        <motion.p key={`sub-${currentSlide}`} className="ng-subtitle"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}>
          {slide.subtitle}
        </motion.p>

        <motion.p key={`desc-${currentSlide}`} className="ng-desc"
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          {slide.desc || slide.description || ''}
        </motion.p>

        <motion.div key={`cta-${currentSlide}`} className="ng-ctas"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}>
          <Link to="/vehicules"><button className="ng-btn-primary">Configurer <ArrowRight size={15} /></button></Link>
          <Link to="/garage"><button className="ng-btn-ghost">Rendez-vous</button></Link>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="ng-bottom">
        <div className="ng-counter">
          <span className="ng-num-active">{pad(currentSlide)}</span>
          <div className="ng-tracks">
            {slides.map((_: any, i: number) => (
              <div key={i} className="ng-track" onClick={() => goToSlide(i)}>
                <div className="ng-fill" style={{
                  width: i === currentSlide ? `${progress}%` : i < currentSlide ? '100%' : '0%'
                }} />
              </div>
            ))}
          </div>
          <span className="ng-num-total">{pad(slides.length - 1)}</span>
        </div>
        <div className="ng-nav">
          <button className="ng-arrow ng-arrow-prev" onClick={goPrev} />
          <button className="ng-arrow ng-arrow-next" onClick={goNext} />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="ng-scroll-ind">
        <div className="ng-scroll-line" />
        <span className="ng-scroll-txt">SCROLL</span>
      </div>
    </section>
  )
}

const Home = () => {
  const [vehicles, setVehicles] = useState<any[]>([])
  const arrivalsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axiosInstance.get('/api/v1/vehicules/all')
        if (response.data.statut === 200) {
          setVehicles(response.data.data)
        }
      } catch (err) {
        console.error("Erreur chargement véhicules:", err)
      }
    }
    fetchVehicles()
  }, [])

  const newArrivals = [...vehicles].sort((a, b) => b.id - a.id).slice(0, 5)
  const finalModelUrl = vehicles.find(v => v.fichierGlb)?.fichierGlb
    ? (vehicles.find(v => v.fichierGlb).fichierGlb.startsWith('http') ? vehicles.find(v => v.fichierGlb).fichierGlb : `${BASE_URL}/uploads/${vehicles.find(v => v.fichierGlb).fichierGlb.replace(/^\//, '')}`)
    : `${BASE_URL}/uploads/vehicules/5c1cb55e-0e77-48a5-b4db-dfe26286d495.glb`;

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', paddingTop: '80px', transition: 'background 0.4s ease, color 0.4s ease' }}>

      <HeroSlider />



      <ServicesSection />

      {/* TRANSITION CAR (INTERSECTION) */}
      <div style={{ position: 'relative', height: '0', zIndex: 50, display: 'flex', justifyContent: 'center' }}>
        <motion.img
          src="/MG5.png"
          alt="MG5 Transition"
          initial={{ opacity: 0, x: -150 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{
            position: 'absolute',
            top: '-120px',
            width: '450px',
            height: 'auto'
          }}
        />
      </div>

      {/* 2. SECTION NOUVEAUTÉS (REMPLACE LE DESIGN DES CARTES) */}
      <section id="new-arrivals-section" style={{ background: 'var(--bg-secondary)', padding: '120px 8%', overflow: 'hidden', transition: 'background 0.4s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '80px' }}>
          <div>
            {/* Label fade-in */}
            <motion.h3
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ color: '#b71c1c', letterSpacing: '4px', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px' }}
            >
              Inventaire
            </motion.h3>
            {/* Kinetic typography — mot par mot */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 0.25em' }}>
              {['Dernières', 'Arrivées'].map((word, i) => (
                <div key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
                  <motion.span
                    className="staggered-title"
                    style={{ display: 'inline-block', fontSize: '2.5rem' }}
                    initial={{ y: '110%' }}
                    whileInView={{ y: '0%' }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.85, delay: 0.15 + i * 0.13, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {word}
                  </motion.span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button className="elite-nav-btn" onClick={() => {
              const el = arrivalsRef.current;
              if (el) {
                if (el.scrollLeft <= 0) {
                  el.scrollTo({ left: el.scrollWidth, behavior: 'auto' });
                }
                el.scrollBy({ left: -450, behavior: 'smooth' });
              }
            }}><ChevronLeft size={65} strokeWidth={2} color="var(--text-primary)" /></button>
            <button className="elite-nav-btn" onClick={() => {
              const el = arrivalsRef.current;
              if (el) {
                if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
                  el.scrollTo({ left: 0, behavior: 'auto' });
                }
                el.scrollBy({ left: 450, behavior: 'smooth' });
              }
            }}><ChevronRight size={65} strokeWidth={2} color="var(--text-primary)" /></button>
          </div>
        </div>

        <div className="elite-slider-wrapper" ref={arrivalsRef} style={{ scrollSnapType: 'x mandatory' }}>
          {/* On triple les éléments pour simuler le loop infini proprement */}
          {[...newArrivals, ...newArrivals, ...newArrivals].map((vh, idx) => (
            <motion.div
              key={`${vh.id}-${idx}`}
              className="ngc-card"
              style={{ scrollSnapAlign: 'start' }}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: (idx % 5) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Accent top line */}
              <div className="ngc-accent-line" />

              {/* Watermark number */}
              <div className="ngc-number">{String((idx % newArrivals.length) + 1).padStart(2, '0')}</div>

              {/* Image */}
              <div className="ngc-image-zone">
                <img src={getImageUrl(vh.imagePrincipale)} alt={vh.modele} />
              </div>

              {/* Info panel */}
              <div className="ngc-info">
                <div className="ngc-brand">{vh.marque}</div>
                <h4 className="ngc-model">{vh.modele}</h4>
                <div className="ngc-price">
                  <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 500, letterSpacing: '1px' }}>Prix sur demande</span>
                </div>

                {/* Hover-only specs + CTA */}
                <div className="ngc-hover-content">
                  <div className="ngc-specs">
                    <div className="ngc-spec"><Zap size={12} /><span>180 HP</span></div>
                    <div className="ngc-spec"><Gauge size={12} /><span>0-100 / 7s</span></div>
                    <div className="ngc-spec"><Cog size={12} /><span>Auto</span></div>
                  </div>
                  <Link to={`/vehicules/${vh.uuid}`} className="ngc-cta">
                    Découvrir <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}

        </div>

        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <Link to="/vehicules" className="elite-stock-link">
            Explorer tout notre stock ({vehicles.length} véhicules) <ArrowRight size={20} />
          </Link>
        </div>
      </section>
      <AppointmentSection />


      <ScrollReveal direction="up">
        <ProductsSection />
      </ScrollReveal>

      <LogoMarquee />

      <ScrollReveal direction="right">
        <ConfiguratorSection />
      </ScrollReveal>

      <ScrollReveal direction="left">
        <AboutUsSection />
      </ScrollReveal>

      <ScrollReveal direction="up">
        <TestimonialsSection />
      </ScrollReveal>
      <FloatingContact />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;700;900&display=swap');

        /* ===== NEW GEN HERO ===== */
        .ng-hero { position:relative; width:100%; height:calc(100vh - 80px); min-height:520px; overflow:hidden; background:#000; }

        .ng-bg { position:absolute; inset:0; background-size:cover; background-position:center 40%;
          opacity:0; transition:opacity 1.4s cubic-bezier(0.16,1,0.3,1); filter:brightness(0.7); }
        .ng-bg.active { opacity:1; animation:kbZoom 7.5s ease-out forwards; }
        @keyframes kbZoom { from { transform:scale(1.06); } to { transform:scale(1.0); } }

        .ng-gradient { position:absolute; inset:0; z-index:1;
          background: linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.08) 100%),
                      linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 65%); }

        .ng-watermark { position:absolute; right:5%; bottom:10%; z-index:1;
          font-size:clamp(8rem,22vw,18rem); font-weight:900; color:rgba(255,255,255,0.04);
          line-height:1; pointer-events:none; user-select:none; font-family:'Poppins',sans-serif; }

        .ng-content { position:absolute; bottom:160px; left:8%; z-index:2; max-width:720px; }

        .ng-tag { display:inline-flex; align-items:center; gap:10px; font-size:0.68rem;
          font-weight:700; text-transform:uppercase; letter-spacing:4px;
          color:rgba(255,255,255,0.65); margin-bottom:28px; }
        .ng-dot { width:7px; height:7px; border-radius:50%; background:#b71c1c; flex-shrink:0; }

        .ng-title-wrap { display:flex; flex-wrap:wrap; gap:0 18px; margin-bottom:18px; }
        .ng-overflow { overflow:hidden; display:inline-block; }
        .ng-word { display:inline-block; font-size:clamp(3.2rem,7.5vw,7.5rem);
          font-weight:200; color:#fff; letter-spacing:-3px; line-height:0.92;
          font-family:'Poppins',sans-serif; }

        .ng-subtitle { font-size:clamp(1rem,2vw,1.5rem); font-weight:800; color:#b71c1c;
          text-transform:uppercase; letter-spacing:5px; margin:0 0 18px; }
        .ng-desc { font-size:0.95rem; color:rgba(255,255,255,0.55); margin:0 0 38px;
          line-height:1.75; max-width:480px; }

        .ng-ctas { display:flex; gap:14px; flex-wrap:wrap; }
        .ng-btn-primary { display:inline-flex; align-items:center; gap:10px;
          background:#b71c1c; color:#fff; border:none; padding:15px 34px;
          font-weight:700; font-size:0.8rem; text-transform:uppercase; letter-spacing:2px;
          cursor:pointer; transition:all 0.4s cubic-bezier(0.16,1,0.3,1);
          clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%); }
        .ng-btn-primary:hover { background:#fff; color:#b71c1c; transform:translateY(-3px); }
        .ng-btn-ghost { display:inline-flex; align-items:center; gap:10px;
          background:transparent; color:#fff; border:1px solid rgba(255,255,255,0.35);
          padding:15px 34px; font-weight:600; font-size:0.8rem; text-transform:uppercase;
          letter-spacing:2px; cursor:pointer; transition:all 0.4s cubic-bezier(0.16,1,0.3,1); }
        .ng-btn-ghost:hover { border-color:#fff; background:rgba(255,255,255,0.08); }

        /* Bottom bar */
        .ng-bottom { position:absolute; bottom:36px; left:8%; right:8%; z-index:10;
          display:flex; justify-content:space-between; align-items:center; }
        .ng-counter { display:flex; align-items:center; gap:18px; }
        .ng-num-active { font-size:0.8rem; font-weight:800; color:#fff; }
        .ng-num-total  { font-size:0.8rem; font-weight:600; color:rgba(255,255,255,0.4); }
        .ng-tracks { display:flex; gap:8px; width:180px; }
        .ng-track { flex:1; height:2px; background:rgba(255,255,255,0.18); cursor:pointer;
          position:relative; overflow:hidden; }
        .ng-fill { position:absolute; top:0; left:0; height:100%; background:#b71c1c;
          transition:width 0.04s linear; }
        .ng-nav { display:flex; gap:8px; }
        .ng-arrow {
          width:42px; height:42px; border-radius:50%;
          background:rgba(0,0,0,0.45); border:1.5px solid rgba(255,255,255,0.55);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all 0.3s ease; backdrop-filter:blur(6px);
          padding:0; position:relative; flex-shrink:0;
        }
        .ng-arrow::before {
          content:'';
          display:block;
          width:10px; height:10px;
          border-top:2.5px solid #ffffff;
          border-left:2.5px solid #ffffff;
          flex-shrink:0;
        }
        .ng-arrow-prev::before { transform:rotate(-45deg) translateX(2px); }
        .ng-arrow-next::before { transform:rotate(135deg) translateX(2px); }
        .ng-arrow:hover { background:#b71c1c; border-color:#b71c1c; transform:scale(1.08); }
        .ng-arrow:hover::before { border-color:#ffffff; }

        /* Scroll indicator */
        .ng-scroll-ind { position:absolute; right:36px; top:50%; transform:translateY(-50%);
          z-index:10; display:flex; flex-direction:column; align-items:center; gap:12px; }
        .ng-scroll-line { width:1px; height:80px;
          background:linear-gradient(to bottom,transparent,rgba(255,255,255,0.45));
          animation:scrollPulse 2s ease-in-out infinite; }
        @keyframes scrollPulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
        .ng-scroll-txt { font-size:0.5rem; font-weight:800; letter-spacing:4px;
          color:rgba(255,255,255,0.35); writing-mode:vertical-rl; }

        /* ===== REST OF HOME PAGE ===== */
        .elite-slider-wrapper { display:flex; gap:30px; overflow-x:auto; scroll-snap-type:x mandatory;
          padding:20px 0; scrollbar-width:none; will-change:transform; }
        .elite-slider-wrapper::-webkit-scrollbar { display:none; }

        /* ===== NEW GEN VEHICLE CARDS ===== */
        .ngc-card { min-width:370px; border-radius:16px; overflow:hidden; scroll-snap-align:start;
          position:relative; cursor:pointer; background:var(--bg-primary);
          border:1px solid var(--admin-border,rgba(0,0,0,0.08));
          box-shadow:0 8px 40px rgba(0,0,0,0.06);
          transition:all 0.65s cubic-bezier(0.16,1,0.3,1); }
        .ngc-card:hover { transform:translateY(-18px);
          box-shadow:0 50px 100px rgba(0,0,0,0.14);
          border-color:rgba(183,28,28,0.25); }

        /* Accent top sweep */
        .ngc-accent-line { position:absolute; top:0; left:0; height:3px; width:0;
          background:linear-gradient(90deg,#b71c1c,#ff5252);
          transition:width 0.65s cubic-bezier(0.16,1,0.3,1); z-index:10; }
        .ngc-card:hover .ngc-accent-line { width:100%; }

        /* Watermark number */
        .ngc-number { position:absolute; top:16px; right:20px; font-size:3.5rem;
          font-weight:900; color:rgba(0,0,0,0.055); line-height:1; z-index:1;
          pointer-events:none; font-family:'Poppins',sans-serif;
          transition:color 0.5s ease; }
        .ngc-card:hover .ngc-number { color:rgba(183,28,28,0.09); }

        /* Image zone */
        .ngc-image-zone { height:250px; display:flex; align-items:center;
          justify-content:center; padding:20px 30px; overflow:hidden;
          background:var(--bg-secondary); }
        .ngc-image-zone img { width:100%; height:100%; object-fit:contain;
          transition:transform 1s cubic-bezier(0.16,1,0.3,1);
          filter:drop-shadow(0 18px 28px rgba(0,0,0,0.13)); }
        .ngc-card:hover .ngc-image-zone img { transform:scale(1.1) translateY(-8px); }

        /* Info panel */
        .ngc-info { padding:22px 24px 24px; position:relative; z-index:2; }
        .ngc-brand { font-size:0.62rem; font-weight:800; text-transform:uppercase;
          letter-spacing:4px; color:#b71c1c; margin-bottom:5px; }
        .ngc-model { font-size:1.55rem; font-weight:800; margin:0 0 10px;
          color:var(--text-primary); line-height:1.1; }
        .ngc-price { font-size:1.15rem; font-weight:900; color:var(--text-primary); }
        .ngc-price span { font-size:0.68rem; font-weight:600; opacity:0.5; margin-left:4px; }

        /* Slide-up hover content */
        .ngc-hover-content { max-height:0; overflow:hidden; opacity:0; margin-top:0;
          transition:max-height 0.55s cubic-bezier(0.16,1,0.3,1),
                      opacity 0.4s ease, margin-top 0.4s ease; }
        .ngc-card:hover .ngc-hover-content { max-height:120px; opacity:1; margin-top:18px; }

        .ngc-specs { display:flex; gap:18px; margin-bottom:16px; }
        .ngc-spec { display:flex; align-items:center; gap:5px; font-size:0.67rem;
          font-weight:700; text-transform:uppercase; letter-spacing:1px;
          color:var(--text-primary); opacity:0.55; }

        .ngc-cta { display:inline-flex; align-items:center; gap:8px;
          background:#b71c1c; color:#fff; text-decoration:none;
          padding:10px 22px; font-size:0.72rem; font-weight:700;
          text-transform:uppercase; letter-spacing:2px;
          transition:all 0.3s ease; border-radius:3px; }
        .ngc-cta:hover { background:#000; transform:translateX(4px); }

        /* Navigation buttons */
        .elite-nav-btn { background:none; border:none; cursor:pointer;
          opacity:0.3; transition:opacity 0.3s; padding:0; line-height:0; }
        .elite-nav-btn:hover { opacity:1; }

        /* Stock link */
        .elite-stock-link { display:inline-flex; align-items:center; gap:12px;
          font-weight:800; font-size:1rem; color:var(--text-primary);
          text-decoration:none; border-bottom:2px solid currentColor;
          padding-bottom:4px; transition:all 0.3s ease; letter-spacing:1px; }
        .elite-stock-link:hover { color:#b71c1c; gap:18px; }

        @media (max-width:1024px) {
          .ng-hero { height:calc(100vh - 60px); }
          .ngc-card { min-width:300px; }
          .ngc-image-zone { height:200px; }
          .ng-content { bottom:130px; left:6%; right:6%; }
          .ng-scroll-ind { display:none; }
        }
        @media (max-width:768px) {
          .ng-hero { height:calc(100vh - 60px); }
          .ng-word { font-size:clamp(2.4rem,10vw,4.5rem); letter-spacing:-1px; }
          .ng-tracks { width:110px; }
          .ng-watermark { display:none; }
          .ng-content { bottom:110px; }
          .ngc-card { min-width:270px; }
        }

      `}</style>

      
      {/* Hidden images to force early loading/decoding of critical assets */}
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {newArrivals.slice(0, 2).map((vh, i) => (
          <img key={i} src={getImageUrl(vh.imagePrincipale)} fetchPriority="high" loading="eager" alt="" />
        ))}
      </div>
    </div>
  )
}

export default Home
