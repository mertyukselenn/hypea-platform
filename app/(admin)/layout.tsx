import { requireAdmin } from "@/lib/auth-utils"
import { AdminLayout } from "@/components/layout/admin-layout"

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This will redirect to login if not authenticated or not admin
  await requireAdmin()

  return <AdminLayout>{children}</AdminLayout>
}
