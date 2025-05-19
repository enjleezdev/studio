

export interface Warehouse {
  id: string;
  name: string;
  description?: string;
}

export interface Item {
  id: string;
  warehouseId: string;
  name: string;
  quantity: number;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
  history: HistoryEntry[]; 
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
  id: string; // e.g., itemID-timestamp
  warehouseId: string;
  warehouseName: string;
  itemId: string;
  itemName: string;
  printedBy: string; // User who printed
  printedAt: string; // ISO string date of printing
  historySnapshot: HistoryEntry[]; // A snapshot of the item's history at the time of printing
}
    
