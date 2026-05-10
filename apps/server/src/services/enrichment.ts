import ogs from 'open-graph-scraper'
import type { ErrorResult, ImageObject, SuccessResult } from 'open-graph-scraper/types'
import pool from '../db/client';
import { AppError } from '../utils/AppError';

type EnrichedMetadata = {
  title?: string;
  type?: string;
  description?: string;
  image?: ImageObject[];
}

export const fetchMetadata = async (url: string):Promise<EnrichedMetadata> => {
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

export const enrichLink = async (linkId: string): Promise<void> => {
  try {
    const result = await pool.query('SELECT * from link where id=$1', [linkId])
    if (result.rows.length === 0) throw new Error('Link not found')
    const fetchResult = await fetchMetadata(result.rows[0].url)
    await pool.query('UPDATE link SET title=$1, type=$2, summary=$3, preview_image=$4, enrichment_status=$5 WHERE id=$6', [fetchResult.title, fetchResult.type, fetchResult.description, fetchResult.image?.[0]?.url, 'done', linkId])
  } catch (e: unknown) {
    await pool.query('UPDATE link SET enrichment_status=$1, enrichment_attempts=enrichment_attempts + 1 WHERE id=$2', ['failed', linkId])
    console.log('Error in enrichLink:', e)
    throw e
  }
}
