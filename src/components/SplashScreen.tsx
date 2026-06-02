import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const containerRef  = useRef<HTMLDivElement>(null);
  const barFillRef    = useRef<HTMLDivElement>(null);
  const logoRef       = useRef<HTMLDivElement>(null);
  const carWrapRef    = useRef<HTMLDivElement>(null);
  const eyebrowRef    = useRef<HTMLSpanElement>(null);
  const titleRef      = useRef<HTMLHeadingElement>(null);
  const taglineRef    = useRef<HTMLParagraphElement>(null);
  const percentRef    = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        // Slide the whole screen up and fade out
        gsap.to(containerRef.current, {
          y: '-100%',
          duration: 0.8,
          ease: 'expo.in',
          onComplete,
        });
      },
    });

    // Starting states
    gsap.set([eyebrowRef.current, titleRef.current, taglineRef.current], {
      opacity: 0, y: 30,
    });
    gsap.set(logoRef.current, { opacity: 0, scale: 0.85 });
    gsap.set(carWrapRef.current, { opacity: 0, x: 180 });
    gsap.set(barFillRef.current, { scaleX: 0, transformOrigin: 'left center' });

    // — Animate in
    tl
      // 1. Logo icon fades in
      .to(logoRef.current, {
        opacity: 1, scale: 1,
        duration: 0.7, ease: 'back.out(1.5)',
      }, 0.3)

      // 2. Eyebrow text
      .to(eyebrowRef.current, {
        opacity: 1, y: 0,
        duration: 0.55, ease: 'power3.out',
      }, 0.65)

      // 3. Main title
      .to(titleRef.current, {
        opacity: 1, y: 0,
        duration: 0.7, ease: 'power3.out',
      }, 0.85)

      // 4. Car slides in
      .to(carWrapRef.current, {
        opacity: 1, x: 0,
        duration: 1.2, ease: 'expo.out',
      }, 1.0)

      // 5. Tagline
      .to(taglineRef.current, {
        opacity: 1, y: 0,
        duration: 0.5, ease: 'power2.out',
      }, 1.3)

      // 6. Loading bar fills up + counter
      .to(barFillRef.current, {
        scaleX: 1,
        duration: 1.4,
        ease: 'power1.inOut',
        onUpdate: function () {
          if (percentRef.current) {
            const pct = Math.round(this.progress() * 100);
            percentRef.current.textContent = `${pct}%`;
          }
        },
      }, 1.5)

      // 7. Brief pause before exit
      .to({}, { duration: 0.3 });

    return () => { tl.kill(); };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        overflow: 'hidden',
        background: '#0B0C10',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Background car image (very subtle) ─── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/for.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.12)',
        zIndex: 0,
      }} />

      {/* ── Red radial glow ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 50% 40% at 50% 60%, rgba(196,30,30,0.12) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      {/* ── Dot grid texture ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      {/* ── Main center content ── */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '0',
      }}>
        {/* Logo image */}
        <div ref={logoRef} style={{ marginBottom: '24px' }}>
          <img
            src="/logo.png"
            alt="DIWA"
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'contain',
              filter: 'brightness(1.1)',
            }}
          />
        </div>

        {/* Eyebrow: INTERNATIONALE */}
        <span ref={eyebrowRef} style={{
          display: 'block',
          fontSize: '0.58rem',
          fontWeight: 800,
          letterSpacing: '5px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)',
          marginBottom: '10px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          Internationale
        </span>

        {/* Main title: DIWA */}
        <h1 ref={titleRef} style={{
          margin: '0 0 12px 0',
          fontSize: 'clamp(4rem, 10vw, 7rem)',
          fontWeight: 200,
          letterSpacing: '-5px',
          color: '#fff',
          lineHeight: 0.9,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          D<strong style={{ fontWeight: 900 }}>I</strong>WA
        </h1>

        {/* Red accent line — same as auth page */}
        <div style={{
          width: '40px',
          height: '3px',
          background: 'linear-gradient(to right, #C41E1E, #116BAB)',
          borderRadius: '2px',
          margin: '0 auto 16px',
        }} />

        {/* Tagline */}
        <p ref={taglineRef} style={{
          margin: 0,
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          fontWeight: 600,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          L'excellence automobile
        </p>
      </div>

      {/* ── Car — front view cropped from MGRX8.png (1536×1024, front = top 512px) ── */}
      {/* bg-size: 100% auto → displayed height = width × (1024/1536) = width × 0.667         */}
      {/* container height = displayed_height × 0.5 → clips exactly to front-view panel        */}
      <div
        ref={carWrapRef}
        style={{
          position: 'absolute',
          bottom: '-30px',
          right: '-10px',
          /* width W → displayed image height = W × 0.667 → clip at W × 0.333 shows top half  */
          width:  'clamp(640px, 68vw, 920px)',
          height: 'clamp(213px, 22.7vw, 307px)',  /* = width × 0.333 */
          backgroundImage: 'url(/MGRX8.png)',
          backgroundSize:     '100% auto',
          backgroundPosition: 'top center',
          backgroundRepeat:   'no-repeat',
          zIndex: 1,
          pointerEvents: 'none',
          /* Fade left edge + bottom edge for smooth blending */
          WebkitMaskImage: [
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 12%, black 28%, black 100%)',
            'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
          ].join(', '),
          maskImage: [
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 12%, black 28%, black 100%)',
            'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
          ].join(', '),
          WebkitMaskComposite: 'source-in',
          maskComposite: 'intersect',
        }}
      />

      {/* ── Bottom loading bar ── */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 2,
        padding: '0 40px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        {/* Percentage + label */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: '0.62rem',
            fontWeight: 800,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>
            Chargement
          </span>
          <span ref={percentRef} style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '1px',
          }}>
            0%
          </span>
        </div>

        {/* Track */}
        <div style={{
          width: '100%',
          height: '2px',
          background: 'rgba(255,255,255,0.07)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          {/* Fill */}
          <div ref={barFillRef} style={{
            height: '100%',
            width: '100%',
            background: 'linear-gradient(to right, #C41E1E, #116BAB)',
            borderRadius: '2px',
          }} />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
