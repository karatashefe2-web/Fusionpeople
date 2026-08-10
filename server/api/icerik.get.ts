import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export default defineEventHandler(async () => {
  try {
    const dergi = await redis.get('dergiIcerik') || []
    const belgesel = await redis.get('belgeselIcerik') || ''
    const landing = await redis.get('landingIcerik') || ''
    const yuklemeTipi = await redis.get('yuklemeTipi') || 'tekil'
    const pdf = await redis.get('pdfIcerik') || ''
    const siteMetinleri = await redis.get('siteMetinleri') || null

    return { dergi, belgesel, landing, yuklemeTipi, pdf, siteMetinleri }
  } catch (error) {
    return { error: 'Veritabanına bağlanılamadı' }
  }
})
