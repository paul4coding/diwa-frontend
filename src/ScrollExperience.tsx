import React, { useLayoutEffect, useRef, Suspense, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Stage, PerspectiveCamera, Environment, ContactShadows, OrbitControls } from '@react-three/drei'
import { Model } from './Model'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollExperienceProps {
  carColor: string
  modelUrl?: string
}

const CameraRig = ({ setSection }: { setSection: (s: number) => void }) => {
  const { camera } = useThree()
  const groupRef = useRef<any>()

  useLayoutEffect(() => {
    // Timeline de reconstruction DIWA ELITE
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".scroll-wrapper",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        onUpdate: (self) => {
          // Détection de la section pour l'UI
          const progress = self.progress
          if (progress < 0.33) setSection(1)
          else if (progress < 0.66) setSection(2)
          else setSection(3)
        }
      }
    })

    // -- PHASE 1 : Profil vers Face (Section 1 -> 2) --
    // Caméra de départ : [0, 0.5, 6.5]
    tl.to(camera.position, { x: 0, y: 0.8, z: 6.5 }, 0)
    
    // -- PHASE 2 : Pivot 90° et Face (Section 2) --
    tl.to(camera.position, { x: 5, y: 1.2, z: 2.5 }, 1) // On tourne vers la face
    
    // -- PHASE 3 : Zoom Configurateur (Section 3) --
    tl.to(camera.position, { x: 0, y: 1.5, z: 5.5 }, 2)

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [camera, setSection])

  return null
}

// Filet de sécurité pour capturer les erreurs de chargement 3D (ex: Erreur 500 sur le GLB)
class ThreeErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', color: '#94a3b8' }}>
          <p style={{ textAlign: 'center' }}>Expérience 3D momentanément indisponible.<br/>Continuez à faire défiler pour voir le catalogue.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ScrollExperience({ carColor, modelUrl }: ScrollExperienceProps) {
  const [currentSection, setCurrentSection] = useState(1)

  return (
    <div className="scroll-wrapper" style={{ height: '150vh', position: 'relative' }}>
      
      <ThreeErrorBoundary>
        {/* CANVAS 3D COLLÉ À SA SECTION (STICKY) */}
        <div style={{ position: 'sticky', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 1, overflow: 'hidden' }}>
          <Canvas shadows camera={{ fov: 35 }}>
            <Suspense fallback={null}>
              <Environment preset="city" blur={0.8} />
              <PerspectiveCamera makeDefault position={[0, 0.5, 6.5]} />
              
              <Stage intensity={0.8} environment="city" adjustCamera={false}>
                 <Model url={modelUrl} color={carColor} scale={1} />
              </Stage>

              <spotLight position={[5, 10, 5]} angle={0.15} penumbra={1} intensity={2} castShadow />
              <pointLight position={[-10, -10, -10]} intensity={1} color="#var(--diwa-blue)" />

              <ContactShadows 
                position={[0, -0.01, 0]} 
                opacity={0.6} 
                scale={15} 
                blur={2} 
                far={4} 
              />

              <CameraRig setSection={setCurrentSection} />
              
              {/* Activation 360° uniquement en section finale */}
              {currentSection === 3 && <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />}
            </Suspense>
          </Canvas>
        </div>
      </ThreeErrorBoundary>

      {/* OVERLAY TEXTE (Stické dans la section) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
        
        {/* SECTION 1 : ACCUEIL (Stickée en haut de son wrapper) */}
        <div style={{ 
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%', 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          opacity: currentSection === 1 ? 1 : 0,
          transition: 'opacity 0.8s ease',
          paddingBottom: '100px'
        }}>
          <h1 style={{ fontSize: '10rem', margin: 0, letterSpacing: '10px' }}>DIWA</h1>
          <p className="serif" style={{ fontSize: '1.2rem', letterSpacing: '4px', opacity: 0.6 }}>ELITE EXPERIENCE</p>
        </div>

        {/* SECTION 2 : DETAILS (Stickée) */}
        <div style={{ 
          position: 'sticky', 
          top: 0,
          left: 0,
          width: '100%', 
          height: '100vh',
          padding: '0 8%', 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          opacity: currentSection === 2 ? 1 : 0,
          pointerEvents: currentSection === 2 ? 'auto' : 'none',
          transition: 'opacity 0.8s ease'
        }}>
          <h1 style={{ fontSize: '4rem', margin: '0 0 10px 0' }}>DYNAMIC FLOW</h1>
          <div style={{ width: '50px', height: '2px', background: 'black', marginBottom: '30px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '400px' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#666', margin: 0 }}>MOTEUR</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 900 }}>TURBO 1.5L</p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#666', margin: 0 }}>PUISSANCE</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 900 }}>180 HP</p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#666', margin: 0 }}>0-100 KM/H</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 900 }}>7.2 SEC</p>
            </div>
          </div>
        </div>

        {/* SECTION 3 : CONFIGURATEUR (Stickée) */}
        <div style={{ 
          position: 'sticky', 
          top: 0,
          left: 0,
          width: '100%', 
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: currentSection === 3 ? 1 : 0,
          transition: 'all 0.8s ease',
          transform: currentSection === 3 ? 'translateY(0)' : 'translateY(50px)'
        }}>
          <h2 className="serif" style={{ fontSize: '2rem', marginBottom: '10px' }}>PERSONNALISEZ VOTRE MG RX-8</h2>
          <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Utilisez la souris pour explorer le véhicule à 360°</p>
        </div>
      </div>
    </div>
  )
}
