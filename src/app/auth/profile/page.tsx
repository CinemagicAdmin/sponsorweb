'use client';

import { Suspense, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, User as UserIcon, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuthContext } from '@/contexts/AuthContext';
import { userService } from '@/services/user.service';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const machineId = searchParams.get('m');
  const { user, setUser } = useAuthContext();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let response;

      if (profileImage) {
        const formData = new FormData();
        formData.append('firstName', firstName.trim());
        if (lastName.trim()) formData.append('lastName', lastName.trim());
        formData.append('email', email.trim());
        formData.append('userProfile', profileImage);
        response = await userService.updateProfileWithImage(formData);
      } else {
        response = await userService.updateProfile({
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
          email: email.trim(),
        });
      }

      setUser(response.data.data);

      // Redirect to sponsor page
      if (machineId) {
        router.replace(`/sponsor/${machineId}`);
      } else {
        router.replace('/');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to update profile. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center pr-10">
          My profile
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-4 pb-8">
        {/* Profile image */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative mb-2"
        >
          <div className="w-28 h-28 rounded-full bg-[#4ECDC4] overflow-hidden flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="h-12 w-12 text-white" />
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-[#4ECDC4] text-sm font-medium mb-8"
        >
          Change profile picture
        </button>

        {/* Form fields */}
        <div className="w-full max-w-sm space-y-4">
          {/* First Name */}
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5 focus-within:border-[#4ECDC4] transition-colors">
            <UserIcon className="h-5 w-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-base"
            />
          </div>

          {/* Last Name */}
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5 focus-within:border-[#4ECDC4] transition-colors">
            <UserIcon className="h-5 w-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-base"
            />
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5 focus-within:border-[#4ECDC4] transition-colors">
            <Mail className="h-5 w-5 text-gray-400 shrink-0" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-base"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
      </div>

      {/* Save button - fixed at bottom */}
      <div className="px-6 pb-8">
        <Button onClick={handleSave} loading={loading}>
          Save
        </Button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ProfileContent />
    </Suspense>
  );
}
