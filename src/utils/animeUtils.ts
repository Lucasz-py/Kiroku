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
  // MAL CDN: suffix 'l' = large, 't' = tiny, no suffix = standard.
  // Always upgrade to 'l' (largest available) and prefer webp when already webp.
  return url.replace(/(?:[lt])?\.(jpg|webp)$/i, 'l.$1');
};
