import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Settings, 
  Wrench, 
  ShoppingBag, 
  MessageSquare, 
  Users, 
  LogOut,
  Menu,
  X,
  TrendingUp,
  Tag,
  User,
  Monitor,
  Truck,
  Clock,
  Calendar
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import axiosInstance from '../../utils/axiosInstance';
import './AdminStyles.css';

gsap.registerPlugin(useGSAP);

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [alertCount, setAlertCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { username: 'Admin', roles: [] };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axiosInstance.get('/api/v1/pieces-detachees/all');
        if (response.data.statut === 200) {
          const count = response.data.data.filter((p: any) => p.quantiteStock <= 3).length;
          setAlertCount(count);
        }
      } catch (e) {}
    };

    const fetchUnreadMessages = async () => {
       try {
         const res = await axiosInstance.get('/api/contact/admin/all');
         const unread = res.data.filter((m: any) => !m.lu).length;
         setUnreadMessages(unread);
       } catch (e) {}
    };

    if (user.roles?.includes('ROLE_ADMIN')) {
      fetchAlerts();
      fetchUnreadMessages();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const hasRole = (role: string) => user.roles?.includes(role);
  const isAdmin = hasRole('ROLE_ADMIN');
  const isReceptionnist = hasRole('ROLE_RECEPTIONNISTE');
  const isChefTech = hasRole('ROLE_CHEF_TECHNICIEN');
  const isTech = hasRole('ROLE_TECHNICIEN');
  const isChauffeur = hasRole('ROLE_CHAUFFEUR');
  const isStock = hasRole('ROLE_STOCK');

  const navItems = [
    { 
      icon: <LayoutDashboard size={20} />, 
      label: 'Tableau de bord', 
      path: '/admin/dashboard',
      show: true 
    },
    { 
      icon: <TrendingUp size={20} />, 
      label: 'Analyses & Stats', 
      path: '/admin/stats',
      show: isAdmin || hasRole('ROLE_DG')
    },
    { 
      icon: <MessageSquare size={20} />, 
      label: 'Messages Clients', 
      path: '/admin/messages',
      badge: unreadMessages > 0 ? unreadMessages : null,
      show: isAdmin || isReceptionnist
    },
    { 
      icon: <Car size={20} />, 
      label: 'Parc Automobiles', 
      path: '/admin/vehicules',
      show: isAdmin || isReceptionnist
    },
    { 
      icon: <ShoppingBag size={20} />, 
      label: 'Commandes Pièces', 
      path: '/admin/commandes',
      show: isAdmin || isStock || isReceptionnist
    },
    { 
      icon: <LayoutDashboard size={20} />, 
      label: 'Module Réception', 
      path: '/admin/reception/dashboard',
      show: isReceptionnist
    },
    { 
      icon: <Wrench size={20} />, 
      label: 'Module Atelier', 
      path: '/admin/atelier/dashboard',
      show: isChefTech || isTech
    },
    { 
      icon: <Calendar size={20} />, 
      label: 'Planning Atelier', 
      path: '/admin/atelier/affectation',
      show: isChefTech
    },
    { 
      icon: <Calendar size={20} />, 
      label: 'Planning & RDV', 
      path: '/admin/garage',
      show: isAdmin
    },
    { 
      icon: <MessageSquare size={20} />, 
      label: 'Suivi SAV (Atelier/Réception)', 
      path: '/admin/sav',
      show: isAdmin || isReceptionnist || isChefTech
    },
    { 
      icon: <Truck size={20} />, 
      label: 'Logistique & Missions', 
      path: '/admin/logistique',
      show: isAdmin || isReceptionnist
    },
    { 
      icon: <Clock size={20} />, 
      label: 'Horaires de Travail', 
      path: '/admin/logistique?tab=plages',
      show: isAdmin || isReceptionnist
    },
    { 
      icon: <Users size={20} />, 
      label: 'Équipe Chauffeurs', 
      path: '/admin/chauffeurs',
      show: isAdmin || isReceptionnist
    },
    { 
      icon: <Settings size={20} />, 
      label: 'Stock & Inventaire', 
      path: '/admin/pieces',
      badge: alertCount > 0 ? alertCount : null,
      show: isAdmin || isStock
    },
    {
      icon: <Tag size={20} />,
      label: 'Catégories Pièces',
      path: '/admin/categories',
      show: isAdmin || isStock
    },
    {
      icon: <Tag size={20} />,
      label: 'Coupons Réduction',
      path: '/admin/coupons',
      show: isAdmin || isReceptionnist
    },
    {
      icon: <Wrench size={20} />,
      label: 'Garage & Techniciens',
      path: '/admin/garage',
      show: isAdmin
    },
    { 
      icon: <Users size={20} />, 
      label: 'Gestion Personnel', 
      path: '/admin/users',
      show: isAdmin
    },
    { 
      icon: <Monitor size={20} />, 
      label: 'Gestion Contenu (CMS)', 
      path: '/admin/cms',
      show: isAdmin
    },
    { 
      icon: <User size={20} />, 
      label: 'Mon Profil', 
      path: '/admin/profile',
      show: true 
    },
  ];

  const filteredNavItems = navItems.filter(item => item.show);

  useGSAP((context) => {
    if (!context || !context.selector) return;
    if (context.selector('.admin-sidebar').length > 0) {
      gsap.from('.admin-sidebar', {
        x: -50,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out'
      });
    }
  }, { scope: container });

  const getRoleLabel = () => {
    if (isAdmin) return 'Administrateur';
    if (isReceptionnist) return 'Réceptionniste';
    if (isChefTech) return 'Chef Technicien';
    if (isTech) return 'Technicien';
    if (isChauffeur) return 'Chauffeur';
    if (isStock) return 'Gestionnaire Stock';
    return 'Employé';
  };

  return (
    <div className="admin-container" ref={container}>
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          {isSidebarOpen && (
            <div className="admin-logo">
              <span className="logo-eyebrow">Internationale</span>
              <span className="logo-text">
                D<span className="logo-accent">I</span>WA
              </span>
            </div>
          )}
          <button
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={!isSidebarOpen ? { margin: '0 auto' } : {}}
          >
            {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        <nav className="admin-nav">
          {filteredNavItems.map((item, index) => (
            <NavLink 
              key={index}
              to={item.path} 
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {isSidebarOpen && <span className="nav-label">{item.label}</span>}
              {item.badge && isSidebarOpen && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="user-avatar" title={user.username}>{user.username?.charAt(0).toUpperCase()}</div>
            {isSidebarOpen && (
              <div className="user-details">
                <p className="user-name">{user.username}</p>
                <p className="user-role">{getRoleLabel()}</p>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Déconnexion">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
             {!isSidebarOpen && (
               <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(true)} style={{ marginRight: '15px' }}>
                 <Menu size={20} />
               </button>
             )}
              <div className="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                 <span style={{
                   color: 'var(--admin-text-muted)',
                   fontSize: '0.72rem',
                   fontWeight: 800,
                   textTransform: 'uppercase',
                   letterSpacing: '2.5px',
                 }}>DIWA</span>
                 <span style={{ margin: '0 10px', color: 'var(--admin-border)', fontSize: '0.9rem' }}>/</span>
                 <span style={{
                   fontWeight: 700,
                   fontSize: '0.9rem',
                   color: 'var(--admin-text-main)',
                 }}>Espace Admin</span>
              </div>
          </div>
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="status-indicator">
              <div className="dot pulse"></div>
              <span className="hide-mobile">Système actif</span>
            </div>

            {/* Séparateur */}
            <div style={{ width: '1px', height: '24px', background: 'var(--admin-border)' }} />

            <button
              onClick={() => navigate('/admin/profile')}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#f8fafc',
                color: 'var(--admin-text-muted)',
                border: '1px solid var(--admin-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s',
              }}
              className="admin-avatar-btn"
              title="Mon Profil"
            >
              <User size={18} />
            </button>

            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(196,30,30,0.07)',
                color: '#C41E1E',
                border: '1px solid rgba(196,30,30,0.18)',
                padding: '9px 16px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'all 0.25s',
                letterSpacing: '0.3px',
              }}
              title="Déconnexion"
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(196,30,30,0.14)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(196,30,30,0.07)';
              }}
            >
              <LogOut size={15} />
              <span className="hide-mobile">Déconnexion</span>
            </button>
          </div>
        </header>
        
        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
