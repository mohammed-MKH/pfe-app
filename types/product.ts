export type ProductStatus = "pending" | "approved" | "rejected"

export interface Product {
  productId:       string
  adminId:         string
  submittedBy:     string
  submittedByName: string
  name:            string
  quantity:        number
  unite:           string
  condition:       string
  location:        string
  lotNumber:       string
  notes:           string
  photoURLs:       string[]
  status:          ProductStatus
  reviewedBy:      string | null
  managerComment:  string | null
  createdAt:       number
  updatedAt:       number
}