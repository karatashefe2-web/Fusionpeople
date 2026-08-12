<script setup lang="ts">
import { ref, shallowRef, onMounted, nextTick, computed, watch } from 'vue'
const { texts, magazinePages, pdfLink, uploadType } = useSiteContent()

const flipbookRef = ref<HTMLElement | null>(null)
const pages = ref<any[]>([])
const isLoading = ref(true)
const isError = ref(false)

// Vue'nun motoru unutmaması için 'shallowRef' kullanıyoruz!
const pageFlipInstance = shallowRef<any>(null)

const extractDriveId = (url: string) => {
  if (!url) return null;
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

const resolveImageLink = (url: string) => {
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w2000` : url;
}

const resolvePdfLink = computed(() => {
  const id = extractDriveId(pdfLink.value);
  return id ? `https://drive.google.com/file/d/${id}/preview` : pdfLink.value;
})

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
    pages.value = [
      { id: 1, name: 'Cover', resolvedLink: '' },
      { id: 2, name: 'Page 1', resolvedLink: '' },
      { id: 3, name: 'Page 2', resolvedLink: '' },
      { id: 4, name: 'Back Cover', resolvedLink: '' }
    ]
  }
  
  isLoading.value = false
  
  await nextTick() 
  
  if (pages.value.length > 0 && flipbookRef.value) {
    try {
      if (!pageFlipInstance.value) {
        const { PageFlip } = await import('page-flip')
        pageFlipInstance.value = new PageFlip(flipbookRef.value, {
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
        pageFlipInstance.value.loadFromHTML(flipbookRef.value.querySelectorAll('.my-page'))
      } else {
        pageFlipInstance.value.updateFromHTML(flipbookRef.value.querySelectorAll('.my-page'))
      }
    } catch (err) {
      isError.value = true
    }
  }
}

onMounted(() => {
  loadFlipbook()
})

watch(resolvedPages, (newVal) => {
  if (newVal && newVal.length > 0) {
    loadFlipbook()
  }
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
      <iframe
        v-if="uploadType === 'pdf' && pdfLink"
        :src="resolvePdfLink"
        class="pdf-frame"
        title="Magazine PDF"
        scrolling="yes"
      ></iframe>

      <template v-else>
        <div v-if="isLoading" class="status-message">Loading…</div>
        <div v-else-if="isError" class="status-message">Could not load the magazine. Please try again later.</div>
        
        <div v-else-if="hasMagazine" class="magazine-wrapper">
          <div class="flipbook-container">
            <div ref="flipbookRef" class="flip-book">
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

/* YENİ: Gölge motorunu delip butonları kesin tıklanabilir yapmak için z-index ve position eklendi */
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
