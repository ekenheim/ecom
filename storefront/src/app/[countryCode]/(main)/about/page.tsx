import { Metadata } from "next"
import Image from "next/image"
import { getAboutPageContent } from "@lib/data/strapi-content"
import { strapiMedia } from "@lib/strapi"
import { Layout, LayoutColumn } from "@/components/Layout"

export const metadata: Metadata = {
  title: "About Tazari",
  description: "The story behind Tazari's ancestral oils.",
}

export const dynamic = "force-dynamic"

export default async function AboutPage() {
  const content = await getAboutPageContent()

  const heroSrc =
    (content?.hero_image?.url ? strapiMedia(content.hero_image.url) : null) ??
    "/images/content/tazari-about-hero.png"
  const heroAlt =
    content?.hero_image?.alternativeText ??
    "Woman in a Moroccan riad courtyard holding a Tazari oil bottle"

  return (
    <>
      <div className="max-md:pt-18">
        <Image
          src={heroSrc}
          width={2880}
          height={1500}
          alt={heroAlt}
          className="md:h-screen md:object-cover w-full"
          priority
        />
      </div>

      <div className="pt-8 md:pt-26 pb-26 md:pb-36">
        {content?.sections && content.sections.length > 0 ? (
          // Dynamic sections from Strapi
          content.sections.map((section, index) => {
            const imageSrc = section.image?.url
              ? strapiMedia(section.image.url)
              : null
            const isEven = index % 2 === 0

            return (
              <Layout key={section.id} className="mb-16 md:mb-26">
                {section.heading && (
                  <LayoutColumn start={1} end={{ base: 13, lg: isEven ? 7 : 8 }}>
                    <h3 className="text-md max-lg:mb-6 md:text-2xl">
                      {section.heading}
                    </h3>
                  </LayoutColumn>
                )}
                {section.body && (
                  <LayoutColumn
                    start={{ base: 1, lg: section.heading ? (isEven ? 8 : 1) : 1 }}
                    end={13}
                  >
                    {/* eslint-disable-next-line react/no-danger */}
                    <div className="md:text-md lg:mt-18" dangerouslySetInnerHTML={{ __html: section.body }} />
                  </LayoutColumn>
                )}
                {imageSrc && (
                  <LayoutColumn className="col-span-full mt-8">
                    <Image
                      src={imageSrc}
                      width={2496}
                      height={1404}
                      alt={section.image?.alternativeText ?? ""}
                      className="w-full"
                    />
                  </LayoutColumn>
                )}
              </Layout>
            )
          })
        ) : (
          // Static fallback — original hardcoded content
          <Layout>
            <LayoutColumn start={1} end={{ base: 13, lg: 7 }}>
              <h3 className="text-md max-lg:mb-6 md:text-2xl">
                At Tazari, we believe the best skincare ingredients have existed
                for centuries.
              </h3>
            </LayoutColumn>
            <LayoutColumn start={{ base: 1, lg: 8 }} end={13}>
              <div className="md:text-md lg:mt-18">
                <p className="mb-5 lg:mb-9">
                  Tazari was born from a journey between two worlds — the ancient
                  oil-pressing traditions of southern Morocco and the clean,
                  functional design philosophy of Scandinavia. We found that both
                  cultures had arrived at the same conclusion: that the most
                  powerful things are usually the most simple.
                </p>
                <p>
                  Three oils. Cold-pressed. Undiluted. Bottled without additives
                  or shortcuts. That is Tazari — a meeting point of two heritages
                  united by a shared belief in purity.
                </p>
              </div>
            </LayoutColumn>
            <LayoutColumn>
              <Image
                src="/images/content/tazari-about-interior1.png"
                width={2496}
                height={1404}
                alt="Argan kernels being cold-pressed in a traditional Moroccan workshop"
                className="mt-26 lg:mt-36 mb-8 lg:mb-26 w-full"
              />
            </LayoutColumn>
            <LayoutColumn start={1} end={{ base: 13, lg: 8 }}>
              <h3 className="text-md lg:mb-10 mb-6 md:text-2xl">
                We are here to make ancient wisdom accessible.
              </h3>
            </LayoutColumn>
            <LayoutColumn start={1} end={{ base: 13, lg: 6 }}>
              <div className="mb-16 lg:mb-26">
                <p className="mb-5 md:mb-9">
                  Every bottle of Tazari Glow begins with full traceability. Our
                  Argan oil is sourced directly from a women&apos;s cooperative in
                  the Souss Valley. Our Jojoba is cold-pressed in small batches
                  from certified organic farms. Our Squalane is extracted from
                  Spanish olives grown without pesticides.
                </p>
                <p>
                  We cold-press every oil to preserve the full spectrum of fatty
                  acids, vitamins, and antioxidants. Nothing is refined. Nothing
                  is diluted. What goes into the bottle is exactly what comes from
                  the source.
                </p>
              </div>
            </LayoutColumn>
            <LayoutColumn start={{ base: 2, lg: 1 }} end={{ base: 12, lg: 7 }}>
              <Image
                src="/images/content/tazari-about-portrait.png"
                width={1200}
                height={1600}
                alt="Tazari oil bottle on leather books beside a Moroccan brass tea glass"
                className="mb-16 lg:mb-46"
              />
            </LayoutColumn>
            <LayoutColumn start={{ base: 1, lg: 8 }} end={13}>
              <div className="mb-6 lg:mb-20 xl:mb-36">
                <p>
                  Our philosophy is rooted in restraint. We do not add
                  preservatives, synthetic fragrances, or carrier fillers because
                  we do not need to. The three oils we have chosen are inherently
                  stable, inherently effective, and inherently complete. Purity is
                  not a marketing claim for us — it is the only way we know how
                  to make a product we can stand behind.
                </p>
              </div>
              <div className="md:text-md max-lg:mb-26">
                <p>
                  We are committed to responsible sourcing, minimal packaging, and
                  partnering with cooperatives that invest in the communities
                  where these ingredients grow. When you buy Tazari, you support
                  the people and the land that make it possible.
                </p>
              </div>
            </LayoutColumn>
          </Layout>
        )}

        {/* Interior image 2 — shown regardless (static asset until Strapi version adds it) */}
        {(!content?.sections || content.sections.length === 0) && (
          <>
            <Image
              src="/images/content/tazari-about-interior2.png"
              width={2880}
              height={1618}
              alt="Tazari oil bottle on a Scandinavian bathroom shelf"
              className="mb-8 lg:mb-26 w-full"
            />
            <Layout>
              <LayoutColumn start={1} end={{ base: 13, lg: 7 }}>
                <h3 className="text-md max-lg:mb-6 md:text-2xl">
                  Our customers are at the center of everything we do.
                </h3>
              </LayoutColumn>
              <LayoutColumn start={{ base: 1, lg: 8 }} end={13}>
                <div className="md:text-md lg:mt-18">
                  <p className="mb-5 lg:mb-9">
                    We know that changing your skincare routine takes trust. Our
                    team is here to help — whether you have questions about which
                    oil is right for your skin type, how to build a ritual, or
                    anything else on your mind.
                  </p>
                  <p>
                    We are not just selling oil. We are inviting you into a ritual
                    that has nourished skin and hair for generations. Thank you for
                    choosing Tazari.
                  </p>
                </div>
              </LayoutColumn>
            </Layout>
          </>
        )}
      </div>
    </>
  )
}
