import { Module } from '@medusajs/utils'
import Loader from './loader'

export default Module('strapiClient', { loaders: [Loader] })
