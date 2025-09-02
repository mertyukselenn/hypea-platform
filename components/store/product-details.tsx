"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Shield, 
  Download,
  Clock,
  Star,
  Users,
  Check
} from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  id: string
  name: string
  shortDescription: string | null
  price: any
  comparePrice: any | null
  type: string
  licenseDuration: number | null
  maxActivations: number | null
  _count: {
    orderItems: number
    licenses: number
  }
}

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { toast } = useToast()

  const hasDiscount = product.comparePrice && Number(product.comparePrice) > Number(product.price)
  const discountPercentage = hasDiscount 
    ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
    : 0

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    
    try {
      // TODO: Implement cart functionality
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    // TODO: Implement direct checkout
    toast({
      title: "Redirecting to checkout",
      description: "Taking you to the checkout page...",
    })
  }

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

  return (
    <div className="space-y-6">
      {/* Product Title */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="flex items-center gap-1">
            {getTypeIcon(product.type)}
            {product.type}
          </Badge>
          {hasDiscount && (
            <Badge variant="destructive">
              Save {discountPercentage}%
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-4">
          {product.name}
        </h1>
        {product.shortDescription && (
          <p className="text-lg text-muted-foreground">
            {product.shortDescription}
          </p>
        )}
      </div>

      {/* Rating & Sales */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
            ))}
          </div>
          <span className="font-medium ml-2">4.8</span>
          <span className="text-muted-foreground">(124 reviews)</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-4 w-4" />
          {product._count.orderItems} sales
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold">
            {formatPrice(Number(product.price))}
          </span>
          {hasDiscount && (
            <span className="text-xl text-muted-foreground line-through">
              {formatPrice(Number(product.comparePrice))}
            </span>
          )}
        </div>
        {hasDiscount && (
          <p className="text-sm text-green-600 dark:text-green-400">
            You save {formatPrice(Number(product.comparePrice) - Number(product.price))}
          </p>
        )}
      </div>

      {/* License Info */}
      {product.type === 'LICENSE' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            License Information
          </h3>
          <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            {product.licenseDuration ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Valid for {product.licenseDuration} days
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Lifetime license
              </div>
            )}
            {product.maxActivations ? (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Up to {product.maxActivations} device activations
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Unlimited activations
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      {product.type !== 'LICENSE' && (
        <div className="flex items-center gap-4">
          <label className="font-medium">Quantity:</label>
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 hover:bg-muted transition-colors"
            >
              -
            </button>
            <span className="px-4 py-2 border-x">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 hover:bg-muted transition-colors"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <Button 
            variant="gradient" 
            size="lg" 
            className="flex-1"
            onClick={handleBuyNow}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Buy Now
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1">
            <Heart className="h-4 w-4 mr-2" />
            Add to Wishlist
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">What's Included</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-500" />
            Instant digital delivery
          </li>
          <li className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-500" />
            24/7 customer support
          </li>
          <li className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-500" />
            30-day money-back guarantee
          </li>
          {product.type === 'LICENSE' && (
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              Automatic license key generation
            </li>
          )}
        </ul>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">
            Secure Purchase - SSL Encrypted & Verified Payment
          </span>
        </div>
      </div>
    </div>
  )
}
