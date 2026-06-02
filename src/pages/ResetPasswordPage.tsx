import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import axiosInstance from '../utils/axiosInstance';
import './AuthPages.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialEmail = queryParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Le backend attend un PasswordResetConfirmRequest
      // { email, newPassword, confirmPassword, otpCode } 
      // Note: Je dois vérifier les champs exacts dans le DTO backend si possible
      await axiosInstance.post('/api/auth/reset-password', {
        email,
        newPassword,
        confirmPassword,
        otpCode: resetCode
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code invalide ou expiré.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" padding="lg">
        <h2 className="auth-title">Réinitialisation</h2>
        <p className="auth-subtitle">Saisissez le code reçu par email et votre nouveau mot de passe</p>
        
        {success ? (
          <div style={{ 
            background: '#f0fdf4', color: '#166534', padding: '20px', 
            borderRadius: '12px', textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>✅ Succès !</h3>
            <p style={{ margin: 0 }}>Votre mot de passe a été réinitialisé. Redirection vers la page de connexion...</p>
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
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!!initialEmail}
                  required
                />
              </div>

              <div className="form-group">
                <label>Code de réinitialisation</label>
                <input 
                  type="text" 
                  placeholder="Entrez le code reçu" 
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button variant="primary" className="w-full" type="submit" disabled={loading}>
                {loading ? 'Traitement...' : 'Réinitialiser le mot de passe'}
              </Button>
            </form>
          </>
        )}
        
        <div className="auth-footer">
          <p>Retourner à la <Link to="/login">connexion</Link></p>
        </div>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
