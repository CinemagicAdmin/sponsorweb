'use client';

import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <Loader2 className="h-10 w-10 text-[#4ECDC4] animate-spin mb-4" />
      <p className="text-gray-500 text-base">{message}</p>
    </div>
  );
}
