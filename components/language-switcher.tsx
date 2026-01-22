"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { useVibeWriteStore } from "@/store/useVibeWriteStore"
import { useEffect, useState } from "react"
import { useTranslation } from "@/lib/i18n"

const languages = [
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
] as const

const LANGUAGE_STORAGE_KEY = 'vibewrite_language'

export function LanguageSwitcher() {
    const { language, setLanguage } = useVibeWriteStore()
    const { t } = useTranslation()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" disabled>
                <Globe className="h-4 w-4" />
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title={t('currentLanguage', { language: currentLanguage.name })}>
                    <div className="flex items-center gap-1">
                        <span className="text-sm">{currentLanguage.flag}</span>
                        <Globe className="h-4 w-4" />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                        {lang.code === language && (
                            <span className="ml-auto text-xs text-muted-foreground">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}