import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ThumbsUp, Users, Award } from 'lucide-react';
import './AboutUsSection.css';
import { Link } from 'react-router-dom';

import { useCMS } from '../../context/CMSContext';

const AboutUsSection = () => {
    const { cmsData } = useCMS();
    const aboutData = cmsData.about || {};

    const getImageUrl = (path: string) => {
        if (!path) return "/paralaxForAboutUs.webp";
        if (path.startsWith('http')) return path;
        if (path.startsWith('/')) return path; // Asset local
        return `${import.meta.env.VITE_API_URL ?? 'http://localhost:8181'}/uploads/${path}`;
    };

    return (
        <section id="about-us" className="about-us-parallax-wrapper" style={{ backgroundImage: `url(${getImageUrl(aboutData.parallaxImage)})` }}>
            <div className="about-us-overlay">
                <div className="about-us-container">

                    {/* TOP PART: IMAGES AND TEXT */}
                    <div className="about-us-grid">
                        {/* LEFT: IMAGES */}
                        <div className="about-images-side">
                            <motion.div
                                className="about-img-box img-1"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                viewport={{ once: true, margin: "-50px" }}
                            >
                                <img src={getImageUrl(aboutData.image1 || "/p1.webp")} alt="Atelier mécanique DIWA 1" />
                            </motion.div>
                            <motion.div
                                className="about-img-box img-2"
                                initial={{ opacity: 0, y: 100 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                viewport={{ once: true, margin: "-50px" }}
                            >
                                <img src={getImageUrl(aboutData.image2 || "/p2.webp")} alt="Atelier mécanique DIWA 2" />
                            </motion.div>
                        </div>

                        {/* RIGHT: TEXT */}
                        <motion.div
                            className="about-text-side"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            viewport={{ once: true, margin: "-50px" }}
                        >
                            <div style={{ marginBottom: '20px' }}>
                                <span className="staggered-title" style={{ fontSize: '1rem', color: '#fff' }}>A B O U T &nbsp; U S</span>
                            </div>

                            <h2 className="about-title">{aboutData.title || "L'Excellence Automobile, de l'Intérieur à l'Extérieur"}</h2>

                            <p className="about-description">
                                {aboutData.text || "Chez DIWA Internationale, nous sommes passionnés par l'idée de sublimer chaque véhicule..."}
                            </p>

                            <Link to="/contact">
                                <button className="about-btn">En Savoir Plus</button>
                            </Link>
                        </motion.div>
                    </div>

                    {/* BOTTOM PART: STATS */}
                    <div className="about-stats-grid">
                        {(aboutData.stats || [
                            { label: 'Heures de Travail', value: '1850+' },
                            { label: 'Clients Satisfaits', value: '2138+' },
                            { label: 'Experts Qualifiés', value: '150+' },
                            { label: 'Années d\'Expérience', value: '20+' }
                        ]).map((stat: any, idx: number) => (
                            <motion.div 
                                key={idx}
                                className="stat-item" 
                                initial={{ opacity: 0, y: 30 }} 
                                whileInView={{ opacity: 1, y: 0 }} 
                                transition={{ duration: 0.5, delay: 0.1 * idx }} 
                                viewport={{ once: true }}
                            >
                                {idx === 0 && <Briefcase size={36} color="#e31e24" />}
                                {idx === 1 && <ThumbsUp size={36} color="#e31e24" />}
                                {idx === 2 && <Users size={36} color="#e31e24" />}
                                {idx === 3 && <Award size={36} color="#e31e24" />}
                                <h3>{stat.value}</h3>
                                <p>{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default AboutUsSection;
