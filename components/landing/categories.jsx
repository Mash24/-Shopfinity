import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export function LandingCategories() {
  const categories = [
    {
      name: "Electronics",
      image: "/placeholder.svg?height=200&width=300",
      slug: "electronics",
    },
    {
      name: "Fashion",
      image: "/placeholder.svg?height=200&width=300",
      slug: "fashion",
    },
    {
      name: "Home & Garden",
      image: "/placeholder.svg?height=200&width=300",
      slug: "home-garden",
    },
    {
      name: "Sports & Outdoors",
      image: "/placeholder.svg?height=200&width=300",
      slug: "sports-outdoors",
    },
    {
      name: "Collectibles",
      image: "/placeholder.svg?height=200&width=300",
      slug: "collectibles",
    },
    {
      name: "Books & Media",
      image: "/placeholder.svg?height=200&width=300",
      slug: "books-media",
    },
  ]

  return (
    <section className="py-16">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Popular Categories</h2>
            <p className="mt-2 text-muted-foreground">Explore our wide range of product categories</p>
          </div>
          <Link href="/categories" className="text-primary hover:underline mt-4 md:mt-0">
            View all categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link key={category.slug} href={`/shop?category=${category.slug}`}>
              <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                <div className="aspect-square relative">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-center">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
