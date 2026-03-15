import api from './api';
import type { MachineDetailResponse } from '@/types/machine';

export const machineService = {
  getDetail: (machineId: string, latitude?: number, longitude?: number) =>
    api.get<MachineDetailResponse>(`/machines/${machineId}`, {
      params: {
        ...(latitude != null && { latitude }),
        ...(longitude != null && { longitude }),
      },
    }),
};
