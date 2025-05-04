"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ImageUpload } from "@/components/image-upload"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function SellItem() {
  const router = useRouter()
  const { user, supabase } = useAuth()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState("new")
  const [quantity, setQuantity] = useState("1")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [storageError, setStorageError] = useState(null)

  // Initialize storage bucket
  useEffect(() => {
    const initStorage = async () => {
      try {
        const response = await fetch("/api/init-storage")
        const data = await response.json()

        if (!data.success) {
          setStorageError(data.error || "Failed to initialize storage bucket")
        }
      } catch (error) {
        console.error("Error initializing storage:", error)
        setStorageError("Could not connect to storage service")
      }
    }

    initStorage()
  }, [])

  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from("categories").select("*").order("name")

        if (error) {
          throw error
        }

        if (data) {
          setCategories(data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "Error loading categories",
          description: "Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoadingCategories(false)
      }
    }

    if (user) {
      fetchCategories()
    }
  }, [supabase, user, toast])

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold">Sign in required</h1>
                <p className="text-muted-foreground">You need to be signed in to list an item for sale.</p>
                <Button onClick={() => router.push("/login")} className="w-full">
                  Sign in
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <SiteFooter />
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (images.length === 0) {
      toast({
        title: "Image required",
        description: "Please upload at least one image of your item.",
        variant: "destructive",
      })
      return
    }

    if (!category) {
      toast({
        title: "Category required",
        description: "Please select a category for your item.",
        variant: "destructive",
      })
      return
    }

    if (storageError) {
      toast({
        title: "Storage not available",
        description: "The image storage system is not available. Please try again later.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Create slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
        .concat("-", Date.now().toString().slice(-6))

      // Insert product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          title,
          slug,
          description,
          price: Number.parseFloat(price),
          category_id: Number.parseInt(category), // Ensure category_id is a number
          condition,
          quantity: Number.parseInt(quantity),
          seller_id: user.id,
          city,
          country,
          status: "active", // Set status to active by default
        })
        .select()
        .single()

      if (productError) throw productError

      // Upload images
      const uploadedImages = []

      for (let i = 0; i < images.length; i++) {
        const file = images[i].file
        const isPrimary = i === 0

        try {
          // Upload to storage
          const fileExt = file.name.split(".").pop()
          const fileName = `${Date.now()}-${i}.${fileExt}`
          const filePath = `${product.id}/${fileName}`

          console.log("Uploading image to path:", filePath)

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            })

          if (uploadError) {
            console.error("Error uploading image:", uploadError)
            continue // Skip this image but continue with others
          }

          console.log("Upload successful:", uploadData)

          // Get public URL
          const { data: publicURLData } = supabase.storage.from("product-images").getPublicUrl(filePath)

          console.log("Public URL data:", publicURLData)

          if (!publicURLData || !publicURLData.publicUrl) {
            console.error("Failed to get public URL for uploaded image")
            continue
          }

          const publicUrl = publicURLData.publicUrl
          console.log("Image public URL:", publicUrl)

          // Insert image record
          const { data: imageData, error: imageError } = await supabase
            .from("product_images")
            .insert({
              product_id: product.id,
              url: publicUrl,
              is_primary: isPrimary,
            })
            .select()

          if (imageError) {
            console.error("Error saving image record:", imageError)
            continue
          }

          console.log("Image record saved:", imageData)
          uploadedImages.push(publicUrl)
        } catch (error) {
          console.error("Unexpected error during image upload:", error)
        }
      }

      if (uploadedImages.length === 0) {
        throw new Error("Failed to upload any images. Please try again.")
      }

      toast({
        title: "Item listed successfully!",
        description: "Your item is now available for sale.",
      })

      router.push("/dashboard/listings")
    } catch (error) {
      console.error("Error listing item:", error)
      toast({
        title: "Error listing item",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (file) => {
    setImages((prev) => [...prev, { file, preview: URL.createObjectURL(file) }])
  }

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <div className="container py-8 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Sell an Item</h1>

          {storageError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Storage Error</AlertTitle>
              <AlertDescription>
                There was a problem initializing the image storage system. You may not be able to upload images.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Item Details</h2>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item in detail"
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCategories ? (
                        <SelectItem value="" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : categories.length > 0 ? (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          {/* Fallback categories if database fetch fails */}
                          <SelectItem value="1">Electronics</SelectItem>
                          <SelectItem value="2">Fashion</SelectItem>
                          <SelectItem value="3">Home & Garden</SelectItem>
                          <SelectItem value="4">Sports & Outdoors</SelectItem>
                          <SelectItem value="5">Collectibles</SelectItem>
                          <SelectItem value="6">Books & Media</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Condition</Label>
                <RadioGroup value={condition} onValueChange={setCondition} className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="condition-new" />
                    <Label htmlFor="condition-new">New</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="used" id="condition-used" />
                    <Label htmlFor="condition-used">Used</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="refurbished" id="condition-refurbished" />
                    <Label htmlFor="condition-refurbished">Refurbished</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Location</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter your city"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Enter your country"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Images</h2>
              <p className="text-sm text-muted-foreground">
                Upload at least one image of your item. The first image will be the main image.
              </p>

              <ImageUpload images={images} onUpload={handleImageUpload} onRemove={handleRemoveImage} />
            </div>

            <div className="pt-4 border-t flex justify-end">
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? "Listing Item..." : "List Item for Sale"}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
