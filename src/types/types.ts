// src/types/types.ts
export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  role: 'admin' | 'holder' | 'user'; // BU QATORNI QO'SHING
  access_code?: string;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}