import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getRegion } from "@lib/data/regions"
import {
  getProductByHandle,
  getProductFashionDataByHandle,
} from "@lib/data/products"
import { getProductContent } from "@lib/data/strapi-content"
import { strapiMedia } from "@lib/strapi"
import ProductTemplate from "@modules/products/templates"

// Prevent build-time static generation — the internal cluster Strapi URL is
// unreachable from GitHub Actions build runners, which would bake fallback
// (Strapi-less) HTML into the Docker image. With force-dynamic, pages render
// at runtime inside the cluster where Strapi is available.
export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle, countryCode } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const [product, content] = await Promise.all([
    getProductByHandle(handle, region.id),
    getProductContent(handle),
  ])

  if (!product) {
    notFound()
  }

  const title = content?.seo_title ?? `${product.title} | Medusa Store`
  const description = content?.seo_description ?? product.title ?? undefined
  const ogImage =
    content?.seo_image?.url
      ? strapiMedia(content.seo_image.url) ?? undefined
      : product.thumbnail ?? undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description: description ?? undefined,
      images: ogImage ? [ogImage] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { handle, countryCode } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const [pricedProduct, fashionData, content] = await Promise.all([
    getProductByHandle(handle, region.id),
    getProductFashionDataByHandle(handle),
    getProductContent(handle),
  ])

  if (!pricedProduct) {
    notFound()
  }

  return (
    <ProductTemplate
      product={pricedProduct}
      materials={fashionData.materials}
      region={region}
      countryCode={countryCode}
      content={content}
    />
  )
}
