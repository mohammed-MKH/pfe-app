export type PaymentMethod = "cash" | "card" | "jawaz" | "autoroute"
export type VehicleType   = "company" | "personal"
export type VehicleStatus = "available" | "assigned" | "maintenance"

export interface Vehicle {
  vehicleId:    string
  adminId:      string
  name:         string
  plate:        string
  type:         VehicleType
  brand:        string
  model:        string
  year:         string
  status:       VehicleStatus
  assignedTo:   string | null   // uid of current driver
  assignedName: string | null
  assignedAt:   number | null
  location:     string
  notes:        string
  createdBy:    string
  createdAt:    number
}

export interface VehicleTrip {
  tripId:        string
  vehicleId:     string
  adminId:       string
  driverId:      string
  driverName:    string
  date:          number
  destination:   string
  departure:     string
  distanceKm:    number
  fuelCost:      number
  tollCost:      number
  otherCost:     number
  paymentMethod: PaymentMethod
  cardRef:       string
  notes:         string
  status:        "pending" | "approved" | "rejected"
  reviewedBy:    string | null
  createdAt:     number
}

export interface VehicleDemand {
  demandId:    string
  vehicleId:   string
  adminId:     string
  requestedBy: string
  requesterName: string
  date:        number
  destination: string
  reason:      string
  status:      "pending" | "approved" | "rejected"
  reviewedBy:  string | null
  createdAt:   number
}