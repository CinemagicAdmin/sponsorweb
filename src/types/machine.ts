export interface Machine {
  id: string;
  u_id: string;
  machine_tag: string | null;
  model: string | null;
  description: string | null;
  location_address: string | null;
  location_latitude: string | null;
  location_longitude: string | null;
  machine_image_url: string | null;
  machine_name: string | null;
  machine_currency: string | null;
  machine_operation_state: string | null;
  last_machine_status: string | null;
  distance: number | null;
}

export interface MachineSlot {
  slot_number: string;
  quantity: number;
  max_quantity: number;
  price: number;
  sale_type: 'regular' | 'sponsored';
  sponsor_id: string | null;
  sponsor_order_id: string | null;
  sponsor_type: 'free' | 'discount' | null;
  percentage: number | null;
  product: {
    brand_name: string | null;
    description: string | null;
    product_image_url: string | null;
    unit_price: number | null;
  } | null;
}

export interface MachineDetailResponse {
  status: string;
  data: {
    machine: Machine;
    slots: MachineSlot[];
  };
}
