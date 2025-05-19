
'use client';

import * as React from 'react';
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Home, Edit, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Warehouse, Item } from '@/lib/types';

// Updated AppLogoAndBrand component
const AppLogoAndBrand = () => (
  <div className="flex flex-col items-center mb-8 text-center">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-primary mb-3">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
    <h1 className="text-3xl font-semibold text-primary">Flowgistic Pilot</h1>
    <p className="text-sm text-muted-foreground mt-1">
      powered by{' '}
      <a
        href="https://www.enjleez.tech/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 underline"
      >
        ENJLEEZ TECH
      </a>
    </p>
  </div>
);

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
  const [selectedWarehouseForArchive, setSelectedWarehouseForArchive] = React.useState<Warehouse | null>(null);
  const { toast } = useToast();

  const loadWarehouses = React.useCallback(() => {
    try {
      const storedWarehousesString = localStorage.getItem('warehouses');
      if (storedWarehousesString) {
        const allStoredWarehouses: Warehouse[] = JSON.parse(storedWarehousesString);
        const activeWarehouses = allStoredWarehouses.filter(wh => !wh.isArchived);
        setWarehouses(activeWarehouses);
      }
    } catch (error) {
      console.error("Failed to load warehouses from localStorage", error);
      toast({ title: "Error", description: "Failed to load warehouses.", variant: "destructive" });
    }
  }, [toast]);

  React.useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  const handleArchiveWarehouse = () => {
    if (!selectedWarehouseForArchive) return;

    try {
      const existingWarehousesString = localStorage.getItem('warehouses');
      let allWarehouses: Warehouse[] = existingWarehousesString ? JSON.parse(existingWarehousesString) : [];
      
      const warehouseIndex = allWarehouses.findIndex(wh => wh.id === selectedWarehouseForArchive.id);
      if (warehouseIndex > -1) {
        allWarehouses[warehouseIndex] = { ...allWarehouses[warehouseIndex], isArchived: true };
        localStorage.setItem('warehouses', JSON.stringify(allWarehouses));
        
        const existingItemsString = localStorage.getItem('items');
        if (existingItemsString) {
            let existingItems: Item[] = JSON.parse(existingItemsString);
            existingItems = existingItems.map((item) => {
                if (item.warehouseId === selectedWarehouseForArchive.id) {
                    return { ...item, isArchived: true, updatedAt: new Date().toISOString() };
                }
                return item;
            });
            localStorage.setItem('items', JSON.stringify(existingItems));
        }

        toast({ title: "Warehouse Archived", description: `${selectedWarehouseForArchive.name} and its items have been moved to the archive.` });
        setSelectedWarehouseForArchive(null);
        loadWarehouses(); 
      } else {
        toast({ title: "Error", description: "Warehouse not found for archiving.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to archive warehouse in localStorage", error);
      toast({ title: "Error", description: "Failed to archive warehouse.", variant: "destructive" });
    }
  };

  return (
    <AlertDialog open={!!selectedWarehouseForArchive} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setSelectedWarehouseForArchive(null);
      }
    }}>
      <AppLogoAndBrand />
      <PageHeader
        title="Warehouses"
        description="Manage all your storage locations from here."
        actions={
          <Button asChild>
            <Link href="/warehouses/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Warehouse
            </Link>
          </Button>
        }
      />
      {warehouses.length === 0 ? (
        <EmptyState
          IconComponent={Home}
          title="No Active Warehouses Yet"
          description="Get started by adding your first warehouse or check the archive."
          action={{
            label: "Add Warehouse",
            href: "/warehouses/new",
            icon: PlusCircle,
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {warehouses.map((warehouse) => (
            <Card key={warehouse.id} className="flex flex-col">
              <Link href={`/warehouses/${warehouse.id}`} className="flex flex-col flex-grow hover:bg-muted/50 transition-colors rounded-t-lg">
                <CardHeader className="flex-grow">
                  <div className="flex items-center justify-between">
                    <CardTitle>{warehouse.name}</CardTitle>
                    <Home className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {warehouse.description && (
                    <CardDescription className="mt-1 text-sm text-muted-foreground line-clamp-2">{warehouse.description}</CardDescription>
                  )}
                </CardHeader>
              </Link>
              <div className="flex items-center justify-end gap-2 p-4 pt-0 border-t mt-auto">
                <Button variant="ghost" size="icon" onClick={() => alert(`Editing ${warehouse.name} - coming soon!`)} aria-label={`Edit ${warehouse.name}`}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setSelectedWarehouseForArchive(warehouse)} aria-label={`Archive ${warehouse.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {selectedWarehouseForArchive && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive "{selectedWarehouseForArchive.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will move the warehouse and all its items to the archive. You can restore them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedWarehouseForArchive(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveWarehouse} className="bg-destructive hover:bg-destructive/90">
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}

