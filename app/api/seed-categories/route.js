import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

// This endpoint will seed the categories table with initial data
export async function GET() {
  try {
    // Check if categories already exist
    const { count, error: countError } = await supabase.from("categories").select("*", { count: "exact", head: true })

    if (countError) {
      throw countError
    }

    // If categories already exist, return success
    if (count > 0) {
      return NextResponse.json({
        success: true,
        message: "Categories already exist",
        count,
      })
    }

    // Categories to seed
    const categories = [
      { name: "Electronics", slug: "electronics" },
      { name: "Fashion", slug: "fashion" },
      { name: "Home & Garden", slug: "home-garden" },
      { name: "Sports & Outdoors", slug: "sports-outdoors" },
      { name: "Collectibles", slug: "collectibles" },
      { name: "Books & Media", slug: "books-media" },
    ]

    // Insert categories
    const { data, error } = await supabase.from("categories").insert(categories).select()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Categories seeded successfully",
      data,
    })
  } catch (error) {
    console.error("Error seeding categories:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
