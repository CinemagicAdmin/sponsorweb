'use client';

import { X, Gift, Package } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import type { MachineSlot } from '@/types/machine';

interface ProductDetailModalProps {
  slot: MachineSlot;
  currency: string;
  onClaim: () => void;
  onClose: () => void;
}

export function ProductDetailModal({
  slot,
  currency,
  onClaim,
  onClose,
}: ProductDetailModalProps) {
  const product = slot.product;
  const isFree = slot.sponsor_type === 'free';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {/* Product image */}
        <div className="bg-gradient-to-b from-[#e8faf9] to-white flex items-center justify-center py-8 px-6">
          {product?.product_image_url ? (
            <Image
              src={product.product_image_url}
              alt={product.brand_name ?? 'Product'}
              width={200}
              height={200}
              className="object-contain max-h-48"
              unoptimized
            />
          ) : (
            <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Package className="h-12 w-12 text-gray-300" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="px-5 pb-6 pt-4">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-gray-500 text-white text-xs font-medium px-2 py-0.5 rounded">
              Slot {slot.slot_number}
            </span>
            {isFree && (
              <span className="inline-flex items-center gap-1 bg-green-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                <Gift className="h-3 w-3" />
                FREE GIFT
              </span>
            )}
          </div>

          {/* Name */}
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {product?.brand_name ?? 'Sponsored Product'}
          </h2>

          {/* Description */}
          {product?.description && (
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Price info */}
          <div className="bg-[#e8faf9] rounded-xl p-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Sponsored Price</p>
                <p className="text-lg font-bold text-[#4ECDC4]">
                  {isFree ? 'FREE' : `${slot.price} ${currency}`}
                </p>
              </div>
              {product?.unit_price != null && product.unit_price > 0 && (
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-0.5">Original Price</p>
                  <p className="text-lg font-bold text-gray-400 line-through">
                    {product.unit_price} {currency}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stock */}
          <p className="text-xs text-gray-400 text-center mb-4">
            {slot.quantity} {slot.quantity === 1 ? 'item' : 'items'} remaining
          </p>

          {/* Claim button */}
          <Button
            onClick={() => {
              onClaim();
              onClose();
            }}
            className="w-full"
          >
            Claim Now
          </Button>
        </div>
      </div>
    </div>
  );
}
