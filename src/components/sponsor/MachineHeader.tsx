'use client';

import { useState } from 'react';
import { ArrowLeft, MapPin, Route, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Machine } from '@/types/machine';

interface MachineHeaderProps {
  machine: Machine;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function MachineHeader({ machine, searchQuery, onSearchChange }: MachineHeaderProps) {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);

  const displayName =
    machine.location_address || machine.machine_name || machine.machine_tag || machine.u_id;

  return (
    <div className="px-4 pt-4 pb-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            // Try to close the tab (works when opened via QR scan)
            window.close();
            // If window.close() is blocked by the browser, go to root
            router.push('/');
          }}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>

        {showSearch ? (
          <div className="flex-1 ml-3 flex items-center gap-2 bg-white rounded-full shadow-sm px-4 py-2">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              autoFocus
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
            />
            <button
              onClick={() => {
                onSearchChange('');
                setShowSearch(false);
              }}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
          >
            <Search className="h-5 w-5 text-gray-700" />
          </button>
        )}
      </div>

      {/* Machine card with rotating border */}
      <div className="relative rounded-2xl p-[2px] overflow-hidden shadow-sm">
        <div
          className="absolute inset-[-50%] animate-[spin_4s_linear_infinite]"
          style={{
            background:
              'conic-gradient(from 0deg, #4ECDC4, #a8edea, #4ECDC4, transparent, #4ECDC4)',
          }}
        />
        <div className="relative bg-white rounded-[14px] p-4 flex items-center gap-4">
          {machine.machine_image_url ? (
            <Image
              src={machine.machine_image_url}
              alt={displayName}
              width={64}
              height={64}
              className="w-16 h-16 rounded-xl object-cover shrink-0"
              unoptimized
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-[#2c3e50] flex items-center justify-center shrink-0">
              <span className="text-[#4ECDC4] font-bold text-lg">VT</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-gray-700">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium truncate">{displayName}</span>
            </div>
            {machine.distance != null && (
              <div className="flex items-center gap-1.5 text-[#4ECDC4] mt-1">
                <Route className="h-4 w-4 shrink-0" />
                <span className="text-sm">
                  {machine.distance < 1
                    ? `${Math.round(machine.distance * 1000)}m`
                    : `${machine.distance.toFixed(1)}Kms`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
