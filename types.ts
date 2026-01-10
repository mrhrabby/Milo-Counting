
export type VerificationStatus = 'Pending' | 'Ok' | 'Short' | 'Extra';

export interface VerificationData {
  status: VerificationStatus;
  discrepancyQuantity?: number;
  note?: string; 
  timestamp?: string;
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
  verification?: VerificationData;
}

export interface HistoryData {
  [date: string]: DailyRecord;
}

// User role definition for access control levels
export type UserRole = 'admin' | 'staff';

// User structure for authentication and management features
export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  fullName: string;
}
