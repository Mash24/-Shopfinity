import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingHero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background z-0"></div>
      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Buy and Sell Worldwide with Shopfinity
            </h1>
            <p className="text-xl text-muted-foreground">
              The modern marketplace for new and second-hand items. Connect with buyers and sellers around the globe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link href="/shop">
                <Button size="lg" className="w-full sm:w-auto">
                  Shop Now
                </Button>
              </Link>
              <Link href="/sell">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sell an Item
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/50 z-10"></div>
            <img
              src="/placeholder.svg?height=500&width=600"
              alt="Shopfinity Marketplace"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
