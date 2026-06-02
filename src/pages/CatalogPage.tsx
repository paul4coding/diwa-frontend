import React from 'react'
import ProductsSection from '../components/sections/ProductsSection'

const CatalogPage = () => {
  return (
    <div style={{ background: '#f8f8f8', minHeight: '100vh', paddingTop: '150px' }}>
      <div style={{ padding: '0 8%' }}>
        <h1 className="serif" style={{ fontSize: '4rem', color: '#000' }}>Catalogue Complet</h1>
        <p style={{ color: '#666', marginBottom: '80px' }}>Trouvez la pièce exacte pour votre modèle MG.</p>
        
        {/* On utilise le ProductsSection modulaire */}
        <ProductsSection />
        
        <div style={{ padding: '100px 0' }}>
          <h2 className="serif" style={{ fontSize: '2rem', color: '#000' }}>Accessoires MG</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '40px' }}>
            {/* Autres items du catalogue */}
            <div style={{ height: '200px', background: '#fff', borderRadius: '12px' }} />
            <div style={{ height: '200px', background: '#fff', borderRadius: '12px' }} />
            <div style={{ height: '200px', background: '#fff', borderRadius: '12px' }} />
            <div style={{ height: '200px', background: '#fff', borderRadius: '12px' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CatalogPage
