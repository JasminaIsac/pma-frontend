export const formatDate = (date: string | Date | null | undefined, fallback = 'Not set'): string => {
  if (!date) return fallback;

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return fallback;

  return dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit', 
    year: 'numeric' 
  });
};

export const formatDateWithSuffix = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const day = dateObj.getDate();

  const getDaySuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return `${month}, ${day}${getDaySuffix(day)}`;
};

export const formatRelativeDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  // Dacă e în viitor (cazul Today/Tomorrow din codul tău original)
  if (diffInSeconds < 0) {
    const diffDays = Math.ceil(Math.abs(diffInSeconds) / (60 * 60 * 24));
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  }

  // Mesaje trimise ACUM (trecut)
  if (diffInSeconds < 60) return 'now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d`;

  // Dacă e mai vechi de o săptămână, folosim formatul tău standard
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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