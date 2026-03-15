'use client';

import { useState, useCallback } from 'react';

interface GeoState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const requestLocation = useCallback(
    (onSuccess?: (lat: number, lng: number) => void) => {
      if (!navigator.geolocation) {
        setState((s) => ({
          ...s,
          error: 'Geolocation is not supported by your browser',
          loading: false,
        }));
        return;
      }

      setState((s) => ({ ...s, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setState({
            latitude: lat,
            longitude: lng,
            error: null,
            loading: false,
          });
          onSuccess?.(lat, lng);
        },
        (err) => {
          let message = 'Unable to retrieve your location';
          if (err.code === err.PERMISSION_DENIED) {
            message =
              'Location permission denied. Please enable GPS to continue.';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            message = 'Location information is unavailable.';
          } else if (err.code === err.TIMEOUT) {
            message = 'Location request timed out.';
          }
          setState({
            latitude: null,
            longitude: null,
            error: message,
            loading: false,
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
      );
    },
    [],
  );

  return { ...state, requestLocation };
}
