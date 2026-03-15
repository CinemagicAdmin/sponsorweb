'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ErrorScreen } from '@/components/ui/ErrorScreen';

function MachineDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuthContext();

  const machineId = searchParams.get('m');

  useEffect(() => {
    if (isLoading) return;
    if (!machineId) return;

    if (isAuthenticated) {
      router.replace(`/sponsor/${machineId}`);
    } else {
      router.replace(`/auth/login?m=${machineId}`);
    }
  }, [machineId, isAuthenticated, isLoading, router]);

  if (isLoading) return <LoadingScreen />;

  if (!machineId) {
    return (
      <ErrorScreen
        title="Invalid QR Code"
        message="The QR code does not contain valid machine information. Please scan again."
      />
    );
  }

  return <LoadingScreen message="Redirecting..." />;
}

export default function MachineDetailRedirect() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <MachineDetailContent />
    </Suspense>
  );
}
