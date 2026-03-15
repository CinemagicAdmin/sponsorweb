'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { countries, type Country } from '@/utils/countries';

interface CountryPickerProps {
  onSelect: (country: Country) => void;
  onClose: () => void;
}

export function CountryPicker({ onSelect, onClose }: CountryPickerProps) {
  const [search, setSearch] = useState('');

  const filtered = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search),
  );

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#4ECDC4] px-4 py-3">
        <button onClick={onClose} className="text-white">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name of country"
          className="flex-1 bg-transparent text-white placeholder-white/70 focus:outline-none text-base"
          autoFocus
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((country) => (
          <button
            key={country.code}
            onClick={() => onSelect(country)}
            className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 border-b border-gray-50"
          >
            <span className="text-2xl">{country.flag}</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">{country.name}</p>
              <p className="text-sm text-[#4ECDC4]">{country.dialCode}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
