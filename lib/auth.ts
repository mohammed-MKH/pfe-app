import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth"
import { auth } from "../lib/firebase"
import { setUser, setAdmin } from "./firestore"
import type { AppUser, Admin, Role } from "@/types"

// Called by Admin to create a worker or manager
export async function createMember(params: {
  email:       string
  password:    string
  displayName: string
  role:        Role
  adminId:     string
  createdBy:   string
}): Promise<AppUser> {
  const cred = await createUserWithEmailAndPassword(
    auth,
    params.email,
    params.password
  )

  const user: AppUser = {
    uid:         cred.user.uid,
    adminId:     params.adminId,
    email:       params.email,
    displayName: params.displayName,
    role:        params.role,
    language:    "fr",
    theme:       "dark",
    photoURL:    null,
    createdAt:   Date.now(),
    createdBy:   params.createdBy,
    isActive:    true,
  }

  await setUser(user)
  return user
}

// Called by Super Admin to create an Admin
export async function createAdminAccount(params: {
  email:            string
  password:         string
  displayName:      string
  organizationName: string
  createdBy:        string
}): Promise<{ user: AppUser; admin: Admin }> {
  const cred = await createUserWithEmailAndPassword(
    auth,
    params.email,
    params.password
  )

  const adminId = cred.user.uid

  const admin: Admin = {
    adminId,
    uid:              cred.user.uid,
    email:            params.email,
    displayName:      params.displayName,
    organizationName: params.organizationName,
    createdBy:        params.createdBy,
    createdAt:        Date.now(),
    isActive:         true,
    memberCount:      0,
  }

  const user: AppUser = {
    uid:         cred.user.uid,
    adminId,
    email:       params.email,
    displayName: params.displayName,
    role:        "admin",
    language:    "fr",
    theme:       "dark",
    photoURL:    null,
    createdAt:   Date.now(),
    createdBy:   params.createdBy,
    isActive:    true,
  }

  await setAdmin(admin)
  await setUser(user)

  return { user, admin }
}

// Create the Super Admin user (run once manually)
export async function createSuperAdmin(params: {
  email:    string
  password: string
  displayName: string
}): Promise<AppUser> {
  const cred = await createUserWithEmailAndPassword(
    auth,
    params.email,
    params.password
  )

  const user: AppUser = {
    uid:         cred.user.uid,
    adminId:     "superadmin",
    email:       params.email,
    displayName: params.displayName,
    role:        "superadmin",
    language:    "fr",
    theme:       "dark",
    photoURL:    null,
    createdAt:   Date.now(),
    createdBy:   "system",
    isActive:    true,
  }

  await setUser(user)
  return user
}