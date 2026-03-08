"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { useTranslation } from "@/lib/i18n"

function isApiUrl(inputUrl: string) {
  try {
    const url = new URL(inputUrl, window.location.origin)
    return url.origin === window.location.origin && url.pathname.startsWith("/api/")
  } catch {
    return false
  }
}

export function ApiRateLimitToast() {
  const { t } = useTranslation()

  useEffect(() => {
    const w = window as typeof window & {
      __vibewriteFetchPatched?: boolean
      __vibewriteFetchOriginal?: typeof window.fetch
    }

    if (w.__vibewriteFetchPatched) {
      return
    }

    if (!w.__vibewriteFetchOriginal) {
      w.__vibewriteFetchOriginal = window.fetch.bind(window)
    }

    const originalFetch = w.__vibewriteFetchOriginal

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await originalFetch(input, init)

      try {
        const inputUrl =
          typeof input === "string"
            ? input
            : input instanceof Request
              ? input.url
              : input.toString()

        if (isApiUrl(inputUrl) && response.status === 429) {
          const message =
            response.headers.get("x-rate-limit-message") ||
            t("toast.quotaExceeded")
          toast.warning(message)
        }
      } catch {
        // Ignore toast errors to avoid breaking fetch consumers.
      }

      return response
    }

    w.__vibewriteFetchPatched = true
  }, [t])

  return null
}
