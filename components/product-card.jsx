"use client"

import Link from "next/link"
import { useCart } from "@/components/cart-provider"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { toast } = useToast()

  // Find primary image or use first image
  const primaryImage = product.product_images?.find((img) => img.is_primary)
  const imageUrl =
    primaryImage?.url ||
    (product.product_images?.length > 0 ? product.product_images[0].url : null) ||
    "/placeholder.svg?height=300&width=300"

  // Debug image URL
  console.log("Product image URL:", imageUrl)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    addToCart(product)

    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    })
  }

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-md">
        <div className="aspect-square relative">
          <img
            src={imageUrl || "/placeholder.svg?height=300&width=300"}
            alt={product.title}
            className="object-cover w-full h-full"
            onError={(e) => {
              console.error("Image failed to load:", imageUrl)
              e.target.src = "/placeholder.svg?height=300&width=300"
            }}
          />
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <Badge variant={product.condition === "new" ? "default" : "secondary"}>
              {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium line-clamp-1">{product.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{product.category?.name || "Uncategorized"}</p>
          <p className="font-bold mt-2">${Number.parseFloat(product.price).toFixed(2)}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button variant="secondary" size="sm" className="w-full" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
