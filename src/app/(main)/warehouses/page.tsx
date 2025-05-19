
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Home } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";

export default function WarehousesPage() {
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
            <Link href="#"> {/* Placeholder link for /warehouses/new */}
              <PlusCircle className="mr-2" />
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
            onClick: () => {
              // In a real app, this would navigate to a form or open a modal
              // For now, we can link to a placeholder or just log
              console.log("Add Warehouse button clicked");
              // router.push('/warehouses/new'); // If /warehouses/new exists
            },
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
