"use client"

import { useEffect } from "react"

export default function DynamicTitle() {
  useEffect(() => {
    const updateTitle = async () => {
      try {
        const response = await fetch("/api/settings", {
          cache: "no-store",
        })
        if (response.ok) {
          const settings = await response.json()
          // API returns object, not array
          const siteName = settings.site_name || "글쓰니"
          document.title = siteName
        }
      } catch (error) {
        console.error("Failed to update title:", error)
      }
    }

    updateTitle()
  }, [])

  return null
}
