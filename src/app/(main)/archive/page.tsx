
'use client';

import * as React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArchiveRestore, Package, Warehouse as WarehouseIcon, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Warehouse, Item } from '@/lib/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';

export default function ArchivePage() {
  const { toast } = useToast();
  const [archivedWarehouses, setArchivedWarehouses] = React.useState<Warehouse[]>([]);
  const [allWarehouses, setAllWarehouses] = React.useState<Warehouse[]>([]); // To find warehouse names
  const [archivedItems, setArchivedItems] = React.useState<Item[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadArchivedData = React.useCallback(() => {
    setIsLoading(true);
    try {
      const storedWarehousesString = localStorage.getItem('warehouses');
      const allWhs: Warehouse[] = storedWarehousesString ? JSON.parse(storedWarehousesString) : [];
      setAllWarehouses(allWhs);
      setArchivedWarehouses(allWhs.filter(wh => wh.isArchived));

      const storedItemsString = localStorage.getItem('items');
      const allIts: Item[] = storedItemsString ? JSON.parse(storedItemsString) : [];
      setArchivedItems(allIts.filter(item => item.isArchived));

    } catch (error) {
      console.error("Failed to load archived data from localStorage", error);
      toast({ title: "Error", description: "Failed to load archived data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadArchivedData();
  }, [loadArchivedData]);

  const getWarehouseName = (warehouseId: string): string => {
    const warehouse = allWarehouses.find(wh => wh.id === warehouseId);
    return warehouse ? warehouse.name : "Unknown Warehouse";
  };

  // Placeholder for future restore functionality
  const handleRestoreWarehouse = (warehouseId: string) => {
    toast({ title: "Info", description: `Restore warehouse ${warehouseId} - coming soon!`});
  };

  const handleRestoreItem = (itemId: string) => {
     toast({ title: "Info", description: `Restore item ${itemId} - coming soon!`});
  };


  if (isLoading) {
    return <LoadingSpinner className="mx-auto my-10" size={48} />;
  }

  return (
    <>
      <PageHeader
        title="Archive"
        description="View and manage archived warehouses and items."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Archived Warehouses</CardTitle>
            <CardDescription>Warehouses that have been moved to the archive.</CardDescription>
          </CardHeader>
          <CardContent>
            {archivedWarehouses.length === 0 ? (
              <EmptyState
                IconComponent={WarehouseIcon}
                title="No Archived Warehouses"
                description="Warehouses you archive will appear here."
              />
            ) : (
              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedWarehouses.map((wh) => (
                      <TableRow key={wh.id}>
                        <TableCell className="font-medium">{wh.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{wh.description || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleRestoreWarehouse(wh.id)} disabled>
                            <RotateCcw className="mr-2 h-3 w-3" /> Restore
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

        <Card>
          <CardHeader>
            <CardTitle>Archived Items</CardTitle>
            <CardDescription>Items that have been moved to the archive.</CardDescription>
          </CardHeader>
          <CardContent>
            {archivedItems.length === 0 ? (
              <EmptyState
                IconComponent={Package}
                title="No Archived Items"
                description="Items you archive will appear here."
              />
            ) : (
              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                       <TableHead>Archived On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{getWarehouseName(item.warehouseId)}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-xs">{item.updatedAt ? format(new Date(item.updatedAt), 'PPpp') : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleRestoreItem(item.id)} disabled>
                            <RotateCcw className="mr-2 h-3 w-3" /> Restore
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
