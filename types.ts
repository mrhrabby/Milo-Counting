
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
}

export interface HistoryData {
  [date: string]: DailyRecord;
}

// Added User and UserRole types to support authentication and user management
export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  fullName: string;
}
