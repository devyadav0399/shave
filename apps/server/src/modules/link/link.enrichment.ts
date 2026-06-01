import ogs from 'open-graph-scraper'

import type { ErrorResult, ImageObject, SuccessResult } from "open-graph-scraper/types";

export type EnrichedMetadata = {
  title?: string;
  type?: string;
  description?: string;
  image?: ImageObject[];
}

export const fetchMetadata = async (url: string): Promise<EnrichedMetadata> => {
  try {
    const ogResult: (SuccessResult | ErrorResult) = await ogs({ url })

    if (ogResult.result.success) {
      const { ogTitle, ogType, ogDescription, ogImage } = ogResult.result
      return {
        title: ogTitle,
        type: ogType,
        description: ogDescription,
        image: ogImage
     }
    } else {
      throw new Error('Metadata fetch was unsuccessful')
    }

  } catch (e: unknown) {
    console.error('Error in fetchMetadata:', e)
    throw e
  }
}

export const linkEnrichment = { fetchMetadata }
