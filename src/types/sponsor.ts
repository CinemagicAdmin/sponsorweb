export interface SponsoredProduct {
  slot_number: string;
  quantity: number;
  price: number;
  sponsor_id: string;
  sponsor_type: 'free' | 'discount';
  percentage: number | null;
  product: {
    brand_name: string | null;
    description: string | null;
    product_image_url: string | null;
    unit_price: number | null;
  } | null;
  sponsor?: {
    id: string;
    name: string;
    company_name: string | null;
    logo_url: string | null;
  } | null;
}

export interface SponsoredProductsResponse {
  status: string;
  data: SponsoredProduct[];
}

export interface SponsorMedia {
  id: number;
  title: string | null;
  type: string;
  url: string;
  category: string | null;
  sponsor_id: string;
  created_at: string;
}

export interface SponsorMediaResponse {
  status: string;
  data: SponsorMedia[];
}

export interface ClaimPayload {
  machineId: string;
  slotNumber: string;
  latitude: number;
  longitude: number;
}

export interface ClaimResponse {
  status: string;
  data: {
    saleId: string;
    media: SponsorMedia[];
    minWatchTime: number;
    sponsorType: 'free' | 'discount';
    percentage: number | null;
    amountToPay: number;
  };
}

export interface RedeemPayload {
  saleId: string;
}

export interface RedeemResponse {
  status: string;
  data: {
    paymentId: string | null;
    machineId: string;
    slotNumber: string;
    sponsorType: 'free' | 'discount';
    amountToPay: number;
  };
}
