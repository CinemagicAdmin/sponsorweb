'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { countries, defaultCountry, type Country } from '@/utils/countries';
import { authService } from '@/services/auth.service';
import { useAuthContext } from '@/contexts/AuthContext';
import { storage } from '@/utils/storage';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const machineId = searchParams.get('m');
  const prefillPhone = searchParams.get('phone') ?? '';
  const prefillCc = searchParams.get('cc') ?? '';
  const { setAuth } = useAuthContext();

  const [country, setCountry] = useState<Country>(
    () => countries.find((c) => c.dialCode === prefillCc) ?? defaultCountry,
  );
  const [phone, setPhone] = useState(prefillPhone);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (phone.length < 5) {
      setError('Please enter a valid phone number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await authService.register({
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
          ?.message ?? 'Registration failed. Please try again.';
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
          alt="Create account"
          width={200}
          height={200}
          priority
        />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
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
        <Button onClick={handleRegister} loading={loading}>
          Sign Up
        </Button>
      </div>

      <p className="text-gray-500">
        Already have an account?{' '}
        <Link
          href={`/auth/login${machineId ? `?m=${machineId}` : ''}`}
          className="text-[#4ECDC4] font-semibold"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RegisterContent />
    </Suspense>
  );
}
