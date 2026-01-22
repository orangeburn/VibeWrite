export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

// Mapping of country codes to languages
const countryToLanguage: Record<string, 'zh' | 'en' | 'ja' | 'ko'> = {
    'CN': 'zh', // China
    'TW': 'zh', // Taiwan
    'HK': 'zh', // Hong Kong
    'MO': 'zh', // Macau
    'SG': 'zh', // Singapore
    'US': 'en', // United States
    'GB': 'en', // United Kingdom
    'CA': 'en', // Canada
    'AU': 'en', // Australia
    'JP': 'ja', // Japan
    'KR': 'ko', // South Korea
    // Add more mappings as needed
}

// Default language fallback order based on browser accept-language
const getBrowserLanguage = (acceptLanguage: string | null): 'zh' | 'en' | 'ja' | 'ko' => {
    if (!acceptLanguage) return 'zh'

    const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim())

    for (const lang of languages) {
        if (lang.startsWith('zh')) return 'zh'
        if (lang.startsWith('en')) return 'en'
        if (lang.startsWith('ja')) return 'ja'
        if (lang.startsWith('ko')) return 'ko'
    }

    return 'zh'
}

export async function GET(request: NextRequest) {
    try {
        // Get IP from headers (Vercel provides this in x-real-ip or x-forwarded-for)
        const ip = request.headers.get('x-real-ip') ||
            request.headers.get('x-forwarded-for')?.split(',')[0]

        // If we have an IP, try to geolocate
        if (ip && ip !== '::1' && !ip.startsWith('127.')) {
            try {
                // Using ipapi.co free tier (no API key needed for basic info)
                const response = await fetch(`https://ipapi.co/${ip}/json/`)
                const data = await response.json()

                if (data.country_code && countryToLanguage[data.country_code]) {
                    return NextResponse.json({
                        language: countryToLanguage[data.country_code],
                        source: 'ip_geolocation',
                        country: data.country_code,
                        country_name: data.country_name
                    })
                }
            } catch (error) {
                console.warn('IP geolocation failed:', error)
                // Fall through to browser detection
            }
        }

        // Fallback to browser language detection
        const acceptLanguage = request.headers.get('accept-language')
        const browserLang = getBrowserLanguage(acceptLanguage)

        return NextResponse.json({
            language: browserLang,
            source: 'browser',
            acceptLanguage
        })
    } catch (error) {
        console.error('Language detection error:', error)
        return NextResponse.json({
            language: 'zh',
            source: 'default',
            error: 'Detection failed'
        }, { status: 500 })
    }
}