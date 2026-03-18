'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { machineService } from '@/services/machine.service';
import { sponsorService } from '@/services/sponsor.service';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ErrorScreen } from '@/components/ui/ErrorScreen';
import { LocationPermission } from '@/components/ui/LocationPermission';
import { MachineHeader } from '@/components/sponsor/MachineHeader';
import { SponsoredProductCard } from '@/components/sponsor/SponsoredProductCard';
import { AdViewer } from '@/components/sponsor/AdViewer';
import { DispenseStatus } from '@/components/sponsor/DispenseStatus';
import { ProductDetailModal } from '@/components/sponsor/ProductDetailModal';
import { haversineDistanceMeters } from '@/utils/distance';
import { config } from '@/config/env';
import type { Machine, MachineSlot } from '@/types/machine';
import type { SponsorMedia } from '@/types/sponsor';

type FlowStep =
  | 'location'
  | 'loading'
  | 'products'
  | 'ad'
  | 'dispensing'
  | 'success'
  | 'error';

export default function SponsorPage() {
  const params = useParams();
  const router = useRouter();
  const machineId = params.machineId as string;
  const { isAuthenticated, isLoading: authLoading, isProfileComplete } =
    useAuthContext();
  const geo = useGeolocation();

  const [step, setStep] = useState<FlowStep>('location');
  const [machine, setMachine] = useState<Machine | null>(null);
  const [slots, setSlots] = useState<MachineSlot[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Claim / ad state
  const [saleId, setSaleId] = useState<string | null>(null);
  const [media, setMedia] = useState<SponsorMedia[]>([]);
  const [minWatchTime, setMinWatchTime] = useState(3);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [detailSlot, setDetailSlot] = useState<MachineSlot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/auth/login?m=${machineId}`);
    }
  }, [authLoading, isAuthenticated, machineId, router]);

  // Redirect to profile if incomplete
  useEffect(() => {
    if (!authLoading && isAuthenticated && !isProfileComplete) {
      router.replace(`/auth/profile?m=${machineId}`);
    }
  }, [authLoading, isAuthenticated, isProfileComplete, machineId, router]);

  // Fetch machine details — called from event handlers only, not effects
  const fetchMachine = useCallback(
    async (lat: number, lng: number) => {
      setStep('loading');
      try {
        const { data } = await machineService.getDetail(machineId, lat, lng);

        const m = data.data.machine;
        if (!m) {
          setErrorMsg('Machine not found. Please scan a valid QR code.');
          setStep('error');
          return;
        }

        // Calculate distance for display (but don't block product listing)
        if (m.location_latitude && m.location_longitude) {
          const dist = haversineDistanceMeters(
            lat,
            lng,
            Number(m.location_latitude),
            Number(m.location_longitude),
          );
          m.distance = dist / 1000;
        }

        setMachine(m);

        const sponsoredSlots = data.data.slots.filter(
          (s) =>
            s.sale_type === 'sponsored' &&
            s.sponsor_type === 'free' &&
            s.quantity > 0,
        );

        if (sponsoredSlots.length === 0) {
          setErrorMsg(
            'No sponsored products available on this machine right now.',
          );
          setStep('error');
          return;
        }

        setSlots(sponsoredSlots);
        setStep('products');
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? 'Failed to load machine details.';
        setErrorMsg(msg);
        setStep('error');
      }
    },
    [machineId],
  );

  // Called when user taps "Allow Location Access" — event-driven, no effects
  const handleLocationRequest = () => {
    geo.requestLocation((lat, lng) => {
      setUserCoords({ lat, lng });
      fetchMachine(lat, lng);
    });
  };

  // Handle claim
  const handleClaim = async (slotNumber: string) => {
    if (!userCoords) {
      setErrorMsg('Location not available. Please enable GPS.');
      setStep('error');
      return;
    }

    // Distance check — only block claiming, not viewing
    if (machine?.location_latitude && machine?.location_longitude) {
      const dist = haversineDistanceMeters(
        userCoords.lat,
        userCoords.lng,
        Number(machine.location_latitude),
        Number(machine.location_longitude),
      );
      if (dist > config.maxDistanceMeters) {
        setErrorMsg(
          `You are ${Math.round(dist)}m away from the machine. Please move within ${config.maxDistanceMeters}m to claim this product.`,
        );
        setStep('error');
        return;
      }
    }

    setStep('loading');
    setSelectedSlot(slotNumber);

    try {
      const { data } = await sponsorService.claim({
        machineId,
        slotNumber,
        latitude: userCoords.lat,
        longitude: userCoords.lng,
      });

      setSaleId(data.data.saleId);
      setMedia(data.data.media);
      setMinWatchTime(data.data.minWatchTime ?? 3);
      setStep('ad');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to claim product.';
      setErrorMsg(msg);
      setStep('error');
    }
  };

  // Handle ad complete → redeem → then dispense
  const handleAdComplete = async () => {
    if (!saleId) return;

    setStep('loading');

    try {
      const { data } = await sponsorService.redeem({ saleId });
      setPaymentId(data.data.paymentId);
      setStep('dispensing');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to redeem product.';
      setErrorMsg(msg);
      setStep('error');
    }
  };

  const handleDispenseComplete = () => setStep('success');

  const handleDispenseError = (msg: string) => {
    setErrorMsg(msg);
    setStep('error');
  };

  // --- Render ---

  if (authLoading) return <LoadingScreen message="Checking authentication..." />;
  if (!isAuthenticated) return null;

  if (step === 'location') {
    if (geo.loading) return <LoadingScreen message="Getting your location..." />;
    return (
      <LocationPermission onAllow={handleLocationRequest} error={geo.error} />
    );
  }

  if (step === 'loading')
    return <LoadingScreen message="Loading machine details..." />;

  if (step === 'error') {
    return (
      <ErrorScreen
        message={errorMsg}
        onRetry={() => {
          setErrorMsg('');
          if (userCoords) {
            fetchMachine(userCoords.lat, userCoords.lng);
          } else {
            setStep('location');
          }
        }}
      />
    );
  }

  if (step === 'ad') {
    return (
      <AdViewer
        media={media}
        minWatchTime={minWatchTime}
        onComplete={handleAdComplete}
      />
    );
  }

  if (step === 'dispensing') {
    return (
      <DispenseStatus
        machineId={machine?.machine_tag ?? machineId}
        paymentId={paymentId}
        slotNumber={selectedSlot!}
        onSuccess={handleDispenseComplete}
        onError={handleDispenseError}
      />
    );
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-gradient-to-b from-[#e8faf9] to-white">
        <div className="w-20 h-20 rounded-full bg-[#4ECDC4] flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Product Dispensed!
        </h1>
        <p className="text-gray-500 mb-8 max-w-xs">
          Your free product has been dispensed. Please collect it from the
          vending machine.
        </p>
        <button
          onClick={() => {
            setSaleId(null);
            setPaymentId(null);
            setMedia([]);
            setSelectedSlot(null);
            if (userCoords) {
              fetchMachine(userCoords.lat, userCoords.lng);
            } else {
              setStep('location');
            }
          }}
          className="text-[#4ECDC4] font-semibold text-lg"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Filter slots by search query
  const filteredSlots = searchQuery
    ? slots.filter((slot) =>
        slot.product?.brand_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()),
      )
    : slots;

  // Products view
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#c8f0ec_0%,#e8faf9_30%,#f0fdfb_60%,#ffffff_100%)]">
      {machine && (
        <MachineHeader
          machine={machine}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      <div className="px-4 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {filteredSlots.map((slot) => (
            <SponsoredProductCard
              key={slot.slot_number}
              slot={slot}
              currency={machine?.machine_currency ?? 'KWD'}
              onClaim={() => handleClaim(slot.slot_number)}
              onInfo={() => setDetailSlot(slot)}
            />
          ))}
        </div>
      </div>

      {detailSlot && (
        <ProductDetailModal
          slot={detailSlot}
          currency={machine?.machine_currency ?? 'KWD'}
          onClaim={() => handleClaim(detailSlot.slot_number)}
          onClose={() => setDetailSlot(null)}
        />
      )}
    </div>
  );
}
