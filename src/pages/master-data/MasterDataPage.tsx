import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { skus, locations, zones, warehouses, suppliers, customers } from "@/data/mockData";

const MasterDataPage = () => {
  const skuColumns = [
    { key: "id", label: "SKU ID", sortable: true },
    { key: "description", label: "Description", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "uom", label: "UOM" },
    { key: "lot", label: "Lot", render: (r: any) => r.lot || "—" },
    { key: "hazardous", label: "Hazardous", render: (r: any) => r.hazardous ? "⚠️" : "—" },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
  ];

  const locColumns = [
    { key: "id", label: "Location ID", sortable: true },
    { key: "label", label: "Label" },
    { key: "zone", label: "Zone" },
    { key: "aisle", label: "Aisle" },
    { key: "rack", label: "Rack" },
    { key: "bin", label: "Bin" },
  ];

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Master Data" }]} />
      <h1 className="text-2xl font-bold mb-4">Master Data</h1>

      <Tabs defaultValue="sku">
        <TabsList>
          <TabsTrigger value="sku">SKU Master</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="sku" className="mt-4">
          <DataTable columns={skuColumns} data={skus} actions={<Button size="sm">+ Add SKU</Button>} />
        </TabsContent>

        <TabsContent value="locations" className="mt-4">
          <DataTable columns={locColumns} data={locations} actions={<Button size="sm">+ Add Location</Button>} />
        </TabsContent>

        <TabsContent value="warehouses" className="mt-4">
          <DataTable columns={[
            { key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "city", label: "City" }, { key: "country", label: "Country" },
          ]} data={warehouses} />
        </TabsContent>

        <TabsContent value="suppliers" className="mt-4">
          <DataTable columns={[
            { key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "contact", label: "Contact" }, { key: "country", label: "Country" },
          ]} data={suppliers} />
        </TabsContent>

        <TabsContent value="customers" className="mt-4">
          <DataTable columns={[
            { key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "contact", label: "Contact" }, { key: "country", label: "Country" },
          ]} data={customers} />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default MasterDataPage;
