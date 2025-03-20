"use client"

import { useCallback, useEffect, useState } from "react"
import { LOCAL_STORAGE_KEYS } from "@/constants/app-constants"

type Theme = "light" | "dark" | "system"

export function useThemeStorage() {
  const [theme, setThemeState] = useState<Theme>("light")

  // Load theme from localStorage on initial render
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME)
      if (storedTheme) {
        setThemeState(storedTheme as Theme)
      }
    } catch (error) {
      console.error("Failed to read theme from localStorage:", error)
    }
  }, [])

  // Save theme to localStorage
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)

    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, newTheme)
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error)
      // Continue even if localStorage fails - the theme will still work in memory
    }
  }, [])

  return {
    theme,
    setTheme,
  }
}

