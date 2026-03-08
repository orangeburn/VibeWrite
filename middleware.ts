import { NextRequest, NextResponse } from "next/server"

const MAX_IP_PER_DAY = 10
const MAX_GLOBAL_PER_DAY = 100
const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000

type CounterState = {
  dateKey: string
  globalCount: number
  ipCounts: Map<string, number>
}

const state: CounterState = {
  dateKey: "",
  globalCount: 0,
  ipCounts: new Map(),
}

function getBeijingDateKey() {
  return new Date(Date.now() + BEIJING_OFFSET_MS).toISOString().slice(0, 10)
}

function getClientIp(request: NextRequest) {
  return (
    request.ip ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  )
}

function getPreferredLanguage(request: NextRequest): "zh" | "en" | "ja" | "ko" {
  const acceptLanguage = request.headers.get("accept-language") || ""
  const langs = acceptLanguage.split(",").map((lang) => lang.split(";")[0].trim())
  for (const lang of langs) {
    if (lang.startsWith("zh")) return "zh"
    if (lang.startsWith("en")) return "en"
    if (lang.startsWith("ja")) return "ja"
    if (lang.startsWith("ko")) return "ko"
  }
  return "zh"
}

function getQuotaMessage(lang: "zh" | "en" | "ja" | "ko") {
  switch (lang) {
    case "en":
      return "Today's quota is used up"
    case "ja":
      return "本日の上限に達しました"
    case "ko":
      return "오늘의 할당량을 모두 사용했습니다"
    default:
      return "今日额度已完"
  }
}

export function middleware(request: NextRequest) {
  const today = getBeijingDateKey()
  if (state.dateKey !== today) {
    state.dateKey = today
    state.globalCount = 0
    state.ipCounts.clear()
  }

  const ip = getClientIp(request)
  const currentIpCount = state.ipCounts.get(ip) ?? 0
  const lang = getPreferredLanguage(request)
  const message = getQuotaMessage(lang)

  if (state.globalCount >= MAX_GLOBAL_PER_DAY) {
    return NextResponse.json(
      { error: "quota_exceeded", message },
      {
        status: 429,
        headers: { "x-rate-limit-message": message },
      }
    )
  }

  if (currentIpCount >= MAX_IP_PER_DAY) {
    return NextResponse.json(
      { error: "quota_exceeded", message },
      {
        status: 429,
        headers: { "x-rate-limit-message": message },
      }
    )
  }

  state.globalCount += 1
  state.ipCounts.set(ip, currentIpCount + 1)

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
