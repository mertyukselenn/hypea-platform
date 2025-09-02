"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { 
  ShoppingCart, 
  Star, 
  Download,
  Shield,
  Clock,
  Users
} from "lucide-react"
import { formatPrice } from "@/lib/utils"
// import { motion } from "framer-motion" // Disabled for server compatibility

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  shortDescription: string | null
  images: any
  price: any
  comparePrice: any | null
  status: string
  type: string
  category: {
    name: string
    slug: string
  } | null
  _count: {
    orderItems: number
  }
}

interface ProductCardProps {
  product: Product
  featured?: boolean
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const images = product.images ? JSON.parse(product.images as string) : []
  const mainImage = images[0] || "/placeholder-product.jpg"
  const hasDiscount = product.comparePrice && Number(product.comparePrice) > Number(product.price)
  const discountPercentage = hasDiscount 
    ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
    : 0

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LICENSE':
        return <Shield className="h-4 w-4" />
      case 'DIGITAL':
        return <Download className="h-4 w-4" />
      default:
        return <ShoppingCart className="h-4 w-4" />
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'LICENSE':
        return 'success'
      case 'DIGITAL':
        return 'info'
      default:
        return 'secondary'
    }
  }

  return (
    <div>
      <GlassCard className={`overflow-hidden h-full ${featured ? 'ring-2 ring-primary/20' : ''}`}>
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge variant={getTypeBadgeVariant(product.type)} className="flex items-center gap-1">
              {getTypeIcon(product.type)}
              {product.type}
            </Badge>
            {featured && (
              <Badge variant="warning" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                Featured
              </Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="backdrop-blur-sm">
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Category */}
          {product.category && (
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              {product.category.name}
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
            <Link href={`/store/products/${product.slug}`}>
              {product.name}
            </Link>
          </h3>

          {/* Description */}
          {product.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.shortDescription}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {product._count.orderItems} sales
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              4.8
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">
                  {formatPrice(Number(product.price))}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(Number(product.comparePrice))}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button asChild className="flex-1" variant="gradient">
              <Link href={`/store/products/${product.slug}`}>
                View Details
              </Link>
            </Button>
            <Button variant="outline" size="icon">
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </GlassCard>
          </div>
  )
}
