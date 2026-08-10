import { Redis } from '@upstash/redis'

export default defineEventHandler(async () => {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
    })
    const dergi = await redis.get('dergiIcerik') || []
    const belgesel = await redis.get('belgeselIcerik') || ''
    const landing = await redis.get('landingIcerik') || ''
    const landingVideo = await redis.get('landingVideo') || ''
    const yuklemeTipi = await redis.get('yuklemeTipi') || 'tekil'
    const pdf = await redis.get('pdfIcerik') || ''
    const siteMetinleri = await redis.get('siteMetinleri') || null

    return { dergi, belgesel, landing, landingVideo, yuklemeTipi, pdf, siteMetinleri }
  } catch (error: any) {
    return { error: 'GET Hatası: ' + (error.message || 'Bilinmeyen hata') }
  }
})
