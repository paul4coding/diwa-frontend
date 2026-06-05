import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Twitter, MapPin, Phone, Mail, ChevronRight } from 'lucide-react';

import { useCMS } from '../../context/CMSContext';

const Footer = () => {
  const { cmsData } = useCMS();
  const brands = cmsData.brands || [
    { name: 'MG', logo: '/assets/brands/MG_Logo.png' },
    { name: 'BAIC', logo: '/assets/brands/BAIC_Logo.png' },
    { name: 'ISUZU', logo: '/assets/brands/ISUZU_Logo.png' },
    { name: 'CHEVROLET', logo: '/assets/brands/CHEVROLET_Logo.png' }
  ];

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return path; // Asset local
    return `${import.meta.env.VITE_API_URL ?? 'http://localhost:8181'}/uploads/${path}`;
  };

  return (
    <footer className="elite-footer">
      {/* 1. SECTION LOGOS MARQUES (TOP) */}
      <div className="footer-brands-bar">
        <div className="brands-container">
          {brands.map((brand: any, i: number) => (
            <Link key={i} to={`/vehicules?brand=${brand.name}`} className="brand-logo-item">
              <img src={getImageUrl(brand.logo)} alt={brand.name} />
            </Link>
          ))}
        </div>
      </div>

      {/* 2. SECTION INFOS PRINCIPALES */}
      <div className="footer-main-content">
        <div className="footer-grid">
          {/* Colonne 1: À Propos */}
          <div className="footer-col about-col">
            <img src="/logo-clean.png" alt="DIWA Internationale" className="footer-logo" />
            <p className="about-text">
              {cmsData.sections?.about?.text || "DIWA Internationale est le leader de la distribution automobile premium au Togo."}
            </p>
            <div className="social-links">
              {cmsData.footer?.socials?.facebook && <a href={cmsData.footer.socials.facebook} target="_blank" rel="noopener noreferrer"><Facebook size={18} /></a>}
              {cmsData.footer?.socials?.instagram && <a href={cmsData.footer.socials.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>}
              {cmsData.footer?.socials?.twitter && <a href={cmsData.footer.socials.twitter} target="_blank" rel="noopener noreferrer"><Twitter size={18} /></a>}
              {cmsData.footer?.socials?.linkedin && <a href={cmsData.footer.socials.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={18} /></a>}
            </div>
          </div>

          {/* Colonne 2: Catalogue */}
          <div className="footer-col">
            <h4>Catalogue Elite</h4>
            <ul>
              <li><Link to="/vehicules?brand=MG"><ChevronRight size={14} /> Modèles MG</Link></li>
              <li><Link to="/vehicules?brand=CHEVROLET"><ChevronRight size={14} /> SUV Chevrolet</Link></li>
              <li><Link to="/vehicules?brand=ISUZU"><ChevronRight size={14} /> Gamme ISUZU</Link></li>
              <li><Link to="/vehicules?brand=BAIC"><ChevronRight size={14} /> Innovation BAIC</Link></li>
            </ul>
          </div>

          {/* Colonne 3: Services */}
          <div className="footer-col">
            <h4>Services Privilégiés</h4>
            <ul>
              <li><Link to="/garage"><ChevronRight size={14} /> Maintenance Elite</Link></li>
              <li><Link to="/contact"><ChevronRight size={14} /> Financement</Link></li>
              <li><Link to="/vehicules"><ChevronRight size={14} /> Véhicules en Stock</Link></li>
              <li><a href="/#about-us"><ChevronRight size={14} /> Notre Histoire</a></li>
            </ul>
          </div>

          {/* Colonne 4: Contact */}
          <div className="footer-col contact-col">
            <h4>Contact</h4>
            <div className="contact-info">
              <p><MapPin size={16} /> <span>{cmsData.footer?.address || "2556, Boulevard de la paix, Tokoin Aéroport - 08 BP 8535, Lomé-Togo"}</span></p>
              <p><Phone size={16} /> <span>{cmsData.footer?.phone || "(+228) 22 61 27 76 / 77 / 78"} / Mob: (+228) 93 25 96 96</span></p>
              <p><Mail size={16} /> <span>{cmsData.footer?.email || "info@diwatg.com"}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION COPYRIGHT (BOTTOM) */}
      <div className="footer-bottom">
        <div className="bottom-content">
          <p>© 2026 DIWA Internationale. Tous droits réservés.</p>
          <div className="bottom-links">
            <a href="#">Mentions Légales</a>
            <a href="#">Politique de Confidentialité</a>
          </div>
        </div>
      </div>

      {/* STYLES INTERNES POUR LE FOOTER */}
      <style>{`
                .elite-footer {
                    background: rgb(31, 28, 28);
                    color: #fff;
                    font-family: 'Poppins', sans-serif;
                }

                /* Marques */
                .footer-brands-bar {
                    background: #0D6DAD;
                    padding: 40px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .brands-container { 
                    max-width: 1600px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: center;
                    gap: 60px;
                    flex-wrap: wrap;
                }
                .brand-logo-item img {
                    height: 70px;
                    filter: grayscale(1) brightness(1.5);
                    opacity: 0.7;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .brand-logo-item:hover img {
                    opacity: 1;
                    filter: grayscale(0) brightness(1);
                    transform: scale(1.1);
                }

                /* Main Content */
                .footer-main-content {
                    padding: 80px 8% 60px;
                }
                .footer-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
                    gap: 40px;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                .footer-logo {
                    height: 100px;
                    margin-bottom: 5px;
                }
                .about-text {
                    font-size: 0.85rem;
                    line-height: 1.8;
                    color: #999;
                    margin-bottom: 25px;
                }
                .social-links {
                    display: flex;
                    gap: 15px;
                }
                .social-links a {
                    width: 38px;
                    height: 38px;
                    background: #222;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    transition: 0.3s;
                }
                .social-links a:hover {
                    background: var(--diwa-blue, #0D6DAD);
                    transform: translateY(-3px);
                }

                /* Colonnes */
                .footer-col h4 {
                    font-size: 0.95rem;
                    font-weight: 700;
                    margin-bottom: 25px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #fff;
                }
                .footer-col ul {
                    list-style: none;
                    padding: 0;
                }
                .footer-col ul li {
                    margin-bottom: 12px;
                }
                .footer-col ul li a {
                    color: #999;
                    text-decoration: none;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: 0.3s;
                }
                .footer-col ul li a:hover {
                    color: #fff;
                    padding-left: 5px;
                }

                /* Contact */
                .contact-info p {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    color: #999;
                    font-size: 0.85rem;
                    margin-bottom: 15px;
                }
                .contact-info svg {
                    color: #71020C;
                    flex-shrink: 0;
                }
                .contact-info span { line-height: 1.4; }

                /* Bottom */
                .footer-bottom {
                    background: #0a0a0a;
                    padding: 25px 8%;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }
                .bottom-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.75rem;
                    color: #555;
                }
                .bottom-links {
                    display: flex;
                    gap: 25px;
                }
                .bottom-links a {
                    color: #555;
                    text-decoration: none;
                }
                .bottom-links a:hover { color: #999; }

                @media (max-width: 1024px) {
                    .footer-grid { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 600px) {
                    .footer-grid { grid-template-columns: 1fr; }
                    .footer-brands-bar { display: none; }
                }
            `}</style>
    </footer>
  );
};

export default Footer;
