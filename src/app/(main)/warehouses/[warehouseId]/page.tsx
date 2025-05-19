
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, PackagePlus, PackageSearch, PlusCircle, MinusCircle, History as HistoryIcon, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Item, Warehouse, HistoryEntry } from '@/lib/types';


const itemFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Item name must be at least 2 characters.',
  }),
  quantity: z.coerce
    .number({ invalid_type_error: 'Quantity must be a number.' })
    .int('Quantity must be a whole number.')
    .positive({ message: 'Quantity must be a positive number.' }),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

const stockAdjustmentFormSchema = z.object({
  adjustmentQuantity: z.coerce
    .number({ invalid_type_error: 'Quantity must be a number.' })
    .int('Quantity must be a whole number.')
    .positive({ message: 'Adjustment quantity must be a positive number.' }),
  comment: z.string().optional(),
});

type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentFormSchema>;


export default function WarehouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const warehouseId = params.warehouseId as string;

  const [warehouse, setWarehouse] = React.useState<Warehouse | null>(null);
  const [items, setItems] = React.useState<Item[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = React.useState(false);
  
  const [isStockAdjustmentDialogOpen, setIsStockAdjustmentDialogOpen] = React.useState(false);
  const [itemForAdjustment, setItemForAdjustment] = React.useState<Item | null>(null);
  const [adjustmentType, setAdjustmentType] = React.useState<'ADD_STOCK' | 'CONSUME_STOCK' | null>(null);
  const [selectedItemForHistory, setSelectedItemForHistory] = React.useState<Item | null>(null);


  const itemForm = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: '',
      quantity: 1,
    },
  });

  const stockAdjustmentForm = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentFormSchema),
    defaultValues: {
      adjustmentQuantity: 1,
      comment: '',
    },
  });

  const loadWarehouseAndItems = React.useCallback(() => {
    setIsLoading(true);
    try {
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

      const storedItemsString = localStorage.getItem('items');
      let allItems: Item[] = [];
      if (storedItemsString) {
        allItems = JSON.parse(storedItemsString);
      }
      
      const warehouseItems = allItems.filter(item => item.warehouseId === warehouseId);
      setItems(warehouseItems);

      if (selectedItemForHistory) {
        const updatedSelectedItem = warehouseItems.find(item => item.id === selectedItemForHistory.id);
        setSelectedItemForHistory(updatedSelectedItem || null);
      }

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({ title: "Error", description: "Failed to load data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [warehouseId, router, toast]); 

  React.useEffect(() => {
    if (warehouseId) {
      loadWarehouseAndItems();
    }
  }, [warehouseId, loadWarehouseAndItems]);


  function onAddItemSubmit(data: ItemFormValues) {
    if (!warehouseId) return;

    const now = new Date().toISOString();
    const initialHistoryEntry: HistoryEntry = {
      id: Date.now().toString() + '-hist-create',
      type: 'CREATE_ITEM',
      change: data.quantity,
      quantityBefore: 0,
      quantityAfter: data.quantity,
      timestamp: now,
      comment: 'Initial item creation',
    };

    const newItem: Item = {
      id: Date.now().toString(),
      warehouseId: warehouseId,
      name: data.name,
      quantity: data.quantity,
      createdAt: now,
      updatedAt: now,
      history: [initialHistoryEntry],
    };

    try {
      const existingItemsString = localStorage.getItem('items');
      const existingItems: Item[] = existingItemsString ? JSON.parse(existingItemsString) : [];
      existingItems.push(newItem);
      localStorage.setItem('items', JSON.stringify(existingItems));
      
      toast({ title: "Item Added", description: `${newItem.name} has been added to ${warehouse?.name}.` });
      setIsAddItemDialogOpen(false); 
      itemForm.reset(); 
      loadWarehouseAndItems(); 
    } catch (error) {
      console.error("Failed to save item to localStorage", error);
      toast({ title: "Error", description: "Failed to save item. Please try again.", variant: "destructive" });
    }
  }

  const handleOpenStockAdjustmentDialog = (item: Item, type: 'ADD_STOCK' | 'CONSUME_STOCK') => {
    setItemForAdjustment(item);
    setAdjustmentType(type);
    stockAdjustmentForm.reset({ adjustmentQuantity: 1, comment: '' });
    setIsStockAdjustmentDialogOpen(true);
  };

  function onStockAdjustmentSubmit(data: StockAdjustmentFormValues) {
    if (!itemForAdjustment || !adjustmentType || !warehouseId) return;

    const quantityChange = adjustmentType === 'ADD_STOCK' ? data.adjustmentQuantity : -data.adjustmentQuantity;
    
    if (adjustmentType === 'CONSUME_STOCK' && itemForAdjustment.quantity < data.adjustmentQuantity) {
      stockAdjustmentForm.setError("adjustmentQuantity", {
        type: "manual",
        message: `Cannot consume more than available stock (${itemForAdjustment.quantity}).`,
      });
      return;
    }

    const now = new Date().toISOString();
    const newHistoryEntry: HistoryEntry = {
      id: Date.now().toString() + '-hist-adjust',
      type: adjustmentType,
      change: quantityChange,
      quantityBefore: itemForAdjustment.quantity,
      quantityAfter: itemForAdjustment.quantity + quantityChange,
      timestamp: now,
      comment: data.comment || (adjustmentType === 'ADD_STOCK' ? 'Stock added' : 'Stock consumed'),
    };

    const updatedItem: Item = {
      ...itemForAdjustment,
      quantity: itemForAdjustment.quantity + quantityChange,
      updatedAt: now,
      history: [...(itemForAdjustment.history || []), newHistoryEntry],
    };

    try {
      const existingItemsString = localStorage.getItem('items');
      const existingItems: Item[] = existingItemsString ? JSON.parse(existingItemsString) : [];
      const itemIndex = existingItems.findIndex(i => i.id === updatedItem.id);

      if (itemIndex > -1) {
        existingItems[itemIndex] = updatedItem;
        localStorage.setItem('items', JSON.stringify(existingItems));
        toast({ title: "Stock Updated", description: `Stock for ${updatedItem.name} has been updated.` });
        setIsStockAdjustmentDialogOpen(false);
        stockAdjustmentForm.reset();
        loadWarehouseAndItems();
      } else {
        toast({ title: "Error", description: "Item not found for update.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update item stock in localStorage", error);
      toast({ title: "Error", description: "Failed to update stock. Please try again.", variant: "destructive" });
    }
  }
  
  const handleShowHistory = (item: Item) => {
    if (selectedItemForHistory?.id === item.id) {
      setSelectedItemForHistory(null); 
    } else {
      setSelectedItemForHistory(item);
    }
  };


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
          <CardDescription>All items currently stored in {warehouse.name}. Click the <HistoryIcon className="inline h-4 w-4 text-muted-foreground" /> icon to view an item's transaction history.</CardDescription>
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
                  <TableHead className="w-full">Item Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <React.Fragment key={item.id}>
                    <TableRow className={selectedItemForHistory?.id === item.id ? 'bg-muted/50 border-b-0' : ''}>
                      <TableCell className="py-3 px-4 align-top">
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-semibold text-base break-words">{item.name}</span>
                          <span className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </span>
                          <div className="flex items-center gap-0.5 flex-wrap mt-1">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenStockAdjustmentDialog(item, 'ADD_STOCK')} aria-label={`Add stock to ${item.name}`}>
                              <PlusCircle className="h-5 w-5 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenStockAdjustmentDialog(item, 'CONSUME_STOCK')} aria-label={`Consume stock from ${item.name}`}>
                              <MinusCircle className="h-5 w-5 text-red-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleShowHistory(item)} aria-label={`View history for ${item.name}`} className={selectedItemForHistory?.id === item.id ? 'bg-accent text-accent-foreground' : ''}>
                              <HistoryIcon className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => alert(`Delete item ${item.name} - coming soon!`)} aria-label={`Delete ${item.name}`}>
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                    {selectedItemForHistory?.id === item.id && item.history && (
                      <TableRow className="bg-muted/20 hover:bg-muted/30">
                         <TableCell className="p-0 overflow-hidden">
                           <div className="h-full w-full overflow-auto"> {/* This div handles scrolling */}
                            <div className="p-4 space-y-3">
                                <h4 className="text-md font-semibold text-foreground">
                                Transaction History: <span className="font-bold">{item.name}</span>
                                </h4>
                                {item.history.length > 0 ? (
                                    <table className="text-xs border-collapse min-w-full">
                                    <thead className="sticky top-0 bg-muted/80 dark:bg-muted/60 backdrop-blur-sm z-10">
                                        <tr>
                                        <th className="py-2 px-3 text-left font-medium text-muted-foreground whitespace-nowrap">Date</th>
                                        <th className="py-2 px-3 text-left font-medium text-muted-foreground whitespace-nowrap">Type</th>
                                        <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap">Change</th>
                                        <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap">Before</th>
                                        <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap">After</th>
                                        <th className="py-2 px-3 text-left font-medium text-muted-foreground min-w-[150px] whitespace-normal">Comment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...item.history].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((entry) => (
                                        <tr key={entry.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10 dark:hover:bg-muted/5">
                                            <td className="py-1.5 px-3 whitespace-nowrap">{format(new Date(entry.timestamp), "PPpp")}</td>
                                            <td className="py-1.5 px-3 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                entry.type === 'CREATE_ITEM' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' :
                                                entry.type === 'ADD_STOCK' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' :
                                                entry.type === 'CONSUME_STOCK' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' :
                                                entry.type === 'ADJUST_STOCK' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>
                                                {entry.type.replace('_', ' ')}
                                            </span>
                                            </td>
                                            <td className={`py-1.5 px-3 text-right font-medium whitespace-nowrap ${entry.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {entry.change > 0 ? `+${entry.change}` : entry.change}
                                            </td>
                                            <td className="py-1.5 px-3 text-right whitespace-nowrap">{entry.quantityBefore}</td>
                                            <td className="py-1.5 px-3 text-right font-semibold whitespace-nowrap">{entry.quantityAfter}</td>
                                            <td className="py-1.5 px-3 text-muted-foreground min-w-[150px] whitespace-normal break-words">{entry.comment}</td>
                                        </tr>
                                        ))}
                                    </tbody>
                                    </table>
                                ) : (
                                <p className="text-sm text-muted-foreground p-4 text-center">No transaction history for this item.</p>
                                )}
                            </div>
                           </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>


      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Item to {warehouse?.name}</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new item to this warehouse.
            </DialogDescription>
          </DialogHeader>
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit(onAddItemSubmit)} className="space-y-4 py-4">
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

      {/* Stock Adjustment Dialog */}
      <Dialog open={isStockAdjustmentDialogOpen} onOpenChange={(isOpen) => {
        setIsStockAdjustmentDialogOpen(isOpen);
        if (!isOpen) {
            stockAdjustmentForm.reset(); 
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === 'ADD_STOCK' ? 'Add Stock to ' : 'Consume Stock from '} 
              {itemForAdjustment?.name}
            </DialogTitle>
            <DialogDescription>
              Current quantity: {itemForAdjustment?.quantity}. Enter the amount to {adjustmentType === 'ADD_STOCK' ? 'add.' : 'consume.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...stockAdjustmentForm}>
            <form onSubmit={stockAdjustmentForm.handleSubmit(onStockAdjustmentSubmit)} className="space-y-4 py-4">
              <FormField
                control={stockAdjustmentForm.control}
                name="adjustmentQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity to {adjustmentType === 'ADD_STOCK' ? 'Add' : 'Consume'}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={stockAdjustmentForm.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g. Received new shipment, Order #123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  {adjustmentType === 'ADD_STOCK' ? 'Add Stock' : 'Consume Stock'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
    

    

    

    
