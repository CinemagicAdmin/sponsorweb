import api from './api';
import type {
  SponsoredProductsResponse,
  SponsorMediaResponse,
  ClaimPayload,
  ClaimResponse,
  RedeemPayload,
  RedeemResponse,
} from '@/types/sponsor';

export const sponsorService = {
  getProducts: (machineId: string, latitude: number, longitude: number) =>
    api.get<SponsoredProductsResponse>(
      `/sponsored-products/machine/${machineId}`,
      { params: { latitude, longitude } },
    ),

  getMedia: (sponsorId: string, machineId: string) =>
    api.get<SponsorMediaResponse>(
      `/sponsored-products/media/${sponsorId}`,
      { params: { machineId } },
    ),

  claim: (payload: ClaimPayload) =>
    api.post<ClaimResponse>('/sponsored-products/claim', payload),

  redeem: (payload: RedeemPayload) =>
    api.post<RedeemResponse>('/sponsored-products/redeem', payload),
};
