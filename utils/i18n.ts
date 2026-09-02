import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en';
import ro from '../locales/ro';
import ru from '../locales/ru';

export const LANGUAGE_KEY = 'app_language';
export type AppLanguage = 'en' | 'ro' | 'ru';
export const SUPPORTED_LANGUAGES: AppLanguage[] = ['en', 'ro', 'ru'];

// Synchronous init — all resources are bundled, no network loading needed.
// initImmediate: false ensures init() completes before any component renders,
// so useTranslation() always returns real values from the first render.
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        ro: { translation: ro },
        ru: { translation: ru },
      },
      lng: 'en',
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      initImmediate: false,
    });
}

export default i18n;
