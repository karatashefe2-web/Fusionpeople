<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from 'vue'
const { texts, magazinePages, pdfLink, uploadType } = useSiteContent()

const flipbookRef = ref<HTMLElement | null>(null)
const pages = ref<any[]>([])
const isLoading = ref(true)
const isError = ref(false)
let pageFlipInstance: any = null // Animasyon motorunun çakışmasını önler

// Google Drive linklerinden ID'yi çıkaran yardımcı fonksiyon
const extractDriveId = (url: string) => {
  if (!url) return null;
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

// Ham resmi, doğrudan gösterilebilir formata çevir
const resolveImageLink = (url: string) => {
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : url;
}

// Ham PDF linkini, iframe içinde gösterilebilir preview formatına çevir
const resolvePdfLink = computed(() => {
  const id = extractDriveId(pdfLink.value);
  return id ? `https://drive.google.com/file/d/${id}/preview` : pdfLink.value;
})

// Sayfaları filtreden geçirirken linkleri de çevir
const resolvedPages = computed(() => {
  return [...(magazinePages.value || [])]
    .filter((p) => p.link || p.gosterimLink)
    .map((p) => ({
      ...p,
      resolvedLink: resolveImageLink(p.link || p.gosterimLink)
    }))
})

const hasMagazine = computed(() => resolvedPages.value.length > 0 || pdfLink.value)

const loadFlipbook = async () => {
  isError.value = false
  
  if (resolvedPages.value.length > 0) {
    pages.value = resolvedPages.value
  } else {
    // Boş durum için 4 yer tutucu sayfa
    pages.value = [
      { id: 1, name: 'Cover', resolvedLink: '' },
      { id: 2, name: 'Page 1', resolvedLink: '' },
      { id: 3, name: 'Page 2', resolvedLink: '' },
      { id: 4, name: 'Back Cover', resolvedLink: '' }
    ]
  }
  
  // PARADOKS ÇÖZÜMÜ: HTML'in (flipbookRef) çizilmesi için 
  // yükleme ekranını motor çalışmadan HEMEN ÖNCE kapatıyoruz!
  isLoading.value = false
  
  await nextTick() // Vue'nun DOM'u (Kutuları) çizmesini bekle
  
  if (pages.value.length > 0 && flipbookRef.value) {
    try {
      if (!pageFlipInstance) {
        // Motor ilk defa çalışıyorsa
        const { PageFlip } = await import('page-flip')
        pageFlipInstance = new PageFlip(flipbookRef.value, {
          width: 315,
          height: 445,
          size: 'stretch',
          minWidth: 150,
          maxWidth: 1000,
          minHeight: 212,
          maxHeight: 1414,
          showCover: true,
          drawShadow: true,
          usePortrait: true,
          mobileScrollSupport: false
        })
        pageFlipInstance.loadFromHTML(flipbookRef.value.querySelectorAll('.my-page'))
      } else {
        // Motor zaten çalışıyorsa ve sayfalar sonradan geldiyse sadece sayfaları güncelle
        pageFlipInstance.updateFromHTML(flipbookRef.value.querySelectorAll('.my-page'))
      }
    } catch (err) {
      isError.value = true
    }
  }
}

onMounted(() => {
  loadFlipbook()
})

// GÖZCÜ: Veritabanı veriyi sonradan getirirse anında motoru tetikler
watch(resolvedPages, (newVal) => {
  if (newVal && newVal.length > 0) {
    loadFlipbook()
  }
}, { deep: true })

</script>

<template>
  <div class="magazine-page">
    <nav class="top-nav">
      <NuxtLink to="/" class="back-link">{{ texts.goBack }}</NuxtLink>
      <span class="magazine-title">{{ texts.magazineTopTitle }}</span>
    </nav>

    <main class="reader-container">
      <!-- PDF modu: tam ekran PDF görüntüleyici -->
      <iframe
        v-if="uploadType === 'pdf' && pdfLink"
        :src="resolvePdfLink"
        class="pdf-frame"
        title="Magazine PDF"
        scrolling="yes"
      ></iframe>

      <!-- Görsel modu: flipbook -->
      <template v-else>
        <div v-if="isLoading" class="status-message">Loading…</div>
        <div v-else-if="isError" class="status-message">Could not load the magazine. Please try again later.</div>
        <div v-else-if="hasMagazine" ref="flipbookRef" class="flip-book">
          <div v-for="(page, index) in pages" :key="page.id" class="my-page">
            <div :class="['page-content', { cover: index === 0 || index === pages.length - 1 }]">
              <img v-if="page.resolvedLink" :src="page.resolvedLink" :alt="page.name" />
              <h2 v-else>{{ page.name }}</h2>
            </div>
          </div>
        </div>
        <div v-else class="status-message">{{ texts.emptyMagazine }}</div>
      </template>
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
</style>
