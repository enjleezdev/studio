
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, PackagePlus, PackageSearch, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Item, Warehouse } from '@/lib/types';

// Zod schema for item form validation
const itemFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Item name must be at least 2 characters.',
  }),
  quantity: z.coerce // Ensures the input string is converted to a number
    .number({ invalid_type_error: 'Quantity must be a number.' })
    .int('Quantity must be a whole number.')
    .positive({ message: 'Quantity must be a positive number.' }),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

export default function WarehouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const warehouseId = params.warehouseId as string;

  const [warehouse, setWarehouse] = React.useState<Warehouse | null>(null);
  const [items, setItems] = React.useState<Item[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = React.useState(false);

  const itemForm = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: '',
      quantity: 1,
    },
  });

  const loadWarehouseAndItems = React.useCallback(() => {
    setIsLoading(true);
    try {
      // Load warehouse
      const storedWarehousesString = localStorage.getItem('warehouses');
      if (storedWarehousesString) {
        const storedWarehouses: Warehouse[] = JSON.parse(storedWarehousesString);
        const foundWarehouse = storedWarehouses.find(wh => wh.id === warehouseId);
        if (foundWarehouse) {
          setWarehouse(foundWarehouse);
        } else {
          toast({ title: "Error", description: "Warehouse not found.", variant: "destructive" });
          router.push('/warehouses');
          return;
        }
      } else {
         toast({ title: "Error", description: "No warehouses found in storage.", variant: "destructive" });
         router.push('/warehouses');
         return;
      }

      // Load items for this warehouse
      const storedItemsString = localStorage.getItem('items');
      if (storedItemsString) {
        const allItems: Item[] = JSON.parse(storedItemsString);
        const warehouseItems = allItems.filter(item => item.warehouseId === warehouseId);
        setItems(warehouseItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({ title: "Error", description: "Failed to load data.", variant: "destructive" });
      // Potentially redirect if warehouse loading failed and not caught above
      if (!warehouse) router.push('/warehouses');
    } finally {
      setIsLoading(false);
    }
  }, [warehouseId, router, toast, warehouse]); // Added warehouse to dependency array

  React.useEffect(() => {
    if (warehouseId) {
      loadWarehouseAndItems();
    }
  }, [warehouseId, loadWarehouseAndItems]);


  function onItemSubmit(data: ItemFormValues) {
    if (!warehouseId) return;

    const newItem: Item = {
      id: Date.now().toString(),
      warehouseId: warehouseId,
      name: data.name,
      quantity: data.quantity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const existingItemsString = localStorage.getItem('items');
      const existingItems: Item[] = existingItemsString ? JSON.parse(existingItemsString) : [];
      existingItems.push(newItem);
      localStorage.setItem('items', JSON.stringify(existingItems));
      
      toast({ title: "Item Added", description: `${newItem.name} has been added to ${warehouse?.name}.` });
      setIsAddItemDialogOpen(false); // Close dialog
      itemForm.reset(); // Reset form
      loadWarehouseAndItems(); // Refresh item list
    } catch (error) {
      console.error("Failed to save item to localStorage", error);
      toast({ title: "Error", description: "Failed to save item. Please try again.", variant: "destructive" });
    }
  }

  if (isLoading) {
    return <LoadingSpinner className="mx-auto my-10" size={48} />;
  }

  if (!warehouse) {
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
            <Button onClick={() => setIsAddItemDialogOpen(true)}>
              <PackagePlus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        }
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>All items currently stored in {warehouse.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState
              IconComponent={PackageSearch}
              title="No Items Yet"
              description="Start by adding the first item to this warehouse."
              action={{
                label: "Add Item",
                onClick: () => setIsAddItemDialogOpen(true),
                icon: PackagePlus,
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => alert(`Edit ${item.name} - coming soon!`)} aria-label={`Edit ${item.name}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => alert(`Delete ${item.name} - coming soon!`)} aria-label={`Delete ${item.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Item to {warehouse.name}</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new item to this warehouse.
            </DialogDescription>
          </DialogHeader>
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit(onItemSubmit)} className="space-y-4 py-4">
              <FormField
                control={itemForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Blue Widgets" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={itemForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Item</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

    