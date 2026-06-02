import React from 'react'
import { Link } from 'react-router-dom'

export const SAVSection = () => (
  <section id="sav" style={{ padding: '100px 8%', background: '#f8f8f8' }}>
    <div style={{ display: 'flex', gap: '50px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: '300px' }}>
        <h2 className="serif" style={{ fontSize: '3rem', color: '#000', marginBottom: '30px' }}>Service Après-Vente de Luxe</h2>
        <p style={{ fontSize: '1.2rem', opacity: 0.7, color: '#000', lineHeight: '1.8', marginBottom: '40px' }}>
          Nos techniciens certifiés traitent votre véhicule avec le plus haut niveau de soin et d'expertise, utilisant uniquement des pièces d'origine.
        </p>
        <Link to="/sav">
          <button className="btn-commencer">Prendre rendez-vous</button>
        </Link>
      </div>
      <div style={{ flex: 1, minWidth: '300px' }}>
        <img src="/sav-bg.jpg" alt="SAV" style={{ width: '100%', borderRadius: '15px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
      </div>
    </div>
  </section>
)

export default SAVSection
