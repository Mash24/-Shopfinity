import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingCTA() {
  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to start buying and selling?</h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Join our global community of buyers and sellers today. Create an account in minutes and start exploring.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Create an Account
              </Button>
            </Link>
            <Link href="/shop">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
