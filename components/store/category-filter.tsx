"use client"

import Link from "next/link"
import { useSearchParams, usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  slug: string
  _count: {
    products: number
  }
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory?: string
}

export function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createCategoryUrl = (categorySlug?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (categorySlug) {
      params.set('category', categorySlug)
    } else {
      params.delete('category')
    }
    
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="space-y-2">
      {/* All Categories */}
      <Link 
        href={createCategoryUrl()}
        className={cn(
          "flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-muted/50",
          !selectedCategory && "bg-primary/10 text-primary"
        )}
      >
        <span>All Categories</span>
        <Badge variant="outline">
          {categories.reduce((total, cat) => total + cat._count.products, 0)}
        </Badge>
      </Link>

      {/* Individual Categories */}
      {categories.map((category) => (
        <Link
          key={category.id}
          href={createCategoryUrl(category.slug)}
          className={cn(
            "flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-muted/50",
            selectedCategory === category.slug && "bg-primary/10 text-primary"
          )}
        >
          <span>{category.name}</span>
          <Badge variant="outline">
            {category._count.products}
          </Badge>
        </Link>
      ))}
    </div>
  )
}
