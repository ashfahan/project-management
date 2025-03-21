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
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          padding: "16px",
          borderRadius: "8px",
          fontWeight: "500",
        },
        success: {
          style: {
            borderLeft: "4px solid hsl(var(--success))",
          },
        },
        error: {
          style: {
            borderLeft: "4px solid hsl(var(--destructive))",
          },
        },
        warning: {
          style: {
            borderLeft: "4px solid hsl(var(--warning))",
          },
        },
        info: {
          style: {
            borderLeft: "4px solid hsl(var(--primary))",
          },
        },
      }}
      theme={theme as "light" | "dark" | "system"}
      closeButton
      richColors={false} // Disable rich colors to use our custom colors
      zIndex={9999999}
      className="toast-container"
    />
  )
}

