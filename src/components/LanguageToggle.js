import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageToggle.css';

const LanguageToggle = () => {
  const { toggleLanguage, isHindi } = useLanguage();

  return (
    <button
      className="language-toggle"
      onClick={toggleLanguage}
      aria-label={`Switch to ${isHindi ? 'English' : 'Hindi'}`}
      title={`Switch to ${isHindi ? 'English' : 'Hindi'}`}
    >
      <span className="language-toggle-text">
        {isHindi ? 'EN' : 'हिं'}
      </span>
      <span className="language-toggle-label">
        {isHindi ? 'English' : 'हिंदी'}
      </span>
    </button>
  );
};

export default LanguageToggle;
