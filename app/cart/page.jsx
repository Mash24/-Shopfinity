"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"

export default function Cart() {
  const router = useRouter()
  const { user } = useAuth()
  const { cartItems, cartCount, removeFromCart, updateCartItemQuantity, loading } = useCart()
  const [processingCheckout, setProcessingCheckout] = useState(false)

  const handleCheckout = () => {
    if (!user) {
      router.push("/login?redirect=/checkout")
      return
    }

    setProcessingCheckout(true)
    router.push("/checkout")
  }

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.quantity
  }, 0)

  // Calculate shipping (simplified)
  const shipping = subtotal > 0 ? 10 : 0

  // Calculate total
  const total = subtotal + shipping

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <div className="container py-8 flex-1">
          <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
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
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        {cartCount > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = item.product
                const primaryImage = product.product_images?.find((img) => img.is_primary)
                const imageUrl =
                  primaryImage?.url ||
                  (product.product_images?.length > 0 ? product.product_images[0].url : null) ||
                  "/placeholder.svg?height=100&width=100"

                return (
                  <Card key={item.id || item.product_id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-32 h-32">
                          <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <Link href={`/product/${product.slug || product.id}`}>
                              <h3 className="font-medium hover:underline">{product.title}</h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">
                              Condition: {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateCartItemQuantity(item.id || item.product_id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateCartItemQuantity(item.id || item.product_id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="font-bold">${(Number(product.price) * item.quantity).toFixed(2)}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => removeFromCart(item.id || item.product_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" size="lg" onClick={handleCheckout} disabled={processingCheckout}>
                    {processingCheckout ? "Processing..." : "Proceed to Checkout"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Your cart is empty</h2>
            <p className="text-muted-foreground">Looks like you haven't added any items to your cart yet.</p>
            <Button asChild className="mt-4">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  )
}
