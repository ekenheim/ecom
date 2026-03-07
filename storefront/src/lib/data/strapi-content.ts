import {
  strapiGet,
  StrapiListResponse,
  StrapiProduct,
  StrapiMarketingBanner,
  StrapiLandingPage,
} from "@lib/strapi"

export async function getProductContent(
  handle: string,
): Promise<StrapiProduct | null> {
  const res = await strapiGet<StrapiListResponse<StrapiProduct>>(
    `/api/products?filters[handle][$eq]=${encodeURIComponent(handle)}&populate=seo_image,features`,
  )
  return res?.data?.[0] ?? null
}

export async function getActiveMarketingBanners(
  position?: StrapiMarketingBanner["position"],
): Promise<StrapiMarketingBanner[]> {
  const positionFilter = position
    ? `&filters[position][$eq]=${encodeURIComponent(position)}`
    : ""
  const res = await strapiGet<StrapiListResponse<StrapiMarketingBanner>>(
    `/api/marketing-banners?filters[active][$eq]=true${positionFilter}&populate=image,cta`,
  )
  return res?.data ?? []
}

export async function getLandingPage(
  slug: string,
): Promise<StrapiLandingPage | null> {
  const res = await strapiGet<StrapiListResponse<StrapiLandingPage>>(
    `/api/landing-pages?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=blocks`,
  )
  return res?.data?.[0] ?? null
}
