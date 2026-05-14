export const parseDurationToMinutes = (durationStr?: string | null): number => {
  if (!durationStr || durationStr === 'Unknown') return 24;
  let totalMin = 0;
  const hrMatch = durationStr.match(/(\d+)\s*hr/);
  if (hrMatch) totalMin += parseInt(hrMatch[1], 10) * 60;
  const minMatch = durationStr.match(/(\d+)\s*min/);
  if (minMatch) totalMin += parseInt(minMatch[1], 10);
  return totalMin > 0 ? totalMin : 24;
};

export const getHighResImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (!url.includes('cdn.myanimelist.net')) return url;
  // Elimina el sufijo 'l' o 't' justo antes de la extensión y normaliza a .jpg
  // Ej: /138006l.jpg → /138006.jpg | /138006l.webp → /138006.jpg
  return url.replace(/[lt]\.(jpg|webp)$/, '.jpg');
};
