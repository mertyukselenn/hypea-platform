"use client"

import { ProductCard } from "./product-card"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

interface RelatedProductsProps {
  products: Product[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Related Products</h2>
        <Button variant="outline" asChild>
          <Link href="/store">
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
