
'use client';

import * as React from 'react';
import Link from 'next/link';
import ReactDOM from 'react-dom/client';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Package as PackageIcon, Warehouse as WarehouseIcon, Printer, Archive } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import type { Warehouse, Item, HistoryEntry, ArchivedReport } from '@/lib/types';
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
import { PrintableItemReport } from '@/components/PrintableItemReport';

// Helper to format history types - simple space replacement
const formatHistoryType = (type: HistoryEntry['type']): string => {
  return type.replace('_', ' ');
};

export default function ReportsPage() {
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
  const [items, setItems] = React.useState<Item[]>([]); // All items
  const [archivedReports, setArchivedReports] = React.useState<ArchivedReport[]>([]);
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
      const storedArchivedReportsString = localStorage.getItem('archivedReports');
      if (storedArchivedReportsString) {
        setArchivedReports(JSON.parse(storedArchivedReportsString));
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
    setSelectedItemId(null); 
  };

  const handleItemChange = (itemId: string) => {
    setSelectedItemId(itemId);
  };
  
  const renderItemHistoryTable = (history: HistoryEntry[], title: string, currentStock?: number) => {
    if (!history || history.length === 0) {
      return <p className="text-sm text-muted-foreground">No transaction history for this item.</p>;
    }
    const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">
          {title} {currentStock !== undefined ? `(Current Stock: ${currentStock})` : ''}
        </h3>
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
                        {formatHistoryType(entry.type)}
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
      </div>
    );
  };

  const handlePrintArchivedReport = (report: ArchivedReport) => {
    const printableArea = document.createElement('div');
    printableArea.id = 'printable-report-area';
    document.body.appendChild(printableArea);

    const root = ReactDOM.createRoot(printableArea);
    // Simulate the Item structure expected by PrintableItemReport
    const itemForPrinting: Item = {
        id: report.itemId,
        name: report.itemName,
        warehouseId: report.warehouseId,
        quantity: report.historySnapshot.length > 0 ? report.historySnapshot[0].quantityAfter : 0, // Best guess for current quantity
        createdAt: report.historySnapshot.length > 0 ? report.historySnapshot[report.historySnapshot.length -1].timestamp : report.printedAt,
        updatedAt: report.historySnapshot.length > 0 ? report.historySnapshot[0].timestamp : report.printedAt,
        history: report.historySnapshot,
    };

    root.render(
      <PrintableItemReport
        warehouseName={report.warehouseName}
        item={itemForPrinting} 
        printedBy={report.printedBy}
        printDate={new Date(report.printedAt)}
      />
    );

    setTimeout(() => {
      window.print();
      root.unmount();
      if (document.body.contains(printableArea)) {
        document.body.removeChild(printableArea);
      }
    }, 100);
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
              renderItemHistoryTable(selectedItem.history, `History for: ${selectedItem.name}`, selectedItem.quantity)
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

        <Card>
          <CardHeader>
            <CardTitle>Archived Printed Reports</CardTitle>
            <CardDescription>View and re-print previously generated reports.</CardDescription>
          </CardHeader>
          <CardContent>
            {archivedReports.length === 0 ? (
              <EmptyState
                IconComponent={Archive}
                title="No Archived Reports"
                description="Reports you print will be archived here for future reference."
              />
            ) : (
              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Printed By</TableHead>
                      <TableHead>Printed At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedReports.sort((a,b) => new Date(b.printedAt).getTime() - new Date(a.printedAt).getTime()).map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.itemName}</TableCell>
                        <TableCell>{report.warehouseName}</TableCell>
                        <TableCell>{report.printedBy}</TableCell>
                        <TableCell className="text-xs">{format(new Date(report.printedAt), 'PPpp')}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handlePrintArchivedReport(report)}>
                            <Printer className="mr-2 h-3 w-3" /> Re-print
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
