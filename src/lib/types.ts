
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
}

export type HistoryEntryType = 'CREATE_ITEM' | 'ADD_STOCK' | 'CONSUME_STOCK' | 'ADJUST_STOCK' | 'CREATE_WAREHOUSE' | 'UPDATE_WAREHOUSE' | 'DELETE_WAREHOUSE';

export interface HistoryEntry {
  id: string;
  warehouseId: string;
  warehouseName?: string; // Denormalized
  itemId?: string;        // Optional because warehouse operations don't have itemId
  itemName?: string;      // Denormalized, optional
  change?: number;        // e.g., +5, -3. Optional for warehouse operations.
  quantityBefore?: number; // Optional
  quantityAfter?: number; // Optional
  comment?: string;
  type: HistoryEntryType;
  timestamp: string; // ISO string date
}

    