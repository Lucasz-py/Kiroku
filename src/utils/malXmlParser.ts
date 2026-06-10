export async function readMalListFile(file: File): Promise<string> {
  const isGzip = file.name.toLowerCase().endsWith('.gz');
  if (!isGzip) return file.text();

  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Tu navegador no puede descomprimir archivos .gz. Descomprimilo manualmente y subí el .xml.');
  }

  try {
    const stream = file.stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(stream).text();
  } catch {
    throw new Error('No se pudo descomprimir el archivo .gz. Asegurate de que sea el archivo exportado desde MyAnimeList.');
  }
}

export interface MalAnimeEntry {
  malId: number;
  title: string;
  totalEpisodes: number;
  watchedEpisodes: number;
  userScore: number;
  malStatus: string;
  status: 'Completado' | 'Mirando' | 'Pendiente';
}

function mapMalStatus(s: string): MalAnimeEntry['status'] {
  if (s === 'Completed') return 'Completado';
  if (s === 'Watching') return 'Mirando';
  return 'Pendiente';
}

export function parseMalXml(xmlString: string): MalAnimeEntry[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

  if (doc.querySelector('parsererror')) {
    throw new Error('El archivo XML no es válido.');
  }

  const animeNodes = doc.querySelectorAll('anime');
  if (animeNodes.length === 0) {
    throw new Error('No se encontraron animes en el archivo. Asegurate de exportar tu lista desde MyAnimeList.');
  }

  const entries: MalAnimeEntry[] = [];

  animeNodes.forEach(node => {
    const get = (tag: string) => node.querySelector(tag)?.textContent?.trim() ?? '';
    const malId = parseInt(get('series_animedb_id'), 10);
    if (!malId || isNaN(malId)) return;

    const malStatus = get('my_status');
    entries.push({
      malId,
      title: get('series_title'),
      totalEpisodes: parseInt(get('series_episodes'), 10) || 0,
      watchedEpisodes: parseInt(get('my_watched_episodes'), 10) || 0,
      userScore: parseInt(get('my_score'), 10) || 0,
      malStatus,
      status: mapMalStatus(malStatus),
    });
  });

  return entries;
}

export function getMalStatusCounts(entries: MalAnimeEntry[]) {
  return entries.reduce(
    (acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}
