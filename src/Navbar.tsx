import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Heart, User as UserIcon, ChevronDown, Menu as MenuIcon, ShoppingBag, X as XIcon, Plus, Minus, Trash2, Sun, Moon, Package, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import { useCart } from './context/CartContext'
import AuthFavorisModal from './components/common/AuthFavorisModal'
import axiosInstance from './utils/axiosInstance'
import LoadingDots from './components/common/LoadingDots'

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null)
  const [hoverDropdown, setHoverDropdown] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light')
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const { cart, removeFromCart, updateQuantity, itemCount, totalAmount } = useCart()
  const [categories, setCategories] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/api/v1/categories-pieces/all')
        if (response.data.statut === 200) {
          setCategories(response.data.data)
        }
      } catch (error) {
        console.error('Erreur categories navbar:', error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 250)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsCartOpen(false)
    setHoverDropdown(null)
    setMobileDropdown(null)
  }, [location])

  // Ferme le dropdown au clic extérieur (desktop)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.nav-link-wrapper')) {
        setHoverDropdown(null)
        setMobileDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleFavClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
    } else {
      navigate('/favoris')
    }
  }

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url; // Asset local
    return `${import.meta.env.VITE_API_URL ?? 'http://localhost:8181'}/uploads/${url}`;
  };

  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const response = await axiosInstance.get('/api/v1/notifications/my')
          setNotifications(response.data)
          setUnreadCount(response.data.filter((n: any) => !n.read).length)
        } catch (error) {
          console.error('Erreur notifications:', error)
        }
      }
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000) 
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  // Ouvre le panel ET marque tout comme lu immédiatement
  const handleOpenNotifications = async () => {
    const opening = !isNotificationsOpen
    setIsNotificationsOpen(opening)

    if (opening && unreadCount > 0) {
      // Mise à jour locale immédiate (UX réactive)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      // Persistance côté serveur (silencieuse)
      try {
        await axiosInstance.put('/api/v1/notifications/mark-all-read')
      } catch (e) { console.error('mark-all-read:', e) }
    }
  }

  // Clic sur une notification : elle disparaît de la liste + navigation
  const handleNotificationClick = (notif: any) => {
    setNotifications(prev => prev.filter(n => n.id !== notif.id))
    setIsNotificationsOpen(false)
    if (notif.targetId) {
      navigate(`/mes-demandes/${notif.targetId}`)
    }
  }

  return (
    <>
      <nav className={`navbar-elite ${isScrolled ? 'navbar-scrolled' : ''}`}
        style={{
          backgroundColor: isScrolled ? 'rgba(var(--bg-primary-rgb), 0.8)' : 'var(--bg-primary)',
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          color: 'var(--text-primary)',
          borderBottom: '1px solid var(--bg-secondary)',
          transition: 'all 0.4s ease'
        }}
      >
        {/* BLOC GAUCHE : Logo + Menu */}
        <div className="nav-left-brand">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', zIndex: 3000 }}>
            <img
              src="/logo-clean.png"
              alt="DIWA Logo"
              style={{
                height: isScrolled ? '60px' : '85px',
                width: 'auto', objectFit: 'contain', transition: 'all 0.4s ease'
              }}
            />
          </Link>

          <div className={`nav-links-container ${isMobileMenuOpen ? 'nav-mobile-active' : ''}`}>
            <Link to="/" className="nav-link-item" style={{ textDecoration: 'none' }}>Accueil</Link>
            <Link to="/vehicules" className="nav-link-item" style={{ textDecoration: 'none' }}>Nos Véhicules</Link>

            {/* Dropdown: Nos Produits — contrôlé React (hover desktop + click mobile) */}
            <div
              className={`nav-link-wrapper ${mobileDropdown === 'products' ? 'mobile-open' : ''}`}
              style={{ position: 'relative' }}
              onMouseEnter={() => { if (window.innerWidth > 1024) setHoverDropdown('products'); }}
              onMouseLeave={() => { if (window.innerWidth > 1024) setHoverDropdown(null); }}
            >
              <span
                className="nav-link-item"
                onClick={() => {
                  if (window.innerWidth > 1024) {
                    setHoverDropdown(prev => prev === 'products' ? null : 'products')
                  } else {
                    setMobileDropdown(mobileDropdown === 'products' ? null : 'products')
                  }
                }}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                Nos Produits <ChevronDown size={14} strokeWidth={3} style={{ transform: (hoverDropdown === 'products' || mobileDropdown === 'products') ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
              </span>
              {/* Dropdown panel — visible uniquement si hover desktop OU mobile-open */}
              <div
                className="dropdown-menu"
                style={{
                  opacity: (hoverDropdown === 'products' || mobileDropdown === 'products') ? 1 : 0,
                  visibility: (hoverDropdown === 'products' || mobileDropdown === 'products') ? 'visible' : 'hidden',
                  transform: (hoverDropdown === 'products' || mobileDropdown === 'products')
                    ? 'translateX(-50%) translateY(0)'
                    : 'translateX(-50%) translateY(10px)',
                  pointerEvents: (hoverDropdown === 'products' || mobileDropdown === 'products') ? 'auto' : 'none',
                }}
              >
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/produits?cat=${cat.id}`}
                      className="dropdown-item"
                      style={{ textDecoration: 'none' }}
                      onClick={() => { setIsMobileMenuOpen(false); setHoverDropdown(null); }}
                    >
                      {cat.libelle}
                    </Link>
                  ))
                ) : (
                  <span className="dropdown-item" style={{ fontSize: '0.8rem', opacity: 0.5 }}><LoadingDots /></span>
                )}
              </div>
            </div>

            {/* Dropdown: Garage — même logique contrôlée */}
            <div
              className={`nav-link-wrapper ${mobileDropdown === 'garage' ? 'mobile-open' : ''}`}
              style={{ position: 'relative' }}
              onMouseEnter={() => { if (window.innerWidth > 1024) setHoverDropdown('garage'); }}
              onMouseLeave={() => { if (window.innerWidth > 1024) setHoverDropdown(null); }}
            >
              <span
                className="nav-link-item"
                onClick={() => {
                  if (window.innerWidth > 1024) {
                    setHoverDropdown(prev => prev === 'garage' ? null : 'garage')
                  } else {
                    setMobileDropdown(mobileDropdown === 'garage' ? null : 'garage')
                  }
                }}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                Garage <ChevronDown size={14} strokeWidth={3} style={{ transform: (hoverDropdown === 'garage' || mobileDropdown === 'garage') ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
              </span>
              <div
                className="dropdown-menu"
                style={{
                  opacity: (hoverDropdown === 'garage' || mobileDropdown === 'garage') ? 1 : 0,
                  visibility: (hoverDropdown === 'garage' || mobileDropdown === 'garage') ? 'visible' : 'hidden',
                  transform: (hoverDropdown === 'garage' || mobileDropdown === 'garage')
                    ? 'translateX(-50%) translateY(0)'
                    : 'translateX(-50%) translateY(10px)',
                  pointerEvents: (hoverDropdown === 'garage' || mobileDropdown === 'garage') ? 'auto' : 'none',
                }}
              >
                <Link to="/garage" className="dropdown-item" onClick={() => { setIsMobileMenuOpen(false); setHoverDropdown(null); }}>Prendre RDV</Link>
                <Link to="/garage" className="dropdown-item" onClick={() => { setIsMobileMenuOpen(false); setHoverDropdown(null); }}>SAV &amp; Maintenance</Link>
              </div>
            </div>

            <Link to="/contact" className="nav-link-item" style={{ textDecoration: 'none' }}>Contact</Link>
          </div>
        </div>

        {/* BLOC DROITE : Favoris + Connexion + Panier + Thème + Burger */}
        <div className="nav-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

          {/* THEME TOGGLE */}
          <div onClick={toggleTheme} style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(128,128,128,0.1)' }} title="Changer le thème">
            <AnimatePresence mode="wait">
              {theme === 'light' ? (
                <motion.div key="moon" initial={{ opacity: 0, rotate: -90, scale: 0.5 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 90, scale: 0.5 }} transition={{ duration: 0.3 }}>
                  <Moon size={18} />
                </motion.div>
              ) : (
                <motion.div key="sun" initial={{ opacity: 0, rotate: -90, scale: 0.5 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 90, scale: 0.5 }} transition={{ duration: 0.3 }}>
                  <Sun size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PANIER */}
          <div onClick={() => setIsCartOpen(true)} style={{ cursor: 'pointer', position: 'relative', opacity: 0.8, padding: '8px' }} title="Mon Panier">
            <ShoppingBag size={22} />
            {itemCount > 0 && (
              <span style={{ 
                position: 'absolute', top: '0', right: '0',
                background: '#116BAB',
                color: '#fff', fontSize: '0.65rem', fontWeight: 800,
                width: '18px', height: '18px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}>
                {itemCount}
              </span>
            )}
          </div>

          {/* NOTIFICATIONS */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={handleOpenNotifications}
              style={{ cursor: 'pointer', position: 'relative', opacity: 0.8, padding: '8px' }}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{ 
                  position: 'absolute', 
                  top: '4px', 
                  right: '4px', 
                  background: '#71020C', 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%',
                  border: '2px solid var(--bg-primary)'
                }}></span>
              )}
            </div>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    right: 0, 
                    width: '320px', 
                    background: 'var(--bg-primary)', 
                    boxShadow: '0 15px 40px rgba(0,0,0,0.15)', 
                    borderRadius: '16px', 
                    marginTop: '15px',
                    zIndex: 5000,
                    border: '1px solid var(--bg-secondary)',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--bg-secondary)', fontWeight: 800, fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between' }}>
                    Notifications
                    {unreadCount > 0 && <span style={{ color: '#0D6DAD', fontSize: '0.75rem' }}>{unreadCount} nouvelles</span>}
                  </div>
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.5, fontSize: '0.85rem' }}>
                        Aucune notification pour le moment
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n)}
                          style={{ 
                            padding: '15px 20px', 
                            borderBottom: '1px solid var(--bg-secondary)', 
                            cursor: 'pointer',
                            background: n.read ? 'transparent' : 'rgba(13, 109, 173, 0.05)',
                            transition: '0.2s'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px', color: n.read ? 'inherit' : '#0D6DAD' }}>{n.title}</div>
                          <div style={{ fontSize: '0.8rem', opacity: 0.8, lineHeight: 1.4 }}>{n.message}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '8px' }}>
                            {new Date(n.createDate).toLocaleDateString()} {new Date(n.createDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div
                      onClick={() => setIsNotificationsOpen(false)}
                      style={{ padding: '12px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer', borderTop: '1px solid var(--bg-secondary)', opacity: 0.6 }}
                    >
                      Fermer
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FAVORIS (COEUR) */}
          <div onClick={handleFavClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.8 }} title="Mes Favoris">
            <Heart size={20} fill={location.pathname === '/favoris' ? 'currentColor' : 'none'} />
          </div>

          {/* SECTION CONNEXION */}
          {!isAuthenticated ? (
            <Link to="/login" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(128,128,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserIcon size={16} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Connexion</span>
            </Link>
          ) : (
            <div 
              className="nav-link-wrapper" 
              style={{ position: 'relative' }}
              onMouseEnter={() => setHoverDropdown('profile')}
              onMouseLeave={() => setHoverDropdown(null)}
              onClick={() => setMobileDropdown(mobileDropdown === 'profile' ? null : 'profile')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#116BAB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserIcon size={16} color="#fff" />
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 400, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{user?.username}</span>
              </div>
              <div 
                className="dropdown-menu" 
                style={{ 
                  minWidth: '150px',
                  opacity: (hoverDropdown === 'profile' || mobileDropdown === 'profile') ? 1 : 0,
                  visibility: (hoverDropdown === 'profile' || mobileDropdown === 'profile') ? 'visible' : 'hidden',
                  transform: (hoverDropdown === 'profile' || mobileDropdown === 'profile')
                    ? 'translateX(-50%) translateY(0)'
                    : 'translateX(-50%) translateY(10px)',
                  pointerEvents: (hoverDropdown === 'profile' || mobileDropdown === 'profile') ? 'auto' : 'none',
                }}
              >
                <Link to="/mon-espace" className="dropdown-item" onClick={() => { setIsMobileMenuOpen(false); setHoverDropdown(null); setMobileDropdown(null); }}>Mon Profil</Link>
                {user?.roles.some((role: string) => 
                  ['ROLE_ADMIN', 'ADMIN', 'ROLE_RECEPTIONNISTE', 'ROLE_CHEF_TECHNICIEN', 'ROLE_TECHNICIEN'].includes(role)
                ) && (
                  <Link to="/admin/dashboard" className="dropdown-item" style={{ fontWeight: 800, color: '#0D6DAD' }} onClick={() => { setIsMobileMenuOpen(false); setHoverDropdown(null); setMobileDropdown(null); }}>Accès Professionnel</Link>
                )}
                <div className="dropdown-item" onClick={() => { logout(); setIsMobileMenuOpen(false); setHoverDropdown(null); setMobileDropdown(null); }} style={{ color: '#73020D' }}>Déconnexion</div>
              </div>
            </div>
          )}

          {/* BURGER MENU */}
          <button className="burger-menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <MenuIcon size={28} strokeWidth={2.5} />
          </button>
        </div>
      </nav>

      {/* CART DRAWER */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`} style={{
        position: 'fixed', top: 0, right: 0, width: '400px', height: '100vh', background: 'var(--bg-primary)',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.3)', zIndex: 4000, transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
        display: 'flex', flexDirection: 'column', color: 'var(--text-primary)'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Votre Panier ({itemCount})</h2>
          <button onClick={() => setIsCartOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}><XIcon size={24} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
              <ShoppingBag size={64} style={{ marginBottom: '20px', opacity: 0.3 }} />
              <p style={{ color: 'var(--text-secondary)' }}>Votre panier est vide.</p>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'var(--staggered-line-color)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 700, marginTop: '20px', cursor: 'pointer' }}>Continuer mes achats</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '10px' }}>
                    {item.imageUrl ? <img src={getImageUrl(item.imageUrl)!} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Package size={30} color="#ddd" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', fontWeight: 700 }}>{item.nom}</h4>
                    {/* <div style={{ fontSize: '0.85rem', color: 'var(--staggered-line-color)', fontWeight: 800, marginBottom: '10px' }}>{item.prixUnitaire.toLocaleString()} FCFA</div> */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--bg-secondary)', borderRadius: '4px' }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Minus size={14} /></button>
                        <span style={{ padding: '0 10px', fontSize: '0.85rem', fontWeight: 700 }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ color: '#71020C', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '24px', borderTop: '1px solid var(--bg-secondary)', background: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              {/* <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--staggered-line-color)' }}>{totalAmount.toLocaleString()} FCFA</span> */}
              <span style={{ fontWeight: 600, fontSize: '1rem', color: '#64748b' }}>Sur devis</span>
            </div>
            <button className="checkout-btn" style={{ width: '100%', background: 'var(--staggered-line-color)', color: '#fff', border: 'none', padding: '16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: '0.3s' }}>
              Passer la commande
            </button>
          </div>
        )}
      </div>

      {isCartOpen && <div onClick={() => setIsCartOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 3500 }}></div>}

      <AuthFavorisModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}

export default Navbar
