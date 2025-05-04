"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductCard } from "@/components/product-card"
import { Filter } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function Shop() {
  const searchParams = useSearchParams()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedConditions, setSelectedConditions] = useState([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sortBy, setSortBy] = useState("newest")
  const [searchQuery, setSearchQuery] = useState("")

  // Get initial category from URL
  useEffect(() => {
    const categorySlug = searchParams.get("category")
    if (categorySlug) {
      // Find category by slug and add to selected categories
      const fetchCategory = async () => {
        const { data } = await supabase.from("categories").select("id").eq("slug", categorySlug).single()

        if (data) {
          setSelectedCategories([data.id.toString()])
        }
      }

      fetchCategory()
    }
  }, [searchParams])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*").order("name")

      if (data) {
        setCategories(data)
      }
    }

    fetchCategories()
  }, [])

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)

      let query = supabase
        .from("products")
        .select(`
          *,
          category:category_id(name),
          seller:seller_id(full_name),
          product_images(url, is_primary)
        `)
        .eq("status", "active")
        .gte("price", priceRange[0])
        .lte("price", priceRange[1])

      // Apply category filter
      if (selectedCategories.length > 0) {
        query = query.in("category_id", selectedCategories)
      }

      // Apply condition filter
      if (selectedConditions.length > 0) {
        query = query.in("condition", selectedConditions)
      }

      // Apply search query
      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`)
      }

      // Apply sorting
      switch (sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false })
          break
        case "oldest":
          query = query.order("created_at", { ascending: true })
          break
        case "price-low":
          query = query.order("price", { ascending: true })
          break
        case "price-high":
          query = query.order("price", { ascending: false })
          break
      }

      const { data, error } = await query

      if (data) {
        setProducts(data)
      }

      setLoading(false)
    }

    fetchProducts()
  }, [selectedCategories, selectedConditions, priceRange, sortBy, searchQuery])

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const handleConditionChange = (condition) => {
    setSelectedConditions((prev) => {
      if (prev.includes(condition)) {
        return prev.filter((c) => c !== condition)
      } else {
        return [...prev, condition]
      }
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    setSearchQuery(formData.get("search") || "")
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedConditions([])
    setPriceRange([0, 1000])
    setSortBy("newest")
    setSearchQuery("")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <div className="container py-8 flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters - Desktop */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="sticky top-20 space-y-6">
              <div>
                <h3 className="font-medium mb-2 flex items-center justify-between">
                  Filters
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                </h3>
                <Separator className="my-4" />
              </div>

              <div>
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id.toString())}
                        onCheckedChange={() => handleCategoryChange(category.id.toString())}
                      />
                      <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Condition</h4>
                <div className="space-y-2">
                  {["new", "used", "refurbished"].map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={`condition-${condition}`}
                        checked={selectedConditions.includes(condition)}
                        onCheckedChange={() => handleConditionChange(condition)}
                      />
                      <Label htmlFor={`condition-${condition}`}>
                        {condition.charAt(0).toUpperCase() + condition.slice(1)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <Slider
                  defaultValue={[0, 1000]}
                  min={0}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mb-6"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm">${priceRange[0]}</span>
                  <span className="text-sm">${priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h1 className="text-3xl font-bold">Shop</h1>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Mobile filter button */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="md:hidden">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="py-4 space-y-6">
                        <div>
                          <h4 className="font-medium mb-3">Categories</h4>
                          <div className="space-y-2">
                            {categories.map((category) => (
                              <div key={category.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`mobile-category-${category.id}`}
                                  checked={selectedCategories.includes(category.id.toString())}
                                  onCheckedChange={() => handleCategoryChange(category.id.toString())}
                                />
                                <Label htmlFor={`mobile-category-${category.id}`}>{category.name}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Condition</h4>
                          <div className="space-y-2">
                            {["new", "used", "refurbished"].map((condition) => (
                              <div key={condition} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`mobile-condition-${condition}`}
                                  checked={selectedConditions.includes(condition)}
                                  onCheckedChange={() => handleConditionChange(condition)}
                                />
                                <Label htmlFor={`mobile-condition-${condition}`}>
                                  {condition.charAt(0).toUpperCase() + condition.slice(1)}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Price Range</h4>
                          <Slider
                            defaultValue={[0, 1000]}
                            min={0}
                            max={1000}
                            step={10}
                            value={priceRange}
                            onValueChange={setPriceRange}
                            className="mb-6"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-sm">${priceRange[0]}</span>
                            <span className="text-sm">${priceRange[1]}</span>
                          </div>
                        </div>

                        <Button onClick={clearFilters} className="w-full">
                          Clear Filters
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <form onSubmit={handleSearch} className="relative">
                <Input name="search" placeholder="Search products..." defaultValue={searchQuery} className="pr-12" />
                <Button type="submit" size="sm" className="absolute right-1 top-1 h-8">
                  Search
                </Button>
              </form>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
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
              ) : (
                <>
                  {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                      {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium">No products found</h3>
                      <p className="text-muted-foreground mt-2">Try adjusting your filters or search query</p>
                      <Button variant="outline" onClick={clearFilters} className="mt-4">
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
