import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import axiosInstance from '../utils/axiosInstance';
import './AuthPages.css';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!email) {
    return (
      <div className="auth-container">
        <Card className="auth-card" padding="lg">
          <h2 className="auth-title">Accès non autorisé</h2>
          <p className="auth-subtitle">Veuillez repasser par la page de connexion.</p>
          <Button variant="primary" onClick={() => navigate('/login')}>Retourner au Login</Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
        return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axiosInstance.post('/api/auth/change-password-first-login', {
        email,
        newPassword,
        confirmPassword
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du changement de mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" padding="lg">
        <h2 className="auth-title">Nouveau Mot de Passe</h2>
        <p className="auth-subtitle">C'est votre première connexion. Pour sécuriser votre compte, veuillez définir un mot de passe personnel.</p>
        
        {success ? (
          <div style={{ 
            background: '#f0fdf4', color: '#166534', padding: '20px', 
            borderRadius: '12px', textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>✅ Mot de passe mis à jour !</h3>
            <p style={{ margin: 0 }}>Votre nouveau mot de passe est enregistré. Vous allez être redirigé vers la page de connexion.</p>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}
            
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} readOnly disabled />
              </div>
              
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input 
                  type="password" 
                  placeholder="Choisissez un mot de passe robuste" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input 
                  type="password" 
                  placeholder="Répétez le mot de passe" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button variant="primary" className="w-full" type="submit" disabled={loading}>
                {loading ? 'Mise à jour...' : 'Définir mon mot de passe'}
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
};

export default ChangePasswordPage;
