<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
const { texts, magazinePages, pdfLink, uploadType } = useSiteContent()

const flipbookRef = ref<HTMLElement | null>(null)
const pages = ref<any[]>([])
const isLoading = ref(true)
const isError = ref(false)

// Sayfaları hazırla: admin panelinde "multi" modda görseller, "pdf" modunda PDF.
const resolvedPages = computed(() => [...magazinePages.value].filter((p) => p.gosterimLink || p.link))

const hasMagazine = computed(() => resolvedPages.value.length > 0 || pdfLink.value)

const loadFlipbook = async () => {
  isLoading.value = true
  isError.value = false
  try {
    if (resolvedPages.value.length > 0) {
      pages.value = resolvedPages.value
    } else {
      // Boş durum için 4 yer tutucu sayfa
      pages.value = [
        { id: 1, name: 'Cover', gosterimLink: '' },
        { id: 2, name: 'Page 1', gosterimLink: '' },
        { id: 3, name: 'Page 2', gosterimLink: '' },
        { id: 4, name: 'Back Cover', gosterimLink: '' }
      ]
    }
    await nextTick()
    if (pages.value.length > 0 && flipbookRef.value) {
      const { PageFlip } = await import('page-flip')
      const pageFlip = new PageFlip(flipbookRef.value, {
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
      pageFlip.loadFromHTML(flipbookRef.value.querySelectorAll('.my-page'))
    }
  } catch (err) {
    isError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadFlipbook()
})
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
        :src="pdfLink"
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
              <img v-if="page.gosterimLink || page.link" :src="page.gosterimLink || page.link" :alt="page.name" />
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
