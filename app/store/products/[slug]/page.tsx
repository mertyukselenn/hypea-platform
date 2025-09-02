import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { MainLayout } from "@/components/layout/main-layout"
import { ProductDetails } from "@/components/store/product-details"
import { ProductGallery } from "@/components/store/product-gallery"
import { RelatedProducts } from "@/components/store/related-products"
import { ProductReviews } from "@/components/store/product-reviews"

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { 
      slug,
      status: 'ACTIVE'
    },
    include: {
      category: true,
      _count: {
        select: {
          orderItems: true,
          licenses: true
        }
      }
    }
  })

  if (!product) {
    notFound()
  }

  // Get related products from the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      status: 'ACTIVE',
      id: { not: product.id }
    },
    include: {
      category: true,
      _count: {
        select: {
          orderItems: true
        }
      }
    },
    take: 4
  })

  return {
    product,
    relatedProducts
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { product } = await getProduct(params.slug)
  
  return {
    title: `${product.name} | Hypea Store`,
    description: product.shortDescription || product.description || `Buy ${product.name} from Hypea Store`,
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description,
      images: product.images ? JSON.parse(product.images as string) : [],
    }
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { product, relatedProducts } = await getProduct(params.slug)
  
  const images = product.images ? JSON.parse(product.images as string) : []

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white/50 dark:bg-gray-900/50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="text-sm">
              <ol className="flex items-center space-x-2">
                <li>
                  <a href="/store" className="text-muted-foreground hover:text-primary">
                    Store
                  </a>
                </li>
                <li className="text-muted-foreground">/</li>
                {product.category && (
                  <>
                    <li>
                      <a 
                        href={`/store?category=${product.category.slug}`}
                        className="text-muted-foreground hover:text-primary"
                      >
                        {product.category.name}
                      </a>
                    </li>
                    <li className="text-muted-foreground">/</li>
                  </>
                )}
                <li className="font-medium">{product.name}</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Gallery */}
            <div>
              <ProductGallery images={images} productName={product.name} />
            </div>

            {/* Product Details */}
            <div>
              <ProductDetails product={product} />
            </div>
          </div>

          {/* Product Description & Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2">
              {/* Description */}
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-6">Product Description</h2>
                <div 
                  className="prose prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: product.description || 'No description available.' 
                  }}
                />
              </div>
            </div>

            <div>
              {/* Product Info */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-semibold">Product Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{product.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{product.category?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sales:</span>
                    <span className="font-medium">{product._count.orderItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Licenses:</span>
                    <span className="font-medium">{product._count.licenses}</span>
                  </div>
                  {product.sku && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKU:</span>
                      <span className="font-medium font-mono text-xs">{product.sku}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="glass-card p-6 mt-6">
                <h3 className="font-semibold mb-4">Features</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Instant digital delivery
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    24/7 customer support
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Secure payment processing
                  </li>
                  {product.type === 'LICENSE' && (
                    <>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        License key generation
                      </li>
                      {product.maxActivations && (
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                          Up to {product.maxActivations} activations
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-16">
            <ProductReviews productId={product.id} />
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <RelatedProducts products={relatedProducts} />
          )}
        </div>
      </div>
    </MainLayout>
  )
}
