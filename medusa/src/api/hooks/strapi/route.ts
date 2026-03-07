import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'

type StrapiWebhookBody = {
  model: string
  entry: Record<string, unknown>
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve('logger')
  const { model, entry } = req.body as StrapiWebhookBody

  if (model === 'product' && typeof entry?.handle === 'string') {
    const storefrontUrl = process.env.STOREFRONT_URL
    const revalidateSecret = process.env.STOREFRONT_REVALIDATE_SECRET

    if (!storefrontUrl || !revalidateSecret) {
      logger.warn(
        'Strapi webhook: STOREFRONT_URL or STOREFRONT_REVALIDATE_SECRET not set — skipping revalidation',
      )
      return res.sendStatus(200)
    }

    try {
      const response = await fetch(`${storefrontUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': revalidateSecret,
        },
        body: JSON.stringify({ tag: `product-${entry.handle}` }),
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        logger.warn(
          `Strapi webhook: storefront revalidation returned ${response.status} for product-${entry.handle}`,
        )
      } else {
        logger.info(
          `Strapi webhook: revalidated tag product-${entry.handle}`,
        )
      }
    } catch (err) {
      logger.error(`Strapi webhook: failed to reach storefront revalidation endpoint — ${err}`)
    }
  }

  res.sendStatus(200)
}
