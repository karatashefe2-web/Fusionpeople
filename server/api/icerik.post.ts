import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    if (body.dergi !== undefined) await redis.set('dergiIcerik', body.dergi)
    if (body.belgesel !== undefined) await redis.set('belgeselIcerik', body.belgesel)
    if (body.landing !== undefined) await redis.set('landingIcerik', body.landing)
    if (body.yuklemeTipi !== undefined) await redis.set('yuklemeTipi', body.yuklemeTipi)
    if (body.pdf !== undefined) await redis.set('pdfIcerik', body.pdf)
    if (body.siteMetinleri !== undefined) await redis.set('siteMetinleri', body.siteMetinleri)

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Veritabanına yazılamadı' }
  }
})
