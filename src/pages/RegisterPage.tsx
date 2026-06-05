import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedText } from '../components/ui/animated-text';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post('/api/auth/register', {
        username: formData.email,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  /* ── SUCCÈS ── */
  if (isSubmitted) {
    return (
      <div className="auth-container reverse">
        {/* Left panel */}
        <div className="auth-left-panel">
          <div className="auth-brand-mark">DIWA — Automotive Excellence</div>
          <div>
            <div className="auth-left-tagline">
              Bienvenue<br />
              <strong>dans la famille</strong><br />
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
                Votre compte a été créé avec succès. Vérifiez votre boîte mail pour activer votre accès.
              </p>
            </div>
          </div>
          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            © 2025 DIWA Automobiles — Lomé, Togo
          </div>
        </div>

        {/* Right panel — success */}
        <div className="auth-right-panel">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}
          >
            <div style={{
              width: '64px', height: '64px',
              background: '#F5F4F2',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px',
              border: '1px solid rgba(115,2,13,0.15)'
            }}>
              <span style={{ fontSize: '1.8rem' }}>✉️</span>
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px', color: 'var(--text-primary, #1C1917)' }}>
              Vérifiez votre email
            </h1>
            <p style={{ color: 'var(--neutral-500, #78716C)', lineHeight: 1.7, marginBottom: '8px', fontSize: '0.92rem' }}>
              Un lien de confirmation a été envoyé à :
            </p>
            <p style={{ fontWeight: 700, color: '#73020D', fontSize: '0.95rem', marginBottom: '32px' }}>
              {formData.email}
            </p>

            <div style={{ height: '1px', background: 'var(--border-color, #E8E6E2)', marginBottom: '28px' }} />

            <p style={{ fontSize: '0.82rem', color: 'var(--neutral-400, #A8A29E)', lineHeight: 1.7, marginBottom: '28px' }}>
              Le lien expire dans 24 heures. Si vous ne le trouvez pas, vérifiez vos spams.
            </p>

            <Button variant="primary" className="w-full" onClick={() => navigate('/login')}>
              Retour à la connexion
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── FORMULAIRE ── */
  return (
    <motion.div
      className="auth-container reverse"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left panel */}
      <div className="auth-left-panel">
        <div className="auth-brand-mark">DIWA — Automotive Excellence</div>
        <div>
          <div className="auth-left-tagline">
            Rejoignez<br />
            <strong>l'univers</strong><br />
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
              Créez votre compte pour accéder à vos configurations personnalisées et aux offres exclusives.
            </p>
          </div>
        </div>
        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          © 2025 DIWA Automobiles — Lomé, Togo
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-right-panel">
        <Card className="auth-card" padding="lg">
          <h2 className="auth-title">Créer un compte</h2>
          <p className="auth-subtitle">Rejoignez l'univers DIWA dès aujourd'hui</p>

          {error && (
            <div style={{
              color: '#73020D', marginBottom: '1rem', fontSize: '0.9rem',
              background: '#FAF0F1', padding: '10px 14px', borderRadius: '8px',
              border: '1px solid rgba(115,2,13,0.15)'
            }}>{error}</div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Prénom</label>
                <input type="text" name="prenom" placeholder="kossi" value={formData.prenom} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input type="text" name="nom" placeholder="ALOBA" value={formData.nom} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="votre@email.com" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
            </div>

            <Button variant="primary" className="w-full" type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </Button>
          </form>

          <div className="auth-footer">
            <p>Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
