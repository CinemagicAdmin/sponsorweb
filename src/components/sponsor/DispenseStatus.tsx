'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { dispenseService } from '@/services/dispense.service';

interface DispenseStatusProps {
  machineId: string;
  paymentId: string | null;
  slotNumber: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

type Status = 'dispensing' | 'success' | 'error';

export function DispenseStatus({
  machineId,
  paymentId,
  slotNumber,
  onSuccess,
  onError,
}: DispenseStatusProps) {
  const [status, setStatus] = useState<Status>('dispensing');
  const dispenseRef = useRef(false);

  useEffect(() => {
    if (!paymentId || dispenseRef.current) return;
    dispenseRef.current = true;

    const doDispense = async () => {
      try {
        await dispenseService.dispense({ machineId, paymentId, slotNumber });
        setStatus('success');
        setTimeout(onSuccess, 2500);
      } catch (err: unknown) {
        setStatus('error');
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? 'Failed to dispense product. Please contact support.';
        setTimeout(() => onError(msg), 2500);
      }
    };

    doDispense();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-[#e8faf9] to-white">
      {status === 'dispensing' && (
        <>
          <Loader2 className="h-16 w-16 text-[#4ECDC4] animate-spin mb-6" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Dispensing...</h2>
          <p className="text-gray-500 text-center max-w-xs">
            Please wait while your product is being dispensed from the machine.
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-6" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-500">Your product is ready. Enjoy!</p>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="h-16 w-16 text-red-500 mb-6" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Dispense Failed</h2>
          <p className="text-gray-500 text-center max-w-xs">
            Something went wrong. Please try again or contact support.
          </p>
        </>
      )}
    </div>
  );
}
