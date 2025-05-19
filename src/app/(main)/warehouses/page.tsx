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

interface StoredWarehouse {
  id: string;
  name: string;
  description?: string;
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = React.useState<StoredWarehouse[]>([]);
  const [selectedWarehouseForDelete, setSelectedWarehouseForDelete] = React.useState<StoredWarehouse | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    try {
      const storedWarehousesString = localStorage.getItem('warehouses');
      if (storedWarehousesString) {
        const storedWarehouses: StoredWarehouse[] = JSON.parse(storedWarehousesString);
        setWarehouses(storedWarehouses);
      }
    } catch (error) {
      console.error("Failed to load warehouses from localStorage", error);
      toast({ title: "Error", description: "Failed to load warehouses.", variant: "destructive" });
    }
  }, [toast]);

  const handleDeleteWarehouse = () => {
    if (!selectedWarehouseForDelete) return;

    try {
      const updatedWarehouses = warehouses.filter(wh => wh.id !== selectedWarehouseForDelete.id);
      localStorage.setItem('warehouses', JSON.stringify(updatedWarehouses));
      setWarehouses(updatedWarehouses);
      toast({ title: "Warehouse Deleted", description: `${selectedWarehouseForDelete.name} has been deleted.` });
      setSelectedWarehouseForDelete(null); // Close dialog by resetting state
    } catch (error) {
      console.error("Failed to delete warehouse from localStorage", error);
      toast({ title: "Error", description: "Failed to delete warehouse.", variant: "destructive" });
    }
  };

  return (
    <AlertDialog open={!!selectedWarehouseForDelete} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setSelectedWarehouseForDelete(null);
      }
    }}>
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
          title="No Warehouses Yet"
          description="Get started by adding your first warehouse."
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
              <CardHeader className="flex-grow">
                <div className="flex items-center justify-between">
                  <CardTitle>{warehouse.name}</CardTitle>
                  <Home className="h-5 w-5 text-muted-foreground" />
                </div>
                {warehouse.description && (
                  <CardDescription className="mt-1 text-sm text-muted-foreground">{warehouse.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Items: 0 
                </p>
              </CardContent>
              <div className="flex items-center justify-end gap-2 p-4 pt-0 border-t mt-auto">
                <Button variant="ghost" size="icon" onClick={() => alert(`Edit ${warehouse.name} - coming soon!`)} aria-label={`Edit ${warehouse.name}`}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setSelectedWarehouseForDelete(warehouse)} aria-label={`Delete ${warehouse.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {selectedWarehouseForDelete && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete &quot;{selectedWarehouseForDelete.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the warehouse and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedWarehouseForDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWarehouse} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
