import { loadMultipleCSV, parseCSV } from '../utils/csvParser';
import { BusRecord, SequenceRecord, StopRecord } from './graphBuilder';

interface RouteDataset {
  stops: StopRecord[];
  sequences: SequenceRecord[];
  buses: BusRecord[];
}

const toDataset = (raw: {
  bus_stops?: StopRecord[];
  bus_stop_sequence?: SequenceRecord[];
  buses?: BusRecord[];
}): RouteDataset => ({
  stops: raw.bus_stops || [],
  sequences: raw.bus_stop_sequence || [],
  buses: raw.buses || [],
});

const hasMinimumData = (dataset: RouteDataset): boolean => {
  return dataset.stops.length > 0 && dataset.sequences.length > 0;
};

const getCandidateBasePaths = (): string[] => {
  const candidates = ['/data', 'data', './data'];

  if (typeof window !== 'undefined' && window.location?.origin) {
    candidates.push(`${window.location.origin}/data`);
  }

  return Array.from(new Set(candidates));
};

const fetchCsvWithFallback = async (fileName: string): Promise<string | null> => {
  const candidates = getCandidateBasePaths();

  for (const basePath of candidates) {
    const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    const url = `${normalizedBase}/${fileName}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        continue;
      }

      return response.text();
    } catch {
      // Keep trying other paths.
    }
  }

  return null;
};

const loadWithPathFallback = async (): Promise<RouteDataset> => {
  const [stopsText, sequenceText, busesText] = await Promise.all([
    fetchCsvWithFallback('bus_stops.csv'),
    fetchCsvWithFallback('bus_stop_sequence.csv'),
    fetchCsvWithFallback('buses.csv'),
  ]);

  return {
    stops: stopsText ? (parseCSV(stopsText) as StopRecord[]) : [],
    sequences: sequenceText ? (parseCSV(sequenceText) as SequenceRecord[]) : [],
    buses: busesText ? (parseCSV(busesText) as BusRecord[]) : [],
  };
};

export const loadRouteRecommendationDataset = async (): Promise<RouteDataset> => {
  const sharedLoaderResult = (await loadMultipleCSV(['bus_stops.csv', 'bus_stop_sequence.csv', 'buses.csv'])) as {
    bus_stops?: StopRecord[];
    bus_stop_sequence?: SequenceRecord[];
    buses?: BusRecord[];
  };

  const primaryDataset = toDataset(sharedLoaderResult);
  if (hasMinimumData(primaryDataset)) {
    return primaryDataset;
  }

  const fallbackDataset = await loadWithPathFallback();
  return fallbackDataset;
};
