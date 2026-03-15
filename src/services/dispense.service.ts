import api from './api';
import type { DispensePayload, DispenseResponse } from '@/types/api';

export const dispenseService = {
  dispense: (payload: DispensePayload) =>
    api.post<DispenseResponse>('/machines/dispense', payload),
};
