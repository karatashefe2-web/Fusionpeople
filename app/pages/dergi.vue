<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount, nextTick, computed, watch } from 'vue'
const { texts, magazinePages, pdfLink, uploadType } = useSiteContent()

interface ResolvedPage {
  id: number
  name: string
  link: string
  gosterimLink?: string
  resolvedLink: string
}

const flipbookRef = ref<HTMLElement | null>(null)
// Key değişince Vue flipbook div'ini sıfırdan yaratır — PageFlip'in DOM'a
// bıraktığı .stf__wrapper/.stf__block gibi kalıntılar böylece temizlenir.
const flipbookKey = ref(0)
const pages = ref<ResolvedPage[]>([])
const isLoading = ref(true)
const isError = ref(false)

// Vue'nun motoru unutmaması için 'shallowRef' kullanıyoruz!
const pageFlipInstance = shallowRef<any>(null)

const isPdfMode = computed(() => uploadType.value === 'pdf' && !!pdfLink.value)

const extractDriveId = (url: string) => {
  if (!url) return null;
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

const resolveImageLink = (url: string) => {
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w2000` : url;
}

// PDF'in flipbook'a render edileceği kaynak URL: kullanıcıya indirme yerine
// içerik olarak dönen, fetch edilebilir Drive bağlantısı tercih edilir.
const pdfDownloadLink = computed(() => {
  const id = extractDriveId(pdfLink.value);
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : pdfLink.value;
})

const resolvedPages = computed<ResolvedPage[]>(() => {
  return [...(magazinePages.value || [])]
    .filter((p) => p.link || p.gosterimLink)
    .map((p) => ({
      ...p,
      resolvedLink: resolveImageLink(p.link || p.gosterimLink || '')
    }))
})

const hasMagazine = computed(() => resolvedPages.value.length > 0 || pdfLink.value)

const destroyFlipbook = () => {
  if (pageFlipInstance.value) {
    try {
      // PageFlip'in gerçek destroy()'u ana flip-book elementini DOM'dan
      // kaldırır (block.remove()) ve Vue'nun v-for yönetimini bozar.
      // Bunun yerine event listener'ları temizleyen ui.destroy() kullanılır:
      // PageFlip'in eklediği .stf__wrapper/.stf__block elementlerini ve
      // window dinleyicilerini kaldırır, ana div'e dokunmaz.
      const ui = pageFlipInstance.value.getUI?.()
      ui?.destroy?.()
    } catch {
      // Zaten temizlenmiş olabilir — yut.
    }
    pageFlipInstance.value = null
  }
}

// Sayfa listesini flipbook motoruna bağlar. Mevcut bir flipbook varken
// içerik değiştiyse `updateFromHtml`'e güvenmek yerine tamamen yeniden
// kuruyoruz: eski instance temizlenir, flipbook div'ine yeni key verilir
// (Vue div'i sıfırdan yaratır), taze element üzerinde yeni instance kurulur.
const rebuildFlipbook = async (nextPages: ResolvedPage[]) => {
  if (pageFlipInstance.value) {
    destroyFlipbook()
    flipbookKey.value++
  }

  pages.value = nextPages
  isLoading.value = false

  await nextTick()

  const flipbookElement = flipbookRef.value
  if (pages.value.length > 0 && flipbookElement) {
    try {
      const { PageFlip } = await import('page-flip')
      pageFlipInstance.value = new PageFlip(flipbookElement, {
        width: 315,
        height: 445,
        size: 'stretch',
        minWidth: 315,
        maxWidth: 1000,
        minHeight: 445,
        maxHeight: 1414,
        showCover: true,
        drawShadow: true,
        usePortrait: true,
        mobileScrollSupport: false
      })
      pageFlipInstance.value.loadFromHTML(flipbookElement.querySelectorAll('.my-page'))
    } catch (err) {
      console.error('[dergi] Flipbook kurulamadı:', err)
      isError.value = true
    }
  }
}

// PDF'i pdfjs-dist ile tarayıcıda sayfalara ayırıp her sayfayı görsele çevirir.
// Böylece PDF de aynı sayfa çevirme efektiyle gösterilir (iframe yerine).
const loadPdfPages = async () => {
  // PDF yeniden yüklenirken eski flipbook ve sayfalar temizlenir.
  destroyFlipbook()
  pages.value = []
  isLoading.value = true
  isError.value = false

  try {
    const [{ getDocument, GlobalWorkerOptions }, workerModule] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    ])
    // Vite "?url" import'u ile worker dosyasının sunucu adresini döndürür.
    const workerUrl = (workerModule as unknown as { default: string }).default
    GlobalWorkerOptions.workerSrc = workerUrl

    // getDocument() bir loadingTask döndürür; .promise üzerinden dokümana erişilir
    // ve iş bitince loadingTask.destroy() ile bellek temizlenir.
    const loadingTask = getDocument({
      url: pdfDownloadLink.value
    })
    const pdf = await loadingTask.promise

    const pdfPages: ResolvedPage[] = []
    // Yüksek çözünürlük için maksimum 1600px genişlik hedefi — metinler okunur kalır.
    const MAX_WIDTH = 1600

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const baseViewport = page.getViewport({ scale: 1 })
      const scale = Math.min(2, MAX_WIDTH / baseViewport.width)
      const viewport = page.getViewport({ scale })

      const canvas = document.createElement('canvas')
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas 2D not supported')

      // pdfjs-dist v6+: render() doğrudan canvas nesnesini (2d context) alır.
      await page.render({ canvas, viewport }).promise

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      pdfPages.push({
        id: i,
        name: `Page ${i}`,
        link: dataUrl,
        resolvedLink: dataUrl
      })

      // Belleği hızlıca boşalt.
      canvas.width = 0
      canvas.height = 0
    }

    // PDF dokümanı işi bittiğinde loadingTask.destroy() ile bellek temizlenir.
    await loadingTask.destroy()
    await rebuildFlipbook(pdfPages)
  } catch (err) {
    console.error('[dergi] PDF yüklenemedi:', err)
    isError.value = true
    isLoading.value = false
    pages.value = []
  }
}

const loadFlipbook = async () => {
  isError.value = false

  // PDF modu: PDF sayfalarını çevrilebilir görsellere dönüştür.
  if (isPdfMode.value) {
    await loadPdfPages()
    return
  }

  // Görsel modu: içerik yoksa flipbook kurma; boş mesajı template gösterir.
  if (resolvedPages.value.length === 0) {
    pages.value = []
    isLoading.value = false
    destroyFlipbook()
    return
  }

  await rebuildFlipbook(resolvedPages.value)
}

onMounted(() => {
  loadFlipbook()
})

onBeforeUnmount(() => {
  destroyFlipbook()
})

// İçerik, PDF ya da yükleme tipi değiştiğinde flipbook'u yeniden kur.
watch([resolvedPages, pdfLink, uploadType], () => {
  loadFlipbook()
}, { deep: true })

// Motor tetikleyicilerimiz shallowRef (pageFlipInstance.value) üzerinden sorunsuz çalışacak
const nextPage = () => {
  if (pageFlipInstance.value) {
    pageFlipInstance.value.flipNext()
  }
}

const prevPage = () => {
  if (pageFlipInstance.value) {
    pageFlipInstance.value.flipPrev()
  }
}

</script>

<template>
  <div class="magazine-page">
    <nav class="top-nav">
      <NuxtLink to="/" class="back-link">{{ texts.goBack }}</NuxtLink>
      <span class="magazine-title">{{ texts.magazineTopTitle }}</span>
    </nav>

    <main class="reader-container">
      <div v-if="isLoading" class="status-message">Loading…</div>
      <div v-else-if="isError" class="status-message">Could not load the magazine. Please try again later.</div>

      <div v-else-if="hasMagazine" class="magazine-wrapper">
        <div class="flipbook-container">
          <div :key="flipbookKey" ref="flipbookRef" class="flip-book">
            <div v-for="(page, index) in pages" :key="page.id" class="my-page">
              <div :class="['page-content', { cover: index === 0 || index === pages.length - 1 }]">
                <img v-if="page.resolvedLink" :src="page.resolvedLink" :alt="page.name" />
                <h2 v-else>{{ page.name }}</h2>
              </div>
            </div>
          </div>
        </div>

        <div class="magazine-controls">
          <button class="nav-btn" @click="prevPage" aria-label="Previous Page">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button class="nav-btn" @click="nextPage" aria-label="Next Page">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-else class="status-message">{{ texts.emptyMagazine }}</div>
    </main>
  </div>
</template>

<style scoped>
.magazine-page {
  height: 100dvh;
  overflow: hidden;
  background-color: #f4f4f0;
  color: #111;
  display: flex;
  flex-direction: column;
}
.top-nav {
  height: 80px;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}
.back-link {
  text-decoration: none;
  color: inherit;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: opacity 0.3s ease;
}
.back-link:hover {
  opacity: 0.5;
}
.magazine-title {
  font-weight: 700;
  letter-spacing: 0.2em;
}
.reader-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;
  overflow: auto;
}

.magazine-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.flipbook-container {
  flex: 1;
  width: 100%;
  position: relative;
  min-height: 0;
}

/* Gölge motorunu delip butonları kesin tıklanabilir yapmak için z-index ve position eklendi */
.magazine-controls {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem 0;
  flex-shrink: 0;
  position: relative;
  z-index: 50;
}
.nav-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.1);
  background: #fff;
  color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  pointer-events: auto; /* Kesin tıklanabilirlik */
}
.nav-btn:hover {
  background: #111;
  color: #fff;
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.15);
}

.flip-book {
  width: 100%;
  height: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}
.my-page {
  background-color: white;
  overflow: hidden;
}
.page-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}
.page-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover {
  background-color: #eae8e3;
  color: #111;
}
.pdf-frame {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}
.status-message {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #666;
}

@media (max-width: 768px) {
  .reader-container {
    padding: 0;
  }
  .top-nav {
    padding: 0 1.5rem;
  }
  .magazine-controls {
    padding: 1rem 0 1.5rem 0;
  }
}
</style>
