import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-fetch';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

async function fetchProfile(): Promise<ProfileData> {
  const response = await apiFetch('/api/profile');
  
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  const data = await response.json();
  if (data.success && data.data) {
    return data.data;
  }
  
  throw new Error('Invalid profile response');
}

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: fetchProfile,
    staleTime: 30 * 60 * 1000, // 30 minutes - profile doesn't change often
    gcTime: 60 * 60 * 1000, // 1 hour - keep profile cached longer
    retry: 1, // Only retry once on failure
  });
}

