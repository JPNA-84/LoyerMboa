import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import Navbar from './components/layout/Navbar';
import AuthModal from './components/auth/AuthModal';
import PropertyModal from './components/property/PropertyModal';

import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import MapPage from './pages/MapPage';
import FavoritesPage from './pages/FavoritesPage';
import DashboardPage from './pages/DashboardPage';

import './index.css';

function AppShell() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"          element={<HomePage />} />
        <Route path="/listings"  element={<ListingsPage />} />
        <Route path="/map"       element={<MapPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*"          element={<HomePage />} />
      </Routes>
      {/* Global modals */}
      <AuthModal />
      <PropertyModal />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
