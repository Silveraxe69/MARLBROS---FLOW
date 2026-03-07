export interface StopRecord {
  stop_id: string;
  stop_name: string;
  latitude?: string;
  longitude?: string;
}

export interface SequenceRecord {
  route_id: string;
  stop_id: string;
  stop_sequence?: string;
  stop_order?: string;
}

export interface BusRecord {
  route_id: string;
  bus_number?: string;
  bus_id?: string;
  status?: string;
}

export interface GraphStop {
  stopId: string;
  stopName: string;
}

export interface GraphEdge {
  toStopId: string;
  routeId: string;
  busNumbers: string[];
  baseTravelTimeMinutes: number;
  edgeKey: string;
}

export interface StopGraph {
  adjacency: Map<string, GraphEdge[]>;
  stopsById: Map<string, GraphStop>;
  edgeCount: number;
}

const toNumber = (value?: string): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getSequenceNumber = (record: SequenceRecord): number => {
  const raw = record.stop_sequence ?? record.stop_order ?? '0';
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const estimateBaseTravelTime = (fromStop: StopRecord | undefined, toStop: StopRecord | undefined): number => {
  if (!fromStop || !toStop) {
    return 5;
  }

  const fromLat = toNumber(fromStop.latitude);
  const fromLon = toNumber(fromStop.longitude);
  const toLat = toNumber(toStop.latitude);
  const toLon = toNumber(toStop.longitude);

  if (fromLat === null || fromLon === null || toLat === null || toLon === null) {
    return 5;
  }

  const distanceKm = haversineKm(fromLat, fromLon, toLat, toLon);
  // 24 km/h average + boarding/buffer time.
  const travelMinutes = Math.round((distanceKm / 24) * 60) + 2;
  return Math.max(2, travelMinutes);
};

const pushEdge = (adjacency: Map<string, GraphEdge[]>, fromStopId: string, edge: GraphEdge): void => {
  const current = adjacency.get(fromStopId);
  if (current) {
    current.push(edge);
    return;
  }
  adjacency.set(fromStopId, [edge]);
};

export const buildStopGraph = (
  stops: StopRecord[],
  sequences: SequenceRecord[],
  buses: BusRecord[]
): StopGraph => {
  const adjacency = new Map<string, GraphEdge[]>();
  const stopsById = new Map<string, GraphStop>();
  const stopRecordsById = new Map<string, StopRecord>();

  stops.forEach((stop) => {
    stopsById.set(stop.stop_id, {
      stopId: stop.stop_id,
      stopName: stop.stop_name,
    });
    stopRecordsById.set(stop.stop_id, stop);
  });

  const busesByRoute = new Map<string, Set<string>>();
  buses.forEach((bus) => {
    if (!bus.route_id) return;
    const isRunning = (bus.status || '').toLowerCase() === 'running';
    if (!isRunning && bus.status) return;

    const busName = bus.bus_number || bus.bus_id;
    if (!busName) return;

    if (!busesByRoute.has(bus.route_id)) {
      busesByRoute.set(bus.route_id, new Set<string>());
    }
    busesByRoute.get(bus.route_id)?.add(busName);
  });

  const sequencesByRoute = new Map<string, SequenceRecord[]>();
  sequences.forEach((sequence) => {
    if (!sequence.route_id || !sequence.stop_id) return;
    if (!sequencesByRoute.has(sequence.route_id)) {
      sequencesByRoute.set(sequence.route_id, []);
    }
    sequencesByRoute.get(sequence.route_id)?.push(sequence);
  });

  let edgeCount = 0;

  sequencesByRoute.forEach((routeStops, routeId) => {
    routeStops.sort((a, b) => getSequenceNumber(a) - getSequenceNumber(b));

    const routeBusNumbers = Array.from(busesByRoute.get(routeId) ?? []);

    for (let index = 0; index < routeStops.length - 1; index += 1) {
      const fromStopId = routeStops[index].stop_id;
      const toStopId = routeStops[index + 1].stop_id;

      const fromStop = stopRecordsById.get(fromStopId);
      const toStop = stopRecordsById.get(toStopId);
      const baseTravelTimeMinutes = estimateBaseTravelTime(fromStop, toStop);

      const forwardEdge: GraphEdge = {
        toStopId,
        routeId,
        busNumbers: routeBusNumbers,
        baseTravelTimeMinutes,
        edgeKey: `${routeId}|${fromStopId}|${toStopId}`,
      };

      const reverseEdge: GraphEdge = {
        toStopId: fromStopId,
        routeId,
        busNumbers: routeBusNumbers,
        baseTravelTimeMinutes,
        edgeKey: `${routeId}|${toStopId}|${fromStopId}`,
      };

      pushEdge(adjacency, fromStopId, forwardEdge);
      pushEdge(adjacency, toStopId, reverseEdge);
      edgeCount += 2;
    }
  });

  return {
    adjacency,
    stopsById,
    edgeCount,
  };
};
