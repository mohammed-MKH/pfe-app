export type ProductStatus = "pending" | "approved" | "rejected" | "correction";

export type Product = {
  id?: string;
  name: string;
  reference: string;
  category: string;
  quantity: number;
  supplier: string;
  notes?: string;
  photoUrls: string[];
  status: ProductStatus;
  createdBy: string;
  reviewedBy?: string;
  managerComment?: string;
  createdAt: Date;
  updatedAt: Date;
};