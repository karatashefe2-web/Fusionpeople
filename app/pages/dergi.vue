<script setup>
import { ref, onMounted, nextTick } from 'vue'

const flipbookRef = ref(null)
const pages = ref([])

onMounted(async () => {
  const savedPages = localStorage.getItem('dergiIcerik')
  
  if (savedPages) {
    pages.value = JSON.parse(savedPages).filter(p => p.gosterimLink)
  } else {
    pages.value = [
      { id: 1, ad: 'Kapak', gosterimLink: null },
      { id: 2, ad: 'Sayfa 1', gosterimLink: null },
      { id: 3, ad: 'Sayfa 2', gosterimLink: null },
      { id: 4, ad: 'Arka Kapak', gosterimLink: null }
    ]
  }

  await nextTick()

  const { PageFlip } = await import('page-flip')
  
  if (flipbookRef.value) {
    const pageFlip = new PageFlip(flipbookRef.value, {
      width: 315, // Temel genişlik
      height: 445, // A4 formatı oranı (1:1.414)
      size: 'stretch', // Kapsayıcıya tam oturmasını sağlar
      minWidth: 150, // Mobilde taşmayı önlemek için sınırları daralttık
      maxWidth: 1000,
      minHeight: 212,
      maxHeight: 1414,
      showCover: true, 
      drawShadow: true,
      usePortrait: true, // Telefonlarda dikeyken ekranı bölmek yerine tek sayfaya geçer
      mobileScrollSupport: false // Telefonlarda kaydırma çakışmalarını tamamen durdurur
    })

    pageFlip.loadFromHTML(document.querySelectorAll('.my-page'))
  }
})
</script>

<template>
  <div class="magazine-page">
    <nav class="top-nav">
      <NuxtLink to="/" class="back-link">← Geri Dön</NuxtLink>
      <span class="magazine-title">SAYI 01</span>
    </nav>
    
    <main class="reader-container">
      <div v-if="pages.length > 0" ref="flipbookRef" class="flip-book">
        
        <div v-for="(sayfa, index) in pages" :key="sayfa.id" class="my-page">
          <div :class="['page-content', { 'cover': index === 0 || index === pages.length - 1 }]">
            <img v-if="sayfa.gosterimLink" :src="sayfa.gosterimLink" :alt="sayfa.ad" />
            <h2 v-else>{{ sayfa.ad }}</h2>
          </div>
        </div>

      </div>
      <div v-else class="no-content">
        Admin panelinden sayfa eklenmedi.
      </div>
    </main>
  </div>
</template>

<style scoped>
.magazine-page {
  height: 100dvh; /* Yeni nesil viewport ölçüsü: iOS/Android adres çubuklarını hesaba katar */
  overflow: hidden; /* Sayfanın aşağı-yukarı kaydırılmasını (scroll) tamamen iptal eder */
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
  border-bottom: 1px solid rgba(0,0,0,0.1);
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

.back-link:hover { opacity: 0.5; }

.magazine-title {
  font-weight: 700;
  letter-spacing: 0.2em;
}

.reader-container {
  flex: 1; /* Üst bardan arta kalan tüm yüksekliği kapla */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem; 
  width: 100%;
  height: calc(100dvh - 80px); /* Kapsayıcının sınırlarını ekrana zorla */
  box-sizing: border-box;
  overflow: hidden; /* İçerik taşarsa kaydırma çubuğu çıkarma */
}

.flip-book {
  width: 100%;
  height: 100%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
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
  background-color: #ffffff;
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

.no-content {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
</style>