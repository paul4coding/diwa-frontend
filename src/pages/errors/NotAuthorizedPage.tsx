import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { LogIn, ArrowLeft, ShieldOff } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const NotAuthorizedPage: React.FC = () => {
  const navigate  = useNavigate();
  const rootRef   = useRef<HTMLDivElement>(null);
  const codeRef   = useRef<HTMLDivElement>(null);
  const badgeRef  = useRef<HTMLDivElement>(null);
  const titleRef  = useRef<HTMLHeadingElement>(null);
  const subRef    = useRef<HTMLParagraphElement>(null);
  const lineRef   = useRef<HTMLDivElement>(null);
  const btnsRef   = useRef<HTMLDivElement>(null);
  const glowRef   = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Set initial states
    gsap.set([badgeRef.current, titleRef.current, subRef.current, btnsRef.current], {
      opacity: 0, y: 32,
    });
    gsap.set(codeRef.current, { opacity: 0, scale: 0.82, y: 20 });
    gsap.set(lineRef.current, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(glowRef.current, { opacity: 0, scale: 0.6 });

    const tl = gsap.timeline({ delay: 0.1 });

    tl
      // Glow pulse in
      .to(glowRef.current, {
        opacity: 1, scale: 1,
        duration: 1.4, ease: 'power2.out',
      }, 0)

      // Giant 401
      .to(codeRef.current, {
        opacity: 1, scale: 1, y: 0,
        duration: 0.9, ease: 'back.out(1.4)',
      }, 0.2)

      // Badge
      .to(badgeRef.current, {
        opacity: 1, y: 0,
        duration: 0.55, ease: 'power3.out',
      }, 0.65)

      // Accent line
      .to(lineRef.current, {
        scaleX: 1,
        duration: 0.7, ease: 'power3.out',
      }, 0.8)

      // Title
      .to(titleRef.current, {
        opacity: 1, y: 0,
        duration: 0.6, ease: 'power3.out',
      }, 0.9)

      // Subtitle
      .to(subRef.current, {
        opacity: 1, y: 0,
        duration: 0.55, ease: 'power2.out',
      }, 1.05)

      // Buttons
      .to(btnsRef.current, {
        opacity: 1, y: 0,
        duration: 0.5, ease: 'power2.out',
      }, 1.2);

  }, { scope: rootRef });

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0B0C10',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
        zIndex: 9990,
      }}
    >
      {/* ── Background car image ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/for.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.08)',
        zIndex: 0,
      }} />

      {/* ── Dot grid ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      {/* ── Red radial glow ── */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '500px',
          background: 'radial-gradient(ellipse at center, rgba(196,30,30,0.18) 0%, transparent 68%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* ── Horizontal scan lines ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      {/* ── Car — bottom right decoration ── */}
      <div style={{
        position: 'absolute',
        bottom: '-40px',
        right: '-20px',
        width: 'clamp(500px, 52vw, 780px)',
        height: 'clamp(167px, 17.3vw, 260px)',
        backgroundImage: 'url(/MGRX8.png)',
        backgroundSize: '100% auto',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        zIndex: 1,
        pointerEvents: 'none',
        WebkitMaskImage: [
          'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 18%, black 38%, black 100%)',
          'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
        ].join(', '),
        maskImage: [
          'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 18%, black 38%, black 100%)',
          'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
        ].join(', '),
        WebkitMaskComposite: 'source-in',
        maskComposite: 'intersect',
        opacity: 0.55,
      }} />

      {/* ── Main content ── */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 24px',
        maxWidth: '560px',
      }}>

        {/* Giant 401 */}
        <div
          ref={codeRef}
          style={{
            position: 'relative',
            marginBottom: '8px',
            lineHeight: 1,
          }}
        >
          {/* Background ghost number */}
          <span style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 'clamp(9rem, 22vw, 16rem)',
            fontWeight: 900,
            letterSpacing: '-12px',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(196,30,30,0.12)',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            pointerEvents: 'none',
          }}>401</span>

          {/* Foreground number */}
          <span style={{
            display: 'block',
            fontSize: 'clamp(6rem, 14vw, 10rem)',
            fontWeight: 900,
            letterSpacing: '-8px',
            background: 'linear-gradient(135deg, #ffffff 30%, rgba(255,255,255,0.35) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
            userSelect: 'none',
          }}>401</span>
        </div>

        {/* Badge */}
        <div
          ref={badgeRef}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(196,30,30,0.12)',
            border: '1px solid rgba(196,30,30,0.28)',
            borderRadius: '100px',
            padding: '6px 16px',
            marginBottom: '20px',
          }}
        >
          <ShieldOff size={13} style={{ color: '#C41E1E' }} />
          <span style={{
            fontSize: '0.6rem',
            fontWeight: 800,
            letterSpacing: '3.5px',
            textTransform: 'uppercase',
            color: '#C41E1E',
          }}>
            Accès Non Autorisé
          </span>
        </div>

        {/* Accent line */}
        <div
          ref={lineRef}
          style={{
            width: '48px',
            height: '3px',
            background: 'linear-gradient(to right, #C41E1E, #116BAB)',
            borderRadius: '2px',
            marginBottom: '20px',
          }}
        />

        {/* Title */}
        <h1
          ref={titleRef}
          style={{
            margin: '0 0 14px 0',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)',
            fontWeight: 200,
            letterSpacing: '-1.5px',
            color: '#fff',
            lineHeight: 1.1,
          }}
        >
          Vous n'avez pas les{' '}
          <strong style={{ fontWeight: 900 }}>permissions</strong>
          {' '}requises
        </h1>

        {/* Subtitle */}
        <p
          ref={subRef}
          style={{
            margin: '0 0 40px 0',
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.38)',
            lineHeight: 1.7,
            letterSpacing: '0.2px',
          }}
        >
          Votre session ne dispose pas des droits nécessaires pour accéder à cette
          ressource. Veuillez vous reconnecter avec un compte autorisé.
        </p>

        {/* Buttons */}
        <div
          ref={btnsRef}
          style={{
            display: 'flex',
            gap: '14px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '13px 26px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.3px',
              transition: 'all 0.25s',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
            onMouseEnter={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = 'rgba(255,255,255,0.1)';
              b.style.borderColor = 'rgba(255,255,255,0.22)';
              b.style.color = '#fff';
            }}
            onMouseLeave={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = 'rgba(255,255,255,0.06)';
              b.style.borderColor = 'rgba(255,255,255,0.12)';
              b.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            <ArrowLeft size={16} />
            Retour
          </button>

          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #C41E1E 0%, #8B0000 100%)',
              color: '#fff',
              border: '1px solid rgba(196,30,30,0.5)',
              padding: '13px 28px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.3px',
              transition: 'all 0.25s',
              boxShadow: '0 8px 32px rgba(196,30,30,0.35)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
            onMouseEnter={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.transform = 'translateY(-2px)';
              b.style.boxShadow = '0 14px 40px rgba(196,30,30,0.5)';
            }}
            onMouseLeave={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.transform = 'translateY(0)';
              b.style.boxShadow = '0 8px 32px rgba(196,30,30,0.35)';
            }}
          >
            <LogIn size={16} />
            Se Connecter
          </button>
        </div>
      </div>

      {/* ── DIWA watermark bottom-left ── */}
      <div style={{
        position: 'absolute',
        bottom: '28px',
        left: '40px',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
      }}>
        <span style={{
          fontSize: '0.45rem',
          fontWeight: 800,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.18)',
        }}>
          Internationale
        </span>
        <span style={{
          fontSize: '1.1rem',
          fontWeight: 900,
          letterSpacing: '-2px',
          color: 'rgba(255,255,255,0.12)',
          lineHeight: 1,
        }}>
          D<span style={{ color: 'rgba(196,30,30,0.35)' }}>I</span>WA
        </span>
      </div>

      {/* ── Error code bottom-right ── */}
      <div style={{
        position: 'absolute',
        bottom: '28px',
        right: '40px',
        zIndex: 2,
        textAlign: 'right',
      }}>
        <span style={{
          fontSize: '0.55rem',
          fontWeight: 800,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.15)',
        }}>
          HTTP 401 · UNAUTHORIZED
        </span>
      </div>
    </div>
  );
};

export default NotAuthorizedPage;
