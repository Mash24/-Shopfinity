"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { CreditCard, CheckCircle } from "lucide-react"

export default function Checkout() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, profile } = useAuth()
  const { cartItems, cartCount, clearCart, loading } = useCart()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [processingOrder, setProcessingOrder] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.quantity
  }, 0)
  const shipping = subtotal > 0 ? 10 : 0
  const total = subtotal + shipping

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && cartCount === 0 && !orderComplete) {
      router.push("/cart")
    }
  }, [loading, cartCount, router, orderComplete])

  // Pre-fill form with user data if available
  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "")
      setEmail(user?.email || "")
      setPhone(profile.phone || "")
      setAddress(profile.address || "")
      setCity(profile.city || "")
      setCountry(profile.country || "")
      setPostalCode(profile.postal_code || "")
    }
  }, [profile, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessingOrder(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Clear cart
      await clearCart()

      // Show success
      setOrderComplete(true)

      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase.",
      })
    } catch (error) {
      toast({
        title: "Error processing order",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setProcessingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <div className="container py-8 flex-1">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
        <SiteFooter />
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <div className="container py-8 flex-1">
          <div className="max-w-md mx-auto text-center py-12">
            <CheckCircle className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Complete!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/orders">View Your Orders</Link>
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
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal-code">Postal Code</Label>
                      <Input
                        id="postal-code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Credit Card</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    This is a demo checkout. No actual payment will be processed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id || item.product_id} className="flex justify-between">
                    <span>
                      {item.product.title} <span className="text-muted-foreground">x{item.quantity}</span>
                    </span>
                    <span>${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <Separator />

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
                <Button form="checkout-form" type="submit" className="w-full" size="lg" disabled={processingOrder}>
                  {processingOrder ? "Processing..." : `Pay $${total.toFixed(2)}`}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
