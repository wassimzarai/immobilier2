import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';

import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import AddAnnonce from './components/AddAnnonce';

import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Activate from './components/Activate'; // <-- AJOUT ICI

// --- VÉRIFIER CET IMPORT ---
import AnnonceDetail from './components/AnnonceDetail'; // Assurez-vous que cette ligne est présente

import './App.css';
import EspaceClient from './pages/EspaceClient';

const PageLayoutWithNavbar = () => (
  <>
    <Navbar />
    <div style={{ paddingTop: '80px' }}><Outlet /></div>
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<PageLayoutWithNavbar />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/annonces/ajouter" element={<AddAnnonce />} />
<Route path="/annonces/ajouter/:id" element={<AddAnnonce />} />
            
            <Route path="/activate" element={<Activate />} />

            {/* --- VÉRIFIER CETTE LIGNE --- */}
            {/* C'est la ligne qui connecte l'URL au composant. Elle est essentielle. */}
            <Route path="/annonces/:id" element={<AnnonceDetail />} />
            <Route path="/espace-client" element={<EspaceClient />} />
          </Route>
                  </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
