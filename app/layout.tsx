import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ProjectsProvider } from "@/hooks/use-projects"
import { TeamMembersProvider } from "@/hooks/use-team-members"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Project Management Tool</title>
        <meta name="description" content="A task management tool with boards, deadlines, and team assignments" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TeamMembersProvider>
            <ProjectsProvider>{children}</ProjectsProvider>
          </TeamMembersProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
