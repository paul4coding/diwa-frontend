import React, { useState } from 'react';
import '../components/sections/ContactSection.css';
import { Send, Phone, Mail, MapPin } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import PageHero from '../components/common/PageHero';

const ContactPage = () => {
    const [formData, setFormData] = useState({ nom: '', email: '', telephone: '', message: '' });
    const [status, setStatus] = useState({ loading: false, success: false, error: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, error: '' });
        
        try {
            await axiosInstance.post('/api/contact/send', formData);
            setStatus({ loading: false, success: true, error: '' });
            setFormData({ nom: '', email: '', telephone: '', message: '' });
            setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
        } catch (error: any) {
            console.error("Erreur d'envoi", error);
            setStatus({ 
                loading: false, 
                success: false, 
                error: error.response?.data?.message || error.response?.data || 'Erreur lors de l\'envoi du message. Veuillez réessayer.' 
            });
        }
    };

    return (
        <div className="contact-page-wrapper" style={{ paddingTop: '80px' }}>
            <PageHero
                tag="Contactez-nous"
                titleWords={['Parlons', 'de', 'votre', 'projet']}
                subtitle="Notre équipe DIWA est disponible pour répondre à toutes vos questions."
                bgImage="/paralax1.png"
                height="55vh"
            />

            <section className="contact-parallax-container">
                <div className="contact-main-section">
                    <div className="contact-grid">
                        
                        {/* LEFT PART: TEXT + PARALLAX BG (IMAGE 2) */}
                        <div className="contact-info-parallax" style={{ backgroundImage: 'url("/paralax2.png")' }}>
                            <div className="info-overlay">
                                <div className="info-content">
                                    <span className="small-tag">CONTACTEZ-NOUS</span>
                                    <h2 className="info-title">Nous sommes toujours à votre écoute</h2>
                                    <p className="info-text">
                                        Que vous ayez une question sur nos véhicules MG, Chevrolet ou Isuzu, une demande de maintenance SAV Elite, ou simplement besoin d'un conseil d'expert, notre équipe DIWA est là pour vous accompagner. Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                                    </p>
                                    
                                    <div className="contact-details-list">
                                        <div className="contact-detail-item">
                                            <div className="icon-box"><Phone size={18} /></div>
                                            <div>
                                                <h4>Téléphone</h4>
                                                <p>(+228) 22 61 27 76 / 77 / 78<br/>Mob: (+228) 93 25 96 96</p>
                                            </div>
                                        </div>
                                        <div className="contact-detail-item">
                                            <div className="icon-box"><Mail size={18} /></div>
                                            <div>
                                                <h4>Email</h4>
                                                <p>info@diwatg.com</p>
                                            </div>
                                        </div>
                                        <div className="contact-detail-item">
                                            <div className="icon-box"><MapPin size={18} /></div>
                                            <div>
                                                <h4>Adresse</h4>
                                                <p>2556, Boulevard de la paix, Tokoin Aéroport - 08 BP 8535, Lomé-Togo</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PART: FORM */}
                        <div className="contact-form-side">
                            <div className="form-card">
                                <h3 className="form-title">Envoyez-nous un message</h3>
                                <form className="elite-form" onSubmit={handleSubmit}>
                                    {status.success && (
                                        <div style={{ background: '#dcfce7', color: '#166534', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
                                            Votre message a été envoyé avec succès !
                                        </div>
                                    )}
                                    {status.error && (
                                        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                                            {typeof status.error === 'string' ? status.error : "Une erreur est survenue."}
                                        </div>
                                    )}
                                    
                                    <div className="form-group">
                                        <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Votre Nom" required />
                                    </div>
                                    <div className="form-group">
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Votre Email" required />
                                    </div>
                                    <div className="form-group">
                                        <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Votre Téléphone" />
                                    </div>
                                    <div className="form-group">
                                        <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Votre Message" rows={5} required></textarea>
                                    </div>
                                    <button type="submit" className="send-btn" disabled={status.loading} style={{ opacity: status.loading ? 0.7 : 1 }}>
                                        {status.loading ? 'Envoi en cours...' : 'Envoyer'} 
                                        {!status.loading && <Send size={18} style={{ marginLeft: '10px' }} />}
                                    </button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
