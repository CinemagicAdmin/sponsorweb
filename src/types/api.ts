export interface ApiError {
  status: number;
  message: string;
}

export interface DispensePayload {
  machineId: string;
  paymentId: string;
  slotNumber: string;
}

export interface DispenseResponse {
  success: boolean;
  data: {
    acknowledged: boolean;
    commandSent: boolean;
  };
  message: string;
}
