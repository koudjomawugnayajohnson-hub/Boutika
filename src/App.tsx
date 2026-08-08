import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { AuthProvider } from './ui/contexts/AuthContext';
import { Layout } from './ui/components/Layout';
import { Home } from './ui/pages/Home';
import { Features } from './ui/pages/Features';
import { Login } from './ui/pages/Login';
import { Register } from './ui/pages/Register';
import { Dashboard } from './ui/pages/Dashboard';
import { Catalog } from './ui/pages/Catalog';
import { Inventory } from './ui/pages/Inventory';
import { POS } from './ui/pages/POS';
import { SaleDetail } from './ui/pages/SaleDetail';
import { Subscription } from './ui/pages/Subscription';
import { PlatformAdmin } from './ui/pages/PlatformAdmin';
import { PlatformAdminLogin } from './ui/pages/PlatformAdminLogin';
import { PlatformAdminGuard } from './ui/components/PlatformAdminGuard';
import { Team } from './ui/pages/Team';
import { Compliance } from './ui/pages/Compliance';
import { Shops } from './ui/pages/Shops';
import { ShopDashboard } from './ui/pages/ShopDashboard';

const SaleDetailRoute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  if (!id) return null;
  return <SaleDetail saleId={id} onBack={() => navigate(-1)} />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fonctionnalites" element={<Features />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="pos" element={<POS />} />
            <Route path="sale/:id" element={<SaleDetailRoute />} />
            <Route path="shops" element={<Shops />} />
            <Route path="shops/:shopId" element={<ShopDashboard />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="team" element={<Team />} />
            <Route path="compliance" element={<Compliance />} />
          </Route>
          <Route path="/platform-admin/login" element={<PlatformAdminLogin />} />
          <Route path="/platform-admin" element={<PlatformAdminGuard />}>
            <Route index element={<PlatformAdmin />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
