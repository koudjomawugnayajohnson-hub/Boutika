import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n';

export const Login: React.FC = () => {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [countryCode, setCountryCode] = useState('+228');
  const [phone, setPhone] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const { login, requestPhoneOtp } = useAuth();
  const navigate = useNavigate();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length > 5) {
      const fullPhone = countryCode + phone;
      const success = await requestPhoneOtp(fullPhone);
      if (success) {
        setStep('OTP');
        setError('');
      } else {
        setError(t('auth.loginError'));
      }
    } else {
      setError(t('auth.loginError'));
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
      const fullPhone = countryCode + phone;
      const success = await login(fullPhone, fullOtp);
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

  if (step === 'PHONE') {
    return (
      <div className="bg-surface text-on-surface h-screen flex flex-col items-center justify-center font-body-md">
        <div className="w-full max-w-[400px] px-sm md:px-0">
          <div className="flex items-center justify-center mb-xl">
            <span className="text-headline-md font-headline-md font-bold text-primary tracking-tight">Boutika</span>
          </div>
          
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg flex flex-col gap-lg shadow-sm">
            <div className="flex flex-col gap-xs text-center">
              <h1 className="text-headline-md font-headline-md md:text-headline-lg md:font-headline-lg text-on-surface">{t('auth.phoneTitle')}</h1>
              <p className="text-body-md font-body-md text-on-surface-variant max-w-[280px] mx-auto">
                {t('auth.phoneSubtitle')}
              </p>
            </div>
            
            {error && <div className="text-error text-center text-label-md font-label-md">{error}</div>}
            
            <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-sm">
              <div className="flex flex-col gap-base">
                <label className="text-label-md font-label-md text-on-surface-variant uppercase" htmlFor="phone">{t('auth.phoneLabel')}</label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 flex items-center border-r border-outline-variant">
                    <select 
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-full bg-transparent border-0 text-body-md font-body-md text-on-surface pl-sm pr-xs py-0 focus:ring-0 cursor-pointer appearance-none outline-none"
                    >
                      <option value="+228">🇹🇬 +228</option>
                      <option value="+226">🇧🇫 +226</option>
                      <option value="+223">🇲🇱 +223</option>
                    </select>
                    <span className="material-symbols-outlined text-on-surface-variant mr-xs pointer-events-none" style={{fontSize: '16px'}}>arrow_drop_down</span>
                  </div>
                  <input 
                    className="w-full h-12 pl-[100px] pr-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-body-lg font-body-lg text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                    id="phone" 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('auth.phonePlaceholder')}
                    data-testid="login-phone"
                    required 
                  />
                </div>
              </div>
              
              <p className="text-label-md font-label-md text-outline text-center mt-xs">
                {t('auth.termsText')} <a className="text-primary hover:underline" href="#">{t('auth.termsLink')}</a>.
              </p>
              
              <button type="submit" data-testid="login-submit" className="w-full h-12 bg-primary text-on-primary text-title-lg font-title-lg rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-xs mt-sm">
                {t('common.continue')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // OTP Step
  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex items-center justify-center">
      <main className="w-full max-w-md p-md md:p-lg">
        <div className="mb-xl text-center">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-sm">Boutika</h1>
          <p className="font-title-lg text-title-lg text-on-surface">{t('auth.verificationTitle')}</p>
        </div>
        
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg flex flex-col items-center">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-md text-on-primary-container">
            <span className="material-symbols-outlined" style={{fontSize: '32px'}}>lock_open</span>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant text-center mb-lg">
            {t('auth.verificationSubtitle')} <br/>
            <span className="font-semibold text-on-surface">{countryCode} {phone}</span>
          </p>
          
          {error && <div className="text-error text-center text-label-md font-label-md mb-md">{error}</div>}
          
          <form onSubmit={handleOtpSubmit} className="w-full flex flex-col items-center">
            <div className="flex gap-2 justify-center w-full mb-lg" dir="ltr">
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
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-headline-md font-headline-md border border-outline-variant rounded bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              ))}
            </div>
            
            <button type="submit" data-testid="otp-submit" className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:bg-surface-tint transition-colors mb-md flex items-center justify-center gap-2">
              {t('auth.validateCode')}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            
            <div className="text-center font-body-md text-body-md text-on-surface-variant">
              <p className="mb-xs">{t('auth.didNotReceive')}</p>
              <button type="button" className="text-primary font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer flex items-center justify-center gap-1 mx-auto">
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                {t('auth.resendCode')}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-lg text-center">
          <button 
            type="button" 
            onClick={() => setStep('PHONE')}
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
