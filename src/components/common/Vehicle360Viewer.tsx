import React, { useState, useEffect, useRef } from 'react';

interface Props {
  imagePath: string; // Exemple: "/assets/cars/bj80/bj80_"
  totalFrames?: number; // 24 par défaut
  extension?: string; // "webp" ou "jpg"
}

const Vehicle360Viewer: React.FC<Props> = ({ imagePath, totalFrames = 24, extension = "webp" }) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Préchargement des images pour éviter les blancs lors de la rotation
  useEffect(() => {
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = `${imagePath}${i}.${extension}`;
    }
  }, [imagePath, totalFrames, extension]);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;

    const deltaX = startX - clientX;
    const sensitivity = 15; // Ajuste la vitesse de rotation ici

    if (Math.abs(deltaX) > sensitivity) {
      if (deltaX > 0) {
        // Rotation vers la droite
        setCurrentFrame((prev) => (prev >= totalFrames ? 1 : prev + 1));
      } else {
        // Rotation vers la gauche
        setCurrentFrame((prev) => (prev <= 1 ? totalFrames : prev - 1));
      }
      setStartX(clientX);
    }
  };

  const handleEnd = () => setIsDragging(false);

  return (
    <div 
      ref={containerRef}
      className="vehicle-360-container"
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      <img
        src={`${imagePath}${currentFrame}.${extension}`}
        alt="Vehicle 360 view"
        className="vehicle-360-image"
      />
      
      {/* Indicateur visuel discret */}
      <div className="viewer-hint">
        Faites glisser pour faire pivoter à 360°
      </div>

      <style>{`
        .vehicle-360-container {
            position: relative;
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
            cursor: grab;
            user-select: none;
            overflow: hidden;
            background: transparent;
        }
        .vehicle-360-container:active {
            cursor: grabbing;
        }
        .vehicle-360-image {
            width: 100%;
            height: auto;
            pointer-events: none;
            display: block;
        }
        .viewer-hint {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            padding: 8px 24px;
            border-radius: 100px;
            color: #000;
            font-size: 0.75rem;
            font-weight: 500;
            border: 1px solid rgba(0,0,0,0.05);
            pointer-events: none;
            opacity: 0.6;
        }
      `}</style>
    </div>
  );
};

export default Vehicle360Viewer;
