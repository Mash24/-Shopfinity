import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// This endpoint will initialize the necessary storage buckets
export async function GET() {
  try {
    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    )

    // Check if the product-images bucket exists
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

    if (bucketsError) {
      throw bucketsError
    }

    const productImagesBucket = buckets.find((bucket) => bucket.name === "product-images")

    // If the bucket doesn't exist, create it
    if (!productImagesBucket) {
      const { data, error } = await supabaseAdmin.storage.createBucket("product-images", {
        public: true, // Make the bucket public so we can access images without authentication
        fileSizeLimit: 5242880, // 5MB limit
      })

      if (error) {
        throw error
      }

      // Try to update the bucket's CORS configuration
      try {
        await supabaseAdmin.storage.updateBucketCors("product-images", {
          allowedOrigins: ["*"],
          allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          allowedHeaders: ["*"],
          maxAgeSeconds: 3600,
        })

        console.log("CORS configuration updated for product-images bucket")
      } catch (corsError) {
        console.warn("Could not update CORS configuration:", corsError)
      }

      return NextResponse.json({
        success: true,
        message: "Product images bucket created successfully",
      })
    }

    // If the bucket exists but isn't public, update it to be public
    if (productImagesBucket && !productImagesBucket.public) {
      const { error } = await supabaseAdmin.storage.updateBucket("product-images", {
        public: true,
      })

      if (error) {
        throw error
      }

      // Try to update the bucket's CORS configuration
      try {
        await supabaseAdmin.storage.updateBucketCors("product-images", {
          allowedOrigins: ["*"],
          allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          allowedHeaders: ["*"],
          maxAgeSeconds: 3600,
        })

        console.log("CORS configuration updated for product-images bucket")
      } catch (corsError) {
        console.warn("Could not update CORS configuration:", corsError)
      }

      return NextResponse.json({
        success: true,
        message: "Product images bucket updated to be public",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Product images bucket already exists and is properly configured",
    })
  } catch (error) {
    console.error("Error initializing storage:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
