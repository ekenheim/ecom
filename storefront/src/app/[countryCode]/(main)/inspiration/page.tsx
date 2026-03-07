import { Metadata } from "next"
import Image from "next/image"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"
import { LocalizedLink } from "@/components/LocalizedLink"
import { CollectionsSection } from "@/components/CollectionsSection"

export const metadata: Metadata = {
  title: "Inspiration — Tazari",
  description:
    "Discover the rituals, ingredients and stories behind Tazari's ancestral oils.",
}

export const dynamic = "force-dynamic"

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
      regions.flatMap((r) =>
        r.countries
          ? r.countries
              .map((c) => c.iso_2)
              .filter(
                (value): value is string =>
                  typeof value === "string" && Boolean(value)
              )
          : []
      )
    )

    const staticParams = countryCodes.map((countryCode) => ({
      countryCode,
    }))

    return staticParams
  } catch (error) {
    console.error(error)
    return []
  }
}

export default function InspirationPage() {
  return (
    <>
      {/* Section 1 — The Glow Ritual */}
      <div className="max-md:pt-18">
        <Image
          src="/images/content/tazari-insp-1.png"
          width={2880}
          height={1500}
          alt="Golden oil drop falling from a dropper onto glowing skin"
          className="md:h-screen md:object-cover mb-8 md:mb-26 w-full"
          priority
        />
      </div>
      <div className="pb-26 md:pb-36">
        <Layout>
          <LayoutColumn start={1} end={{ base: 13, md: 8 }}>
            <h3 className="text-md mb-6 md:mb-16 md:text-2xl">
              Three drops. That is the ritual.
            </h3>
            <div className="md:text-md max-md:mb-16 max-w-135">
              <p>
                Morning or evening, the ritual is the same. Warm three drops of
                Tazari Glow between your palms, press gently into clean skin,
                work through hair ends, or smooth over dry body. The oils absorb
                in seconds. The glow lasts all day.
              </p>
            </div>
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, md: 9 }} end={13}>
            <LocalizedLink href="/store">
              <Image
                src="/images/content/tazari-product-card.png"
                width={768}
                height={572}
                alt="Tazari Glow Elixir dropper bottle"
                className="mb-4 md:mb-6"
              />
              <div className="flex justify-between">
                <div>
                  <p className="mb-1">Tazari Glow Elixir</p>
                  <p className="text-grayscale-500 text-xs">
                    Argan · Jojoba · Squalane
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-tazari-700">Shop Now</p>
                </div>
              </div>
            </LocalizedLink>
          </LayoutColumn>

          {/* Section 2 — The Three Oils */}
          <LayoutColumn>
            <Image
              src="/images/content/tazari-about.png"
              width={2496}
              height={1404}
              alt="Argan, Jojoba and Squalane ingredients flat-lay with Tazari bottle"
              className="mt-26 md:mt-36 mb-8 md:mb-26 w-full"
            />
          </LayoutColumn>
          <LayoutColumn start={1} end={{ base: 13, md: 8 }}>
            <h3 className="text-md mb-6 md:mb-16 md:text-2xl">
              Three oils. One origin story.
            </h3>
            <div className="md:text-md max-md:mb-16 max-w-135">
              <p>
                Argan from the sun-dried valleys of southern Morocco. Jojoba
                from the Sonoran desert, where it has been used for generations
                to protect skin against extreme conditions. Squalane from
                Spanish olives — light, stable, and identical in structure to
                what your own skin produces. Each oil was chosen because people
                trusted it long before we did.
              </p>
            </div>
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, md: 9 }} end={13}>
            <LocalizedLink
              href="/store"
              className="mb-8 md:mb-16 inline-block w-full"
            >
              <Image
                src="/images/content/tazari-product-card.png"
                width={768}
                height={572}
                alt="Tazari Glow Elixir — face ritual"
                className="mb-4 md:mb-6"
              />
              <div className="flex justify-between">
                <div>
                  <p className="mb-1">Face Ritual</p>
                  <p className="text-grayscale-500 text-xs">
                    Repairs &amp; protects
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-tazari-700">Shop Now</p>
                </div>
              </div>
            </LocalizedLink>
            <LocalizedLink href="/store" className="inline-block w-full">
              <Image
                src="/images/content/tazari-hero.png"
                width={768}
                height={572}
                alt="Tazari Glow Elixir — hair and body"
                className="mb-4 md:mb-6 object-cover aspect-[4/3]"
              />
              <div className="flex justify-between">
                <div>
                  <p className="mb-1">Hair &amp; Body</p>
                  <p className="text-grayscale-500 text-xs">
                    Softens &amp; seals
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-tazari-700">Shop Now</p>
                </div>
              </div>
            </LocalizedLink>
          </LayoutColumn>
        </Layout>

        {/* Section 3 — Face. Body. Hair. */}
        <Image
          src="/images/content/tazari-insp-3.png"
          width={2880}
          height={1618}
          alt="Woman with glowing skin and lustrous hair in soft Nordic light"
          className="md:h-screen md:object-cover mt-26 md:mt-36 mb-8 md:mb-26 w-full"
        />
        <Layout>
          <LayoutColumn start={1} end={{ base: 13, md: 8 }}>
            <h3 className="text-md mb-6 md:mb-16 md:text-2xl">
              One oil. No limits on where you use it.
            </h3>
            <div className="md:text-md max-md:mb-16 max-w-135">
              <p>
                Most oils are formulated for one purpose. Tazari Glow was
                formulated without that constraint. The same bottle goes from
                your face at 7am to your hair before bed. It works on every
                skin type because the three oils it contains are oils your body
                already recognizes.
              </p>
            </div>
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, md: 9 }} end={13}>
            <LocalizedLink href="/store">
              <Image
                src="/images/content/tazari-product-card.png"
                width={768}
                height={572}
                alt="Tazari Glow Elixir — face, body and hair"
                className="mb-4 md:mb-6"
              />
              <div className="flex justify-between">
                <div>
                  <p className="mb-1">Tazari Glow Elixir</p>
                  <p className="text-grayscale-500 text-xs">
                    Face · Body · Hair
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-tazari-700">Shop Now</p>
                </div>
              </div>
            </LocalizedLink>
          </LayoutColumn>
        </Layout>
        <CollectionsSection className="mt-26 md:mt-36" />
      </div>
    </>
  )
}
