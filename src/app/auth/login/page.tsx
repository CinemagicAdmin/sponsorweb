'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { defaultCountry, type Country } from '@/utils/countries';
import { authService } from '@/services/auth.service';
import { useAuthContext } from '@/contexts/AuthContext';
import { storage } from '@/utils/storage';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const machineId = searchParams.get('m');
  const { setAuth } = useAuthContext();

  const [country, setCountry] = useState<Country>(defaultCountry);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (phone.length < 5) {
      setError('Please enter a valid phone number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await authService.login({
        countryCode: country.dialCode,
        phoneNumber: phone,
        deviceType: 'web',
      });

      const user = data.data;
      setAuth(user, user.token, user.refreshToken);

      if (machineId) storage.setMachineId(machineId);

      router.push(
        `/auth/verify?m=${machineId ?? ''}&phone=${phone}&cc=${encodeURIComponent(country.dialCode)}`,
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center px-6 pt-12 pb-8">
      <div className="mb-8">
        <Image
          src="/images/phone-verify.svg"
          alt="Phone verification"
          width={200}
          height={200}
          priority
        />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Let&apos;s Verify your Phone
      </h1>
      <p className="text-gray-500 mb-8">Please enter your phone number below:</p>

      <div className="w-full max-w-sm mb-6">
        <PhoneInput
          country={country}
          onCountryChange={setCountry}
          value={phone}
          onChange={setPhone}
          error={error}
        />
      </div>

      <div className="w-full max-w-sm mb-6">
        <Button onClick={handleLogin} loading={loading}>
          Login
        </Button>
      </div>

      <p className="text-gray-500">
        Don&apos;t have an account?{' '}
        <Link
          href={`/auth/register${machineId ? `?m=${machineId}` : ''}`}
          className="text-[#4ECDC4] font-semibold"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginContent />
    </Suspense>
  );
}
