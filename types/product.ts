export type ProductStatus = "pending" | "approved" | "rejected"

export interface Product {
  productId:      string
  adminId:        string
  submittedBy:    string
  submittedByName: string
  name:           string
  quantity:       number
  condition:      string
  notes:          string
  photoURLs:      string[]
  status:         ProductStatus
  reviewedBy:     string | null
  managerComment: string | null
  createdAt:      number
  updatedAt:      number
}