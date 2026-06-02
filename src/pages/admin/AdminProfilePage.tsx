import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Shield, CheckCircle2, AlertCircle, Loader2, Save, ArrowLeft } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const AdminProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        roles: []
    });

    const [passwords, setPasswords] = useState({
        new: '',
        confirm: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/users/profile');
                if (response.data.statut === 200) {
                    setProfile(response.data.data);
                }
            } catch (err) {
                setError("Erreur de connexion au serveur.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);
        
        try {
            // On envoie tout en une fois si possible, ou séparément
            const payload: any = { 
                username: profile.username, 
                email: profile.email 
            };
            if (passwords.new) {
                if (passwords.new !== passwords.confirm) throw new Error("Les mots de passe divergent");
                payload.password = passwords.new;
            }

            const response = await axiosInstance.put('/api/v1/users/profile', payload);
            if (response.data.statut === 200) {
                setSuccess("Profil mis à jour avec succès");
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                user.username = profile.username;
                localStorage.setItem('user', JSON.stringify(user));
                window.dispatchEvent(new Event('storage'));
                setPasswords({ new: '', confirm: '' });
            }
        } catch (err: any) {
            setError(err.message || "Erreur lors de la mise à jour");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline text-blue-600" size={40} /></div>;

    return (
        <div className="profile-wrapper">
            <div className="profile-inner">
                
                <div className="profile-header-nav">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <ArrowLeft size={18} /> Retour
                    </button>
                </div>

                <Card className="profile-main-card">
                    <div className="card-top-accent"></div>
                    <div className="profile-card-content">
                        
                        <div className="profile-avatar-section">
                            <div className="avatar-circle">
                                {profile.username.charAt(0).toUpperCase()}
                            </div>
                            <h2>Mon Profil Admin</h2>
                            <p>Gérez vos identifiants de connexion</p>
                        </div>

                        {error && <div className="msg-box error"><AlertCircle size={16} /> {error}</div>}
                        {success && <div className="msg-box success"><CheckCircle2 size={16} /> {success}</div>}

                        <form onSubmit={handleSave} className="profile-form">
                            
                            <div className="input-section">
                                <label>Nom d'utilisateur</label>
                                <div className="input-with-icon">
                                    <User className="field-icon" size={18} />
                                    <input 
                                        type="text" 
                                        value={profile.username}
                                        onChange={e => setProfile({...profile, username: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="input-section">
                                <label>Email professionnel</label>
                                <div className="input-with-icon">
                                    <Mail className="field-icon" size={18} />
                                    <input 
                                        type="email" 
                                        value={profile.email}
                                        onChange={e => setProfile({...profile, email: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="divider"><span>Sécurité (Optionnel)</span></div>

                            <div className="input-section">
                                <label>Nouveau mot de passe</label>
                                <div className="input-with-icon">
                                    <Lock className="field-icon" size={18} />
                                    <input 
                                        type="password" 
                                        placeholder="Laisser vide pour ne pas changer"
                                        value={passwords.new}
                                        onChange={e => setPasswords({...passwords, new: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="input-section">
                                <label>Confirmer le mot de passe</label>
                                <div className="input-with-icon">
                                    <Shield className="field-icon" size={18} />
                                    <input 
                                        type="password" 
                                        placeholder="Confirmez le nouveau mot de passe"
                                        value={passwords.confirm}
                                        onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <Button 
                                    variant="primary" 
                                    className="save-btn" 
                                    disabled={saving}
                                    type="submit"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : "Enregistrer les modifications"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            </div>

            <style>{`
                .profile-wrapper {
                    min-height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    padding: 40px 20px;
                    background: #f8fafc;
                }
                .profile-inner {
                    width: 100%;
                    max-width: 500px;
                    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .profile-header-nav { margin-bottom: 20px; }
                .back-btn {
                    display: flex; align-items: center; gap: 8px;
                    background: transparent; border: none;
                    color: #64748b; font-weight: 500; cursor: pointer;
                    transition: color 0.2s;
                }
                .back-btn:hover { color: #0f172a; }

                .profile-main-card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
                    overflow: hidden;
                    border: 1px solid #f1f5f9;
                }
                .card-top-accent {
                    height: 6px;
                    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
                }
                .profile-card-content { padding: 40px; }

                .profile-avatar-section {
                    text-align: center; margin-bottom: 40px;
                }
                .avatar-circle {
                    width: 80px; height: 80px;
                    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                    color: #2563eb; font-size: 2rem; font-weight: 800;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 16px; border-radius: 50%;
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.1);
                    border: 4px solid white;
                }
                .profile-avatar-section h2 { font-size: 1.5rem; color: #0f172a; margin-bottom: 4px; }
                .profile-avatar-section p { color: #64748b; font-size: 0.9rem; }

                .msg-box {
                    padding: 12px 16px; border-radius: 12px; font-size: 0.9rem;
                    display: flex; align-items: center; gap: 10px; margin-bottom: 24px;
                }
                .msg-box.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fee2e2; }
                .msg-box.success { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }

                .profile-form { display: flex; flex-direction: column; gap: 20px; }
                
                .input-section { display: flex; flex-direction: column; gap: 8px; }
                .input-section label { font-size: 0.85rem; font-weight: 600; color: #475569; margin-left: 4px; }
                
                .input-with-icon { position: relative; }
                .field-icon {
                    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
                    color: #cbd5e1; pointer-events: none; transition: color 0.2s;
                }
                .input-with-icon input {
                    width: 100%; padding: 12px 14px 12px 42px;
                    background: #f8fafc; border: 2px solid #f1f5f9;
                    border-radius: 12px; outline: none; font-size: 0.95rem;
                    transition: all 0.2s; color: #1e293b;
                }
                .input-with-icon input:focus {
                    background: white; border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }
                .input-with-icon input:focus + .field-icon { color: #3b82f6; }

                .divider {
                    display: flex; align-items: center; margin: 10px 0;
                }
                .divider span {
                    background: #f1f5f9; padding: 4px 12px; border-radius: 100px;
                    font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .form-actions { margin-top: 10px; }
                .save-btn {
                    width: 100%; padding: 14px !important; border-radius: 12px !important;
                    font-weight: 700 !important; font-size: 1rem !important;
                    background: #2563eb !important; border: none !important;
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3) !important;
                    transition: transform 0.2s, box-shadow 0.2s !important;
                }
                .save-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.4) !important;
                }
                .save-btn:active { transform: translateY(0); }

                @media (max-width: 640px) {
                    .profile-inner { max-width: 100%; }
                    .profile-card-content { padding: 24px; }
                }
            `}</style>
        </div>
    );
};

export default AdminProfilePage;
