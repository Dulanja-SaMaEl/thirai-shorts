"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '../translations';

const LanguageContext = createContext({
  currentLanguage: 'en',
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  languages: SUPPORTED_LANGUAGES
});

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Load persisted language from localStorage on client mount
    try {
      const savedLang = localStorage.getItem('thirai_lang');
      if (savedLang && (savedLang === 'en' || savedLang === 'si' || savedLang === 'ta')) {
        setCurrentLanguage(savedLang);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = savedLang;
        }
      }
    } catch (e) {
      console.warn('Language hydration error:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const setLanguage = (langCode) => {
    if (langCode === 'en' || langCode === 'si' || langCode === 'ta') {
      setCurrentLanguage(langCode);
      try {
        localStorage.setItem('thirai_lang', langCode);
      } catch (e) {}
      if (typeof document !== 'undefined') {
        document.documentElement.lang = langCode;
      }
    }
  };

  /**
   * Helper function to retrieve nested translation strings
   * Example: t('nav.officialSelections', 'Official Selections')
   */
  const t = (path, fallback = '') => {
    if (!path) return fallback;

    const keys = path.split('.');
    
    // 1. Try current language
    let value = TRANSLATIONS[currentLanguage];
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        value = null;
        break;
      }
    }

    if (value && typeof value === 'string') {
      return value;
    }

    // 2. Fallback to English
    let fallbackValue = TRANSLATIONS.en;
    for (const key of keys) {
      if (fallbackValue && typeof fallbackValue === 'object' && key in fallbackValue) {
        fallbackValue = fallbackValue[key];
      } else {
        fallbackValue = null;
        break;
      }
    }

    if (fallbackValue && typeof fallbackValue === 'string') {
      return fallbackValue;
    }

    // 3. Fallback to passed fallback or key
    return fallback || path;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
        isHydrated
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
