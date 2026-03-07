import "server-only"

// ---------------------------------------------------------------------------
// Types — Strapi v5 flat response structure (no .attributes wrapper)
// ---------------------------------------------------------------------------

export interface StrapiFeature {
  id: number
  label: string
}

export interface StrapiSeoImage {
  url: string
  alternativeText?: string | null
  width?: number | null
  height?: number | null
}

export interface StrapiCta {
  label: string
  url: string
  variant: "primary" | "secondary"
}

export interface StrapiProduct {
  id: number
  documentId: string
  medusa_id: string | null
  handle: string
  seo_title: string | null
  seo_description: string | null
  seo_image: StrapiSeoImage | null
  editorial_description: string | null
  features: StrapiFeature[]
}

export interface StrapiMarketingBanner {
  id: number
  documentId: string
  title: string
  subtitle: string | null
  cta: StrapiCta | null
  image: StrapiSeoImage | null
  active: boolean
  position:
    | "homepage_hero"
    | "homepage_secondary"
    | "plp_top"
    | "pdp_sidebar"
    | null
}

export interface StrapiLandingPage {
  id: number
  documentId: string
  slug: string
  title: string
  blocks: unknown[]
}

export interface StrapiListResponse<T> {
  data: T[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export interface StrapiSingleResponse<T> {
  data: T
  meta: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Fetch utilities
// ---------------------------------------------------------------------------

/**
 * Server-side fetch wrapper for Strapi v5 API calls.
 * Returns null on any error — callers must degrade gracefully.
 */
export async function strapiGet<T>(
  path: string,
  revalidate = 60,
): Promise<T | null> {
  const apiUrl = process.env.STRAPI_API_URL
  const apiToken = process.env.STRAPI_API_TOKEN

  if (!apiUrl) {
    return null
  }

  try {
    const res = await fetch(`${apiUrl}${path}`, {
      headers: apiToken
        ? { Authorization: `Bearer ${apiToken}` }
        : {},
      signal: AbortSignal.timeout(5000),
      next: { revalidate },
    })

    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

/**
 * Prepends the public Strapi domain to relative /uploads/... media URLs.
 * Passes through absolute URLs unchanged.
 */
export function strapiMedia(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith("http")) return url
  const publicUrl = process.env.STRAPI_PUBLIC_URL
  if (!publicUrl) return url
  return `${publicUrl}${url}`
}
