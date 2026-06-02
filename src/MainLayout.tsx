import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import Footer from './components/sections/Footer'

const MainLayout = () => {
  return (
    <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar fixe en haut */}
      <Navbar />

      {/* Contenu principal de la page. Outlet injecte le composant de la route actuelle. */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer globale (importé depuis son nouveau fichier modulaire) */}
      <Footer />
    </div>
  )
}

export default MainLayout
