
'use client';

import * as React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Warehouse as WarehouseIcon, RotateCcw } from 'lucide-react';
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

const updateWarehouseTimestamp = (currentWarehouseId: string) => {
  try {
    const storedWarehousesString = localStorage.getItem('warehouses');
    if (storedWarehousesString) {
      let warehouses: Warehouse[] = JSON.parse(storedWarehousesString);
      const warehouseIndex = warehouses.findIndex(wh => wh.id === currentWarehouseId);
      if (warehouseIndex > -1) {
        warehouses[warehouseIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('warehouses', JSON.stringify(warehouses));
      }
    }
  } catch (error) {
    console.error("Failed to update warehouse timestamp in localStorage", error);
  }
};


export default function ArchivePage() {
  const { toast } = useToast();
  const [archivedWarehouses, setArchivedWarehouses] = React.useState<Warehouse[]>([]);
  const [allWarehouses, setAllWarehouses] = React.useState<Warehouse[]>([]);
  const [archivedItems, setArchivedItems] = React.useState<Item[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadArchivedData = React.useCallback(() => {
    setIsLoading(true);
    try {
      const storedWarehousesString = localStorage.getItem('warehouses');
      const allWhs: Warehouse[] = storedWarehousesString ? JSON.parse(storedWarehousesString) : [];
      setAllWarehouses(allWhs); // Keep all warehouses for name lookup
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

  const handleRestoreWarehouse = (warehouseId: string) => {
    try {
      const existingWarehousesString = localStorage.getItem('warehouses');
      let currentAllWarehouses: Warehouse[] = existingWarehousesString ? JSON.parse(existingWarehousesString) : [];
      let restoredWarehouseName = "The warehouse";

      const warehouseIndex = currentAllWarehouses.findIndex(wh => wh.id === warehouseId);
      if (warehouseIndex > -1) {
        restoredWarehouseName = currentAllWarehouses[warehouseIndex].name;
        currentAllWarehouses[warehouseIndex] = {
          ...currentAllWarehouses[warehouseIndex],
          isArchived: false,
          updatedAt: new Date().toISOString(), // Update timestamp on restore
        };
        localStorage.setItem('warehouses', JSON.stringify(currentAllWarehouses));
        
        toast({ title: "Warehouse Restored", description: `${restoredWarehouseName} has been restored.` });
        
        loadArchivedData(); 
      } else {
        toast({ title: "Error", description: "Warehouse not found for restoring.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to restore warehouse from localStorage", error);
      toast({ title: "Error", description: "Failed to restore warehouse.", variant: "destructive" });
    }
  };

  const handleRestoreItem = (itemId: string) => {
    try {
      const existingItemsString = localStorage.getItem('items');
      let allItems: Item[] = existingItemsString ? JSON.parse(existingItemsString) : [];
      let restoredItemName = "The item";
      let parentWarehouseId = "";
      
      const itemIndex = allItems.findIndex(i => i.id === itemId);
      if (itemIndex > -1) {
        restoredItemName = allItems[itemIndex].name;
        parentWarehouseId = allItems[itemIndex].warehouseId;
        allItems[itemIndex] = { 
          ...allItems[itemIndex], 
          isArchived: false, 
          updatedAt: new Date().toISOString() 
        };
        localStorage.setItem('items', JSON.stringify(allItems));
        
        toast({ title: "Item Restored", description: `${restoredItemName} has been restored.` });
        
        // Update parent warehouse timestamp
        if (parentWarehouseId) {
          updateWarehouseTimestamp(parentWarehouseId);
        }
        
        loadArchivedData(); 
      } else {
        toast({ title: "Error", description: "Item not found for restoring.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to restore item from localStorage", error);
      toast({ title: "Error", description: "Failed to restore item.", variant: "destructive" });
    }
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
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="break-words">Name</TableHead>
                      <TableHead className="break-words">Description</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedWarehouses.map((wh) => (
                      <TableRow key={wh.id}>
                        <TableCell className="font-medium break-words">{wh.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground break-words">{wh.description || 'N/A'}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button variant="outline" size="sm" onClick={() => handleRestoreWarehouse(wh.id)}>
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
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Table> 
                  <TableHeader>
                    <TableRow>
                      <TableHead className="break-words">Name</TableHead>
                      <TableHead className="break-words">Warehouse</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Quantity</TableHead>
                      <TableHead className="whitespace-nowrap">Archived On</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium break-words">{item.name}</TableCell>
                        <TableCell className="break-words">{getWarehouseName(item.warehouseId)}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">{item.quantity}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          {item.updatedAt ? format(new Date(item.updatedAt), 'P p') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button variant="outline" size="sm" onClick={() => handleRestoreItem(item.id)}>
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
