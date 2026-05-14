import { createClient } from '@sanity/client'
import { sanityConfig } from '../config/sanity.js'

let client = null

export function useSanityClient() {
  if (!client) {
    client = createClient(sanityConfig)
  }
  return { client }
}
