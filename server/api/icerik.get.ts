import { Redis } from '@upstash/redis'

export default defineEventHandler(async () => {
  try {
    const redis = Redis.fromEnv()
    const dergi = await redis.get('dergiIcerik') || []
    const belgesel = await redis.get('belgeselIcerik') || ''
    const landing = await redis.get('landingIcerik') || ''
    const landingVideo = await redis.get('landingVideo') || ''
    const yuklemeTipi = await redis.get('yuklemeTipi') || 'tekil'
    const pdf = await redis.get('pdfIcerik') || ''
    const siteMetinleri = await redis.get('siteMetinleri') || null

    return { dergi, belgesel, landing, landingVideo, yuklemeTipi, pdf, siteMetinleri }
  } catch (error) {
    return { error: 'Veritabanına bağlanılamadı. Şifreler eksik olabilir.' }
  }
})
