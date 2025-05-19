
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Warehouse } from '@/lib/types'; // Import Warehouse type

const warehouseFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Warehouse name must be at least 2 characters.',
  }),
  description: z.string().optional(),
});

type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

// Explicitly type StoredWarehouse by extending WarehouseFormValues and adding id
interface StoredWarehouse extends WarehouseFormValues {
  id: string;
}

export default function NewWarehousePage() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  function onSubmit(data: WarehouseFormValues) {
    const newWarehouse: StoredWarehouse = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
    };

    try {
      const existingWarehousesString = localStorage.getItem('warehouses');
      const existingWarehouses: StoredWarehouse[] = existingWarehousesString ? JSON.parse(existingWarehousesString) : [];
      existingWarehouses.push(newWarehouse);
      localStorage.setItem('warehouses', JSON.stringify(existingWarehouses));
      
      toast({ title: "Warehouse Created", description: `${data.name} has been successfully created.` });
      router.push('/warehouses');
    } catch (error) {
      console.error("Failed to save warehouse to localStorage", error);
      toast({ title: "Error", description: "Failed to save warehouse. Please try again.", variant: "destructive" });
    }
  }

  return (
    <>
      <PageHeader
        title="Create New Warehouse"
        description="Fill in the details below to add a new warehouse."
        actions={
          <Button variant="outline" asChild>
            <Link href="/warehouses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Warehouses
            </Link>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse Name</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder=""
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.push('/warehouses')}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Warehouse
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
