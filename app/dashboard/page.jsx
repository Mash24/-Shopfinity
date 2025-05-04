"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, Star, DollarSign } from "lucide-react"

export default function Dashboard() {
  const { user, supabase } = useAuth()
  const [stats, setStats] = useState({
    activeListings: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalSales: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        // Get active listings count
        const { count: activeListings } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("seller_id", user.id)
          .eq("status", "active")

        // Get orders as buyer
        const { data: buyerOrders } = await supabase.from("orders").select("id, status").eq("user_id", user.id)

        // Get orders as seller
        const { data: sellerOrders } = await supabase
          .from("order_items")
          .select("order_id, price, quantity, order:order_id(status)")
          .eq("seller_id", user.id)

        // Calculate stats
        const pendingOrders =
          buyerOrders?.filter((order) => ["pending", "processing"].includes(order.status)).length || 0

        const completedOrders = buyerOrders?.filter((order) => order.status === "delivered").length || 0

        const totalSales =
          sellerOrders?.reduce((sum, item) => {
            if (item.order?.status === "delivered") {
              return sum + Number.parseFloat(item.price) * item.quantity
            }
            return sum
          }, 0) || 0

        setStats({
          activeListings: activeListings || 0,
          pendingOrders,
          completedOrders,
          totalSales,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase, user])

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-1/2 bg-muted rounded"></div>
                <div className="h-8 w-1/3 bg-muted rounded mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 w-3/4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/sell">
          <Button>Sell an Item</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Listings</CardDescription>
            <CardTitle className="text-3xl">{stats.activeListings}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <Package className="mr-1 h-4 w-4" />
              Items you're currently selling
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Orders</CardDescription>
            <CardTitle className="text-3xl">{stats.pendingOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <ShoppingCart className="mr-1 h-4 w-4" />
              Orders awaiting delivery
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed Orders</CardDescription>
            <CardTitle className="text-3xl">{stats.completedOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <Star className="mr-1 h-4 w-4" />
              Successfully delivered orders
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sales</CardDescription>
            <CardTitle className="text-3xl">${stats.totalSales.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <DollarSign className="mr-1 h-4 w-4" />
              Revenue from your sales
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Listings</CardTitle>
            <CardDescription>Your recently listed items for sale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <Package className="mx-auto h-8 w-8 mb-2" />
              <p>You don't have any listings yet</p>
              <Link href="/sell">
                <Button variant="link">Create your first listing</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your recent purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <ShoppingCart className="mx-auto h-8 w-8 mb-2" />
              <p>You don't have any orders yet</p>
              <Link href="/shop">
                <Button variant="link">Start shopping</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
