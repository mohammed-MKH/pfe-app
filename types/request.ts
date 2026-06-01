export type RequestStatus = "pending" | "fulfilled" | "validated" | "rejected"

export interface MaterialRequest {
  requestId:      string
  adminId:        string
  createdBy:      string
  createdByName:  string
  assignedTo:     string
  assignedToName: string
  name:           string
  quantity:       number
  unite:          string
  deadline:       number | null
  notes:          string
  status:         RequestStatus
  fulfilledAt:    number | null
  fulfilledNotes: string
  reviewedBy:     string | null
  createdAt:      number
  updatedAt:      number
}