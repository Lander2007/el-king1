import React from 'react';
import { useNavigate } from 'react-router';
import { FileQuestion, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function NotFoundPage() {
  const { isRTL, t } = useApp();
  const navigate = useNavigate();

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 text-center"
      style={{ background: 'var(--ks-bg-secondary)' }}
    >
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 border border-[var(--ks-border)] shadow-md"
        style={{ background: 'var(--ks-bg)' }}
      >
        <FileQuestion size={48} className="text-[var(--ks-blue)] animate-bounce" />
      </div>
      
      <h1 className="text-4xl font-extrabold mb-3" style={{ color: 'var(--ks-text)' }}>
        {t('errors.404')}
      </h1>
      
      <p className="text-sm font-medium mb-8 max-w-md" style={{ color: 'var(--ks-text-secondary)' }}>
        {t('errors.notFoundDesc')}
      </p>

      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-extrabold text-sm transition-all duration-300 hover:shadow-lg active:scale-95"
        style={{ background: 'var(--ks-blue)' }}
      >
        <Home size={16} />
        {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
      </button>
    </div>
  );
}
