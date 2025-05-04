"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"

const CartContext = createContext()

export function CartProvider({ children }) {
  const { user, supabase } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Load cart from database if user is logged in, otherwise from localStorage
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true)

      if (user) {
        // Load cart from database
        const { data, error } = await supabase
          .from("cart_items")
          .select(`
            *,
            product:product_id (
              id,
              title,
              price,
              condition,
              status,
              product_images (
                url,
                is_primary
              )
            )
          `)
          .eq("user_id", user.id)

        if (data && !error) {
          setCartItems(data)
          setCartCount(data.reduce((sum, item) => sum + item.quantity, 0))
        }
      } else {
        // Load cart from localStorage
        try {
          const storedCart = localStorage.getItem("shopfinity_cart")
          if (storedCart) {
            const parsedCart = JSON.parse(storedCart)
            setCartItems(parsedCart)
            setCartCount(parsedCart.reduce((sum, item) => sum + item.quantity, 0))
          }
        } catch (error) {
          console.error("Error loading cart from localStorage:", error)
        }
      }

      setLoading(false)
    }

    loadCart()
  }, [user, supabase])

  // Save cart to localStorage when it changes (for non-logged in users)
  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem("shopfinity_cart", JSON.stringify(cartItems))
    }
  }, [cartItems, user, loading])

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    if (user) {
      // Add to database
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single()

      if (data) {
        // Update existing item
        const newQuantity = data.quantity + quantity
        await supabase.from("cart_items").update({ quantity: newQuantity, updated_at: new Date() }).eq("id", data.id)

        setCartItems((prev) => prev.map((item) => (item.id === data.id ? { ...item, quantity: newQuantity } : item)))
      } else {
        // Insert new item
        const { data: newItem } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity,
          })
          .select(`
            *,
            product:product_id (
              id,
              title,
              price,
              condition,
              status,
              product_images (
                url,
                is_primary
              )
            )
          `)
          .single()

        if (newItem) {
          setCartItems((prev) => [...prev, newItem])
        }
      }
    } else {
      // Add to localStorage
      const existingItemIndex = cartItems.findIndex((item) => item.product_id === product.id)

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...cartItems]
        updatedItems[existingItemIndex].quantity += quantity
        setCartItems(updatedItems)
      } else {
        // Add new item
        setCartItems((prev) => [
          ...prev,
          {
            product_id: product.id,
            quantity,
            product: {
              id: product.id,
              title: product.title,
              price: product.price,
              condition: product.condition,
              status: product.status,
              product_images: product.product_images,
            },
          },
        ])
      }
    }

    // Update cart count
    setCartCount((prev) => prev + quantity)
  }

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    if (user) {
      // Remove from database
      const { data } = await supabase.from("cart_items").select("quantity").eq("id", itemId).single()

      if (data) {
        await supabase.from("cart_items").delete().eq("id", itemId)

        setCartItems((prev) => prev.filter((item) => item.id !== itemId))
        setCartCount((prev) => prev - data.quantity)
      }
    } else {
      // Remove from localStorage
      const item = cartItems.find((item) => item.id === itemId || item.product_id === itemId)
      if (item) {
        setCartItems((prev) => prev.filter((i) => i.id !== itemId && i.product_id !== itemId))
        setCartCount((prev) => prev - item.quantity)
      }
    }
  }

  // Update item quantity
  const updateCartItemQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(itemId)
    }

    if (user) {
      // Update in database
      const { data: oldItem } = await supabase.from("cart_items").select("quantity").eq("id", itemId).single()

      if (oldItem) {
        await supabase.from("cart_items").update({ quantity, updated_at: new Date() }).eq("id", itemId)

        setCartItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)))

        setCartCount((prev) => prev - oldItem.quantity + quantity)
      }
    } else {
      // Update in localStorage
      const item = cartItems.find((item) => item.id === itemId || item.product_id === itemId)
      if (item) {
        const oldQuantity = item.quantity

        setCartItems((prev) => prev.map((i) => (i.id === itemId || i.product_id === itemId ? { ...i, quantity } : i)))

        setCartCount((prev) => prev - oldQuantity + quantity)
      }
    }
  }

  // Clear cart
  const clearCart = async () => {
    if (user) {
      // Clear from database
      await supabase.from("cart_items").delete().eq("user_id", user.id)
    }

    // Clear state
    setCartItems([])
    setCartCount(0)

    // Clear localStorage
    if (!user) {
      localStorage.removeItem("shopfinity_cart")
    }
  }

  const value = {
    cartItems,
    cartCount,
    loading,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
