'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { OtpInput } from '@/components/ui/OtpInput';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { authService } from '@/services/auth.service';
import { useAuthContext } from '@/contexts/AuthContext';

const RESEND_COOLDOWN = 30;

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const machineId = searchParams.get('m');
  const { setAuth } = useAuthContext();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 4) {
      setError('Please enter the 4-digit OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await authService.verifyOtp({ otp });
      const user = data.data;
      setAuth(user, user.token, user.refreshToken);

      const profileComplete = Boolean(user.firstName && user.email);
      const mParam = machineId ? `?m=${machineId}` : '';

      if (!profileComplete) {
        router.push(`/auth/profile${mParam}`);
      } else if (machineId) {
        router.push(`/sponsor/${machineId}`);
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Invalid OTP. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await authService.resendOtp();
      setCountdown(RESEND_COOLDOWN);
      setOtp('');
      setError('');
    } catch {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  }, [countdown]);

  const formatCountdown = (s: number) => {
    const min = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className="flex-1 flex flex-col px-6 pt-6 pb-8">
      <button onClick={() => router.back()} className="mb-4 self-start">
        <ArrowLeft className="h-6 w-6 text-gray-900" />
      </button>

      <div className="flex-1 flex flex-col items-center pt-4">
        <div className="mb-8">
          <Image
            src="/images/otp-verify.svg"
            alt="OTP verification"
            width={200}
            height={200}
            priority
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification code</h1>
        <p className="text-gray-500 text-center mb-8 max-w-xs">
          Please enter your OTP code sent to your phone number.
        </p>

        <div className="w-full max-w-sm mb-6">
          <OtpInput value={otp} onChange={setOtp} error={error} />
        </div>

        <div className="mb-8 text-center">
          <span className="text-gray-500">Didn&apos;t receive the OTP? </span>
          {countdown > 0 ? (
            <span className="text-[#4ECDC4] font-medium">
              Resend otp in {formatCountdown(countdown)}
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-[#4ECDC4] font-semibold"
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>

        <div className="w-full max-w-sm">
          <Button onClick={handleVerify} loading={loading}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <VerifyContent />
    </Suspense>
  );
}
