'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import type { SponsorMedia } from '@/types/sponsor';

interface AdViewerProps {
  media: SponsorMedia[];
  minWatchTime: number;
  onComplete: () => void;
}

export function AdViewer({ media, minWatchTime: rawMinWatchTime, onComplete }: AdViewerProps) {
  const minWatchTime = rawMinWatchTime || 3;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const [loading, setLoading] = useState(false);

  const current = media[currentIndex];
  const isVideo = current?.type?.toLowerCase().includes('video');

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= minWatchTime) setCanProceed(true);
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [minWatchTime]);

  const handleNext = useCallback(() => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, media.length]);

  const handleComplete = async () => {
    setLoading(true);
    onComplete();
  };

  const remaining = Math.max(0, minWatchTime - elapsed);
  const progress = Math.min(100, (elapsed / minWatchTime) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-black to-gray-900 flex flex-col">
      {/* Top bar with progress */}
      <div className="px-4 pt-6 pb-2">
        {media.length > 1 && (
          <div className="flex gap-1.5 mb-3">
            {media.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden"
              >
                <div
                  className="h-full bg-[#4ECDC4] transition-all duration-300"
                  style={{ width: i <= currentIndex ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Sponsor label */}
        <div className="flex items-center justify-between">
          <p className="text-white/50 text-xs font-medium tracking-wider uppercase">
            Sponsored
          </p>
          {!canProceed && (
            <span className="text-white/40 text-xs">
              {remaining}s remaining
            </span>
          )}
        </div>
      </div>

      {/* Media content — fills available space */}
      <div className="flex-1 flex items-center justify-center px-4 py-4 min-h-0">
        {current && (
          isVideo ? (
            <video
              key={current.id}
              src={current.url}
              className="w-full h-full object-contain rounded-2xl"
              autoPlay
              playsInline
              muted={false}
              onEnded={handleNext}
              controls={false}
            />
          ) : (
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image
                key={current.id}
                src={current.url}
                alt={current.title ?? 'Sponsor Advertisement'}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )
        )}
      </div>

      {/* Bottom action area */}
      <div className="px-6 pb-8 pt-4">
        {!canProceed ? (
          <div className="space-y-4">
            {/* Progress ring */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32" cy="32" r="28"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="32" cy="32" r="28"
                    fill="none"
                    stroke="#4ECDC4"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">
                  {remaining}
                </span>
              </div>
              <p className="text-white/50 text-sm">
                Please watch the advertisement
              </p>
            </div>
          </div>
        ) : (
          <Button onClick={handleComplete} loading={loading} className="w-full !py-4 !text-base !rounded-2xl">
            Collect Your Free Gift
          </Button>
        )}
      </div>
    </div>
  );
}
