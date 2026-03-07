import { buildStopGraph, BusRecord, GraphEdge, SequenceRecord, StopGraph, StopRecord } from './graphBuilder';
import { getTrafficDelayMinutes } from './trafficSimulator';

export interface RouteRequest {
  startStopId: string;
  destinationStopId: string;
  stops: StopRecord[];
  sequences: SequenceRecord[];
  buses: BusRecord[];
}

export interface ComputedRoute {
  recommendedBus: string;
  stops: string[];
  transfers: number;
  estimatedTravelTimeMinutes: number;
  routeIds: string[];
}

export interface RouteRecommendationResult {
  success: boolean;
  message?: string;
  bestRoute?: ComputedRoute;
  alternativeRoute?: ComputedRoute;
}

interface DijkstraState {
  distance: number;
  previousStopId?: string;
  previousEdge?: GraphEdge;
}

let cachedGraph: StopGraph | null = null;
let cacheKey = '';

const makeCacheKey = (request: Pick<RouteRequest, 'stops' | 'sequences' | 'buses'>): string => {
  return `${request.stops.length}|${request.sequences.length}|${request.buses.length}`;
};

const getOrBuildGraph = (request: Pick<RouteRequest, 'stops' | 'sequences' | 'buses'>): StopGraph => {
  const newCacheKey = makeCacheKey(request);
  if (cachedGraph && newCacheKey === cacheKey) {
    return cachedGraph;
  }

  cachedGraph = buildStopGraph(request.stops, request.sequences, request.buses);
  cacheKey = newCacheKey;
  return cachedGraph;
};

const dedupe = (values: string[]): string[] => Array.from(new Set(values));

const reconstructPath = (
  endStopId: string,
  stateMap: Map<string, DijkstraState>
): { stopPath: string[]; edgePath: GraphEdge[] } => {
  const stopPath: string[] = [];
  const edgePath: GraphEdge[] = [];

  let cursor: string | undefined = endStopId;
  while (cursor) {
    const state = stateMap.get(cursor);
    stopPath.push(cursor);

    if (!state?.previousStopId || !state.previousEdge) {
      break;
    }

    edgePath.push(state.previousEdge);
    cursor = state.previousStopId;
  }

  return {
    stopPath: stopPath.reverse(),
    edgePath: edgePath.reverse(),
  };
};

const runDijkstra = (
  graph: StopGraph,
  startStopId: string,
  destinationStopId: string,
  penalizedEdgeKeys: Set<string> = new Set<string>()
): { totalMinutes: number; stopPath: string[]; edgePath: GraphEdge[] } | null => {
  const queue = new Set<string>([startStopId]);
  const stateMap = new Map<string, DijkstraState>();
  stateMap.set(startStopId, { distance: 0 });

  while (queue.size > 0) {
    let currentStopId = '';
    let currentDistance = Number.POSITIVE_INFINITY;

    queue.forEach((stopId) => {
      const distance = stateMap.get(stopId)?.distance ?? Number.POSITIVE_INFINITY;
      if (distance < currentDistance) {
        currentDistance = distance;
        currentStopId = stopId;
      }
    });

    if (!currentStopId) {
      break;
    }

    queue.delete(currentStopId);

    if (currentStopId === destinationStopId) {
      const path = reconstructPath(destinationStopId, stateMap);
      return {
        totalMinutes: Math.round(currentDistance),
        stopPath: path.stopPath,
        edgePath: path.edgePath,
      };
    }

    const edges = graph.adjacency.get(currentStopId) ?? [];

    for (const edge of edges) {
      const trafficDelay = getTrafficDelayMinutes(edge.edgeKey);
      const penalty = penalizedEdgeKeys.has(edge.edgeKey) ? 6 : 0;
      const edgeWeight = edge.baseTravelTimeMinutes + trafficDelay + penalty;

      const existing = stateMap.get(edge.toStopId)?.distance ?? Number.POSITIVE_INFINITY;
      const candidateDistance = currentDistance + edgeWeight;

      if (candidateDistance < existing) {
        stateMap.set(edge.toStopId, {
          distance: candidateDistance,
          previousStopId: currentStopId,
          previousEdge: edge,
        });
        queue.add(edge.toStopId);
      }
    }
  }

  return null;
};

const toComputedRoute = (
  graph: StopGraph,
  stopPath: string[],
  edgePath: GraphEdge[],
  totalMinutes: number
): ComputedRoute => {
  const routeIds = edgePath.map((edge) => edge.routeId);
  const uniqueRouteIdsInOrder = routeIds.filter((routeId, index) => index === 0 || routeIds[index - 1] !== routeId);

  const transferCount = Math.max(0, uniqueRouteIdsInOrder.length - 1);

  const buses = dedupe(edgePath.flatMap((edge) => edge.busNumbers));

  const stopNames = stopPath.map((stopId) => graph.stopsById.get(stopId)?.stopName || stopId);

  return {
    recommendedBus: buses.length > 0 ? buses.join(', ') : uniqueRouteIdsInOrder.join(', '),
    stops: stopNames,
    transfers: transferCount,
    estimatedTravelTimeMinutes: totalMinutes,
    routeIds: uniqueRouteIdsInOrder,
  };
};

export const primeRouteGraphCache = (request: Pick<RouteRequest, 'stops' | 'sequences' | 'buses'>): void => {
  getOrBuildGraph(request);
};

export const findBestRoute = (request: RouteRequest): RouteRecommendationResult => {
  const { startStopId, destinationStopId, stops, sequences, buses } = request;

  if (!startStopId || !destinationStopId) {
    return { success: false, message: 'Please select both start and destination stops.' };
  }

  if (startStopId === destinationStopId) {
    return { success: false, message: 'Start and destination stops cannot be the same.' };
  }

  if (stops.length === 0 || sequences.length === 0) {
    return { success: false, message: 'Route data is unavailable right now. Please try again later.' };
  }

  const graph = getOrBuildGraph({ stops, sequences, buses });

  if (!graph.stopsById.has(startStopId) || !graph.stopsById.has(destinationStopId)) {
    return { success: false, message: 'Selected stop is not available in the current dataset.' };
  }

  if (graph.edgeCount === 0) {
    return { success: false, message: 'No route network is available in the dataset.' };
  }

  const primary = runDijkstra(graph, startStopId, destinationStopId);
  if (!primary) {
    return { success: false, message: 'No route available between the selected stops.' };
  }

  const bestRoute = toComputedRoute(graph, primary.stopPath, primary.edgePath, primary.totalMinutes);

  const penalizedEdges = new Set(primary.edgePath.map((edge) => edge.edgeKey));
  const secondary = runDijkstra(graph, startStopId, destinationStopId, penalizedEdges);

  let alternativeRoute: ComputedRoute | undefined;
  if (secondary) {
    const maybeAlternative = toComputedRoute(graph, secondary.stopPath, secondary.edgePath, secondary.totalMinutes);
    const isDifferent = maybeAlternative.stops.join('|') !== bestRoute.stops.join('|');
    if (isDifferent) {
      alternativeRoute = maybeAlternative;
    }
  }

  return {
    success: true,
    bestRoute,
    alternativeRoute,
  };
};
