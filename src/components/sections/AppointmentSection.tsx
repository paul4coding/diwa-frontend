import React, { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCMS } from '../../context/CMSContext'

export const AppointmentSection = () => {
  const { cmsData } = useCMS();
  const sectionRef = useRef<HTMLDivElement>(null);

  const appData = cmsData.appointment || {
    title: 'PRENEZ RENDEZ-VOUS',
    desc: "Réservez votre entretien en ligne en quelques clics. Nos experts prennent soin de votre véhicule avec des pièces d'origine et un savoir-faire inégalé.",
    bgImage: '/paralaxPrenezRendezVous.webp',
    sideImage: '/mechanic.jpg'
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return path;
    return `http://localhost:8181/uploads/${path}`;
  };

  // Uniquement le parallax de fond — aucune animation d'entrée
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".appointment-parallax-bg", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="appointment-parallax-section">
      <div
        className="appointment-parallax-bg"
        style={{ backgroundImage: `url(${getImageUrl(appData.bgImage)})` }}
      />

      <div className="appointment-parallax-overlay">
        <div className="appointment-parallax-container">

          {/* Image — statique, aucune animation */}
          <div className="appointment-left-image">
            <img
              src={getImageUrl(appData.sideImage)}
              alt="Mécanicien Expert DIWA"
            />
            <div className="appointment-image-badge">
              <span className="badge-text">RÉSERVATION<br />EN LIGNE</span>
            </div>
          </div>

          {/* Texte — statique, aucune animation */}
          <div className="appointment-right-content">
            <h2 className="appointment-title">
              {appData.title.split(' ')[0]} <span>{appData.title.split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="appointment-desc">
              {appData.desc}
            </p>
            <Link to="/garage">
              <button className="appointment-btn">RÉSERVER MAINTENANT</button>
            </Link>
          </div>

        </div>
      </div>

      <style>{`
        .appointment-parallax-section {
          position: relative;
          color: #fff;
          overflow: hidden;
          min-height: 600px;
          background: #0f172a;
        }
        .appointment-parallax-bg {
          position: absolute;
          top: -20%;
          left: 0;
          width: 100%;
          height: 140%;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
          z-index: 0;
          will-change: transform;
        }
        .appointment-parallax-overlay {
          position: relative;
          z-index: 1;
          background: rgba(15, 23, 42, 0.85);
          padding: 120px 8%;
          width: 100%;
        }
        .appointment-parallax-container {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .appointment-left-image {
          position: relative;
          border-radius: 12px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.8);
        }
        .appointment-left-image img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 12px;
        }
        .appointment-image-badge {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 120px;
          height: 120px;
          background: #e31e24;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-shadow: 0 10px 30px rgba(227, 30, 36, 0.4);
          transform: rotate(15deg);
          z-index: 10;
        }
        .badge-text {
          font-weight: 900;
          font-size: 0.9rem;
          color: #fff;
          line-height: 1.2;
        }
        .appointment-title {
          font-size: 3.5rem;
          font-weight: 900;
          margin-bottom: 20px;
          letter-spacing: -1px;
        }
        .appointment-title span { color: #e31e24; }
        .appointment-desc {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #cbd5e1;
          margin-bottom: 40px;
        }
        .appointment-btn {
          background: #e31e24;
          color: #fff;
          border: none;
          padding: 16px 40px;
          font-size: 1rem;
          font-weight: 800;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s, transform 0.3s, box-shadow 0.3s;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 5px 15px rgba(227, 30, 36, 0.3);
        }
        .appointment-btn:hover {
          background: #b71c1c;
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(227, 30, 36, 0.4);
        }
        @media (max-width: 1024px) {
          .appointment-parallax-container {
            grid-template-columns: 1fr;
            gap: 80px;
          }
          .appointment-left-image { max-width: 600px; margin: 0 auto; }
          .appointment-title { font-size: 2.5rem; }
        }
      `}</style>
    </section>
  )
}

export default AppointmentSection
