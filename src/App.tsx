import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Lenis from '@studio-freight/lenis'
import MainLayout from './MainLayout'
import Home from './pages/Home'
import VehiclePage from './pages/VehiclePage'
import CatalogPage from './pages/CatalogPage'
import GaragePage from './pages/GaragePage'
import ProductsListPage from './pages/ProductsListPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MonEspacePage from './pages/MonEspacePage'
import FavoritesPage from './pages/FavoritesPage'
import ContactPage from './pages/ContactPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStatsPage from './pages/admin/AdminStatsPage'
import AdminVehiculesPage from './pages/admin/vehicules/AdminVehiculesPage'
import AdminPiecesPage from './pages/admin/pieces/AdminPiecesPage'
import AdminCategoriesPage from './pages/admin/pieces/AdminCategoriesPage'
import AdminStockAlertePage from './pages/admin/pieces/AdminStockAlertePage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminTechniciensPage from './pages/admin/garage/AdminTechniciensPage'
import AdminGaragePage from './pages/admin/garage/AdminGaragePage'
import AdminCommandesPage from './pages/admin/commandes/AdminCommandesPage'
import AdminSavPage from './pages/admin/sav/AdminSavPage'
import DemandeDetailsAdmin from './pages/admin/sav/DemandeDetailsAdmin'
import AdminLogistiquePage from './pages/admin/logistique/AdminLogistiquePage'
import AdminChauffeursPage from './pages/admin/chauffeurs/AdminChauffeursPage'
import AdminProfilePage from './pages/admin/AdminProfilePage'
import AdminCMSPage from './pages/admin/AdminCMSPage'
import AdminMessagesPage from './pages/admin/AdminMessagesPage'
import AdminCouponsPage from './pages/admin/AdminCouponsPage'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

// Design System global styles
import './design-system/tokens.css'

import VehiclesListPage from './pages/VehiclesListPage'

import SmoothScrollProvider from './components/common/SmoothScrollProvider'
import CustomCursor from './components/common/CustomCursor'


import ProFormaClientPage from './pages/client/ProFormaClientPage'
import ReceptionDashboard from './pages/receptionniste/ReceptionDashboard'
import AjoutPrixProForma from './pages/receptionniste/AjoutPrixProForma'
import TechnicienDashboard from './pages/technicien/TechnicienDashboard'
import AffectationTravailPage from './pages/technicien/AffectationTravailPage'
import CreationProFormaV1 from './pages/technicien/CreationProFormaV1'
import EnregistrementTechnique from './pages/technicien/EnregistrementTechnique'
import DemandeSuiviPage from './pages/client/DemandeSuiviPage'

import { CMSProvider } from './context/CMSContext'
import SplashScreen from './components/SplashScreen'
import NotAuthorizedPage from './pages/errors/NotAuthorizedPage'
import NotFoundPage from './pages/errors/NotFoundPage'
import ForbiddenPage from './pages/errors/ForbiddenPage'
import ServerErrorPage from './pages/errors/ServerErrorPage'
import ServiceUnavailablePage from './pages/errors/ServiceUnavailablePage'

function App() {
  const [showSplash, setShowSplash] = React.useState(() => {
    // Show only once per browser session
    if (sessionStorage.getItem('diwa_splash_shown')) return false;
    sessionStorage.setItem('diwa_splash_shown', '1');
    return true;
  });

  return (
    <AuthProvider>
      <CMSProvider>
        <CartProvider>
          {showSplash && (
            <SplashScreen onComplete={() => setShowSplash(false)} />
          )}
          <Router>
            <SmoothScrollProvider>
              <CustomCursor />
              <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/vehicules" element={<VehiclesListPage />} />
            <Route path="/vehicules/:uuid" element={<VehiclePage />} />
            <Route path="/vehicules/:uuid/configuration" element={<VehiclePage />} />
            <Route path="/garage" element={<GaragePage />} />
            <Route path="/produits" element={<ProductsListPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/401" element={<NotAuthorizedPage />} />
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="/500" element={<ServerErrorPage />} />
            <Route path="/503" element={<ServiceUnavailablePage />} />
            {/* Catch-all → 404 */}
            <Route path="*"    element={<NotFoundPage />} />
            
            {/* Routes protégées */}
            <Route element={<PrivateRoute />}>
              <Route path="/mon-espace" element={<MonEspacePage />} />
              <Route path="/sav" element={<MonEspacePage />} />
              <Route path="/favoris" element={<FavoritesPage />} />
              
              {/* SAV CLIENT */}

              <Route path="/mes-demandes/:uuid" element={<DemandeSuiviPage />} />
              <Route path="/mes-demandes/:uuid/proforma/:id" element={<ProFormaClientPage />} />


            </Route>
  
          </Route>
  
          {/* Routes Admin isolées du MainLayout */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="stats" element={<AdminStatsPage />} />
              <Route path="vehicules" element={<AdminVehiculesPage />} />
              <Route path="pieces" element={<AdminPiecesPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="stock-alertes" element={<AdminStockAlertePage />} />
              <Route path="garage" element={<AdminGaragePage />} />
              <Route path="techniciens" element={<AdminTechniciensPage />} />
              <Route path="commandes" element={<AdminCommandesPage />} />
              <Route path="sav" element={<AdminSavPage />} />
              <Route path="sav/:id" element={<DemandeDetailsAdmin />} />
              <Route path="logistique" element={<AdminLogistiquePage />} />
              <Route path="chauffeurs" element={<AdminChauffeursPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
              <Route path="cms" element={<AdminCMSPage />} />
              <Route path="messages" element={<AdminMessagesPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />

              {/* RECEPTIONNISTE & TECHNICIEN (Harmonisés dans AdminLayout) */}
              <Route path="reception/dashboard" element={<ReceptionDashboard />} />
              <Route path="reception/proforma/:id/prix" element={<AjoutPrixProForma />} />
              
              <Route path="atelier/dashboard" element={<TechnicienDashboard />} />
              <Route path="atelier/affectation" element={<AffectationTravailPage />} />
              <Route path="atelier/enregistrement/:id" element={<EnregistrementTechnique />} />
              <Route path="atelier/proforma/nouvelle/:demandeId" element={<CreationProFormaV1 />} />
            </Route>
          </Route>
          </Routes>
        </SmoothScrollProvider>
      </Router>
    </CartProvider>
      </CMSProvider>
    </AuthProvider>
  )
}

export default App
