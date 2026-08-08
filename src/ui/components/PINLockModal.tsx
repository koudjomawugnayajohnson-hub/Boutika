import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n';
import { Lock, Delete, LogOut } from 'lucide-react';

export const PINLockModal: React.FC = () => {
  const { user, unlockTerminal, lockoutUntil, failedAttempts, logout } = useAuth();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    let interval: number;
    if (lockoutUntil) {
      const updateTimer = () => {
        const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
        setTimeRemaining(remaining);
      };
      updateTimer();
      interval = window.setInterval(updateTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  useEffect(() => {
    if (pin.length === 6) {
      handleVerify(pin);
    }
  }, [pin]);

  const handleVerify = async (fullPin: string) => {
    if (isVerifying || timeRemaining > 0) return;
    
    setIsVerifying(true);
    setError(null);
    try {
      await unlockTerminal(fullPin);
    } catch (err: any) {
      setError(err.message || 'Code PIN incorrect');
      setPin(''); // Reset PIN on failure
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyClick = (key: string) => {
    if (isVerifying || timeRemaining > 0) return;
    if (pin.length < 6) {
      setPin(prev => prev + key);
      setError(null);
    }
  };

  const handleDelete = () => {
    if (isVerifying || timeRemaining > 0) return;
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-surface-bright/95 backdrop-blur-md">
      <div className="absolute top-md right-md">
        <button 
          onClick={logout}
          className="flex items-center gap-xs px-md py-sm rounded bg-surface-container hover:bg-surface-container-high transition-colors text-error font-label-md"
        >
          <LogOut className="w-5 h-5" />
          {t('layout.logout') || 'Déconnexion'}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-md">
        <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-lg">
          <Lock className="w-8 h-8" />
        </div>
        
        <h1 className="font-headline-lg text-on-surface mb-xs">
          {user?.name ? `Bonjour, ${user.name}` : 'Terminal Verrouillé'}
        </h1>
        <p className="font-body-md text-on-surface-variant mb-xl text-center max-w-sm">
          {timeRemaining > 0 
            ? `Trop de tentatives. Veuillez patienter ${timeRemaining}s.`
            : 'Veuillez saisir votre code PIN à 6 chiffres pour déverrouiller le terminal.'}
        </p>

        {/* PIN Indicators */}
        <div className="flex gap-md mb-xl">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full transition-colors ${
                i < pin.length ? 'bg-primary' : 'bg-surface-container-high'
              } ${error ? 'bg-error' : ''}`}
            />
          ))}
        </div>

        {error && (
          <div className="text-error font-body-md mb-md animate-pulse">
            {error}
          </div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-sm max-w-[320px] w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleKeyClick(num.toString())}
              disabled={isVerifying || timeRemaining > 0}
              className="aspect-square flex items-center justify-center text-title-lg font-medium bg-surface-container hover:bg-surface-container-highest active:bg-primary-container active:text-on-primary-container rounded-2xl transition-colors disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <div className="aspect-square" /> {/* Empty spot */}
          <button
            onClick={() => handleKeyClick('0')}
            disabled={isVerifying || timeRemaining > 0}
            className="aspect-square flex items-center justify-center text-title-lg font-medium bg-surface-container hover:bg-surface-container-highest active:bg-primary-container active:text-on-primary-container rounded-2xl transition-colors disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            disabled={isVerifying || timeRemaining > 0 || pin.length === 0}
            className="aspect-square flex items-center justify-center text-on-surface-variant bg-surface-container hover:bg-surface-container-highest rounded-2xl transition-colors disabled:opacity-50"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
        
        {/* Edge Case Configuration Link */}
        <div className="mt-xl">
          <button 
             onClick={() => window.location.href = '/register'} // Or handle a specific flow
             className="text-primary font-label-md hover:underline"
          >
            Première connexion ? Configurer mon code PIN
          </button>
        </div>
      </div>
    </div>
  );
};
