import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/signin')
  }
  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  
  if (!allowedRoles.includes(user.role)) {
    redirect('/')
  }
  
  return user
}

export async function requireAdmin() {
  return await requireRole([UserRole.OWNER, UserRole.ADMIN])
}

export async function requireOwner() {
  return await requireRole([UserRole.OWNER])
}

export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

export function isAdmin(userRole: UserRole): boolean {
  return hasPermission(userRole, [UserRole.OWNER, UserRole.ADMIN])
}

export function isOwner(userRole: UserRole): boolean {
  return hasPermission(userRole, [UserRole.OWNER])
}

export function canManageUsers(userRole: UserRole): boolean {
  return hasPermission(userRole, [UserRole.OWNER, UserRole.ADMIN])
}

export function canManageProducts(userRole: UserRole): boolean {
  return hasPermission(userRole, [UserRole.OWNER, UserRole.ADMIN])
}

export function canManageOrders(userRole: UserRole): boolean {
  return hasPermission(userRole, [UserRole.OWNER, UserRole.ADMIN])
}

export function canManageContent(userRole: UserRole): boolean {
  return hasPermission(userRole, [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF])
}

export function canManageSettings(userRole: UserRole): boolean {
  return hasPermission(userRole, [UserRole.OWNER])
}
