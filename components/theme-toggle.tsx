"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")
  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
  const icon = theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />

  return (
    <Button variant="outline" onClick={toggleTheme} aria-label={label} className="h-9">
      {icon}
      <span>Theme</span>
    </Button>
  )
}

