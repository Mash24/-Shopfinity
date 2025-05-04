import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function LandingTestimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Buyer",
      content:
        "I've found so many unique items on Shopfinity that I couldn't find anywhere else. The secure payment system gives me peace of mind with every purchase.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Seller",
      content:
        "As a seller, I love how easy it is to list my products and reach customers worldwide. The platform fees are reasonable and the seller dashboard is intuitive.",
      rating: 5,
    },
    {
      name: "Emma Rodriguez",
      role: "Buyer & Seller",
      content:
        "Shopfinity has become my go-to marketplace for both buying and selling. The community is supportive and the customer service is excellent.",
      rating: 4,
    },
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">What Our Users Say</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied buyers and sellers on our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground flex-grow">{testimonial.content}</p>
                <div className="mt-6 pt-6 border-t">
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
