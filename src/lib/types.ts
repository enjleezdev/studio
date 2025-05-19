
export interface Warehouse {
  id: string;
  name: string;
  description?: string;
  isArchived?: boolean; // Added for soft delete
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}

export interface Item {
  id: string;
  warehouseId: string;
  name: string;
  quantity: number;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
  history: HistoryEntry[];
  isArchived?: boolean; // Added for soft delete
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
  id: string; // e.g., itemID-timestamp or warehouseID-timestamp
  reportType: 'ITEM' | 'WAREHOUSE';
  warehouseId: string;
  warehouseName: string;
  itemId?: string; // Optional, only for item reports
  itemName?: string; // Optional, only for item reports
  printedBy: string; // User who printed
  printedAt: string; // ISO string date of printing
  historySnapshot?: HistoryEntry[]; // Optional, only for item reports
  itemsSnapshot?: { name: string; quantity: number }[]; // Optional, only for warehouse reports
}
