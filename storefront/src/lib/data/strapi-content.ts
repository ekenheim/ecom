import {
  strapiGet,
  StrapiListResponse,
  StrapiSingleResponse,
  StrapiAboutPage,
  StrapiInspirationPage,
  StrapiMarketingBanner,
} from "@lib/strapi"

export async function getAboutPageContent(): Promise<StrapiAboutPage | null> {
  const res = await strapiGet<StrapiSingleResponse<StrapiAboutPage>>(
    "/api/about-page?populate=hero_image,sections.image",
  )
  return res?.data ?? null
}

export async function getInspirationPageContent(): Promise<StrapiInspirationPage | null> {
  const res = await strapiGet<StrapiSingleResponse<StrapiInspirationPage>>(
    "/api/inspiration-page?populate=hero_image,sections.image",
  )
  return res?.data ?? null
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
