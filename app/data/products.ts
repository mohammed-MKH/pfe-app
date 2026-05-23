export type ProductStatus = "pending" | "approved" | "rejected" | "correction";

export type Product = {
  id: string;
  name: string;
  reference: string;
  category: string;
  quantity: number;
  supplier: string;
  status: ProductStatus;
  createdBy: string;
  createdAt: string;
};

export const demoProducts: Product[] = [
  {
    id: "1",
    name: "Industrial Sensor",
    reference: "SEN-001",
    category: "Electronics",
    quantity: 12,
    supplier: "Atlas Supplier",
    status: "pending",
    createdBy: "Employee 1",
    createdAt: "2026-05-05",
  },
  {
    id: "2",
    name: "Control Panel",
    reference: "CTRL-014",
    category: "Electrical",
    quantity: 4,
    supplier: "Tech Industry",
    status: "approved",
    createdBy: "Employee 2",
    createdAt: "2026-05-05",
  },
  {
    id: "3",
    name: "Motor Pump",
    reference: "PMP-220",
    category: "Mechanical",
    quantity: 2,
    supplier: "Morocco Machines",
    status: "rejected",
    createdBy: "Employee 1",
    createdAt: "2026-05-05",
  },
];