
export interface Warehouse {
  id: string;
  name: string;
  description?: string;
  isArchived?: boolean;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}

export interface Item {
  id:string;
  warehouseId: string;
  name: string;
  quantity: number;
  location?: string;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
  history: HistoryEntry[];
  isArchived?: boolean;
}

export type HistoryEntryType =
  | 'CREATE_ITEM'
  | 'ADD_STOCK'
  | 'CONSUME_STOCK'
  | 'ADJUST_STOCK'
  | 'CREATE_WAREHOUSE'
  | 'UPDATE_WAREHOUSE'
  | 'DELETE_WAREHOUSE';

export interface HistoryEntry {
  id: string;
  type: HistoryEntryType;
  change: number;
  quantityBefore: number;
  quantityAfter: number;
  comment?: string;
  timestamp: string; // ISO string date
}

export interface ArchivedReport {
  id: string;
  reportType?: 'ITEM' | 'WAREHOUSE' | 'TRANSACTIONS';
  warehouseId?: string;
  warehouseName?: string;
  warehouseDescription?: string;
  itemId?: string;
  itemName?: string;
  printedBy: string;
  printedAt: string;
  historySnapshot?: HistoryEntry[];
  itemsSnapshot?: { name: string; quantity: number }[];
  transactionsSnapshot?: FlattenedHistoryEntry[];
  reportTitleSnapshot?: string;
}

export interface FlattenedHistoryEntry extends HistoryEntry {
  itemName: string;
  warehouseName: string;
  itemId: string;
  warehouseId: string;
}

export interface UserProfile {
  id: string; // Firebase Auth UID
  username: string;
  email?: string; // Email from Firebase Auth
  usernameChanged: boolean; // Tracks if username can still be changed
  // Password is NOT stored here; it's managed by Firebase Auth service
  createdAt?: any; // Firestore serverTimestamp
}
