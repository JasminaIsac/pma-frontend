import i18n from '@utils/i18n';

const getLocale = (): string => {
  const lang = i18n.language || 'en';
  const map: Record<string, string> = { en: 'en-US', ro: 'ro-RO', ru: 'ru-RU' };
  return map[lang] ?? 'en-US';
};

export const formatDate = (date: string | Date | null | undefined, fallback = 'Not set'): string => {
  if (!date) return fallback;

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return fallback;

  return dateObj.toLocaleDateString(getLocale(), {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
};

export const formatDateWithSuffix = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const locale = getLocale();

  if (i18n.language === 'en') {
    const month = dateObj.toLocaleDateString(locale, { month: 'short' });
    const day = dateObj.getDate();
    return `${month}, ${day}`;
  }

  // ro-RO and ru-RU locales naturally produce "17 iun." / "17 июн." order
  return dateObj.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
};

export const formatRelativeDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 0) {
    const diffDays = Math.ceil(Math.abs(diffInSeconds) / (60 * 60 * 24));
    if (diffDays === 1) return i18n.t('common.tomorrow');
    return i18n.t('common.inXDays', { count: diffDays });
  }

  if (diffInSeconds < 60) return i18n.t('common.now');

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return i18n.t('common.yesterday');
  if (diffInDays < 7) return `${diffInDays}d`;

  return dateObj.toLocaleDateString(getLocale(), { month: 'short', day: 'numeric' });
};

export const isPastDate = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  const dateObj = new Date(date);
  return dateObj < new Date();
};

export const isWithinDays = (date: string | Date | null | undefined, days: number): boolean => {
  if (!date) return false;
  const dateObj = new Date(date);
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);
  return dateObj >= now && dateObj <= futureDate;
};

export const isToday = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;

  const dateObj = new Date(date);
  const today = new Date();

  return dateObj.getFullYear() === today.getFullYear() &&
         dateObj.getMonth() === today.getMonth() &&
         dateObj.getDate() === today.getDate();
};

export const isSameDay = (date1: string | Date | null | undefined, date2: string | Date | null | undefined): boolean => {
  if (!date1 || !date2) return false;

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export const toISODate = (date: Date | string): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

export const formatDateParts = (date: Date | string | null | undefined): { day: number; month: string; year: number } => {
  const d = date ? new Date(date) : new Date();
  const valid = !isNaN(d.getTime()) ? d : new Date();
  return {
    day: valid.getDate(),
    month: valid.toLocaleString(getLocale(), { month: 'short' }),
    year: valid.getFullYear(),
  };
};