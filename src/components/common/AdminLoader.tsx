import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface AdminLoaderProps {
  /** Texte affiché sous la voiture */
  message?: string;
  /** Prend toute la page (fixed overlay) */
  fullPage?: boolean;
}

const AdminLoader: React.FC<AdminLoaderProps> = ({
  message = 'Chargement',
  fullPage = false,
}) => {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const carRef     = useRef<SVGSVGElement>(null);
  const wheel1Ref  = useRef<SVGCircleElement>(null);
  const wheel2Ref  = useRef<SVGCircleElement>(null);
  const beamRef    = useRef<SVGEllipseElement>(null);
  const dotsRef    = useRef<HTMLSpanElement>(null);
  const speedRef   = useRef<HTMLSpanElement>(null);

  // Animated speed counter
  const [speed, setSpeed] = useState(0);
  useEffect(() => {
    let v = 0;
    const id = setInterval(() => {
      v = Math.round(v + (Math.random() * 18 - 4));
      v = Math.max(80, Math.min(260, v));
      setSpeed(v);
    }, 180);
    return () => clearInterval(id);
  }, []);

  useGSAP(() => {
    const TRACK_W = 360;
    const CAR_W   = 120;
    const CENTER  = TRACK_W / 2 - CAR_W / 2; // ≈ 120

    // ── Car drive loop : left → center (pause) → exit right ──
    const carTl = gsap.timeline({ repeat: -1, repeatDelay: 0.2 });
    carTl
      .fromTo(carRef.current,
        { x: -CAR_W - 10 },
        { x: CENTER, duration: 1.1, ease: 'power2.out' }
      )
      .to(carRef.current,
        { x: CENTER, duration: 0.7, ease: 'none' }   // pause visible au centre
      )
      .to(carRef.current,
        { x: TRACK_W + 20, duration: 1.0, ease: 'power2.in' }
      );

    // ── Wheel spin ──────────────────────────────────
    [wheel1Ref.current, wheel2Ref.current].forEach((w) => {
      if (!w) return;
      gsap.to(w, {
        rotation: 360,
        transformOrigin: '50% 50%',
        duration: 0.5,
        ease: 'none',
        repeat: -1,
      });
    });

    // ── Headlight beam pulse ────────────────────────
    gsap.to(beamRef.current, {
      opacity: 0.25,
      scale: 1.3,
      transformOrigin: '0% 50%',
      duration: 0.7,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // ── Dots animation ──────────────────────────────
    const dotsTl = gsap.timeline({ repeat: -1 });
    dotsTl
      .to(dotsRef.current, { duration: 0 }, 0)
      .call(() => { if (dotsRef.current) dotsRef.current.textContent = '.'; },   [], 0.4)
      .call(() => { if (dotsRef.current) dotsRef.current.textContent = '..'; },  [], 0.8)
      .call(() => { if (dotsRef.current) dotsRef.current.textContent = '...'; }, [], 1.2)
      .call(() => { if (dotsRef.current) dotsRef.current.textContent = ''; },    [], 1.8);

  }, { scope: wrapRef });

  const containerStyle: React.CSSProperties = fullPage
    ? {
        position: 'fixed',
        inset: 0,
        background: 'rgba(244,245,249,0.96)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 9500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 0',
        width: '100%',
      };

  return (
    <div ref={wrapRef} style={containerStyle}>

      {/* ── Track container ─────────────────────── */}
      <div style={{
        position: 'relative',
        width: '360px',
        height: '72px',
        overflow: 'hidden',
        marginBottom: '22px',
      }}>

        {/* Road surface — two lines (highway style) */}
        <div style={{
          position: 'absolute',
          bottom: '4px',
          left: 0,
          right: 0,
          height: '1.5px',
          background: 'linear-gradient(to right, transparent 0%, var(--admin-border,#e8ecf0) 12%, var(--admin-border,#e8ecf0) 88%, transparent 100%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '1px',
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(to right, transparent 0%, rgba(196,30,30,0.18) 12%, rgba(196,30,30,0.18) 88%, transparent 100%)',
        }} />

        {/* Dashed center line */}
        {[0,1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{
            position: 'absolute',
            bottom: '2.5px',
            left: `${i * 45 + 20}px`,
            width: '22px',
            height: '1px',
            background: 'rgba(196,30,30,0.12)',
          }} />
        ))}

        {/* Left/right fade masks */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to right,
            var(--admin-bg,#f4f5f9) 0%,
            transparent 10%,
            transparent 90%,
            var(--admin-bg,#f4f5f9) 100%
          )`,
          zIndex: 3,
          pointerEvents: 'none',
        }} />

        {/* ── The Car (SVG side profile) ──────── */}
        <svg
          ref={carRef}
          viewBox="0 0 120 52"
          width="120"
          height="52"
          style={{
            position: 'absolute',
            bottom: '4px',
            left: 0,
            zIndex: 2,
            overflow: 'visible',
            filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.22)) drop-shadow(0 2px 4px rgba(0,0,0,0.12))',
          }}
        >
          {/* Shadow on road */}
          <ellipse cx="60" cy="49" rx="50" ry="3.5"
            fill="rgba(0,0,0,0.1)" />

          {/* Speed lines (behind car — negative x) */}
          <line x1="-8"  y1="20" x2="-32" y2="20"
            stroke="rgba(196,30,30,0.55)" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="-6"  y1="26" x2="-40" y2="26"
            stroke="rgba(196,30,30,0.35)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="-10" y1="31" x2="-28" y2="31"
            stroke="rgba(196,30,30,0.22)" strokeWidth="0.9" strokeLinecap="round" />
          <line x1="-5"  y1="16" x2="-20" y2="16"
            stroke="rgba(17,107,171,0.25)" strokeWidth="0.8" strokeLinecap="round" />

          {/* Headlight beam */}
          <ellipse
            ref={beamRef}
            cx="114" cy="26"
            rx="28" ry="10"
            fill="rgba(255,245,180,0.5)"
            style={{ transformOrigin: '114px 26px' }}
          />

          {/* ── Car body ── */}
          {/* Lower body */}
          <path
            d="M6 30 Q6 24 13 22 L30 17 Q44 13 60 13 Q76 13 88 17 L100 22 Q107 24 108 30 L108 40 Q108 42 106 42 L10 42 Q6 42 6 40 Z"
            fill="#0f172a"
          />
          {/* Body highlight stripe */}
          <path
            d="M14 23 Q44 17 60 17 Q76 17 98 23"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Upper cabin */}
          <path
            d="M32 22 L28 14 Q40 11 56 11 L72 11 Q84 11 86 14 L82 22 Z"
            fill="#1e293b"
          />
          {/* Windshield */}
          <path
            d="M35 21 L31 14 Q43 12 57 12 L71 12 Q82 12 83 14 L79 21 Z"
            fill="rgba(120,210,255,0.12)"
            stroke="rgba(120,210,255,0.18)"
            strokeWidth="0.5"
          />
          {/* Rear window */}
          <path
            d="M35 21 L31 14 Q38 12 46 12 L46 21 Z"
            fill="rgba(120,210,255,0.06)"
          />
          {/* Door seam */}
          <line x1="58" y1="13" x2="55" y2="42"
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          {/* Door handle front */}
          <rect x="72" y="28" width="8" height="2" rx="1"
            fill="rgba(255,255,255,0.15)" />
          {/* Door handle rear */}
          <rect x="43" y="28" width="8" height="2" rx="1"
            fill="rgba(255,255,255,0.15)" />

          {/* Wheel arches */}
          <path d="M10 40 Q10 30 22 30 Q34 30 34 40" fill="#1a2035" />
          <path d="M74 40 Q74 30 86 30 Q98 30 98 40" fill="#1a2035" />

          {/* Wheel 1 (front) */}
          <circle cx="86" cy="42" r="9" fill="#111827" />
          <circle cx="86" cy="42" r="6.5" fill="#1f2937" />
          <circle ref={wheel1Ref} cx="86" cy="42" r="4"
            fill="none" stroke="#64748b" strokeWidth="1"
            strokeDasharray="3 4" />
          <circle cx="86" cy="42" r="2" fill="#94a3b8" />
          <circle cx="86" cy="42" r="0.8" fill="#cbd5e1" />

          {/* Wheel 2 (rear) */}
          <circle cx="22" cy="42" r="9" fill="#111827" />
          <circle cx="22" cy="42" r="6.5" fill="#1f2937" />
          <circle ref={wheel2Ref} cx="22" cy="42" r="4"
            fill="none" stroke="#64748b" strokeWidth="1"
            strokeDasharray="3 4" />
          <circle cx="22" cy="42" r="2" fill="#94a3b8" />
          <circle cx="22" cy="42" r="0.8" fill="#cbd5e1" />

          {/* Headlights */}
          <rect x="105" y="21" width="5" height="5" rx="1.5"
            fill="rgba(255,245,180,0.92)" />
          <rect x="105" y="28" width="5" height="3" rx="1"
            fill="rgba(255,245,180,0.6)" />
          {/* Front grill */}
          <rect x="107" y="33" width="4" height="3" rx="0.8"
            fill="#2d3748" />
          <line x1="108.5" y1="33" x2="108.5" y2="36"
            stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <line x1="109.5" y1="33" x2="109.5" y2="36"
            stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

          {/* Tail lights */}
          <rect x="5" y="22" width="4" height="7" rx="1.5"
            fill="#C41E1E" opacity="0.9" />
          <rect x="5" y="31" width="4" height="4" rx="1"
            fill="rgba(196,30,30,0.5)" />

          {/* Roof rack (subtle) */}
          <rect x="40" y="10.5" width="30" height="1" rx="0.5"
            fill="rgba(255,255,255,0.1)" />
        </svg>
      </div>

      {/* ── HUD speed display ─────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '14px',
        opacity: 0.55,
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#C41E1E',
          boxShadow: '0 0 6px rgba(196,30,30,0.8)',
          animation: 'admin-pulse 1.2s infinite',
        }} />
        <span style={{
          fontSize: '0.6rem',
          fontWeight: 800,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'var(--admin-text-muted,#64748b)',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span ref={speedRef}>{speed}</span>
          {' '}km/h
        </span>
        <div style={{
          width: '1px',
          height: '10px',
          background: 'var(--admin-border,#e8ecf0)',
        }} />
        <span style={{
          fontSize: '0.6rem',
          fontWeight: 800,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'var(--admin-text-muted,#64748b)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {message}
          <span ref={dotsRef} style={{ display: 'inline-block', width: '16px' }} />
        </span>
      </div>

      {/* ── Accent line ───────────────────────── */}
      <div style={{
        width: '48px',
        height: '2px',
        background: 'linear-gradient(to right, #C41E1E, #116BAB)',
        borderRadius: '2px',
        opacity: 0.6,
        animation: 'admin-line-pulse 1.8s ease-in-out infinite',
      }} />

      {/* CSS keyframes */}
      <style>{`
        @keyframes admin-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes admin-line-pulse {
          0%, 100% { opacity: 0.6; width: 48px; }
          50%       { opacity: 0.9; width: 72px; }
        }
      `}</style>
    </div>
  );
};

export default AdminLoader;
