import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import axiosInstance from '../utils/axiosInstance';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Le backend attend l'email dans le corps de la requête (String brut ou JSON selon l'implémentation)
      // En regardant AuthController.java, il semble attendre un @RequestBody String email
      await axiosInstance.post('/api/auth/forgot-password', email, {
        headers: { 'Content-Type': 'text/plain' }
      });
      
      setMessage('Si un compte est associé à cet email, vous recevrez un code de réinitialisation.');
      
      // On redirige vers la page de réinitialisation après un court délai
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la demande.');
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" padding="lg">
        <h2 className="auth-title">Mot de passe oublié</h2>
        <p className="auth-subtitle">Entrez votre email pour recevoir un code de réinitialisation</p>
        
        {message && (
          <div style={{ 
            background: '#f0fdf4', color: '#166534', padding: '12px', 
            borderRadius: '6px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' 
          }}>
            {message}
          </div>
        )}
        
        {error && (
          <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Votre adresse email</label>
            <input 
              type="email" 
              placeholder="votre@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <Button variant="primary" className="w-full" type="submit" disabled={loading}>
            {loading ? 'Envoi en cours...' : 'Envoyer le code'}
          </Button>
        </form>
        
        <div className="auth-footer">
          <p>Retourner à la <Link to="/login">connexion</Link></p>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
