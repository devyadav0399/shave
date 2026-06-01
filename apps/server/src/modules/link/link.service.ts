import { linkEnrichment } from "./link.enrichment"
import { linkRepository } from "./link.repository"

export const enrichLink = async (id: string): Promise<void> => {
  try {
    const link = await linkRepository.getById(id)
    if (!link) throw new Error('Link not found')
    const enrichmentData = await linkEnrichment.fetchMetadata(link.url)
    await linkRepository.updateEnrichmentData(link.id, enrichmentData)
  } catch (e: unknown) {
    await linkRepository.setFailed(id)
    console.log('Error in enrichLink:', e)
    throw e
  }
}

export const linkService = { enrichLink }
