"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingBag, Package, User, ShoppingCart, PlusCircle } from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: ShoppingBag,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/listings",
      label: "My Listings",
      icon: Package,
      active: pathname === "/dashboard/listings",
    },
    {
      href: "/dashboard/orders",
      label: "My Orders",
      icon: ShoppingCart,
      active: pathname === "/dashboard/orders",
    },
    {
      href: "/dashboard/profile",
      label: "My Profile",
      icon: User,
      active: pathname === "/dashboard/profile",
    },
  ]

  return (
    <ScrollArea className="h-full py-2">
      <div className="flex flex-col gap-2 p-2">
        <Link href="/sell">
          <Button className="w-full justify-start gap-2">
            <PlusCircle className="h-4 w-4" />
            Sell an Item
          </Button>
        </Link>

        <div className="mt-4">
          <h3 className="mb-2 px-4 text-sm font-semibold">Dashboard</h3>
          <nav className="grid gap-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
                  route.active ? "bg-muted" : "transparent",
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </ScrollArea>
  )
}
