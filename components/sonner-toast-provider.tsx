"use client"

import { Toaster as SonnerToaster } from "sonner"
import { useTheme } from "next-themes"

export function SonnerToastProvider() {
  const { theme } = useTheme()

  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        },
      }}
      theme={theme as "light" | "dark" | "system"}
      closeButton
      richColors
      className="z-[9999]" // Add a high z-index to ensure toasts appear above other elements
    />
  )
}

