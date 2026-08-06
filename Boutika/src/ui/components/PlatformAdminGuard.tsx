import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n';

export const PlatformAdminGuard: React.FC = () => {
  const { isAdminAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-body-md text-primary">{t('common.loading')}</div>;
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/platform-admin/login" replace />;
  }

  return <Outlet />;
};

