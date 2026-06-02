import React from 'react';
import { X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthFavorisModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthFavorisModal: React.FC<AuthFavorisModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="auth-fav-container" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><X size={20} /></button>
                
                <div className="auth-fav-content">
                    <h2 className="serif-title">Mes favoris</h2>
                    <div className="divider"></div>
                    
                    <p className="auth-fav-text">
                        Offrez-vous une vue d'ensemble de vos véhicules configurés. Votre compte DIWA Internationale personnel vous aide à comparer.
                    </p>
                    
                    <div className="divider"></div>

                    <button 
                        className="btn-connexion-fav" 
                        onClick={() => {
                            onClose();
                            navigate('/login');
                        }}
                    >
                        Connexion
                    </button>
                </div>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 5000; backdrop-filter: blur(2px);
                }
                .auth-fav-container {
                    background: #fff; width: 90%; max-width: 500px;
                    border-radius: 4px; position: relative; padding: 40px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                    animation: slideUp 0.3s ease-out;
                }
                .close-btn {
                    position: absolute; top: 20px; right: 20px;
                    background: transparent; border: none; cursor: pointer; color: #000;
                    opacity: 0.5; transition: opacity 0.2s;
                }
                .close-btn:hover { opacity: 1; }
                
                .serif-title {
                    font-family: 'Poppins', sans-serif;
                    font-size: 2.2rem; font-weight: 400; color: #000; margin: 0;
                }
                .divider { height: 1px; background: #e0e0e0; margin: 30px 0; }
                
                .auth-fav-text {
                    font-size: 1rem; line-height: 1.6; color: #333; margin: 0;
                }
                
                .btn-connexion-fav {
                    width: 100%; padding: 15px; border-radius: 4px; border: none;
                    background: #0078d4; color: #fff; font-weight: 700;
                    font-size: 0.95rem; cursor: pointer; transition: background 0.3s;
                }
                .btn-connexion-fav:hover { background: #005a9e; }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default AuthFavorisModal;
