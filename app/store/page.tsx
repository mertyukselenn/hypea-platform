import { prisma } from "@/lib/prisma"
import { MainLayout } from "@/components/layout/main-layout"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProductCard } from "@/components/store/product-card"
import { CategoryFilter } from "@/components/store/category-filter"
import { 
  Search, 
  Filter, 
  ShoppingBag,
  Star,
  TrendingUp,
  Package
} from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface SearchParams {
  search?: string
  category?: string
  sort?: string
  minPrice?: string
  maxPrice?: string
}

async function getStoreData(searchParams: SearchParams) {
  // Build where clause
  const where = {
    status: 'ACTIVE' as const,
    AND: [
      searchParams.search ? {
        OR: [
          { name: { contains: searchParams.search, mode: 'insensitive' as const } },
          { description: { contains: searchParams.search, mode: 'insensitive' as const } },
        ]
      } : {},
      searchParams.category ? {
        category: { slug: searchParams.category }
      } : {},
      searchParams.minPrice ? {
        price: { gte: parseFloat(searchParams.minPrice) }
      } : {},
      searchParams.maxPrice ? {
        price: { lte: parseFloat(searchParams.maxPrice) }
      } : {},
    ]
  }

  // Build order by clause
  let orderBy = {}
  switch (searchParams.sort) {
    case 'price-low':
      orderBy = { price: 'asc' }
      break
    case 'price-high':
      orderBy = { price: 'desc' }
      break
    case 'newest':
      orderBy = { createdAt: 'desc' }
      break
    case 'popular':
      orderBy = { createdAt: 'desc' } // TODO: Add popularity metric
      break
    default:
      orderBy = { createdAt: 'desc' }
  }

  const [products, categories, featuredProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: {
            orderItems: true
          }
        }
      },
      orderBy,
      take: 24
    }),

    prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            products: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    }),

    prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        // TODO: Add featured flag or use order count
      },
      include: {
        category: true,
        _count: {
          select: {
            orderItems: true
          }
        }
      },
      take: 4,
      orderBy: { createdAt: 'desc' }
    })
  ])

  return {
    products,
    categories,
    featuredProducts
  }
}

export default async function StorePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const data = await getStoreData(searchParams)

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-primary/10 to-purple-600/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
                Digital Store
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Discover premium digital products, software licenses, and exclusive content
              </p>
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">{data.products.length}+</div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{data.categories.length}</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Featured Products */}
          {data.featuredProducts.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <Star className="h-6 w-6 text-yellow-500 mr-2" />
                <h2 className="text-2xl font-bold">Featured Products</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} featured />
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Categories */}
                <GlassCard className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Categories
                  </h3>
                  <CategoryFilter 
                    categories={data.categories} 
                    selectedCategory={searchParams.category}
                  />
                </GlassCard>

                {/* Price Range */}
                <GlassCard className="p-6">
                  <h3 className="font-semibold mb-4">Price Range</h3>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Min" 
                        type="number"
                        defaultValue={searchParams.minPrice}
                      />
                      <Input 
                        placeholder="Max" 
                        type="number"
                        defaultValue={searchParams.maxPrice}
                      />
                    </div>
                    <Button variant="outline" className="w-full">
                      Apply Filter
                    </Button>
                  </div>
                </GlassCard>

                {/* Popular Tags */}
                <GlassCard className="p-6">
                  <h3 className="font-semibold mb-4">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Software</Badge>
                    <Badge variant="outline">License</Badge>
                    <Badge variant="outline">Digital</Badge>
                    <Badge variant="outline">Premium</Badge>
                    <Badge variant="outline">Tools</Badge>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search and Filters */}
              <GlassCard className="p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        className="pl-10"
                        defaultValue={searchParams.search}
                      />
                    </div>
                  </div>
                  
                  <Select defaultValue={searchParams.sort || 'newest'}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </GlassCard>

              {/* Products Grid */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    All Products
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {data.products.length} products found
                  </div>
                </div>

                {data.products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <GlassCard className="p-12 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No products found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search criteria or browse our categories
                    </p>
                    <Button variant="outline">
                      Clear Filters
                    </Button>
                  </GlassCard>
                )}

                {/* Load More */}
                {data.products.length >= 24 && (
                  <div className="text-center">
                    <Button variant="outline" size="lg">
                      Load More Products
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
