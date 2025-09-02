"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  Filter
} from "lucide-react"
import { formatRelativeTime, getInitials } from "@/lib/utils"

interface ProductReviewsProps {
  productId: string
}

// Mock data - replace with actual API call
const mockReviews = [
  {
    id: "1",
    rating: 5,
    title: "Excellent product!",
    content: "This product exceeded my expectations. The quality is outstanding and the delivery was instant. Highly recommended!",
    author: {
      name: "John Doe",
      avatar: null,
      verified: true
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    helpful: 12,
    notHelpful: 1
  },
  {
    id: "2",
    rating: 4,
    title: "Great value for money",
    content: "Good product overall. Works as described and the support team was helpful when I had questions.",
    author: {
      name: "Jane Smith",
      avatar: null,
      verified: true
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    helpful: 8,
    notHelpful: 0
  },
  {
    id: "3",
    rating: 5,
    title: "Perfect for my needs",
    content: "Exactly what I was looking for. The license activation was smooth and the product works flawlessly.",
    author: {
      name: "Mike Johnson",
      avatar: null,
      verified: false
    },
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    helpful: 5,
    notHelpful: 2
  }
]

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews] = useState(mockReviews)
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    content: ""
  })

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => review.rating === rating).length,
    percentage: (reviews.filter(review => review.rating === rating).length / reviews.length) * 100
  }))

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5"
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`${starSize} ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <MessageSquare className="h-6 w-6 mr-2" />
          Customer Reviews
        </h2>
        <Button 
          variant="outline"
          onClick={() => setShowWriteReview(!showWriteReview)}
        >
          Write a Review
        </Button>
      </div>

      {/* Rating Summary */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
              <div>
                {renderStars(Math.round(averageRating), "md")}
                <p className="text-sm text-muted-foreground mt-1">
                  Based on {reviews.length} reviews
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-2 text-sm">
                <span className="w-8">{rating}★</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write Review Form */}
      {showWriteReview && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
          <div className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setNewReview(prev => ({ ...prev, rating: i + 1 }))}
                    className="p-1"
                  >
                    <Star 
                      className={`h-6 w-6 ${
                        i < newReview.rating 
                          ? "text-yellow-400 fill-current" 
                          : "text-gray-300 hover:text-yellow-400"
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Review Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                placeholder="Give your review a title"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">Your Review</label>
              <Textarea
                placeholder="Share your experience with this product"
                rows={4}
                value={newReview.content}
                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="gradient">Submit Review</Button>
              <Button 
                variant="outline"
                onClick={() => setShowWriteReview(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          All Reviews
        </Button>
        <Button variant="ghost" size="sm">5 Stars</Button>
        <Button variant="ghost" size="sm">4 Stars</Button>
        <Button variant="ghost" size="sm">3 Stars</Button>
        <Button variant="ghost" size="sm">Verified Only</Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.author.avatar || undefined} />
                  <AvatarFallback>
                    {getInitials(review.author.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.author.name}</span>
                    {review.author.verified && (
                      <Badge variant="success" className="text-xs">
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground">
                      {formatRelativeTime(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">{review.title}</h4>
              <p className="text-muted-foreground">{review.content}</p>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <button className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                <ThumbsUp className="h-4 w-4" />
                Helpful ({review.helpful})
              </button>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                <ThumbsDown className="h-4 w-4" />
                Not Helpful ({review.notHelpful})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">
          Load More Reviews
        </Button>
      </div>
    </div>
  )
}
