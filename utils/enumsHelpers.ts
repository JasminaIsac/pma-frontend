export interface FilterOption<T = string> {
  label: string;
  value: T;
}

export const formatEnum = (value: string | undefined | null) => {
  if (!value || typeof value !== 'string') return '';

  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
};

export const buildStatusOptions = <T extends Record<string, string>>(
  enumObj: T,
  allLabel: string
): FilterOption<T[keyof T] | ''>[] => {
  const values = Object.values(enumObj) as T[keyof T][];

  return [
    { label: allLabel, value: '' },
    ...values.map(status => ({
      label: formatEnum(status),
      value: status,
    })),
  ];
};

