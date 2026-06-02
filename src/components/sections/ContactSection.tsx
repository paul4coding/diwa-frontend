import React from 'react';
import './ContactSection.css';
import { Send, Phone, Mail, MapPin } from 'lucide-react';

const ContactSection = () => {
    return (
        <section id="contact-section" className="contact-parallax-container">
            {/* TOP PARALLAX HERO (IMAGE 1) */}
            <div className="parallax-hero" style={{ backgroundImage: 'url("/paralax1.png")' }}>
                <div className="parallax-overlay">
                    <h1 className="parallax-title">Contact</h1>
                    <div className="parallax-breadcrumbs">Home &gt; Contact</div>
                </div>
            </div>

            {/* MAIN CONTACT CONTENT WITH DOUBLE PARALLAX EFFECT */}
            <div className="contact-main-section">
                <div className="contact-grid">
                    
                    {/* LEFT PART: TEXT + PARALLAX BG (IMAGE 2) */}
                    <div className="contact-info-parallax" style={{ backgroundImage: 'url("/paralax2.png")' }}>
                        <div className="info-overlay">
                            <div className="info-content">
                                <span className="small-tag">GET IN TOUCH</span>
                                <h2 className="info-title">We are always ready to help you</h2>
                                <p className="info-text">
                                    Whether you have a question, a suggestion, or just want to say hello, this is 
                                    the place to do it. Please fill out the form below with your details and 
                                    message, and we'll get back to you as soon as possible.
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
                            <form className="elite-form">
                                <div className="form-group">
                                    <input type="text" placeholder="Votre Nom" required />
                                </div>
                                <div className="form-group">
                                    <input type="email" placeholder="Votre Email" required />
                                </div>
                                <div className="form-group">
                                    <input type="tel" placeholder="Votre Téléphone" />
                                </div>
                                <div className="form-group">
                                    <textarea placeholder="Votre Message" rows={5} required></textarea>
                                </div>
                                <button type="submit" className="send-btn">
                                    Envoyer <Send size={18} style={{ marginLeft: '10px' }} />
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ContactSection;
