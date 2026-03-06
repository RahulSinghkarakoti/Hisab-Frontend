// src/hooks/useProfile.ts
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axiosInstance';
import { User } from '@/types/auth';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<User>('/user/profile');
      return data;
    },
  });
};