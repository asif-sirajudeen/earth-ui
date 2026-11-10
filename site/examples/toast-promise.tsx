"use client"

import { Button } from "@asif-sirajudeen/earth-ui/button"
import { toast } from "@asif-sirajudeen/earth-ui/toast"

export function ToastPromise() {
  function showToast() {
    toast.promise(
      new Promise<{ name: string }>((resolve) => {
        window.setTimeout(() => resolve({ name: "Event" }), 2000)
      }),
      {
        loading: "Creating event…",
        success: (data) => `${data.name} created.`,
        error: "Could not create event.",
      }
    )
  }

  return (
    <Button variant="outline" onClick={showToast}>
      Create Event
    </Button>
  )
}
