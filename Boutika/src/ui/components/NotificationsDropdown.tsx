import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { t } from '../i18n';
import { Link } from 'react-router-dom';

export const NotificationsDropdown: React.FC = () => {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleOpen}
        className="text-primary hover:bg-surface-container-low transition-colors p-xs rounded-full flex items-center justify-center active:opacity-80 transition-opacity relative"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border border-surface-bright"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-surface border border-outline-variant rounded-xl shadow-lg z-50 flex flex-col max-h-[400px] overflow-hidden">
          <div className="p-3 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
            <h3 className="font-title-md text-title-md text-on-surface font-semibold">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="text-primary text-[11px] font-medium hover:underline"
              >
                {t('notifications.markAllAsRead')}
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-on-surface-variant">
                {t('notifications.empty')}
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-3 border-b border-outline-variant last:border-b-0 hover:bg-surface-container-lowest transition-colors cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-primary-fixed-dim bg-opacity-5' : ''}`}
                    onClick={() => {
                      markAsRead(notif.id);
                      if (notif.link) {
                        setIsOpen(false);
                      }
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'low_stock' ? 'bg-error-container text-error' : 'bg-primary-container text-on-primary-container'}`}>
                      <span className="material-symbols-outlined text-[16px]">
                        {notif.type === 'low_stock' ? 'warning' : 'analytics'}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${!notif.isRead ? 'text-on-surface' : 'text-on-surface-variant'}`}>{notif.title}</span>
                        {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>}
                      </div>
                      <span className="text-xs text-on-surface-variant leading-tight">{notif.description}</span>
                      {notif.link && (
                        <Link to={notif.link} className="text-[10px] text-primary font-medium mt-2 hover:underline">Voir les détails</Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
