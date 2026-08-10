<script setup>
import { ref, onMounted, nextTick } from 'vue'

const flipbookRef = ref(null)
// Adminden gelecek sayfaları tutacağımız değişken
const pages = ref([])

onMounted(async () => {
  // 1. Adminden kaydedilen veriyi localStorage'dan çek
  const savedPages = localStorage.getItem('dergiIcerik')
  
  if (savedPages) {
    // Kaydedilen linkleri sayfaya aktar
    pages.value = JSON.parse(savedPages).filter(p => p.gosterimLink) // Sadece linki dolu olanları al
  } else {
    // Eğer adminden hiç veri girilmemişse, yedek (placeholder) boş sayfalar oluştur
    pages.value = [
      { id: 1, ad: 'Kapak', gosterimLink: null },
      { id: 2, ad: 'Sayfa 1', gosterimLink: null },
      { id: 3, ad: 'Sayfa 2', gosterimLink: null },
      { id: 4, ad: 'Arka Kapak', gosterimLink: null }
    ]
  }

  // 2. Vue'nun DOM'u (HTML'i) güncellemesini bekle
  await nextTick()

  // 3. PageFlip kütüphanesini başlat
  const { PageFlip } = await import('page-flip')
  
  if (flipbookRef.value) {
    const pageFlip = new PageFlip(flipbookRef.value, {
      width: 420,
      height: 594,
      size: 'stretch',
      minWidth: 315,
      maxWidth: 1000,
      minHeight: 420,
      maxHeight: 1414,
      showCover: true, 
      drawShadow: true,
    })

    // DOM'da oluşan `.my-page` divlerini kütüphaneye yükle
    pageFlip.loadFromHTML(document.querySelectorAll('.my-page'))
  }
})
</script>

<template>
  <div class="magazine-page">
    <nav class="top-nav">
      <NuxtLink to="/" class="back-link">← Geri Dön</NuxtLink>
      <span class="magazine-title">DİJİTAL DERGİ</span>
    </nav>
    
    <main class="reader-container">
      <div v-if="pages.length > 0" ref="flipbookRef" class="flip-book">
        
        <!-- Dinamik Sayfalar -->
        <div v-for="(sayfa, index) in pages" :key="sayfa.id" class="my-page">
          <div :class="['page-content', { 'cover': index === 0 || index === pages.length - 1 }]">
            
            <!-- Eğer drive linki varsa resmi göster -->
            <img v-if="sayfa.gosterimLink" :src="sayfa.gosterimLink" :alt="sayfa.ad" />
            
            <!-- Link yoksa sayfanın adını (Örn: Kapak) yazı olarak göster -->
            <h2 v-else>{{ sayfa.ad }}</h2>
            
          </div>
        </div>

      </div>
      <div v-else class="no-content">
        Admin panelinden henüz sayfa eklenmemiş.
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Önceki stillerin aynısı */
.magazine-page {
  min-height: 100vh;
  background-color: var(--bg-color, #f6f5f3);
  color: var(--text-color, #1a1a1a);
  display: flex;
  flex-direction: column;
}

.top-nav {
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.back-link {
  text-decoration: none;
  color: inherit;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: opacity 0.3s ease;
}

.back-link:hover { opacity: 0.5; }

.magazine-title {
  font-weight: 300;
  letter-spacing: 0.2em;
}

.reader-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  overflow: hidden;
}

.flip-book {
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.my-page {
  background-color: white;
  border: 1px solid rgba(0,0,0,0.05);
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
  color: #a39382;
}

/* Resmi div'e tam sığdırma (A4 formatını bozmaz) */
.page-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover {
  background-color: #eae8e3;
  color: #1a1a1a;
}

.no-content {
  color: #a39382;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
</style>