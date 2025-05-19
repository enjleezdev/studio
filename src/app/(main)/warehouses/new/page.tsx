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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const warehouseFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Warehouse name must be at least 2 characters.',
  }),
  description: z.string().optional(),
});

type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

export default function NewWarehousePage() {
  const router = useRouter();
  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  function onSubmit(data: WarehouseFormValues) {
    console.log('New warehouse data:', data);
    // Here you would typically call an API to save the warehouse
    // For now, let's navigate back to the warehouses page after submission
    // router.push('/warehouses');
    // toast({ title: "Warehouse Created", description: `${data.name} has been successfully created.` });
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
                      <Input placeholder="e.g., Main Storage Facility" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a clear and concise name for the warehouse.
                    </FormDescription>
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
                        placeholder="e.g., Primary location for storing electronics and components."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide any additional details about the warehouse.
                    </FormDescription>
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
