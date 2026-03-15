export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Vend IT',
  maxDistanceMeters: Number(process.env.NEXT_PUBLIC_MAX_DISTANCE_METERS ?? 100),
} as const;
