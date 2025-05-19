
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PackagePlus, PackageSearch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface StoredWarehouse {
  id: string;
  name: string;
  description?: string;
}

// TODO: Define Item interface later when implementing item management
// interface Item {
//   id: string;
//   name: string;
//   quantity: number;
//   // ... other item properties
// }

export default function WarehouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const warehouseId = params.warehouseId as string;

  const [warehouse, setWarehouse] = React.useState<StoredWarehouse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  // const [items, setItems] = React.useState<Item[]>([]); // For future item display

  React.useEffect(() => {
    if (warehouseId) {
      setIsLoading(true);
      try {
        const storedWarehousesString = localStorage.getItem('warehouses');
        if (storedWarehousesString) {
          const storedWarehouses: StoredWarehouse[] = JSON.parse(storedWarehousesString);
          const foundWarehouse = storedWarehouses.find(wh => wh.id === warehouseId);
          if (foundWarehouse) {
            setWarehouse(foundWarehouse);
          } else {
            toast({ title: "Error", description: "Warehouse not found.", variant: "destructive" });
            router.push('/warehouses'); // Redirect if not found
          }
        } else {
           toast({ title: "Error", description: "No warehouses found in storage.", variant: "destructive" });
           router.push('/warehouses');
        }
      } catch (error) {
        console.error("Failed to load warehouse from localStorage", error);
        toast({ title: "Error", description: "Failed to load warehouse data.", variant: "destructive" });
        router.push('/warehouses');
      } finally {
        setIsLoading(false);
      }
    }
  }, [warehouseId, router, toast]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!warehouse) {
    // This case should ideally be handled by the redirect in useEffect,
    // but it's good practice to have a fallback.
    return (
       <div className="flex h-full w-full items-center justify-center">
         <p>Warehouse not found or an error occurred.</p>
       </div>
    );
  }

  return (
    <>
      <PageHeader
        title={warehouse.name}
        description={warehouse.description || "Manage items and details for this warehouse."}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/warehouses">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Warehouses
              </Link>
            </Button>
            {/* Placeholder for Add Item button */}
            <Button onClick={() => alert('Add item functionality coming soon!')}>
              <PackagePlus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        }
      />
      
      {/* Item listing section - Placeholder for now */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>All items currently stored in {warehouse.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Replace with actual item list or table later */}
          <EmptyState
            IconComponent={PackageSearch}
            title="No Items Yet"
            description="Start by adding the first item to this warehouse."
            action={{
              label: "Add Item",
              onClick: () => alert('Add item functionality coming soon!'),
              icon: PackagePlus,
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
