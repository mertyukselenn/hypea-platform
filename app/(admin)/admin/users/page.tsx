import { prisma } from "@/lib/prisma"
import { UsersTable } from "@/components/admin/users-table"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Filter } from "lucide-react"

interface SearchParams {
  search?: string
  role?: string
  status?: string
  page?: string
}

async function getUsers(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const where = {
    AND: [
      searchParams.search ? {
        OR: [
          { email: { contains: searchParams.search, mode: 'insensitive' as const } },
          { profile: { displayName: { contains: searchParams.search, mode: 'insensitive' as const } } },
          { profile: { username: { contains: searchParams.search, mode: 'insensitive' as const } } },
        ]
      } : {},
      searchParams.role ? { role: searchParams.role as any } : {},
      searchParams.status ? { status: searchParams.status as any } : {},
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        profile: true,
        userTeamTags: {
          include: {
            teamTag: true
          }
        },
        _count: {
          select: {
            orders: true,
            licenses: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.user.count({ where })
  ])

  return {
    users,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page
  }
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const data = await getUsers(searchParams)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                defaultValue={searchParams.search}
              />
            </div>
          </div>
          
          <Select defaultValue={searchParams.role}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All roles</SelectItem>
              <SelectItem value="OWNER">Owner</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="STAFF">Staff</SelectItem>
              <SelectItem value="MEMBER">Member</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue={searchParams.status}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PENDING_VERIFICATION">Pending</SelectItem>
              <SelectItem value="BANNED">Banned</SelectItem>
              <SelectItem value="DISABLED">Disabled</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </GlassCard>

      {/* Users Table */}
      <GlassCard>
        <UsersTable data={data} />
      </GlassCard>
    </div>
  )
}
