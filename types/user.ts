export type Role  = "worker" | "manager" | "admin" | "superadmin"
export type Lang  = "fr" | "en"
export type Theme = "dark" | "light"

export interface AppUser {
  uid:         string
  adminId:     string
  email:       string
  displayName: string
  role:        Role
  language:    Lang
  theme:       Theme
  photoURL:    string | null
  createdAt:   number
  createdBy:   string
  isActive:    boolean
}

export interface Admin {
  adminId:          string
  uid:              string
  email:            string
  displayName:      string
  organizationName: string
  logoURL:          string | null
  createdBy:        string
  createdAt:        number
  isActive:         boolean
  memberCount:      number
}

export interface SuperAdmin {
  uid:         string
  email:       string
  displayName: string
  createdAt:   number
}