export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://vendit-mobile-backend-updated-898380308450.asia-east2.run.app/api',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Vend IT',
  maxDistanceMeters: Number(process.env.NEXT_PUBLIC_MAX_DISTANCE_METERS || 100),
} as const;
