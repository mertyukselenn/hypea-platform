"use client"

import { useState } from "react"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield, 
  Ban,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { formatRelativeTime, getInitials } from "@/lib/utils"
import { UserRole, UserStatus } from "@prisma/client"

interface User {
  id: string
  email: string | null
  role: UserRole
  status: UserStatus
  createdAt: Date
  emailVerified: Date | null
  profile: {
    username: string | null
    displayName: string | null
    avatar: string | null
  } | null
  userTeamTags: Array<{
    teamTag: {
      name: string
      displayName: string
      color: string
    }
  }>
  _count: {
    orders: number
    licenses: number
  }
}

interface UsersTableProps {
  data: {
    users: User[]
    total: number
    pages: number
    currentPage: number
  }
}

export function UsersTable({ data }: UsersTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'OWNER':
        return 'destructive'
      case 'ADMIN':
        return 'warning'
      case 'STAFF':
        return 'info'
      default:
        return 'secondary'
    }
  }

  const getStatusBadgeVariant = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'success'
      case 'PENDING_VERIFICATION':
        return 'warning'
      case 'BANNED':
        return 'destructive'
      case 'DISABLED':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'PENDING_VERIFICATION':
        return <XCircle className="h-4 w-4 text-yellow-500" />
      case 'BANNED':
        return <Ban className="h-4 w-4 text-red-500" />
      case 'DISABLED':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium">
            {data.total} users
          </h3>
          {selectedUsers.length > 0 && (
            <Badge variant="secondary">
              {selectedUsers.length} selected
            </Badge>
          )}
        </div>
        
        {selectedUsers.length > 0 && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Change Role
            </Button>
            <Button variant="outline" size="sm">
              <Ban className="h-4 w-4 mr-2" />
              Ban Users
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <input 
                type="checkbox" 
                className="rounded border-gray-300"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedUsers(data.users.map(u => u.id))
                  } else {
                    setSelectedUsers([])
                  }
                }}
              />
            </TableHead>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Team Tags</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Licenses</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300"
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers([...selectedUsers, user.id])
                    } else {
                      setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                    }
                  }}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profile?.avatar || undefined} />
                    <AvatarFallback>
                      {getInitials(user.profile?.displayName || user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user.profile?.displayName || user.profile?.username || "No name"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(user.status)}
                  <Badge variant={getStatusBadgeVariant(user.status)}>
                    {user.status}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.userTeamTags.map((tag) => (
                    <Badge 
                      key={tag.teamTag.name}
                      variant="outline"
                      style={{ 
                        borderColor: tag.teamTag.color,
                        color: tag.teamTag.color 
                      }}
                    >
                      {tag.teamTag.displayName}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{user._count.orders}</span>
              </TableCell>
              <TableCell>
                <span className="font-medium">{user._count.licenses}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatRelativeTime(user.createdAt)}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="mr-2 h-4 w-4" />
                      Change Role
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Ban className="mr-2 h-4 w-4" />
                      {user.status === 'BANNED' ? 'Unban User' : 'Ban User'}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-muted-foreground">
            Showing {((data.currentPage - 1) * 20) + 1} to {Math.min(data.currentPage * 20, data.total)} of {data.total} users
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, data.pages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === data.currentPage ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              disabled={data.currentPage >= data.pages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
