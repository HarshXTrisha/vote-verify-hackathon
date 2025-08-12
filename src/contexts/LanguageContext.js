import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to English
    const savedLanguage = localStorage.getItem('jan-saarthi-language');
    return savedLanguage || 'en';
  });

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'hi' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('jan-saarthi-language', newLanguage);
  };

  useEffect(() => {
    // Update document direction for RTL languages if needed
    document.documentElement.setAttribute('lang', language);
    if (language === 'hi') {
      document.documentElement.setAttribute('dir', 'ltr'); // Hindi is LTR
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [language]);

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    isHindi: language === 'hi',
    isEnglish: language === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
