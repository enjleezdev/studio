
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
      setAllWarehouses(allWhs);
      setArchivedWarehouses(allWhs.filter(wh => wh.isArchived).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));

      const storedItemsString = localStorage.getItem('items');
      const allIts: Item[] = storedItemsString ? JSON.parse(storedItemsString) : [];
      setArchivedItems(allIts.filter(item => item.isArchived).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));

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
          updatedAt: new Date().toISOString(),
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

        if (parentWarehouseId) {
          updateWarehouseTimestamp(parentWarehouseId);
        }
        
        setArchivedItems(prevItems => prevItems.filter(i => i.id !== itemId));
        // loadArchivedData(); // Might not be needed if setArchivedItems is sufficient for UI update
      } else {
        toast({ title: "Error", description: "Item not found for restoring.", variant: "destructive" });
      }
    } catch (error)
{
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
        <Card className="overflow-hidden">
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
                <table className="text-xs border-collapse"> {/* REMOVED min-w-full */}
                  <thead className="sticky top-0 bg-background/90 dark:bg-card/80 backdrop-blur-sm z-10">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground break-words">Name</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground break-words">Description</th>
                      <th className="py-3 px-4 text-right font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedWarehouses.map((wh) => (
                      <tr key={wh.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10 dark:hover:bg-muted/5">
                        <td className="py-3 px-4 font-medium break-words">{wh.name}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground break-words">{wh.description || 'N/A'}</td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Button variant="outline" size="sm" onClick={() => handleRestoreWarehouse(wh.id)}>
                            <RotateCcw className="mr-2 h-3 w-3" /> Restore
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
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
                <table className="text-xs border-collapse"> {/* REMOVED min-w-full */}
                  <thead className="sticky top-0 bg-background/90 dark:bg-card/80 backdrop-blur-sm z-10">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground break-words">Name</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground break-words">Warehouse</th>
                      <th className="py-3 px-4 text-right font-medium text-muted-foreground whitespace-nowrap">Quantity</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground whitespace-nowrap">Archived On</th>
                      <th className="py-3 px-4 text-right font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedItems.map((item) => (
                      <tr key={item.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10 dark:hover:bg-muted/5">
                        <td className="py-3 px-4 font-medium break-words">{item.name}</td>
                        <td className="py-3 px-4 break-words">{getWarehouseName(item.warehouseId)}</td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">{item.quantity}</td>
                        <td className="py-3 px-4 text-xs whitespace-nowrap">
                          {item.updatedAt ? format(new Date(item.updatedAt), 'P p') : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Button variant="outline" size="sm" onClick={() => handleRestoreItem(item.id)}>
                            <RotateCcw className="mr-2 h-3 w-3" /> Restore
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
