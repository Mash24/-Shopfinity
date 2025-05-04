"use client"

import { useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { LandingHero } from "@/components/landing/hero"
import { LandingFeatures } from "@/components/landing/features"
import { LandingCTA } from "@/components/landing/cta"
import { LandingCategories } from "@/components/landing/categories"
import { LandingTestimonials } from "@/components/landing/testimonials"

export default function Home() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        await fetch(`${baseUrl}/api/seed-categories`)
        await fetch(`${baseUrl}/api/init-storage`)
      } catch (error) {
        console.error("❌ Error initializing app:", error)
      }
    }

    initializeApp()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <LandingHero />
        <LandingCategories />
        <LandingFeatures />
        <LandingTestimonials />
        <LandingCTA />
      </main>
      <SiteFooter />
    </div>
  )
}