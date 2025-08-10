import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';

import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AddAnnonce from './components/AddAnnonce';
import Activate from './components/Activate';
import AnnonceDetail from './components/AnnonceDetail';
import EspaceClient from './pages/EspaceClient';
import ImmobilierModerne from './pages/ImmobilierModerne';
import DashboardAdmin from './pages/DashboardAdmin';

import './App.css';

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
            <Route path="/annonces/:id" element={<AnnonceDetail />} />
            <Route path="/immobilier-moderne" element={<ImmobilierModerne />} />
            <Route path="/annonces" element={<ImmobilierModerne />} />
            <Route path="/espace-client" element={<EspaceClient />} />
            <Route path="/admin-dashboard" element={<DashboardAdmin />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
