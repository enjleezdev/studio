
'use client';

import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Archive, Package as PackageIcon, Warehouse as WarehouseIcon } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import type { Warehouse, Item, HistoryEntry, ArchivedReport } from '@/lib/types';
import { format } from 'date-fns';
// Removed arSA import as we are reverting to LTR/English
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
import { PrintableWarehouseReport } from '@/components/PrintableWarehouseReport';

// Augmented history entry type for the consolidated log
interface FlattenedHistoryEntry extends HistoryEntry {
  itemName: string;
  warehouseName: string;
  itemId: string; // To help with item filtering
  warehouseId: string; // To help with warehouse filtering
}

const formatHistoryType = (type: HistoryEntry['type']): string => {
  switch (type) {
    case 'CREATE_ITEM': return 'Item Created';
    case 'ADD_STOCK': return 'Stock Added';
    case 'CONSUME_STOCK': return 'Stock Consumed';
    case 'ADJUST_STOCK': return 'Stock Adjusted';
    default: return type.replace(/_/g, ' ');
  }
};

export default function ReportsPage() {
  const [allWarehouses, setAllWarehouses] = React.useState<Warehouse[]>([]);
  const [allItems, setAllItems] = React.useState<Item[]>([]);
  const [archivedReports, setArchivedReports] = React.useState<ArchivedReport[]>([]);
  
  const [allFlattenedTransactions, setAllFlattenedTransactions] = React.useState<FlattenedHistoryEntry[]>([]);
  const [filteredTransactions, setFilteredTransactions] = React.useState<FlattenedHistoryEntry[]>([]);

  const [selectedWarehouseId, setSelectedWarehouseId] = React.useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const itemsInSelectedWarehouse = selectedWarehouseId
    ? allItems.filter(item => item.warehouseId === selectedWarehouseId && !item.isArchived)
    : [];

  React.useEffect(() => {
    setIsLoading(true);
    try {
      const storedWarehousesString = localStorage.getItem('warehouses');
      const activeWarehouses: Warehouse[] = storedWarehousesString 
        ? JSON.parse(storedWarehousesString).filter((wh: Warehouse) => !wh.isArchived) 
        : [];
      setAllWarehouses(activeWarehouses);

      const storedItemsString = localStorage.getItem('items');
      const activeItems: Item[] = storedItemsString 
        ? JSON.parse(storedItemsString).filter((item: Item) => !item.isArchived)
        : [];
      setAllItems(activeItems);

      const flattened: FlattenedHistoryEntry[] = [];
      activeItems.forEach(item => {
        const warehouse = activeWarehouses.find(wh => wh.id === item.warehouseId);
        if (item.history && warehouse) {
          item.history.forEach(entry => {
            flattened.push({
              ...entry,
              itemName: item.name,
              itemId: item.id,
              warehouseName: warehouse.name,
              warehouseId: warehouse.id,
            });
          });
        }
      });
      
      flattened.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setAllFlattenedTransactions(flattened);
      setFilteredTransactions(flattened); // Initially show all

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

  React.useEffect(() => {
    let transactions = allFlattenedTransactions;
    if (selectedWarehouseId) {
      transactions = transactions.filter(t => t.warehouseId === selectedWarehouseId);
      if (selectedItemId) {
        transactions = transactions.filter(t => t.itemId === selectedItemId);
      }
    }
    setFilteredTransactions(transactions);
  }, [selectedWarehouseId, selectedItemId, allFlattenedTransactions]);

  const handleWarehouseChange = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    setSelectedItemId(null); // Reset item selection when warehouse changes
  };

  const handleItemChange = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const renderTransactionsTable = () => {
    if (filteredTransactions.length === 0 && !isLoading) {
      return (
        <EmptyState 
            IconComponent={PackageIcon}
            title="No Transactions Found"
            description="No transactions match your current selection, or no transactions have been recorded yet."
        />
      );
    }

    let tableTitle = "All Transactions";
    if (selectedWarehouseId) {
      const wh = allWarehouses.find(w => w.id === selectedWarehouseId);
      tableTitle = `Transactions for ${wh?.name || 'Selected Warehouse'}`;
      if (selectedItemId) {
        const item = allItems.find(i => i.id === selectedItemId);
        tableTitle = `Transactions for ${item?.name || 'Selected Item'} in ${wh?.name || 'Warehouse'}`;
      }
    }


    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">
          {tableTitle}
        </h3>
        <ScrollArea className="h-[400px] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead className="whitespace-nowrap">Item Name</TableHead>
                <TableHead className="whitespace-nowrap">Warehouse</TableHead>
                <TableHead className="whitespace-nowrap">Type</TableHead>
                <TableHead className="text-right whitespace-nowrap">Change</TableHead>
                <TableHead className="text-right whitespace-nowrap">Before</TableHead>
                <TableHead className="text-right whitespace-nowrap">After</TableHead>
                <TableHead className="whitespace-nowrap">Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((entry) => (
                <TableRow key={entry.id + entry.timestamp}>
                  <TableCell className="text-xs whitespace-nowrap">{format(new Date(entry.timestamp), 'P p')}</TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{entry.itemName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{entry.warehouseName}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                        entry.type === 'CREATE_ITEM' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                        entry.type === 'ADD_STOCK' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        entry.type === 'CONSUME_STOCK' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        entry.type === 'ADJUST_STOCK' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                        {formatHistoryType(entry.type)}
                    </span>
                  </TableCell>
                  <TableCell className={`text-right font-medium whitespace-nowrap ${entry.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {entry.change > 0 ? `+${entry.change}` : entry.change}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">{entry.quantityBefore}</TableCell>
                  <TableCell className="text-right font-semibold whitespace-nowrap">{entry.quantityAfter}</TableCell>
                  <TableCell className="text-xs whitespace-normal break-words">{entry.comment}</TableCell>
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

    if (report.reportType === 'ITEM' && report.itemId && report.itemName && report.historySnapshot) {
      const itemForPrinting: Item = {
          id: report.itemId,
          name: report.itemName,
          warehouseId: report.warehouseId,
          quantity: report.historySnapshot.length > 0 ? report.historySnapshot[0].quantityAfter : 0, 
          createdAt: report.historySnapshot.length > 0 ? report.historySnapshot[report.historySnapshot.length -1].timestamp : report.printedAt,
          updatedAt: report.historySnapshot.length > 0 ? report.historySnapshot[0].timestamp : report.printedAt,
          history: report.historySnapshot,
          isArchived: true, 
      };
      root.render(
        <PrintableItemReport
          warehouseName={report.warehouseName}
          item={itemForPrinting}
          printedBy={report.printedBy || "System"}
          printDate={new Date(report.printedAt)}
        />
      );
    } else if (report.reportType === 'WAREHOUSE' && report.itemsSnapshot) {
      const warehouseForPrinting: Warehouse = {
        id: report.warehouseId,
        name: report.warehouseName,
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString(), 
        isArchived: true,
      };
      root.render(
        <PrintableWarehouseReport
          warehouse={warehouseForPrinting}
          items={report.itemsSnapshot}
          printedBy={report.printedBy || "System"}
          printDate={new Date(report.printedAt)}
        />
      );
    } else {
      toast({ title: "Error", description: "Cannot re-print report. Invalid report data.", variant: "destructive"});
      if (document.body.contains(printableArea)) {
        document.body.removeChild(printableArea);
      }
      return;
    }

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        root.unmount();
        if (document.body.contains(printableArea)) {
          document.body.removeChild(printableArea);
        }
      }, 100);
    }, 250);
  };


  if (isLoading && allFlattenedTransactions.length === 0) { // Show spinner only on initial full load
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
            <CardTitle>Transportations</CardTitle>
            {/* Description removed as per previous request */}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="warehouse-select" className="block text-sm font-medium text-foreground mb-1">
                  Select Warehouse
                </label>
                <Select onValueChange={handleWarehouseChange} value={selectedWarehouseId || undefined}>
                  <SelectTrigger id="warehouse-select" className="w-full">
                    <SelectValue placeholder="All Warehouses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_warehouses_option_value_placeholder_for_clear">All Warehouses</SelectItem> 
                    {/* Placeholder, actual clear handled by setting selectedWarehouseId to null or an "all" value */}
                    {allWarehouses.map(wh => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="item-select" className="block text-sm font-medium text-foreground mb-1">
                  Select Item
                </label>
                <Select onValueChange={handleItemChange} value={selectedItemId || undefined} disabled={!selectedWarehouseId || itemsInSelectedWarehouse.length === 0}>
                  <SelectTrigger id="item-select" className="w-full">
                    <SelectValue placeholder={!selectedWarehouseId ? "Select warehouse first" : itemsInSelectedWarehouse.length === 0 ? "No items in this warehouse" : "All Items in Warehouse"} />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all_items_option_value_placeholder_for_clear">All Items in Warehouse</SelectItem>
                     {/* Placeholder for "All Items" */}
                    {itemsInSelectedWarehouse.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} (Qty: {item.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {renderTransactionsTable()}
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
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="break-words">Report For</TableHead>
                      <TableHead className="break-words text-xs">Type</TableHead>
                      <TableHead className="whitespace-nowrap">Printed By</TableHead>
                      <TableHead className="whitespace-nowrap">Printed At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedReports.sort((a,b) => new Date(b.printedAt).getTime() - new Date(a.printedAt).getTime()).map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium break-words">
                          {report.reportType === 'ITEM' ? report.itemName : report.warehouseName}
                          {report.reportType === 'ITEM' && <span className="text-xs text-muted-foreground block"> (in {report.warehouseName})</span>}
                        </TableCell>
                        <TableCell className="break-words text-xs">
                          {report.reportType === 'ITEM' ? 'Item Details' : 'Warehouse Summary'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{report.printedBy}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{format(new Date(report.printedAt), 'P p')}</TableCell>
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

    