import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatedText } from '../components/ui/animated-text';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import './AuthPages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';
  const queryParams = new URLSearchParams(location.search);
  const isConfirmed = queryParams.get('confirmed') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/api/auth/login', { email, password });

      if (response.data.token) {
        // Si changement forcé requis, on ne connecte pas encore officiellement (ou on redirige)
        if (response.data.mustResetPassword) {
          navigate('/change-password', { state: { email: response.data.email || email } });
          return;
        }

        login(response.data.user, response.data.token);

        // Redirection vers Admin si l'utilisateur est admin, réceptionniste ou technicien
        const roles = response.data.user.roles || [];
        const isAdminPanelUser = roles.some((role: string) =>
          ['ROLE_ADMIN', 'ADMIN', 'ROLE_RECEPTIONNISTE', 'ROLE_CHEF_TECHNICIEN', 'ROLE_TECHNICIEN'].includes(role)
        );

        if (isAdminPanelUser) {
          navigate('/admin/dashboard');
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants invalides');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* LEFT PANEL — cinematic branding */}
      <div className="auth-left-panel">
        <div className="auth-brand-mark">DIWA — Automotive Excellence</div>
        <div>
          <div className="auth-left-tagline">
            L'excellence<br />
            <strong>automobile</strong><br />
            <AnimatedText 
              text="DIWA International" 
              textStyle={{ fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}
              duration={0.1}
              delay={0.08}
              style={{ alignItems: 'flex-start' }}
            />
          </div>
          <div style={{ marginTop: '30px' }}>
            <div className="auth-left-accent" />
            <p className="auth-left-sub">
              Connectez-vous pour accéder à vos configurations, vos favoris et votre espace client DIWA.
            </p>
          </div>
        </div>
        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          © 2025 DIWA Automobiles — Lomé, Togo
        </div>
      </div>

      {/* RIGHT PANEL — form */}
      <div className="auth-right-panel">
        <Card className="auth-card" padding="lg">
          <h2 className="auth-title">Connexion</h2>
          <p className="auth-subtitle">Accédez à votre espace client privilégié</p>

          {isConfirmed && (
            <div style={{
              background: '#f0fdf4', color: '#166534', padding: '12px',
              borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid #bcf0da'
            }}>
              ✅ Votre compte a été validé avec succès !
            </div>
          )}

          {error && <div className="auth-error" style={{ color: '#73020D', marginBottom: '1rem', fontSize: '0.9rem', background: '#FAF0F1', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(115,2,13,0.15)' }}>{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Identifiant ou Email</label>
              <input type="text" placeholder="Ex: chauffeur1 ou email@diwa.tg" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div style={{ textAlign: 'right', marginTop: '-6px' }}>
              <a href="/forgot-password" style={{ fontSize: '0.78rem', color: '#73020D', fontWeight: 600, textDecoration: 'none' }}>
                Mot de passe oublié ?
              </a>
            </div>

            <Button variant="primary" className="w-full" type="submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="auth-footer">
            <p>Pas encore de compte ? <a href="/register">S'inscrire</a></p>
          </div>
        </Card>
      </div>
    </div>
  );

};

export default LoginPage;
