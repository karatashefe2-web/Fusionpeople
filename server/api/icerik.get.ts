import { Redis } from '@upstash/redis'
import type { MagazinePage, SiteContent } from '~/types/content'

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

    // Redis değerleri string ya da (JSON otomatik parse edilmiş) nesne olabilir.
    // Her iki durumu da güvenle handle et — yanlış tip frontend'i çökertmesin.
    const rawDergi = await redis.get('dergiIcerik')
    const parseDergi = (raw: unknown): MagazinePage[] => {
      if (Array.isArray(raw)) return raw as MagazinePage[]
      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw)
          return Array.isArray(parsed) ? (parsed as MagazinePage[]) : []
        } catch {
          return []
        }
      }
      return []
    }

    const rawYuklemeTipi = await redis.get('yuklemeTipi')
    const dergi = parseDergi(rawDergi)
    const belgesel = (await redis.get('belgeselIcerik')) || ''
    const landing = (await redis.get('landingIcerik')) || ''
    const landingVideo = (await redis.get('landingVideo')) || ''
    const yuklemeTipi: 'single' | 'pdf' = rawYuklemeTipi === 'pdf' ? 'pdf' : 'single'
    const pdf = (await redis.get('pdfIcerik')) || ''
    const siteMetinleri = (await redis.get('siteMetinleri')) || null

    return { dergi, belgesel, landing, landingVideo, yuklemeTipi, pdf, siteMetinleri }
  } catch (error: any) {
    // Redis geçici hata verse bile 500 dönme; frontend varsayılanlarla açılır.
    console.error('[icerik.get]', error?.message || error)
    return FALLBACK_CONTENT
  }
})
