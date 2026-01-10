
export type UserRole = 'admin' | 'staff';
export type VerificationStatus = 'Pending' | 'Ok' | 'Short' | 'Extra';

export interface VerificationData {
  status: VerificationStatus;
  discrepancyQuantity?: number;
  note?: string; // New field for detailed comments
  verifiedBy?: string;
  timestamp?: string;
}

export interface User {
  id: string;
  username: string;
  password?: string; // Only stored in local list
  role: UserRole;
  fullName: string;
}

export interface Product {
  id: string;
  name: string;
  brand: 'Milo' | "Beyrel's";
  pcsPerBox: number;
  imageUrl?: string;
}

export interface StockCounts {
  boxCount: number;
  displayPcs: number;
}

export interface StockEntry extends StockCounts {
  productId: string;
  totalPcs: number;
}

export interface DailyRecord {
  date: string;
  entries: StockEntry[];
  totalMiloPcs: number;
  totalBeyrelsPcs: number;
  recordedBy?: string; // Full name for display
  recordedByUsername: string; // Username for access control
  verification?: VerificationData;
}

export interface HistoryData {
  [date: string]: DailyRecord;
}
