
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import ReactDOM from 'react-dom/client';

import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, PackagePlus, PackageSearch, PlusCircle, MinusCircle, History as HistoryIcon, Trash2, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Item, Warehouse, HistoryEntry, ArchivedReport } from '@/lib/types';
import { PrintableItemReport } from '@/components/PrintableItemReport';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const itemFormSchema = z.object({
  name: z.string().min(2, {
    message: 'اسم العنصر يجب أن يتكون من حرفين على الأقل.',
  }),
  quantity: z.coerce
    .number({ invalid_type_error: 'الكمية يجب أن تكون رقمًا.' })
    .int('الكمية يجب أن تكون رقمًا صحيحًا.')
    .positive({ message: 'الكمية يجب أن تكون رقمًا موجبًا.' }),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

const stockAdjustmentFormSchema = z.object({
  adjustmentQuantity: z.coerce
    .number({ invalid_type_error: 'الكمية يجب أن تكون رقمًا.' })
    .int('الكمية يجب أن تكون رقمًا صحيحًا.')
    .positive({ message: 'كمية التعديل يجب أن تكون رقمًا موجبًا.' }),
  comment: z.string().optional(),
});

type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentFormSchema>;

// Helper function to translate history types
const translateHistoryType = (type: HistoryEntry['type']): string => {
  switch (type) {
    case 'CREATE_ITEM': return 'إنشاء عنصر';
    case 'ADD_STOCK': return 'إضافة مخزون';
    case 'CONSUME_STOCK': return 'استهلاك مخزون';
    case 'ADJUST_STOCK': return 'تعديل مخزون';
    default: return type;
  }
};

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
          toast({ title: "خطأ", description: "المستودع غير موجود.", variant: "destructive" });
          router.push('/warehouses');
          return;
        }
      } else {
         toast({ title: "خطأ", description: "لا توجد مستودعات في التخزين.", variant: "destructive" });
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
      toast({ title: "خطأ", description: "فشل تحميل البيانات.", variant: "destructive" });
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
      comment: 'إنشاء العنصر الأولي',
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
      
      toast({ title: "تمت إضافة العنصر", description: `تمت إضافة ${newItem.name} إلى ${warehouse?.name}.` });
      setIsAddItemDialogOpen(false); 
      itemForm.reset(); 
      loadWarehouseAndItems(); 
    } catch (error) {
      console.error("Failed to save item to localStorage", error);
      toast({ title: "خطأ", description: "فشل حفظ العنصر. الرجاء المحاولة مرة أخرى.", variant: "destructive" });
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
        message: `لا يمكن استهلاك كمية أكبر من المخزون المتاح (${itemForAdjustment.quantity}).`,
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
      comment: data.comment || (adjustmentType === 'ADD_STOCK' ? 'تمت إضافة مخزون' : 'تم استهلاك مخزون'),
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
        toast({ title: "تم تحديث المخزون", description: `تم تحديث مخزون ${updatedItem.name}.` });
        setIsStockAdjustmentDialogOpen(false);
        stockAdjustmentForm.reset();
        loadWarehouseAndItems();
      } else {
        toast({ title: "خطأ", description: "لم يتم العثور على العنصر للتحديث.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update item stock in localStorage", error);
      toast({ title: "خطأ", description: "فشل تحديث المخزون. الرجاء المحاولة مرة أخرى.", variant: "destructive" });
    }
  }
  
  const handleShowHistory = (item: Item) => {
    if (selectedItemForHistory?.id === item.id) {
      setSelectedItemForHistory(null); 
    } else {
      setSelectedItemForHistory(item);
    }
  };

  const handlePrintReport = (itemToPrint: Item) => {
    if (!warehouse || !itemToPrint) return;

    const printableArea = document.createElement('div');
    printableArea.id = 'printable-report-area'; // For print.css to target
    document.body.appendChild(printableArea);

    const root = ReactDOM.createRoot(printableArea);
    root.render(
      <PrintableItemReport
        warehouseName={warehouse.name}
        item={itemToPrint}
        printedBy="Admin User" // Replace with actual user if available
        printDate={new Date()}
      />
    );

    setTimeout(() => {
      window.print();

      root.unmount();
      if (document.body.contains(printableArea)) {
        document.body.removeChild(printableArea);
      }
      
      const now = new Date();
      const archivedReport: ArchivedReport = {
        id: `${itemToPrint.id}-${now.getTime()}`,
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        itemId: itemToPrint.id,
        itemName: itemToPrint.name,
        printedBy: "Admin User", 
        printedAt: now.toISOString(),
        historySnapshot: JSON.parse(JSON.stringify(itemToPrint.history || [])), 
      };

      try {
        const existingReportsString = localStorage.getItem('archivedReports');
        const existingReports: ArchivedReport[] = existingReportsString
          ? JSON.parse(existingReportsString)
          : [];
        existingReports.push(archivedReport);
        localStorage.setItem('archivedReports', JSON.stringify(existingReports));
        toast({
          title: "تم أرشفة التقرير",
          description: `تم حفظ تقرير العنصر ${itemToPrint.name}.`,
        });
      } catch (error) {
        console.error("Failed to archive report:", error);
        toast({
          title: "خطأ في الأرشفة",
          description: "لم يتم حفظ التقرير بسبب خطأ.",
          variant: "destructive",
        });
      }
    }, 100); 
  };


  if (isLoading) {
    return <LoadingSpinner className="mx-auto my-10" size={48} />;
  }

  if (!warehouse) {
    return (
       <div className="flex h-full w-full items-center justify-center">
         <p>المستودع غير موجود أو حدث خطأ.</p>
       </div>
    );
  }

  return (
    <TooltipProvider>
      <PageHeader
        title={warehouse.name}
        description={warehouse.description || "إدارة العناصر والتفاصيل الخاصة بهذا المستودع."}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/warehouses">
                <ArrowLeft className="ml-2 h-4 w-4" /> {/* Changed mr-2 to ml-2 for RTL */}
                العودة إلى المستودعات
              </Link>
            </Button>
            <Button onClick={() => setIsAddItemDialogOpen(true)}>
              <PackagePlus className="ml-2 h-4 w-4" /> {/* Changed mr-2 to ml-2 for RTL */}
              إضافة عنصر
            </Button>
          </div>
        }
      />
      
      <Card>
        <CardHeader>
          <CardTitle>عناصر المخزون</CardTitle>
          <CardDescription>جميع العناصر المخزنة حاليًا في {warehouse.name}. انقر على أيقونة <HistoryIcon className="inline h-4 w-4 text-muted-foreground" /> لعرض سجل معاملات العنصر.</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState
              IconComponent={PackageSearch}
              title="لا توجد عناصر بعد"
              description="ابدأ بإضافة العنصر الأول إلى هذا المستودع."
              action={{
                label: "إضافة عنصر",
                onClick: () => setIsAddItemDialogOpen(true),
                icon: PackagePlus,
              }}
            />
          ) : (
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-full text-right">تفاصيل العنصر</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <React.Fragment key={item.id}>
                    <TableRow className={selectedItemForHistory?.id === item.id ? 'bg-muted/50 border-b-0' : ''}>
                      <TableCell className="py-3 px-4 align-top">
                        <div className="flex flex-col items-start gap-1 text-right">
                          <span className="font-semibold text-base break-words">{item.name}</span>
                          <span className="text-sm text-muted-foreground">
                            الكمية: {item.quantity}
                          </span>
                          <div className="flex items-center gap-0.5 flex-wrap mt-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenStockAdjustmentDialog(item, 'ADD_STOCK')} aria-label={`إضافة مخزون إلى ${item.name}`}>
                                  <PlusCircle className="h-5 w-5 text-green-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>إضافة مخزون</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenStockAdjustmentDialog(item, 'CONSUME_STOCK')} aria-label={`استهلاك مخزون من ${item.name}`}>
                                  <MinusCircle className="h-5 w-5 text-red-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>استهلاك مخزون</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleShowHistory(item)} aria-label={`عرض سجل ${item.name}`} className={selectedItemForHistory?.id === item.id ? 'bg-accent text-accent-foreground' : ''}>
                                  <HistoryIcon className="h-5 w-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>عرض السجل</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                 <Button variant="ghost" size="icon" onClick={() => handlePrintReport(item)} aria-label={`طباعة تقرير ${item.name}`}>
                                  <Printer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>طباعة التقرير</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => alert(`سيتم تفعيل حذف العنصر ${item.name} قريبًا!`)} aria-label={`حذف ${item.name}`}>
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>حذف العنصر</p></TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                    {selectedItemForHistory?.id === item.id && item.history && (
                      <TableRow className="bg-muted/20 hover:bg-muted/30">
                         <TableCell className="p-0 overflow-hidden"> 
                           <div className="w-full overflow-auto max-h-[300px]"> 
                            <div className="p-4 space-y-3">
                                <h4 className="text-md font-semibold text-foreground text-right">
                                سجل المعاملات: <span className="font-bold">{item.name}</span>
                                </h4>
                                {item.history.length > 0 ? (
                                    <table className="text-xs border-collapse min-w-full text-right">
                                    <thead className="sticky top-0 bg-muted/80 dark:bg-muted/60 backdrop-blur-sm z-10">
                                        <tr>
                                        <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap">التاريخ</th>
                                        <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap">النوع</th>
                                        <th className="py-2 px-3 text-center font-medium text-muted-foreground whitespace-nowrap">التغيير</th>
                                        <th className="py-2 px-3 text-center font-medium text-muted-foreground whitespace-nowrap">قبل</th>
                                        <th className="py-2 px-3 text-center font-medium text-muted-foreground whitespace-nowrap">بعد</th>
                                        <th className="py-2 px-3 text-right font-medium text-muted-foreground min-w-[150px] whitespace-normal">التعليق</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...item.history].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((entry) => (
                                        <tr key={entry.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10 dark:hover:bg-muted/5">
                                            <td className="py-1.5 px-3 whitespace-nowrap">{format(new Date(entry.timestamp), "PPpp", { locale: arSA })}</td>
                                            <td className="py-1.5 px-3 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                entry.type === 'CREATE_ITEM' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' :
                                                entry.type === 'ADD_STOCK' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' :
                                                entry.type === 'CONSUME_STOCK' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' :
                                                entry.type === 'ADJUST_STOCK' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>
                                                {translateHistoryType(entry.type)}
                                            </span>
                                            </td>
                                            <td className={`py-1.5 px-3 text-center font-medium whitespace-nowrap ${entry.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {entry.change > 0 ? `+${entry.change}` : entry.change}
                                            </td>
                                            <td className="py-1.5 px-3 text-center whitespace-nowrap">{entry.quantityBefore}</td>
                                            <td className="py-1.5 px-3 text-center font-semibold whitespace-nowrap">{entry.quantityAfter}</td>
                                            <td className="py-1.5 px-3 text-muted-foreground min-w-[150px] whitespace-normal break-words">{entry.comment}</td>
                                        </tr>
                                        ))}
                                    </tbody>
                                    </table>
                                ) : (
                                <p className="text-sm text-muted-foreground p-4 text-center">لا يوجد سجل معاملات لهذا العنصر.</p>
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

      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة عنصر جديد إلى {warehouse?.name}</DialogTitle>
            <DialogDescription>
              املأ التفاصيل أدناه لإضافة عنصر جديد إلى هذا المستودع.
            </DialogDescription>
          </DialogHeader>
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit(onAddItemSubmit)} className="space-y-4 py-4">
              <FormField
                control={itemForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم العنصر</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: أدوات إلكترونية" {...field} />
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
                    <FormLabel>الكمية</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="مثال: 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">إلغاء</Button>
                </DialogClose>
                <Button type="submit">حفظ العنصر</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isStockAdjustmentDialogOpen} onOpenChange={(isOpen) => {
        setIsStockAdjustmentDialogOpen(isOpen);
        if (!isOpen) {
            stockAdjustmentForm.reset(); 
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === 'ADD_STOCK' ? 'إضافة مخزون إلى ' : 'استهلاك مخزون من '} 
              {itemForAdjustment?.name}
            </DialogTitle>
            <DialogDescription>
              الكمية الحالية: {itemForAdjustment?.quantity}. أدخل الكمية التي تريد {adjustmentType === 'ADD_STOCK' ? 'إضافتها.' : 'استهلاكها.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...stockAdjustmentForm}>
            <form onSubmit={stockAdjustmentForm.handleSubmit(onStockAdjustmentSubmit)} className="space-y-4 py-4">
              <FormField
                control={stockAdjustmentForm.control}
                name="adjustmentQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الكمية التي سيتم {adjustmentType === 'ADD_STOCK' ? 'إضافتها' : 'استهلاكها'}</FormLabel>
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
                    <FormLabel>تعليق (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="مثال: استلام شحنة جديدة، طلب رقم 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">إلغاء</Button>
                </DialogClose>
                <Button type="submit">
                  {adjustmentType === 'ADD_STOCK' ? 'إضافة مخزون' : 'استهلاك مخزون'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
    
