import type { Role } from "@/types"

export const ROUTES = {
  login:       "/login",
  dashboard:   "/dashboard",
  messages:    "/messages",
  products:    "/products",
  productNew:  "/products/new",
  product:     (id: string) => `/products/${id}`,
  annexe:      "/annexe",
  manager:     "/manager",
  managerTeam: "/manager/team",
  admin:       "/admin",
  adminUsers:  "/admin/users",
  adminAnnexe: "/admin/annexe",
  adminStats:  "/admin/stats",
  superAdmin:  "/superadmin",
  superAdminAdmins: "/superadmin/admins",
  aiTools:     "/ai-tools",
  settings:    "/settings",
} as const

// Where to redirect after login based on role
export function getHomeRoute(role: Role): string {
  switch (role) {
    case "superadmin": return ROUTES.superAdmin
    case "admin":      return ROUTES.admin
    case "manager":    return ROUTES.manager
    case "worker":     return ROUTES.dashboard
    default:           return ROUTES.login
  }
}