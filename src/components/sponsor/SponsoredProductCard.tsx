'use client';

import Image from 'next/image';
import { Gift, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { MachineSlot } from '@/types/machine';

interface SponsoredProductCardProps {
  slot: MachineSlot;
  currency: string;
  onClaim: () => void;
  onInfo: () => void;
}

export function SponsoredProductCard({
  slot,
  currency,
  onClaim,
  onInfo,
}: SponsoredProductCardProps) {
  const product = slot.product;
  const isFree = slot.sponsor_type === 'free';

  return (
    <div className="relative rounded-2xl p-[2px] overflow-hidden shadow-sm">
      {/* Rotating gradient border */}
      <div
        className="absolute inset-[-50%] animate-[spin_4s_linear_infinite]"
        style={{
          background:
            'conic-gradient(from 0deg, #4ECDC4, #a8edea, #4ECDC4, transparent, #4ECDC4)',
        }}
      />

      {/* Card content */}
      <div className="relative bg-white rounded-[14px] overflow-hidden">
        {/* Slot number badge */}
        <div className="relative px-3 pt-3">
          <span className="absolute top-3 left-3 bg-gray-400 text-white text-xs font-medium px-2.5 py-0.5 rounded-full z-10">
            Slot {slot.slot_number}
          </span>

          {/* Product image + centered free gift badge */}
          <div className="relative flex items-center justify-center h-40 mt-2">
            {isFree && (
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1 bg-green-600 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full z-10 whitespace-nowrap">
                <Gift className="h-2.5 w-2.5" />
                FREE GIFT
              </span>
            )}
            {product?.product_image_url ? (
              <Image
                src={product.product_image_url}
                alt={product.brand_name ?? 'Product'}
                width={120}
                height={120}
                className="object-contain max-h-28"
                unoptimized
              />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center">
                <Gift className="h-8 w-8 text-gray-300" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-3 pb-3 pt-2">
          <div className="flex items-start justify-between gap-1 min-h-[2.5rem]">
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 flex-1">
              {product?.brand_name ?? 'Sponsored Product'}
            </h3>
            <button onClick={onInfo} className="shrink-0 mt-0.5">
              <Info className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Price + claim */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-[#4ECDC4] font-bold text-sm">
              {isFree ? `${slot.price} ${currency}` : `${slot.price} ${currency}`}
            </span>
            <Button
              size="sm"
              onClick={onClaim}
              className="!py-1.5 !px-4 !text-xs !rounded-lg"
            >
              Claim
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
