import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Localization from 'expo-localization';
import i18n, { AppLanguage, LANGUAGE_KEY, SUPPORTED_LANGUAGES } from '../utils/i18n';

interface LanguageContextValue {
  language: AppLanguage;
  changeLanguage: (lang: AppLanguage) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  changeLanguage: async () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<AppLanguage>(
    (i18n.language as AppLanguage) || 'en',
  );

  // Apply the saved language preference on first mount.
  // i18next is already initialized (synchronously, in utils/i18n.ts),
  // so this only needs to call changeLanguage to switch from the default 'en'.
  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync(LANGUAGE_KEY);
      const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en';
      const fallback: AppLanguage = SUPPORTED_LANGUAGES.includes(deviceLang as AppLanguage)
        ? (deviceLang as AppLanguage)
        : 'en';
      const lng = (saved as AppLanguage) || fallback;

      if (lng !== i18n.language) {
        await i18n.changeLanguage(lng);
      }
      setLanguage(lng);
    })();
  }, []);

  const changeLanguage = useCallback(async (lang: AppLanguage) => {
    await i18n.changeLanguage(lang);
    await SecureStore.setItemAsync(LANGUAGE_KEY, lang);
    setLanguage(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => useContext(LanguageContext);
