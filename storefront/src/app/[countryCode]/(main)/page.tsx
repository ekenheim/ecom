import { Metadata } from "next"
import Image from "next/image"
import { getRegion } from "@lib/data/regions"
import { getProductTypesList } from "@lib/data/product-types"
import { Layout, LayoutColumn } from "@/components/Layout"
import { LocalizedLink } from "@/components/LocalizedLink"
import { CollectionsSection } from "@/components/CollectionsSection"

export const metadata: Metadata = {
  title: "Tazari — Pure Ancestral Oils",
  description:
    "Moroccan Purity. Scandinavian Simplicity. 3 ancestral oils — Argan, Jojoba, and Squalane — in one ritual for face, body & hair.",
}

const ProductTypesSection: React.FC = async () => {
  const productTypes = await getProductTypesList(0, 20, [
    "id",
    "value",
    "metadata",
  ])

  if (!productTypes) {
    return null
  }

  return (
    <Layout className="mb-26 md:mb-36 max-md:gap-x-2">
      <LayoutColumn>
        <h3 className="text-md md:text-2xl mb-8 md:mb-15">Our products</h3>
      </LayoutColumn>
      {productTypes.productTypes.map((productType, index) => (
        <LayoutColumn
          key={productType.id}
          start={index % 2 === 0 ? 1 : 7}
          end={index % 2 === 0 ? 7 : 13}
        >
          <LocalizedLink href={`/store?type=${productType.value}`}>
            {typeof productType.metadata?.image === "object" &&
              productType.metadata.image &&
              "url" in productType.metadata.image &&
              typeof productType.metadata.image.url === "string" && (
                <Image
                  src={productType.metadata.image.url}
                  width={1200}
                  height={900}
                  alt={productType.value}
                  className="mb-2 md:mb-8"
                />
              )}
            <p className="text-xs md:text-md">{productType.value}</p>
          </LocalizedLink>
        </LayoutColumn>
      ))}
    </Layout>
  )
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  return (
    <>
      {/* Hero — full-screen image with text overlay */}
      <div className="relative max-md:pt-18">
        <Image
          src="/images/content/tazari-hero.png"
          width={2880}
          height={1500}
          alt="Tazari ancestral oil dropper bottle on Moroccan terracotta surface"
          className="md:h-screen w-full object-cover"
          priority
        />
        {/* Gradient scrim for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        {/* Hero copy — bottom-left */}
        <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-xl md:max-w-2xl">
          <p className="text-white text-xs md:text-base uppercase tracking-widest mb-3 md:mb-4 opacity-80">
            Moroccan Purity. Scandinavian Simplicity.
          </p>
          <h1 className="text-white text-lg md:text-3xl mb-4 md:mb-8 leading-tight">
            3 Ancestral Oils.<br />One Ritual.<br />Total Glow.
          </h1>
          <p className="text-white text-xs md:text-base mb-6 md:mb-10 opacity-80">
            No BS. Pure oils for face, body &amp; hair.
          </p>
          <LocalizedLink
            href="/store"
            className="inline-block bg-white text-black text-xs md:text-base font-medium px-8 py-3 rounded-full hover:bg-tazari-50 transition-colors"
          >
            Shop Now
          </LocalizedLink>
        </div>
      </div>

      {/* Ingredients strip */}
      <div className="bg-tazari-50 py-10 md:py-16">
        <Layout>
          <LayoutColumn className="col-span-full">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-tazari-300">
              <div className="py-8 md:py-0 md:px-10 first:md:pl-0 last:md:pr-0">
                <p className="text-xs uppercase tracking-widest text-tazari-700 mb-2">
                  Argan Oil
                </p>
                <h4 className="text-base md:text-sm font-medium mb-2">
                  Liquid Gold of Morocco
                </h4>
                <p className="text-xs text-grayscale-600">
                  Cold-pressed from the kernels of the argan tree. Repairs,
                  softens and protects with deep nourishing fatty acids and
                  vitamin E.
                </p>
              </div>
              <div className="py-8 md:py-0 md:px-10">
                <p className="text-xs uppercase tracking-widest text-tazari-700 mb-2">
                  Jojoba Oil
                </p>
                <h4 className="text-base md:text-sm font-medium mb-2">
                  The Skin-Matching Miracle
                </h4>
                <p className="text-xs text-grayscale-600">
                  Structurally identical to your skin&apos;s own sebum. Balances
                  oil production, soothes and delivers long-lasting hydration
                  without clogging pores.
                </p>
              </div>
              <div className="py-8 md:py-0 md:px-10">
                <p className="text-xs uppercase tracking-widest text-tazari-700 mb-2">
                  Squalane
                </p>
                <h4 className="text-base md:text-sm font-medium mb-2">
                  The Ultra-Light Hydrator
                </h4>
                <p className="text-xs text-grayscale-600">
                  Derived from olives. An ultra-lightweight emollient that locks
                  in moisture, smooths fine lines and leaves skin with a
                  luminous, weightless finish.
                </p>
              </div>
            </div>
          </LayoutColumn>
        </Layout>
      </div>

      <div className="pt-8 pb-26 md:pt-26 md:pb-36">
        {/* Tagline block */}
        <Layout className="mb-26 md:mb-36">
          <LayoutColumn start={1} end={{ base: 13, md: 8 }}>
            <h3 className="text-md max-md:mb-6 md:text-2xl">
              Moroccan Purity. Scandinavian Simplicity.
            </h3>
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, md: 9 }} end={13}>
            <div className="flex items-center h-full">
              <div className="md:text-md">
                <p className="mb-3">
                  A ritual built on generations of knowledge — distilled into
                  one bottle.
                </p>
                <LocalizedLink href="/store" variant="underline">
                  Explore the Collection
                </LocalizedLink>
              </div>
            </div>
          </LayoutColumn>
        </Layout>

        <ProductTypesSection />
        <CollectionsSection className="mb-22 md:mb-36" />

        {/* About Tazari */}
        <Layout>
          <LayoutColumn className="col-span-full">
            <h3 className="text-md md:text-2xl mb-8 md:mb-16">
              About Tazari
            </h3>
            <Image
              src="/images/content/tazari-about.png"
              width={2496}
              height={1400}
              alt="Argan, Jojoba and Squalane ingredients flat-lay with Tazari bottle"
              className="mb-8 md:mb-16 max-md:aspect-[3/2] max-md:object-cover w-full"
            />
          </LayoutColumn>
          <LayoutColumn start={1} end={{ base: 13, md: 7 }}>
            <h2 className="text-md md:text-2xl">
              At Tazari, we believe beauty rituals should be ancestral, not
              industrial.
            </h2>
          </LayoutColumn>
          <LayoutColumn
            start={{ base: 1, md: 8 }}
            end={13}
            className="mt-6 md:mt-19"
          >
            <div className="md:text-md">
              <p className="mb-5 md:mb-9">
                Born from the meeting point of Moroccan tradition and
                Scandinavian minimalism, Tazari was founded on a single belief:
                that the most powerful skincare ingredients have existed for
                centuries — they just needed to be brought together.
              </p>
              <p className="mb-5 md:mb-3">
                We source our three ancestral oils — Argan, Jojoba and
                Squalane — with full traceability, cold-press them to preserve
                every active molecule, and bottle them undiluted. Nothing added.
                Nothing taken away.
              </p>
              <LocalizedLink href="/about" variant="underline">
                Read more about Tazari
              </LocalizedLink>
            </div>
          </LayoutColumn>
        </Layout>
      </div>
    </>
  )
}
