import { ShoppingBag, Globe, Shield, Truck } from "lucide-react"

export function LandingFeatures() {
  const features = [
    {
      icon: ShoppingBag,
      title: "Easy Selling",
      description: "List your items in minutes with our simple and intuitive selling process.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with buyers and sellers from around the world in our diverse marketplace.",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Our secure payment system protects both buyers and sellers throughout the transaction.",
    },
    {
      icon: Truck,
      title: "Shipping Support",
      description: "Get shipping recommendations and tracking for a smooth delivery experience.",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Why Choose Shopfinity?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform makes buying and selling simple, secure, and accessible to everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg bg-background shadow-sm">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
