"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, BookOpen, CalendarDays, Bot } from "lucide-react"

const items = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Santri",
    href: "/student",
    icon: Users,
  },
  {
    title: "Ustadz",
    href: "/teacher",
    icon: Users,
  },
  {
    title: "Hafalan",
    href: "/hafalan",
    icon: BookOpen,
  },
  {
    title: "Absensi",
    href: "/absensi",
    icon: CalendarDays,
  },
  {
    title: "AI Assistant",
    href: "/ai-assistant",
    icon: Bot,
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
            pathname === item.href ? "bg-primary text-primary-foreground" : "transparent",
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}

