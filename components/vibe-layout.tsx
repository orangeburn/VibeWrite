"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PanelLeft, Moon, Sun, Globe, Github } from "lucide-react"
import { useTheme } from "next-themes"
import { useAppStore } from "@/lib/store"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from "@/lib/i18n"

export function VibeLayout({ children }: { children: React.ReactNode }) {
    const { theme, setTheme } = useTheme()
    const { isSearchEnabled, setSearchEnabled, activeFold, setActiveFold } = useAppStore()
    const [mounted, setMounted] = React.useState(false)
    const { t } = useTranslation()

    React.useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className="flex h-screen overflow-hidden bg-background flex-col">
            {/* Top Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-3">
                    <PanelLeft className="h-5 w-5 text-muted-foreground" />
                    <h1 className="text-lg font-semibold tracking-tight">{t('appName')}</h1>
                </div>

                <div className="flex items-center gap-2">
                    {/* GitHub Link */}
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        title="GitHub"
                    >
                        <a
                            href="https://github.com/orangeburn/VibeWrite"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                        >
                            <Github className="h-4 w-4" />
                        </a>
                    </Button>

                    {/* Network Toggle Button (matches theme toggle style) */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSearchEnabled(!isSearchEnabled)}
                        className="relative"
                        title={isSearchEnabled ? t('networkStatus.online') : t('networkStatus.offline')}
                    >
                        <Globe className={cn("h-4 w-4 transition-colors", isSearchEnabled ? "text-primary" : "text-muted-foreground")} />
                        {isSearchEnabled && (
                            <span className="absolute top-2 right-2 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                        )}
                    </Button>

                    {/* Language Switcher */}
                    <LanguageSwitcher />

                    {/* Theme Toggle */}
                    {mounted && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                            {theme === "dark" ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative bg-slate-100/50 dark:bg-slate-900/50">
                {/* Act 1: Configuration Drawer/Full */}
                <div
                    className={cn(
                        "h-full overflow-hidden transition-all duration-700 ease-in-out z-20 bg-background border-r relative group",
                        activeFold === 1 ? "flex-1 min-w-[320px]" : "w-16 cursor-pointer hover:bg-accent/5"
                    )}
                    onClick={() => activeFold === 2 && setActiveFold(1)}
                >
                    {/* Vertical Label for Act 1 when collapsed */}
                    <div className={cn(
                        "absolute inset-y-0 left-0 w-16 flex flex-col items-center justify-center gap-8 transition-opacity duration-300 pointer-events-none",
                        activeFold === 2 ? "opacity-100" : "opacity-0"
                    )}>
                        <PanelLeft className="h-5 w-5 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground [writing-mode:vertical-lr] rotate-180">
                            {t('act1Label')}
                        </span>
                    </div>

                    <div className={cn(
                        "h-full w-full transition-all duration-500",
                        activeFold === 1 ? "opacity-100 visible" : "opacity-0 invisible"
                    )}>
                        <AppSidebar className="h-full w-full" isCollapsed={activeFold === 2} />
                    </div>
                </div>

                <main
                    className={cn(
                        "h-full overflow-hidden transition-all duration-700 ease-in-out relative flex flex-col",
                        activeFold === 2 ? "flex-1 bg-slate-50/50 dark:bg-slate-950/50" : "w-16 cursor-pointer hover:bg-accent/5 bg-background border-l"
                    )}
                    onClick={() => {
                        const hasStarted = useAppStore.getState().generationTrigger > 0
                        if (activeFold === 1) {
                            if (hasStarted) {
                                setActiveFold(2)
                            }
                        }
                    }}
                >
                    {/* Vertical Label for Act 2 when collapsed */}
                    <div className={cn(
                        "absolute inset-y-0 left-0 w-16 flex flex-col items-center justify-center gap-8 transition-opacity duration-300 pointer-events-none z-10",
                        activeFold === 1 ? "opacity-100" : "opacity-0 invisible"
                    )}>
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/50 border-t-primary animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground [writing-mode:vertical-lr] rotate-180">
                            {t('act2Label')}
                        </span>
                    </div>

                    <div className={cn(
                        "flex-1 overflow-auto transition-all duration-500 flex flex-col items-center",
                        activeFold === 2 ? "opacity-100 visible" : "opacity-0 invisible"
                    )}>
                        <div className="w-full max-w-4xl px-4 md:px-8 py-6">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
