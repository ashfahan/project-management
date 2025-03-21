"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"

interface DeleteConfirmPopoverProps {
  onConfirm: () => void
  isDeleting?: boolean
  triggerClassName?: string
}

export function DeleteConfirmPopover({
  onConfirm,
  isDeleting = false,
  triggerClassName = "",
}: DeleteConfirmPopoverProps) {
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    onConfirm()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="destructive" className={triggerClassName} disabled={isDeleting}>
          {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
          Delete
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" side="top" align="center" sideOffset={5}>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Are you sure?</h4>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete this item.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirm} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
              Delete
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

