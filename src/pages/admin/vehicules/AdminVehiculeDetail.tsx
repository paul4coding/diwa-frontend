import React, { useState, Suspense } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Box, 
  Image as ImageIcon, 
  Palette,
  Maximize2,
  Info
} from 'lucide-react';
import { Model } from '../../../Model';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera } from '@react-three/drei';

interface AdminVehiculeDetailProps {
  vehicule: any;
  onClose: () => void;
}

// Filet de sécurité pour capturer les erreurs de chargement 3D (ex: Erreur 500 sur le GLB)
class ThreeErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any) { console.error("Erreur 3D capturée:", error); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px', color: '#94a3b8' }}>
          <Box size={64} opacity={0.2} />
          <p style={{ textAlign: 'center' }}>Modèle 3D indisponible ou erreur serveur.<br/>Vous pouvez toujours consulter la galerie photos.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const BASE_URL = 'http://localhost:8181';

const getImageUrl = (path: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('blob:')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (!cleanPath.startsWith('uploads/')) {
    return `${BASE_URL}/uploads/${cleanPath}`;
  }
  return `${BASE_URL}/${cleanPath}`;
};

const AdminVehiculeDetail: React.FC<AdminVehiculeDetailProps> = ({ vehicule, onClose }) => {
  const [selectedColor, setSelectedColor] = useState(vehicule.couleursDispo?.[0] || '#ffffff');
  const [activeMedia, setActiveMedia] = useState<{ type: '3d' | 'image', url: string }>({ 
    type: '3d', 
    url: vehicule.fichierGlb 
  });

  const allImages = [
    { url: vehicule.imagePrincipale, vue: 'PRINCIPALE' },
    ...(vehicule.imagesGalerie || [])
  ].filter(img => img.url);

  return (
    <div className="premium-detail-overlay">
      <div className="premium-detail-container">
        {/* Header avec Close */}
        <div className="premium-header">
           <div className="header-info">
              <span className="brand-badge">{vehicule.marque}</span>
              <h2>{vehicule.modele}</h2>
              <span className="year-text">{vehicule.annee}</span>
           </div>
           <button className="premium-close" onClick={onClose}><X size={32} /></button>
        </div>

        <div className="main-stage">
          {/* Zone de Visualisation Principale */}
          <div className="viewer-area">
            {activeMedia.type === '3d' ? (
              <div className="canvas-wrapper">
                <ThreeErrorBoundary>
                  <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={35} />
                    <Suspense fallback={null}>
                      <Stage environment="city" intensity={0.6} contactShadow={{ opacity: 0.7, blur: 2 }}>
                         <Model url={getImageUrl(vehicule.fichierGlb)} color={selectedColor} />
                      </Stage>
                    </Suspense>
                    <OrbitControls 
                      enablePan={false} 
                      minDistance={3} 
                      maxDistance={8} 
                      autoRotate={true}
                      autoRotateSpeed={0.5}
                    />
                  </Canvas>
                </ThreeErrorBoundary>
                <div className="viewer-hint">
                   <Box size={16} /> Mode 3D Interactif (Rotation auto)
                </div>
              </div>
            ) : (
              <div className="image-viewer-full">
                 <img src={getImageUrl(activeMedia.url)} alt="Détail" />
                 <button className="back-to-3d" onClick={() => setActiveMedia({ type: '3d', url: vehicule.fichierGlb })}>
                    <Box size={18} /> Retour au Modèle 3D
                 </button>
              </div>
            )}
          </div>

          {/* Panneau Latéral d'infos */}
          <div className="side-panel">
             <div className="info-card">
                <div className="info-section">
                   <label><Palette size={16} /> Couleurs disponibles</label>
                   <div className="color-grid">
                      {vehicule.couleursDispo?.map((color: string, i: number) => (
                        <button 
                          key={i} 
                          className={`color-pill ${selectedColor === color ? 'active' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            setSelectedColor(color);
                            setActiveMedia({ type: '3d', url: vehicule.fichierGlb });
                          }}
                          title={color}
                        />
                      ))}
                   </div>
                </div>

                <div className="info-section price-section">
                   <label>Prix catalogue</label>
                   <div className="price-tag">{vehicule.prixBase?.toLocaleString()} FCFA</div>
                </div>

                <div className="info-section specs-section">
                   <div className="spec-item"><Info size={14} /> Stock : <span>{vehicule.stock}</span></div>
                   <div className="spec-item"><Info size={14} /> Statut : <span className={vehicule.actif ? 'text-green' : ''}>{vehicule.actif ? 'Disponible' : 'Indisponible'}</span></div>
                </div>
             </div>
          </div>
        </div>

        {/* Galerie Photos Horizontale (Scrollable) */}
        <div className="gallery-scroll-container">
           <div className="gallery-track">
              {/* Le premier slot est toujours le raccourci 3D */}
              <div 
                className={`gallery-card mode-3d ${activeMedia.type === '3d' ? 'active' : ''}`}
                onClick={() => setActiveMedia({ type: '3d', url: vehicule.fichierGlb })}
              >
                 <Box size={24} />
                 <span>Vue 3D</span>
              </div>

              {allImages.map((img, i) => (
                <div 
                  key={i} 
                  className={`gallery-card ${activeMedia.url === img.url ? 'active' : ''}`}
                  onClick={() => setActiveMedia({ type: 'image', url: img.url })}
                >
                   <img src={getImageUrl(img.url)} alt="" />
                   <div className="vue-label">{img.vue || 'Vue'}</div>
                </div>
              ))}
           </div>
        </div>

        <style>{`
          .premium-detail-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: #020617; z-index: 2000; display: flex; flex-direction: column;
            color: white; overflow: hidden; font-family: 'Inter', sans-serif;
          }
          .premium-detail-container { display: flex; flex-direction: column; height: 100vh; }
          
          .premium-header { 
            padding: 2.5rem 4rem; display: flex; justify-content: space-between; align-items: flex-start;
            background: linear-gradient(to bottom, rgba(2,6,23,1), rgba(2,6,23,0));
            z-index: 10;
          }
          .header-info h2 { font-size: 3.5rem; margin: 0; font-weight: 800; text-transform: uppercase; letter-spacing: -2px; }
          .brand-badge { background: var(--diwa-blue); color: white; padding: 4px 16px; border-radius: 100px; font-weight: 700; font-size: 0.9rem; margin-bottom: 8px; display: inline-block; }
          .year-text { font-size: 1.5rem; color: #64748b; font-weight: 500; }
          .premium-close { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: white; cursor: pointer; padding: 12px; border-radius: 50%; transition: all 0.3s; }
          .premium-close:hover { background: #ef4444; border-color: #ef4444; transform: rotate(90deg); }

          .main-stage { flex: 1; display: flex; overflow: hidden; padding: 0 4rem; gap: 4rem; }
          .viewer-area { flex: 3; position: relative; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, rgba(30,41,59,0.5) 0%, rgba(2,6,23,1) 70%); }
          .canvas-wrapper { width: 100%; height: 100%; cursor: grab; }
          .canvas-wrapper:active { cursor: grabbing; }
          .viewer-hint { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.6); padding: 8px 16px; border-radius: 100px; font-size: 0.8rem; display: flex; align-items: center; gap: 8px; color: #94a3b8; }
          
          .image-viewer-full { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
          .image-viewer-full img { max-width: 100%; max-height: 80%; object-fit: contain; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
          .back-to-3d { margin-top: 24px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 12px 24px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
          .back-to-3d:hover { background: var(--diwa-blue); border-color: var(--diwa-blue); }

          .side-panel { flex: 1; display: flex; align-items: center; }
          .info-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 32px; width: 100%; backdrop-filter: blur(10px); }
          .info-section { margin-bottom: 32px; }
          .info-section label { display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
          .color-grid { display: flex; flex-wrap: wrap; gap: 12px; }
          .color-pill { width: 44px; height: 44px; border-radius: 50%; border: 3px solid transparent; cursor: pointer; transition: all 0.2s; }
          .color-pill:hover { transform: scale(1.1); }
          .color-pill.active { border-color: var(--diwa-blue); box-shadow: 0 0 20px var(--diwa-blue); }
          
          .price-tag { font-size: 2.5rem; font-weight: 800; color: #ffffff; }
          .spec-item { display: flex; align-items: center; gap: 8px; color: #94a3b8; margin-bottom: 12px; font-size: 1rem; }
          .spec-item span { color: white; font-weight: 600; }
          .text-green { color: #10b981 !important; }

          .gallery-scroll-container { 
            padding: 2rem 4rem 4rem; 
            background: linear-gradient(to top, rgba(2,6,23,1), rgba(2,6,23,0));
          }
          .gallery-track { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 20px; scrollbar-width: none; }
          .gallery-track::-webkit-scrollbar { display: none; }
          
          .gallery-card { 
            min-width: 140px; height: 100px; border-radius: 16px; background: rgba(255,255,255,0.03); 
            border: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: all 0.3s;
            position: relative; overflow: hidden; flex-shrink: 0;
          }
          .gallery-card img { width: 100%; height: 100%; object-fit: cover; opacity: 0.5; transition: all 0.3s; }
          .gallery-card.mode-3d { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: #94a3b8; }
          .gallery-card:hover, .gallery-card.active { border-color: var(--diwa-blue); transform: translateY(-5px); }
          .gallery-card.active img { opacity: 1; }
          .gallery-card.active { background: rgba(var(--diwa-blue-rgb), 0.1); color: var(--diwa-blue); }
          .vue-label { position: absolute; bottom: 8px; left: 8px; font-size: 0.6rem; background: rgba(0,0,0,0.6); padding: 2px 8px; border-radius: 4px; color: #cbd5e1; }
        `}</style>
      </div>
    </div>
  );
};

export default AdminVehiculeDetail;
