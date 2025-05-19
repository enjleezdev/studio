
'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, AlertTriangle, Warehouse as WarehouseIcon, Package as PackageIcon, History as HistoryIcon } from "lucide-react"; // Added PackageIcon and HistoryIcon
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import type { Warehouse, Item, HistoryEntry } from '@/lib/types';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ReportsPage() {
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
  const [items, setItems] = React.useState<Item[]>([]); // All items
  const [selectedWarehouseId, setSelectedWarehouseId] = React.useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const selectedWarehouse = warehouses.find(wh => wh.id === selectedWarehouseId);
  const itemsInSelectedWarehouse = selectedWarehouseId 
    ? items.filter(item => item.warehouseId === selectedWarehouseId) 
    : [];
  const selectedItem = itemsInSelectedWarehouse.find(item => item.id === selectedItemId);

  React.useEffect(() => {
    setIsLoading(true);
    try {
      const storedWarehousesString = localStorage.getItem('warehouses');
      if (storedWarehousesString) {
        setWarehouses(JSON.parse(storedWarehousesString));
      }
      const storedItemsString = localStorage.getItem('items');
      if (storedItemsString) {
        setItems(JSON.parse(storedItemsString));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({ title: "Error", description: "Failed to load report data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleWarehouseChange = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    setSelectedItemId(null); // Reset item selection when warehouse changes
  };

  const handleItemChange = (itemId: string) => {
    setSelectedItemId(itemId);
  };
  
  const renderItemHistoryTable = (history: HistoryEntry[]) => {
    if (!history || history.length === 0) {
      return <p className="text-sm text-muted-foreground">No transaction history for this item.</p>;
    }

    // Sort history by timestamp, newest first
    const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
      <ScrollArea className="h-[400px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead className="text-right">Before</TableHead>
              <TableHead className="text-right">After</TableHead>
              <TableHead>Comment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedHistory.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-xs">{format(new Date(entry.timestamp), 'PPpp')}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                      entry.type === 'CREATE_ITEM' ? 'bg-blue-100 text-blue-700' :
                      entry.type === 'ADD_STOCK' ? 'bg-green-100 text-green-700' :
                      entry.type === 'CONSUME_STOCK' ? 'bg-red-100 text-red-700' :
                      entry.type === 'ADJUST_STOCK' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                  }`}>
                      {entry.type.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell className={`text-right font-medium ${entry.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.change > 0 ? `+${entry.change}` : entry.change}
                </TableCell>
                <TableCell className="text-right">{entry.quantityBefore}</TableCell>
                <TableCell className="text-right font-semibold">{entry.quantityAfter}</TableCell>
                <TableCell className="text-xs">{entry.comment}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  };


  if (isLoading) {
    return <LoadingSpinner className="mx-auto my-10" size={48} />;
  }

  return (
    <>
      <PageHeader
        title="Inventory Reports"
        description="View transaction history and stock levels."
      />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Item Transaction History (Bank Statement Style)</CardTitle>
            <CardDescription>Select a warehouse and an item to view its detailed transaction log.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="warehouse-select" className="block text-sm font-medium text-foreground mb-1">
                  Select Warehouse
                </label>
                <Select onValueChange={handleWarehouseChange} value={selectedWarehouseId || undefined}>
                  <SelectTrigger id="warehouse-select" className="w-full">
                    <SelectValue placeholder="Choose a warehouse..." />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.length > 0 ? (
                      warehouses.map(wh => (
                        <SelectItem key={wh.id} value={wh.id}>
                          {wh.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-sm text-muted-foreground">No warehouses available.</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="item-select" className="block text-sm font-medium text-foreground mb-1">
                  Select Item
                </label>
                <Select onValueChange={handleItemChange} value={selectedItemId || undefined} disabled={!selectedWarehouseId || itemsInSelectedWarehouse.length === 0}>
                  <SelectTrigger id="item-select" className="w-full">
                    <SelectValue placeholder={!selectedWarehouseId ? "Select a warehouse first" : itemsInSelectedWarehouse.length === 0 ? "No items in this warehouse" : "Choose an item..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {itemsInSelectedWarehouse.length > 0 ? (
                      itemsInSelectedWarehouse.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} (Qty: {item.quantity})
                        </SelectItem>
                      ))
                    ) : (
                       <div className="p-4 text-sm text-muted-foreground">{selectedWarehouseId ? "No items in this warehouse." : "Please select a warehouse first."}</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedItem ? (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">
                  History for: {selectedItem.name} (Current Stock: {selectedItem.quantity})
                </h3>
                {renderItemHistoryTable(selectedItem.history)}
              </div>
            ) : selectedWarehouseId ? (
              <EmptyState
                IconComponent={PackageIcon}
                title="Select an Item"
                description="Please select an item from the dropdown above to view its transaction history."
              />
            ) : (
               <EmptyState
                IconComponent={WarehouseIcon}
                title="Select a Warehouse"
                description="Please select a warehouse to begin viewing item reports."
              />
            )}
          </CardContent>
        </Card>

        {/* Placeholder for other report types */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Overall Stock Levels (Coming Soon)</CardTitle>
            <CardDescription>Summary of stock across all warehouses.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              IconComponent={BarChart3}
              title="Feature Under Development"
              description="This report type will be available in a future update."
            />
          </CardContent>
        </Card> */}
      </div>
    </>
  );
}
