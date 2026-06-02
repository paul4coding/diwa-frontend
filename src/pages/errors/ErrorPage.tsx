import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  ArrowLeft, Home, RefreshCw,
  ShieldX, Compass, Flame, Clock, AlertTriangle,
} from 'lucide-react';

gsap.registerPlugin(useGSAP);

/* ─────────────────────────────────────────────────────
 * Error configuration per HTTP code
 * ───────────────────────────────────────────────────── */
export interface ErrorConfig {
  code: number;
  badge: string;
  title: React.ReactNode;
  description: string;
  accent: string;           // main color
  accentRgb: string;        // same color as rgb triplet for shadows
  glowOpacity: number;
  codeStyle?: React.CSSProperties;
  icon: React.ReactNode;
  primaryAction: { label: string; icon: React.ReactNode; action: 'back' | 'home' | 'reload' };
  secondaryAction?: { label: string; icon: React.ReactNode; action: 'back' | 'home' | 'reload' };
}

export const ERROR_CONFIGS: Record<number, ErrorConfig> = {

  403: {
    code: 403,
    badge: 'Accès Interdit',
    title: <>Vous n'êtes pas <strong style={{ fontWeight: 900 }}>autorisé</strong> ici</>,
    description:
      "Votre compte n'a pas les droits nécessaires pour accéder à cette ressource. " +
      'Contactez un administrateur si vous pensez qu\'il s\'agit d\'une erreur.',
    accent:       '#E85D04',
    accentRgb:    '232,93,4',
    glowOpacity:  0.16,
    icon: <ShieldX size={13} />,
    primaryAction:   { label: 'Retour',          icon: <ArrowLeft size={16} />, action: 'back' },
    secondaryAction: { label: 'Accueil',          icon: <Home size={16} />,     action: 'home' },
  },

  404: {
    code: 404,
    badge: 'Page Introuvable',
    title: <>Cette page <strong style={{ fontWeight: 900 }}>n'existe pas</strong></>,
    description:
      "La page que vous cherchez a peut-être été déplacée, supprimée ou n'a jamais existé. " +
      'Vérifiez l\'URL ou revenez à l\'accueil.',
    accent:       '#116BAB',
    accentRgb:    '17,107,171',
    glowOpacity:  0.14,
    codeStyle: {
      WebkitTextStroke: '2px rgba(17,107,171,0.55)',
      background: 'linear-gradient(135deg, rgba(17,107,171,0.9) 0%, rgba(255,255,255,0.7) 60%, rgba(17,107,171,0.4) 100%)',
    },
    icon: <Compass size={13} />,
    primaryAction:   { label: 'Retour',  icon: <ArrowLeft size={16} />, action: 'back' },
    secondaryAction: { label: 'Accueil', icon: <Home size={16} />,      action: 'home' },
  },

  500: {
    code: 500,
    badge: 'Erreur Serveur',
    title: <>Une erreur <strong style={{ fontWeight: 900 }}>inattendue</strong> s'est produite</>,
    description:
      "Quelque chose s'est mal passé de notre côté. Nos équipes techniques ont été notifiées " +
      'et travaillent à résoudre le problème. Réessayez dans quelques instants.',
    accent:       '#F59E0B',
    accentRgb:    '245,158,11',
    glowOpacity:  0.15,
    icon: <Flame size={13} />,
    primaryAction:   { label: 'Réessayer', icon: <RefreshCw size={16} />, action: 'reload' },
    secondaryAction: { label: 'Accueil',   icon: <Home size={16} />,      action: 'home'  },
  },

  503: {
    code: 503,
    badge: 'Service Indisponible',
    title: <>Service en <strong style={{ fontWeight: 900 }}>maintenance</strong></>,
    description:
      'Le service est temporairement indisponible pour maintenance ou en raison d\'une ' +
      'surcharge. Veuillez réessayer dans quelques minutes.',
    accent:       '#8B5CF6',
    accentRgb:    '139,92,246',
    glowOpacity:  0.14,
    icon: <Clock size={13} />,
    primaryAction:   { label: 'Réessayer', icon: <RefreshCw size={16} />, action: 'reload' },
    secondaryAction: { label: 'Accueil',   icon: <Home size={16} />,      action: 'home'  },
  },
};

/* Default fallback for unknown codes */
const DEFAULT_CONFIG: ErrorConfig = {
  code: 0,
  badge: 'Erreur Inconnue',
  title: <>Une <strong style={{ fontWeight: 900 }}>erreur</strong> est survenue</>,
  description: "Une erreur inattendue s'est produite. Veuillez réessayer ou contacter le support.",
  accent:       '#C41E1E',
  accentRgb:    '196,30,30',
  glowOpacity:  0.14,
  icon: <AlertTriangle size={13} />,
  primaryAction:   { label: 'Réessayer', icon: <RefreshCw size={16} />, action: 'reload' },
  secondaryAction: { label: 'Accueil',   icon: <Home size={16} />,      action: 'home' },
};

/* ─────────────────────────────────────────────────────
 * Main component
 * ───────────────────────────────────────────────────── */
interface ErrorPageProps {
  code?: number;
  overrideConfig?: Partial<ErrorConfig>;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ code, overrideConfig }) => {
  const navigate = useNavigate();
  const cfg: ErrorConfig = {
    ...(code ? (ERROR_CONFIGS[code] ?? { ...DEFAULT_CONFIG, code }) : DEFAULT_CONFIG),
    ...overrideConfig,
  };

  const rootRef  = useRef<HTMLDivElement>(null);
  const codeRef  = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const lineRef  = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef   = useRef<HTMLParagraphElement>(null);
  const btnsRef  = useRef<HTMLDivElement>(null);
  const glowRef  = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.set([badgeRef.current, titleRef.current, subRef.current, btnsRef.current], {
      opacity: 0, y: 30,
    });
    gsap.set(codeRef.current, { opacity: 0, scale: 0.8, y: 18 });
    gsap.set(lineRef.current, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(glowRef.current, { opacity: 0, scale: 0.5 });

    gsap.timeline({ delay: 0.05 })
      .to(glowRef.current,  { opacity: 1, scale: 1,   duration: 1.5, ease: 'power2.out' }, 0)
      .to(codeRef.current,  { opacity: 1, scale: 1, y: 0, duration: 0.85, ease: 'back.out(1.5)' }, 0.15)
      .to(badgeRef.current, { opacity: 1, y: 0,       duration: 0.5,  ease: 'power3.out' }, 0.6)
      .to(lineRef.current,  { scaleX: 1,              duration: 0.65, ease: 'power3.out' }, 0.72)
      .to(titleRef.current, { opacity: 1, y: 0,       duration: 0.55, ease: 'power3.out' }, 0.82)
      .to(subRef.current,   { opacity: 1, y: 0,       duration: 0.5,  ease: 'power2.out' }, 0.95)
      .to(btnsRef.current,  { opacity: 1, y: 0,       duration: 0.45, ease: 'power2.out' }, 1.1);
  }, { scope: rootRef });

  const handleAction = (action: 'back' | 'home' | 'reload') => {
    if (action === 'back')   navigate(-1);
    if (action === 'home')   navigate('/');
    if (action === 'reload') window.location.reload();
  };

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed', inset: 0,
        background: '#0B0C10',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
        zIndex: 9990,
      }}
    >
      {/* ── Atmospheric BG car ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/for.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.07)', zIndex: 0,
      }} />

      {/* ── Dot grid ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)',
        backgroundSize: '32px 32px', zIndex: 0, pointerEvents: 'none',
      }} />

      {/* ── Scan lines ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.010) 2px, rgba(255,255,255,0.010) 4px)',
        zIndex: 0, pointerEvents: 'none',
      }} />

      {/* ── Colored radial glow ── */}
      <div ref={glowRef} style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '900px', height: '600px',
        background: `radial-gradient(ellipse at center, rgba(${cfg.accentRgb},${cfg.glowOpacity}) 0%, transparent 65%)`,
        zIndex: 0, pointerEvents: 'none',
      }} />

      {/* ── Car decoration bottom-right ── */}
      <div style={{
        position: 'absolute', bottom: '-40px', right: '-20px',
        width: 'clamp(440px, 46vw, 720px)',
        height: 'clamp(147px, 15.3vw, 240px)',
        backgroundImage: 'url(/MGRX8.png)',
        backgroundSize: '100% auto', backgroundPosition: 'top center', backgroundRepeat: 'no-repeat',
        zIndex: 1, pointerEvents: 'none', opacity: 0.45,
        WebkitMaskImage: [
          'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 22%, black 42%, black 100%)',
          'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)',
        ].join(', '),
        maskImage: [
          'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 22%, black 42%, black 100%)',
          'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)',
        ].join(', '),
        WebkitMaskComposite: 'source-in',
        maskComposite: 'intersect',
      }} />

      {/* ── Main content ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        padding: '0 24px', maxWidth: '580px',
      }}>

        {/* Giant code */}
        <div ref={codeRef} style={{ position: 'relative', marginBottom: '4px', lineHeight: 1 }}>
          {/* Ghost outline */}
          <span style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 'clamp(9rem, 22vw, 16rem)',
            fontWeight: 900, letterSpacing: '-12px',
            color: 'transparent',
            WebkitTextStroke: `1px rgba(${cfg.accentRgb},0.1)`,
            whiteSpace: 'nowrap', userSelect: 'none', pointerEvents: 'none',
          }}>
            {cfg.code || '???'}
          </span>

          {/* Foreground number */}
          <span style={{
            display: 'block',
            fontSize: 'clamp(6rem, 14vw, 10rem)',
            fontWeight: 900, letterSpacing: '-8px',
            background: cfg.codeStyle?.background ??
              'linear-gradient(135deg, #ffffff 30%, rgba(255,255,255,0.32) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', lineHeight: 1, userSelect: 'none',
            ...(cfg.codeStyle ?? {}),
          }}>
            {cfg.code || '???'}
          </span>
        </div>

        {/* Badge */}
        <div ref={badgeRef} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: `rgba(${cfg.accentRgb},0.12)`,
          border: `1px solid rgba(${cfg.accentRgb},0.28)`,
          borderRadius: '100px', padding: '6px 16px', marginBottom: '18px',
        }}>
          <span style={{ color: cfg.accent }}>{cfg.icon}</span>
          <span style={{
            fontSize: '0.6rem', fontWeight: 800, letterSpacing: '3.5px',
            textTransform: 'uppercase', color: cfg.accent,
          }}>
            {cfg.badge}
          </span>
        </div>

        {/* Accent line */}
        <div ref={lineRef} style={{
          width: '48px', height: '3px',
          background: `linear-gradient(to right, ${cfg.accent}, rgba(${cfg.accentRgb},0.2))`,
          borderRadius: '2px', marginBottom: '18px',
        }} />

        {/* Title */}
        <h1 ref={titleRef} style={{
          margin: '0 0 14px 0',
          fontSize: 'clamp(1.4rem, 3.2vw, 2rem)',
          fontWeight: 200, letterSpacing: '-1.5px',
          color: '#fff', lineHeight: 1.1,
        }}>
          {cfg.title}
        </h1>

        {/* Description */}
        <p ref={subRef} style={{
          margin: '0 0 38px 0', fontSize: '0.88rem',
          color: 'rgba(255,255,255,0.36)', lineHeight: 1.75, letterSpacing: '0.2px',
        }}>
          {cfg.description}
        </p>

        {/* Buttons */}
        <div ref={btnsRef} style={{
          display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {/* Secondary action — ghost */}
          {cfg.secondaryAction && (
            <button
              onClick={() => handleAction(cfg.secondaryAction!.action)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.65)',
                border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px',
                borderRadius: '12px', fontSize: '0.84rem', fontWeight: 700,
                cursor: 'pointer', letterSpacing: '0.3px', transition: 'all 0.25s',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = 'rgba(255,255,255,0.1)';
                b.style.borderColor = 'rgba(255,255,255,0.2)';
                b.style.color = '#fff';
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = 'rgba(255,255,255,0.05)';
                b.style.borderColor = 'rgba(255,255,255,0.1)';
                b.style.color = 'rgba(255,255,255,0.65)';
              }}
            >
              {cfg.secondaryAction.icon}
              {cfg.secondaryAction.label}
            </button>
          )}

          {/* Primary action — colored */}
          <button
            onClick={() => handleAction(cfg.primaryAction.action)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: `linear-gradient(135deg, ${cfg.accent} 0%, rgba(${cfg.accentRgb},0.7) 100%)`,
              color: '#fff',
              border: `1px solid rgba(${cfg.accentRgb},0.45)`,
              padding: '12px 26px', borderRadius: '12px',
              fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer',
              letterSpacing: '0.3px', transition: 'all 0.25s',
              boxShadow: `0 8px 28px rgba(${cfg.accentRgb},0.35)`,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
            onMouseEnter={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.transform = 'translateY(-2px)';
              b.style.boxShadow = `0 14px 38px rgba(${cfg.accentRgb},0.52)`;
            }}
            onMouseLeave={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.transform = 'translateY(0)';
              b.style.boxShadow = `0 8px 28px rgba(${cfg.accentRgb},0.35)`;
            }}
          >
            {cfg.primaryAction.icon}
            {cfg.primaryAction.label}
          </button>
        </div>
      </div>

      {/* ── DIWA watermark bottom-left ── */}
      <div style={{
        position: 'absolute', bottom: '26px', left: '38px', zIndex: 2,
      }}>
        <span style={{
          display: 'block', fontSize: '0.43rem', fontWeight: 800,
          letterSpacing: '4px', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.16)',
        }}>Internationale</span>
        <span style={{
          display: 'block', fontSize: '1.05rem', fontWeight: 900,
          letterSpacing: '-2px', color: 'rgba(255,255,255,0.11)', lineHeight: 1,
        }}>
          D<span style={{ color: `rgba(${cfg.accentRgb},0.32)` }}>I</span>WA
        </span>
      </div>

      {/* ── HTTP code label bottom-right ── */}
      <div style={{
        position: 'absolute', bottom: '26px', right: '38px', zIndex: 2,
      }}>
        <span style={{
          fontSize: '0.52rem', fontWeight: 800, letterSpacing: '3px',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.14)',
        }}>
          HTTP {cfg.code} · {cfg.badge.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default ErrorPage;
