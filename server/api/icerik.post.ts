import { Redis } from '@upstash/redis'

export default defineEventHandler(async (event) => {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Vercel ortam değişkenleri bulunamadı! Vercel panelinden şifreleri kontrol et.')
    }

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    })
    const body = await readBody(event)

    if (body.dergi !== undefined) await redis.set('dergiIcerik', body.dergi)
    if (body.belgesel !== undefined) await redis.set('belgeselIcerik', body.belgesel)
    if (body.landing !== undefined) await redis.set('landingIcerik', body.landing)
    if (body.landingVideo !== undefined) await redis.set('landingVideo', body.landingVideo)
    if (body.yuklemeTipi !== undefined) await redis.set('yuklemeTipi', body.yuklemeTipi)
    if (body.pdf !== undefined) await redis.set('pdfIcerik', body.pdf)
    if (body.siteMetinleri !== undefined) await redis.set('siteMetinleri', body.siteMetinleri)

    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'POST Hatası: ' + (error.message || 'Bilinmeyen hata') }
  }
})
