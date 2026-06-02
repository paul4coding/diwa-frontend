import React from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import './PiecesPage.css';

const PiecesPage = () => {
  return (
    <div className="pieces-container">
      <div className="section-header">
        <h1>Pièces Détachées & Accessoires</h1>
        <p>Commandez vos pièces d'origine certifiées pour MG, ISUZU, Chevrolet et BAIC.</p>
      </div>

      <div className="filters-bar">
        <Badge label="Toutes" variant="info" />
        <Badge label="Moteur" variant="brand" />
        <Badge label="Freinage" variant="brand" />
        <Badge label="Liaison au sol" variant="brand" />
        <Badge label="Accessoires" variant="brand" />
      </div>

      <div className="pieces-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} hoverable padding="md" className="piece-card">
            <div className="piece-image-placeholder">Image Pièce #{i}</div>
            <div className="piece-info">
              <h4>Filtre à Huile Haute Performance</h4>
              <p className="piece-ref">REF: DIWA-O-00{i}</p>
              <div className="piece-footer">
                <span className="piece-price">45.00 €</span>
                <Badge label="En stock" variant="success" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PiecesPage;
