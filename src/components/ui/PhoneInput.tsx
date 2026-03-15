'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Country } from '@/utils/countries';
import { CountryPicker } from './CountryPicker';

interface PhoneInputProps {
  country: Country;
  onCountryChange: (country: Country) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function PhoneInput({
  country,
  onCountryChange,
  value,
  onChange,
  placeholder = '000 000 000',
  error,
}: PhoneInputProps) {
  const [showPicker, setShowPicker] = useState(false);

  if (showPicker) {
    return (
      <CountryPicker
        onSelect={(c) => {
          onCountryChange(c);
          setShowPicker(false);
        }}
        onClose={() => setShowPicker(false)}
      />
    );
  }

  return (
    <div>
      <div
        className={cn(
          'flex items-center rounded-xl border bg-white px-4 py-3.5 transition-colors',
          error ? 'border-red-400' : 'border-gray-200 focus-within:border-[#4ECDC4]',
        )}
      >
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-1.5 pr-3 border-r border-gray-200 mr-3 shrink-0"
        >
          <span className="text-xl">{country.flag}</span>
          <span className="text-sm font-medium text-gray-700">
            {country.dialCode}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-base"
          autoComplete="tel"
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}
