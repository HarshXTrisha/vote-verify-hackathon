import { en } from './en';
import { hi } from './hi';

export const translations = {
  en,
  hi
};

export const getTranslation = (language, key) => {
  return translations[language]?.[key] || translations.en[key] || key;
};

export { en, hi };
