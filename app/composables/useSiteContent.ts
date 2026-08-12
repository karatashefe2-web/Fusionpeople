import { useFetch } from '#app'
import { DEFAULT_TEXTS, EMPTY_CONTENT, type SiteContent, type SiteTexts } from '~/types/content'

/**
 * Site içeriğini API'den yükler. API hata verirse veya Redis boşsa
 * uygulama asla boş/çökük kalmaz: varsayılan içerik devreye girer.
 */
export function useSiteContent() {
  const { data, error, pending } = useFetch<SiteContent>('/api/icerik', {
    default: () => EMPTY_CONTENT
  })

  // API hata döndürürse (ör. Redis env eksik) hata verisi olarak değil,
  // boş içerik olarak davran — sayfa yine de düzgün render olur.
  const content = computed<SiteContent>(() => {
    const raw = error.value ? null : data.value
    return raw || EMPTY_CONTENT
  })

  const texts = computed<SiteTexts>(() => ({
    ...DEFAULT_TEXTS,
    ...(content.value.siteMetinleri || {})
  }))

  const magazinePages = computed(() => content.value.dergi || [])
  const belgeselLink = computed(() => content.value.belgesel || '')
  const landscapeImage = computed(() => content.value.landing || '')
  const backgroundVideo = computed(() => content.value.landingVideo || '')
  const pdfLink = computed(() => content.value.pdf || '')
  const uploadType = computed<'single' | 'pdf'>(() => content.value.yuklemeTipi || 'single')

  return {
    content,
    texts,
    magazinePages,
    belgeselLink,
    landscapeImage,
    backgroundVideo,
    pdfLink,
    uploadType,
    pending,
    error
  }
}
