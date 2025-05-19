
export interface Warehouse {
  id: string;
  name: string;
  description?: string;
  // createdAt: string; // ISO string date - Already exists from previous warehouse implementation
}

export interface Item {
  id: string;
  warehouseId: string;
  name: string;
  quantity: number;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
  history: HistoryEntry[]; // Added history tracking
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
  id: string; // Unique ID for the history entry
  // warehouseId: string; // Redundant if history is part of Item, but useful for a global history log
  // warehouseName?: string; // Denormalized
  // itemId?: string;        // Redundant if history is part of Item
  // itemName?: string;      // Denormalized, optional
  type: HistoryEntryType;
  change: number;        // e.g., +5, -3. For CREATE_ITEM, this is the initial quantity.
  quantityBefore: number; 
  quantityAfter: number; 
  comment?: string;
  timestamp: string; // ISO string date
}

    
