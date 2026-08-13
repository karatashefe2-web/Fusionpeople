import { Redis } from '@upstash/redis'

// Admin şifresi sunucuda da doğrulanır. Ortam değişkeni yoksa varsayılan
// devreye girer; üretimde Vercel'e ADMIN_PASSWORD ortam değişkeni eklenmeli.
function isAuthorized(body: Record<string, unknown>): boolean {
  const expected = process.env.ADMIN_PASSWORD || 'fusion2026'
  return body &&
    typeof body.adminPassword === 'string' &&
    body.adminPassword === expected
}

export default defineEventHandler(async (event) => {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Vercel ortam değişkenleri bulunamadı! Vercel panelinden şifreleri kontrol et.')
    }

    const body = await readBody(event)

    if (!isAuthorized(body)) {
      return { success: false, error: 'Yetkisiz erişim — geçerli bir oturum gerekli.' }
    }

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    })

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
