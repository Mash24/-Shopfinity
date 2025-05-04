"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useCart } from "@/components/cart-provider"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Heart, Minus, Plus, Star } from "lucide-react"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { supabase } = useAuth() // Changed from useSupabase to useAuth
  const { addToCart } = useCart()
  const { toast } = useToast()

  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:category_id(id, name, slug),
          seller:seller_id(id, full_name, username),
          product_images(id, url, is_primary)
        `)
        .eq("slug", params.slug)
        .eq("status", "active")
        .single()

      if (error) {
        console.error("Error fetching product:", error)
        router.push("/shop")
        return
      }

      if (data) {
        setProduct(data)

        // Set selected image to primary image or first image
        const primaryImage = data.product_images?.find((img) => img.is_primary)
        setSelectedImage(primaryImage?.url || (data.product_images?.length > 0 ? data.product_images[0].url : null))

        // Fetch related products
        if (data.category_id) {
          const { data: relatedData } = await supabase
            .from("products")
            .select(`
              *,
              category:category_id(name),
              product_images(url, is_primary)
            `)
            .eq("category_id", data.category_id)
            .eq("status", "active")
            .neq("id", data.id)
            .limit(4)

          if (relatedData) {
            setRelatedProducts(relatedData)
          }
        }
      }

      setLoading(false)
    }

    fetchProduct()
  }, [supabase, params.slug, router])

  const handleAddToCart = () => {
    addToCart(product, quantity)

    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    })
  }

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(product.quantity, value))
    setQuantity(newQuantity)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <div className="container py-8 flex-1">
          <div className="flex flex-col md:flex-row gap-8 animate-pulse">
            <div className="md:w-1/2">
              <div className="aspect-square bg-muted rounded-lg"></div>
              <div className="grid grid-cols-5 gap-2 mt-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="md:w-1/2 space-y-4">
              <div className="h-8 w-3/4 bg-muted rounded"></div>
              <div className="h-6 w-1/4 bg-muted rounded"></div>
              <div className="h-6 w-1/3 bg-muted rounded"></div>
              <div className="h-24 w-full bg-muted rounded"></div>
              <div className="h-10 w-full bg-muted rounded"></div>
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <div className="container py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Product not found</h1>
            <p className="text-muted-foreground mt-2">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/shop")} className="mt-4">
              Back to Shop
            </Button>
          </div>
        </div>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <div className="container py-8 flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Images */}
          <div className="md:w-1/2">
            <div className="aspect-square rounded-lg overflow-hidden border">
              <img
                src={selectedImage || "/placeholder.svg?height=600&width=600"}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Failed to load main product image:", selectedImage)
                  e.target.src = "/placeholder.svg?height=600&width=600"
                }}
              />
            </div>

            {product.product_images && product.product_images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-4">
                {product.product_images.map((image) => (
                  <div
                    key={image.id}
                    className={`aspect-square rounded-md overflow-hidden border cursor-pointer ${selectedImage === image.url ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedImage(image.url)}
                  >
                    <img
                      src={image.url || "/placeholder.svg?height=120&width=120"}
                      alt={`${product.title} - Image ${image.id}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Failed to load thumbnail image:", image.url)
                        e.target.src = "/placeholder.svg?height=120&width=120"
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="md:w-1/2">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{product.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={product.condition === "new" ? "default" : "secondary"}>
                    {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Category: {product.category?.name || "Uncategorized"}
                  </span>
                </div>
              </div>

              <div className="text-2xl font-bold">${Number.parseFloat(product.price).toFixed(2)}</div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Location</h3>
                <p className="text-muted-foreground">
                  {product.city}, {product.country}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Seller</h3>
                <p className="text-muted-foreground">{product.seller?.full_name || "Unknown"}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Quantity</h3>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="ml-4 text-sm text-muted-foreground">{product.quantity} available</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button className="sm:flex-1" onClick={handleAddToCart} disabled={product.quantity < 1}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button variant="outline" className="sm:flex-1">
                  <Heart className="mr-2 h-4 w-4" />
                  Add to Wishlist
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => {
                const primaryImage = relatedProduct.product_images?.find((img) => img.is_primary)
                const imageUrl =
                  primaryImage?.url ||
                  (relatedProduct.product_images?.length > 0 ? relatedProduct.product_images[0].url : null) ||
                  "/placeholder.svg?height=300&width=300"

                return (
                  <Card
                    key={relatedProduct.id}
                    className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
                    onClick={() => router.push(`/product/${relatedProduct.slug}`)}
                  >
                    <div className="aspect-square relative">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={relatedProduct.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium line-clamp-1">{relatedProduct.title}</h3>
                      <p className="font-bold mt-1">${Number.parseFloat(relatedProduct.price).toFixed(2)}</p>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="text-center py-8 border rounded-lg">
            <Star className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No reviews yet</p>
            <Button variant="link" className="mt-2">
              Be the first to review this product
            </Button>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
