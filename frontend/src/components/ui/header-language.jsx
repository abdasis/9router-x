import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { LOCALE_COOKIE, LOCALES, LOCALE_NAMES, normalizeLocale } from "@/i18n/config"
import { LOCALE_FLAGS } from "@/shared/constants/locales"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { reloadTranslations } from "@/i18n/runtime"

function getLocaleFromCookie() {
  if (typeof document === "undefined") return "en"
  const cookie = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith(`${LOCALE_COOKIE}=`))
  const value = cookie ? decodeURIComponent(cookie.split("=")[1]) : "en"
  return normalizeLocale(value)
}

export default function HeaderLanguage() {
  const [locale, setLocale] = useState("en")
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setLocale(getLocaleFromCookie())
  }, [])

  const handleSetLocale = async (nextLocale) => {
    if (nextLocale === locale || isPending) return
    setIsPending(true)
    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      })
      await reloadTranslations()
      setLocale(nextLocale)
    } catch (err) {
      console.error("Failed to set locale:", err)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-lg" data-i18n-skip="true">
          {LOCALE_FLAGS[locale] || "🌐"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto" data-i18n-skip="true">
        {LOCALES.map((item) => (
          <DropdownMenuItem
            key={item}
            disabled={isPending}
            onSelect={() => handleSetLocale(item)}
            className={item === locale ? "bg-accent" : ""}
          >
            <span className="mr-2 text-base">{LOCALE_FLAGS[item] || "🌐"}</span>
            <span className="flex-1">{LOCALE_NAMES[item] || item}</span>
            {item === locale && <Check className="size-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
