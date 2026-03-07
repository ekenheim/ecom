import { Module } from '@medusajs/utils'
import Loader from './loader'
import { StrapiClientService } from './service'

export default Module('strapiClient', {
  service: StrapiClientService,
  loaders: [Loader],
})
