import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n';

export const Register: React.FC = () => {
  const [step, setStep] = useState<'FORM' | 'LINK_SENT'>('FORM');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { requestEmailOtp } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsLoading(true);
    setError('');

    try {
      localStorage.setItem('boutika_pending_org_name', name);
      const result = await requestEmailOtp(email);
      if (result.success) {
        setStep('LINK_SENT');
      } else {
        setError(result.error || t('auth.registerError'));
      }
    } catch (err: any) {
      setError(err.message || t('auth.registerError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'FORM') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
              <span className="material-symbols-rounded text-2xl">storefront</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t('auth.registerTitle')}</h2>
            <p className="text-gray-500 mt-2">{t('auth.registerSubtitle')}</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.organizationName')}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder={t('common.organizationName')}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="exemple@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !name || !email}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <span className="material-symbols-rounded animate-spin">progress_activity</span>
              ) : (
                t('auth.registerAction')
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {t('auth.alreadyHaveAccount')}{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:bg-blue-50 font-medium px-2 py-1 rounded"
            >
              {t('auth.loginTitle')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LINK_SENT Step
  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex items-center justify-center">
      <main className="w-full max-w-md p-md md:p-lg">
        <div className="mb-xl text-center">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-sm">Boutika</h1>
          <p className="font-title-lg text-title-lg text-on-surface">Vérifiez votre e-mail</p>
        </div>
        
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-md text-on-primary-container">
            <span className="material-symbols-outlined" style={{fontSize: '32px'}}>mark_email_read</span>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">
            Nous avons envoyé un lien magique pour finaliser l'inscription à <br/>
            <span className="font-semibold text-on-surface">{email}</span>
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant mb-md">
            Cliquez sur ce lien pour créer votre boutique et vous connecter automatiquement.
          </p>
          <div className="text-center font-body-md text-body-md text-on-surface-variant mt-sm">
            <p className="mb-xs">Vous n'avez rien reçu ?</p>
            <button 
              type="button" 
              onClick={() => handleRegister({ preventDefault: () => {} } as React.FormEvent)} 
              className="text-primary font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer mx-auto"
            >
              Renvoyer le lien
            </button>
          </div>
        </div>
        
        <div className="mt-lg text-center">
          <button 
            type="button" 
            onClick={() => setStep('FORM')}
            className="text-secondary font-label-md text-label-md hover:text-on-surface transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {t('auth.backToLogin')}
          </button>
        </div>
      </main>
    </div>
  );
};
