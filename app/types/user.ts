export type UserRole = "employee" | "manager" | "admin";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};