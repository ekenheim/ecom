import { LoaderOptions } from '@medusajs/types'
import { strapi } from '@strapi/client'
import { asValue } from 'awilix'
import { StrapiModuleOptions } from './types'

export default async ({
  container,
  options,
}: LoaderOptions<StrapiModuleOptions>): Promise<void> => {
  if (!options?.apiUrl || !options?.apiToken) {
    throw new Error(
      'Strapi module requires apiUrl and apiToken options (STRAPI_ECOM_URL and STRAPI_ECOM_API_TOKEN)',
    )
  }

  const strapiClient = strapi({
    baseURL: options.apiUrl,
    auth: options.apiToken,
  })

  container.register({
    strapiClient: asValue(strapiClient),
  })
}
