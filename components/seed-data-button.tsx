"use client"

import { Button } from "@/components/ui/button"
import { Database, Loader2 } from "lucide-react"
import { useSeedData } from "@/hooks/use-seed-data"
import { useToast } from "@/hooks/use-toast"

export function SeedDataButton() {
  const { generateSeedData, isGenerating } = useSeedData()
  const { toast } = useToast()

  const handleGenerateSeedData = async () => {
    await generateSeedData()
    toast({
      title: "Test data generated",
      description: "Sample projects and team members have been created.",
    })
  }

  return (
    <Button variant="outline" onClick={handleGenerateSeedData} disabled={isGenerating}>
      {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
      {isGenerating ? "Generating..." : "Generate Test Data"}
    </Button>
  )
}

