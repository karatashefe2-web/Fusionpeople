import { Redis } from '@upstash/redis'
import type { SiteContent } from '~/types/content'

// Redis ortam değişkenleri yoksa (ör. local geliştirme) uygulama çökmesin:
// boş içerik döner, frontend varsayılanları kullanır.
const FALLBACK_CONTENT: SiteContent = {
  dergi: [],
  belgesel: '',
  landing: '',
  landingVideo: '',
  yuklemeTipi: 'single',
  pdf: '',
  siteMetinleri: null
}

export default defineEventHandler(async () => {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
      return FALLBACK_CONTENT
    }

    const redis = new Redis({ url, token })
    const dergi = (await redis.get('dergiIcerik')) || []
    const belgesel = (await redis.get('belgeselIcerik')) || ''
    const landing = (await redis.get('landingIcerik')) || ''
    const landingVideo = (await redis.get('landingVideo')) || ''
    const yuklemeTipi = (await redis.get('yuklemeTipi')) || 'single'
    const pdf = (await redis.get('pdfIcerik')) || ''
    const siteMetinleri = (await redis.get('siteMetinleri')) || null

    return { dergi, belgesel, landing, landingVideo, yuklemeTipi, pdf, siteMetinleri }
  } catch (error: any) {
    // Redis geçici hata verse bile 500 dönme; frontend varsayılanlarla açılır.
    console.error('[icerik.get]', error?.message || error)
    return FALLBACK_CONTENT
  }
})
