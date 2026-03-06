export const formatDate = (
  date,
  locale = 'en-US',
  options = {}
) => {
  if (!date) return '—';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    ...options,
  }).format(new Date(date));
};
