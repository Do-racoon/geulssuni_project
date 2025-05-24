"use client"

import { useState, useEffect } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || ""

      // Check if mobile
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

      // Check if iOS
      const isIOSDevice = /iPhone|iPad|iPod/i.test(userAgent) && !(window as any).MSStream

      // Check if Android
      const isAndroidDevice = /Android/i.test(userAgent)

      setIsMobile(isMobileDevice)
      setIsIOS(isIOSDevice)
      setIsAndroid(isAndroidDevice)
    }

    checkMobile()

    // Also check on resize in case of device orientation changes
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return { isMobile, isIOS, isAndroid }
}

// Add the missing export as an alias to the existing function
export const useIsMobile = useMobile
