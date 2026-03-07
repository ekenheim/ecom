import type { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { Modules } from '@medusajs/framework/utils'

export default async function syncProductToStrapi({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve('logger')
  const productModuleService = container.resolve(Modules.PRODUCT)
  const strapiClient = container.resolve('strapiClient')

  const product = await productModuleService.retrieveProduct(data.id, {
    relations: ['variants'],
  })

  const products = strapiClient.collection('products')

  const existing = await products.find({
    filters: { medusa_id: { $eq: product.id } },
  })

  if (existing.data.length > 0) {
    await products.update(existing.data[0].documentId, {
      data: { medusa_id: product.id, handle: product.handle },
    })
    logger.info(
      `Strapi: updated product entry for "${product.handle}" (${product.id})`,
    )
  } else {
    await products.create({
      data: { medusa_id: product.id, handle: product.handle },
    })
    logger.info(
      `Strapi: created product entry for "${product.handle}" (${product.id})`,
    )
  }
}

export const config: SubscriberConfig = {
  event: ['product.created', 'product.updated'],
}
