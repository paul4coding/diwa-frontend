import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote } from 'lucide-react'
import { useCMS } from '../../context/CMSContext'

export const TestimonialsSection = () => {
  const { cmsData } = useCMS();
  const [activeIndex, setActiveIndex] = useState(0)

  const defaultReviews = [
    { name: "Jean-Paul M.", role: "Chef d'entreprise", quote: "Une expérience d'achat inégalée au Togo.", avatar: "/assets/profiles/profil1.jpg" },
    { name: "Marc L.", role: "Entrepreneur", quote: "Le service après-vente est exceptionnel.", avatar: "/assets/profiles/profil2.avif" }
  ];

  const reviews = cmsData.testimonials && cmsData.testimonials.length > 0 ? cmsData.testimonials : defaultReviews;

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return path;
    return `http://localhost:8181/uploads/${path}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [reviews.length])

  return (
    <section style={{ background: 'var(--bg-primary)', padding: '100px 4%', color: 'var(--text-primary)', overflow: 'hidden', transition: 'background 0.4s ease' }}>
      
      {/* HEADER STYLE "PREMIUM" */}
      <div style={{ textAlign: 'center', marginBottom: '80px', position: 'relative' }}>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <div style={{ width: '80px', height: '2px', background: 'var(--staggered-line-color)', margin: '0 auto 15px auto', transition: 'background 0.4s ease' }}></div>
          <h4 style={{ 
            fontSize: '0.9rem', 
            letterSpacing: '8px', 
            textTransform: 'uppercase', 
            color: 'var(--text-primary)', 
            margin: 0,
            fontWeight: 400
          }}>
            Témoignages
          </h4>
          <div style={{ width: '80px', height: '2px', background: 'var(--staggered-line-color)', margin: '15px auto 0 auto', transition: 'background 0.4s ease' }}></div>
        </div>
        <h2 className="serif" style={{ fontSize: '3rem', marginTop: '30px', fontWeight: 700 }}>Ce que nos clients disent</h2>
      </div>

      <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          gap: '30px',
        }}>
          {[0, 1].map((offset) => {
            const index = (activeIndex + offset) % reviews.length;
            const rev = reviews[index];
            return (
              <motion.div 
                key={`${index}-${offset}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                style={{
                  flex: '1',
                  background: 'var(--bg-secondary)',
                  border: '1px solid rgba(128, 128, 128, 0.1)',
                  borderRadius: '24px',
                  padding: '50px 40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '380px',
                  position: 'relative',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  transition: 'background 0.4s ease'
                }}
              >
                <Quote size={40} color="var(--staggered-line-color)" style={{ position: 'absolute', top: '30px', right: '30px', opacity: 0.1, transition: 'color 0.4s ease' }} />
                
                <p style={{ 
                  fontSize: '1.2rem', 
                  lineHeight: '1.8', 
                  fontStyle: 'italic', 
                  marginBottom: '40px',
                  opacity: 0.9,
                  color: 'var(--text-primary)'
                }}>
                  "{rev.quote}"
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ 
                    width: '70px', 
                    height: '70px', 
                    borderRadius: '50%', 
                    overflow: 'hidden',
                    border: '2px solid var(--staggered-line-color)',
                    transition: 'border-color 0.4s ease'
                  }}>
                    <img src={getImageUrl(rev.avatar)} alt={rev.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h5 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rev.name}</h5>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--staggered-line-color)', fontWeight: 600, transition: 'color 0.4s ease' }}>{rev.role}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* DOTS NAVIGATION */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '60px' }}>
          {reviews.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setActiveIndex(idx)}
              style={{
                width: idx === activeIndex ? '30px' : '10px',
                height: '10px',
                background: idx === activeIndex ? 'var(--staggered-line-color)' : 'rgba(128,128,128,0.2)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
