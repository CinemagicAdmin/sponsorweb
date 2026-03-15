'use client';

import { MapPin } from 'lucide-react';
import { Button } from './Button';

interface LocationPermissionProps {
  onAllow: () => void;
  error?: string | null;
}

export function LocationPermission({ onAllow, error }: LocationPermissionProps) {
  const isDenied = error?.toLowerCase().includes('denied');

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-[#e8faf9] flex items-center justify-center mb-6">
        <MapPin className="h-10 w-10 text-[#4ECDC4]" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        {isDenied ? 'Location Access Denied' : 'Enable Location'}
      </h2>

      <p className="text-gray-500 mb-8 max-w-xs leading-relaxed">
        {isDenied
          ? 'Location access was denied. Please enable location in your browser settings and try again.'
          : 'We need your location to verify you are near the vending machine. Please allow location access to continue.'}
      </p>

      {error && !isDenied && (
        <p className="text-red-500 text-sm mb-4 max-w-xs">{error}</p>
      )}

      {isDenied && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6 max-w-xs">
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>How to enable:</strong> Tap the lock icon in your browser&apos;s
            address bar, then allow Location access. Refresh the page after enabling.
          </p>
        </div>
      )}

      <Button onClick={onAllow}>
        {isDenied ? 'Try Again' : 'Allow Location Access'}
      </Button>
    </div>
  );
}
