export const MAX_TRAFFIC_DELAY_MINUTES = 5;

const TRAFFIC_BUCKET_MS = 5 * 60 * 1000;

const stableHash = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// Simulates a stable traffic delay for each edge within a 5-minute window.
export const getTrafficDelayMinutes = (edgeKey: string, nowMs: number = Date.now()): number => {
  const bucket = Math.floor(nowMs / TRAFFIC_BUCKET_MS);
  const hash = stableHash(`${edgeKey}|${bucket}`);
  return hash % (MAX_TRAFFIC_DELAY_MINUTES + 1);
};
