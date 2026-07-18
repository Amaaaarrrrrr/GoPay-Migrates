export type UserRole = 'passenger' | 'driver' | 'conductor' | 'marshal' | 'admin' | 'institution_admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'top_up' | 'fare_payment' | 'transfer' | 'receive';
  transaction_type?: string;
  description: string;
  reference: string;
  fleet_number?: string;
  sacco?: string;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
}

export interface Route {
  id: string;
  from: string;
  to: string;
  fare: number;
  sacco: string;
  duration?: string;
  distance?: string;
  stops?: string[];
}

export interface Vehicle {
  id: string;
  registration: string;
  sacco: string;
  capacity: number;
  status: 'boarding' | 'idle' | 'in_transit';
  route_id?: string;
  fleet_number?: string;
}

export interface Seat {
  id: string;
  vehicle_id: string;
  seat_number: number;
  status: 'available' | 'booked' | 'reserved';
}
