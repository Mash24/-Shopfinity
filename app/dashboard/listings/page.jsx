"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, Package } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

export default function Listings() {
  const { user, supabase } = useAuth()
  const { toast } = useToast()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            category:category_id(name),
            product_images(id, url, is_primary)
          `)
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setListings(data || [])
      } catch (error) {
        console.error("Error fetching listings:", error)
        toast({
          title: "Error",
          description: "Failed to load your listings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [supabase, user, toast])

  const handleDeleteListing = async (id) => {
    try {
      // Delete the product
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) throw error

      // Update the listings state
      setListings((prev) => prev.filter((listing) => listing.id !== id))

      toast({
        title: "Success",
        description: "Listing deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting listing:", error)
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Listings</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link href="/sell">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No listings yet</h2>
          <p className="text-muted-foreground mb-4">You haven't listed any items for sale yet.</p>
          <Link href="/sell">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Listing
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listings.map((listing) => {
            // Find primary image or use first image
            const primaryImage = listing.product_images?.find((img) => img.is_primary)
            const imageUrl =
              primaryImage?.url ||
              (listing.product_images?.length > 0 ? listing.product_images[0].url : null) ||
              "/placeholder.svg?height=300&width=300"

            return (
              <Card key={listing.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={imageUrl || "/placeholder.svg?height=300&width=300"}
                    alt={listing.title}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      console.error("Failed to load listing image:", imageUrl)
                      e.target.src = "/placeholder.svg?height=300&width=300"
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                      {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium line-clamp-1">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{listing.category?.name || "Uncategorized"}</p>
                  <p className="font-bold mt-2">${Number.parseFloat(listing.price).toFixed(2)}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Link href={`/product/${listing.slug}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/listings/edit/${listing.id}`}>
                      <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this listing? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteListing(listing.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
