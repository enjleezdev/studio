'use client';

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Home } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
// Removed: import { useRouter } from 'next/navigation';

export default function WarehousesPage() {
  // Removed: const router = useRouter();

  // For now, we'll assume there are no warehouses to display
  // This would typically come from a data source
  const warehouses: any[] = [];

  return (
    <>
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
            href: "/warehouses/new", // Changed from onClick to href
            icon: PlusCircle,
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {warehouses.map((warehouse) => (
            <Card key={warehouse.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {warehouse.name}
                  <Home className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
                {warehouse.location && (
                  <CardDescription>{warehouse.location}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {warehouse.itemCount !== undefined
                    ? `${warehouse.itemCount} items`
                    : "Manage items in this warehouse."}
                </p>
              </CardContent>
              {/* Add CardFooter if needed for actions like "View Details" */}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
