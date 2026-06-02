import React, { useLayoutEffect } from 'react'
import { useGLTF } from '@react-three/drei'

interface ModelProps {
  url?: string
  color?: string
  [key: string]: any
}

export function Model({ url = '/models/mg_rx8.glb', color = "#ffffff", ...props }: ModelProps) {
  const { scene } = useGLTF(url) as any
  
  // Appliquer les modifications de matériaux de manière ciblée
  useLayoutEffect(() => {
    if (!scene) return;
    
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        const name = obj.name.toLowerCase();
        
        // Cibler uniquement les parties de la carrosserie (paint, body, etc.)
        if (name.includes('body') || name.includes('paint') || name.includes('car')) {
          obj.material.color.set(color);
          
          // Paramètres pour un look automobile Premium/Métallisé
          obj.material.metalness = 1.0;
          obj.material.roughness = 0.15; 
          obj.material.envMapIntensity = 2.5; 
        } else if (name.includes('glass') || name.includes('window')) {
          obj.material.transparent = true;
          obj.material.opacity = 0.4;
          obj.material.metalness = 1.0;
          obj.material.roughness = 0.0;
        }
        
        obj.material.needsUpdate = true;
      }
    });
  }, [scene, color]);

  return <primitive object={scene} {...props} />
}

// Note: Le préchargement dynamique est plus complexe, on laisse le composant charger au besoin
