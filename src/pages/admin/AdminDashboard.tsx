import React, { useEffect, useState, useRef } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Wrench,
  Package,
  ArrowUpRight,
  Calendar,
  Clock,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import axiosInstance from '../../utils/axiosInstance';
import AdminLoader from '../../components/common/AdminLoader';

gsap.registerPlugin(useGSAP);

import ReceptionDashboard from '../receptionniste/ReceptionDashboard';

/* ── Inline micro-components ─────────────────────────── */

const MetricLabel = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontSize: '0.67rem',
    fontWeight: 800,
    color: 'var(--admin-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '1.8px',
    margin: 0,
  }}>{children}</p>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{
    margin: 0,
    fontSize: '0.68rem',
    fontWeight: 800,
    color: 'var(--admin-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '2.5px',
  }}>{children}</h3>
);

/* ── Main component ──────────────────────────────────── */
const AdminDashboard = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isReceptionnist = user?.roles?.includes('ROLE_RECEPTIONNISTE');
  const isChefTech      = user?.roles?.includes('ROLE_CHEF_TECHNICIEN');
  const isAdmin         = user?.roles?.includes('ROLE_ADMIN');

  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dashboardRef          = useRef<HTMLDivElement>(null);

  if (isReceptionnist && !isChefTech && !isAdmin) {
    return <ReceptionDashboard />;
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/api/v1/stats/dashboard');
        if (response.data.statut === 200) setStats(response.data.data);
      } catch (error) {
        console.error('Erreur stats dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useGSAP(() => {
    if (loading) return;
    gsap.from('.kpi-card', {
      y: 28,
      opacity: 0,
      duration: 0.55,
      stagger: 0.08,
      ease: 'back.out(1.7)',
      delay: 0.15,
    });
    gsap.from('.dashboard-section-card', {
      y: 36,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power3.out',
      delay: 0.45,
    });
    gsap.from('.dash-header-line', {
      width: 0,
      duration: 0.9,
      ease: 'power3.out',
      delay: 0.1,
    });
  }, { dependencies: [loading], scope: dashboardRef });

  /* ── Loading state ── */
  if (loading) {
    return <AdminLoader message="Chargement du tableau de bord" />;
  }

  /* ── KPI Config ── */
  const kpis = [
    {
      label: "Chiffre d'Affaires",
      value: stats?.totalRevenue != null
        ? `${Number(stats.totalRevenue).toLocaleString('fr-FR')} F`
        : '—',
      icon: <TrendingUp size={22} />,
      color: '#C41E1E',
      bg: 'rgba(196,30,30,0.12)',
      trend: '+12.5%',
      trendUp: true,
      path: '/admin/stats',
    },
    {
      label: 'Commandes à traiter',
      value: stats?.pendingOrders ?? 0,
      icon: <ShoppingBag size={22} />,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.12)',
      trend: 'Action requise',
      trendUp: null,
      path: '/admin/commandes',
    },
    {
      label: 'Interventions SAV',
      value: stats?.pendingSAV ?? 0,
      icon: <Wrench size={22} />,
      color: '#60A5FA',
      bg: 'rgba(96,165,250,0.12)',
      trend: 'En cours',
      trendUp: null,
      path: '/admin/garage',
    },
    {
      label: 'Alertes Stock',
      value: stats?.lowStockCount ?? 0,
      icon: <Package size={22} />,
      color: (stats?.lowStockCount ?? 0) > 0 ? '#EF4444' : '#22C55E',
      bg: (stats?.lowStockCount ?? 0) > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.1)',
      trend: (stats?.lowStockCount ?? 0) > 0 ? '⚠ Critique' : '✓ Normal',
      trendUp: (stats?.lowStockCount ?? 0) === 0,
      path: '/admin/pieces',
    },
  ];

  /* ── Chart data ── */
  const chartData: number[] = stats?.weeklyPerformance ?? [45,70,55,95,80,60,90,75,85,65];
  const chartMax = Math.max(...chartData);

  /* ── Activities ── */
  const activities = stats?.recentActivities?.length > 0
    ? stats.recentActivities
    : [
        { type: 'RDV',    text: 'Entretien annuel — Peugeot 3008',  time: 'Il y a 10 min', color: '#22C55E' },
        { type: 'VENTE',  text: 'Nouvelle commande #4592',           time: 'Il y a 1h',     color: '#60A5FA' },
        { type: 'STOCK',  text: 'Stock bas : Plaquettes de frein',   time: 'Il y a 3h',     color: '#EF4444' },
        { type: 'SAV',    text: 'Ticket #102 fermé par Paul',        time: 'Hier',          color: '#C41E1E' },
        { type: 'SYSTEM', text: 'Mise à jour serveur effectuée',     time: 'Hier',          color: '#F59E0B' },
      ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'RDV':    return <Calendar size={16} />;
      case 'VENTE':  return <ShoppingBag size={16} />;
      case 'STOCK':  return <AlertTriangle size={16} />;
      case 'SAV':    return <Wrench size={16} />;
      default:       return <Activity size={16} />;
    }
  };

  return (
    <div ref={dashboardRef}>

      {/* ── Page header ── */}
      <header style={{ marginBottom: '36px' }}>
        {/* Red accent line — auth page style */}
        <div className="dash-header-line" style={{
          width: '40px',
          height: '3px',
          background: 'linear-gradient(to right, #C41E1E, #116BAB)',
          borderRadius: '2px',
          marginBottom: '16px',
        }} />
        <p style={{
          margin: '0 0 4px 0',
          fontSize: '0.65rem',
          fontWeight: 800,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'var(--admin-text-muted)',
        }}>
          DIWA INTERNATIONALE — ESPACE ADMIN
        </p>
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
          fontWeight: 200,
          letterSpacing: '-2px',
          color: 'var(--admin-text-main)',
          lineHeight: 1,
        }}>
          Vue <strong style={{ fontWeight: 900 }}>d'ensemble</strong>
        </h1>
      </header>

      {/* ── KPI Grid ── */}
      <div className="stats-grid">
        {kpis.map((kpi, i) => (
          <div key={i} className="kpi-card">
            <div style={{ padding: '26px' }}>
              {/* Top row: icon + trend badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div className="kpi-icon-box" style={{ background: kpi.bg, color: kpi.color }}>
                  {kpi.icon}
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: kpi.color,
                  background: kpi.bg,
                  padding: '4px 10px',
                  borderRadius: '100px',
                  letterSpacing: '0.3px',
                }}>
                  {kpi.trend}
                </span>
              </div>

              {/* Label + Value */}
              <MetricLabel>{kpi.label}</MetricLabel>
              <h2 className="kpi-value">{kpi.value}</h2>

              {/* Link */}
              <NavLink
                to={kpi.path}
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--admin-text-muted)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '12px',
                  transition: 'color 0.2s',
                  fontWeight: 600,
                  letterSpacing: '0.3px',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = kpi.color)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--admin-text-muted)')}
              >
                Voir les détails <ArrowUpRight size={13} />
              </NavLink>
            </div>

            {/* Bottom accent bar */}
            <div style={{
              height: '2px',
              background: `linear-gradient(to right, ${kpi.color}60, transparent)`,
            }} />
          </div>
        ))}
      </div>

      {/* ── Charts + Activities ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }}>

        {/* Performance Chart */}
        <div className="dashboard-section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <div>
              <SectionHeading>Performance</SectionHeading>
              <p style={{ margin: '5px 0 0 0', fontSize: '1rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                Hebdomadaire
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', background: 'var(--admin-accent)', borderRadius: '3px' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', fontWeight: 700 }}>Ventes</span>
            </div>
          </div>

          {/* Bars */}
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
            {chartData.map((h: number, i: number) => {
              const pct = chartMax > 0 ? (h / chartMax) * 100 : h;
              const isLast = i === chartData.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{
                    width: '100%',
                    height: `${pct}%`,
                    background: isLast
                      ? 'linear-gradient(180deg, rgba(196,30,30,0.35) 0%, rgba(196,30,30,0.06) 100%)'
                      : 'linear-gradient(180deg, rgba(17,107,171,0.14) 0%, rgba(17,107,171,0.03) 100%)',
                    borderTop: `2px solid ${isLast ? 'var(--admin-accent)' : 'rgba(17,107,171,0.3)'}`,
                    borderRadius: '4px 4px 0 0',
                    position: 'relative',
                    transition: 'all 0.3s',
                    cursor: 'default',
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-5px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '8px',
                      height: '8px',
                      background: isLast ? 'var(--admin-accent)' : '#116BAB',
                      borderRadius: '50%',
                      opacity: isLast ? 1 : 0.35,
                      boxShadow: isLast ? '0 0 8px rgba(196,30,30,0.6)' : 'none',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--admin-text-muted)', fontWeight: 700 }}>
                    P{i + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="dashboard-section-card">
          <div style={{ marginBottom: '24px' }}>
            <SectionHeading>Journal</SectionHeading>
            <p style={{ margin: '5px 0 0 0', fontSize: '1rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
              Activités récentes
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {activities.map((act: any, i: number) => (
              <div key={i} style={{
                display: 'flex',
                gap: '12px',
                padding: '12px 0',
                borderBottom: i < activities.length - 1 ? '1px solid var(--admin-border)' : 'none',
                alignItems: 'center',
              }}>
                {/* Icon dot */}
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: `${act.color}16`,
                  color: act.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {getActivityIcon(act.type)}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--admin-text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>{act.text}</p>
                  <p style={{
                    margin: '2px 0 0 0',
                    fontSize: '0.68rem',
                    color: 'var(--admin-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <Clock size={10} /> {act.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick actions row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
        {[
          { label: 'Nouveau RDV',         path: '/admin/garage',     icon: <Calendar size={18} />, color: '#60A5FA' },
          { label: 'Suivi SAV',            path: '/admin/sav',        icon: <Wrench size={18} />,   color: '#C41E1E' },
          { label: 'Logistique missions',  path: '/admin/logistique', icon: <Activity size={18} />, color: '#F59E0B' },
        ].map((action, i) => (
          <NavLink
            key={i}
            to={action.path}
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: 'var(--admin-card-bg)',
              border: '1px solid var(--admin-border)',
              borderRadius: '14px',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              transition: 'all 0.25s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = action.color + '50';
              el.style.background = 'var(--admin-card-bg-hover)';
              el.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = 'var(--admin-border)';
              el.style.background = 'var(--admin-card-bg)';
              el.style.transform = 'translateY(0)';
            }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: action.color + '18',
                color: action.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {action.icon}
              </div>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--admin-text-main)',
              }}>{action.label}</span>
              <ArrowUpRight size={15} style={{ marginLeft: 'auto', color: 'var(--admin-text-muted)' }} />
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
