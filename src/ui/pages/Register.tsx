import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n';

export const Register: React.FC = () => {
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { requestEmailOtp, verifyOtp } = useAuth();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsLoading(true);
    setError('');

    try {
      localStorage.setItem('boutika_pending_org_name', name);
      const success = await requestEmailOtp(email);
      if (success) {
        setStep('OTP');
      } else {
        setError(t('auth.registerError'));
      }
    } catch (err: any) {
      setError(err.message || t('auth.registerError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otpValues];
    newOtp[index] = value.replace(/[^0-9]/g, '');
    setOtpValues(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = [...otpValues];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtpValues(newOtp);
      otpRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fullOtp = otpValues.join('');
    if (fullOtp.length === 6) {
      const success = await verifyOtp(email, fullOtp);
      if (success) {
        navigate('/app');
      } else {
        setError(t('auth.loginError'));
      }
    }
  };

  useEffect(() => {
    if (step === 'OTP' && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [step]);

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
              <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'organisation
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                placeholder="Mon Organisation"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.emailLabel')}
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !name || !email}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <span className="material-symbols-rounded animate-spin">progress_activity</span>
              ) : (
                "Recevoir le code"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              {t('auth.backToLogin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // OTP Step
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-body-md">
      <main className="w-full max-w-md p-md md:p-lg">
        <div className="mb-xl text-center">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-sm">Boutika</h1>
          <p className="font-title-lg text-title-lg text-on-surface">{t('auth.verificationTitle')}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
            <span className="material-symbols-outlined" style={{fontSize: '32px'}}>lock_open</span>
          </div>
          <p className="text-gray-500 text-center mb-8">
            {t('auth.verificationSubtitle')} <br/>
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
          
          {error && <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm w-full text-center mb-4">{error}</div>}
          
          <form onSubmit={handleOtpSubmit} className="w-full flex flex-col items-center">
            <div className="flex gap-2 justify-center w-full mb-8" dir="ltr">
              {otpValues.map((val, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  value={val}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  data-testid={`otp-input-${index}`}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              ))}
            </div>
            
            <button type="submit" data-testid="otp-submit" className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors mb-6 flex items-center justify-center gap-2">
              {t('auth.validateCode')}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            
            <div className="text-center text-sm text-gray-500">
              <p className="mb-2">{t('auth.didNotReceive')}</p>
              <button type="button" className="text-blue-600 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer flex items-center justify-center gap-1 mx-auto">
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                {t('auth.resendCode')}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <button 
            type="button" 
            onClick={() => setStep('FORM')}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {t('auth.backToLogin')}
          </button>
        </div>
      </main>
    </div>
  );
};
