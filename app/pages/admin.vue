<script setup>
import { ref, onMounted } from 'vue'

const yuklemeTipi = ref('tekil') 
const dergiSayfalari = ref([
  { id: 1, ad: 'Kapak', link: '' },
  { id: 2, ad: 'Sayfa 1', link: '' },
  { id: 3, ad: 'Sayfa 2', link: '' },
  { id: 4, ad: 'Arka Kapak', link: '' }
])
const pdfLink = ref('')
const belgeselLink = ref('')
const landingLink = ref('')
const basariMesaji = ref('')

const extractDriveId = (url) => {
  if (!url) return null;
  const match = url.match(/\/d\/(.+?)\/|id=([a-zA-Z0-9_-]+)/);
  return match ? (match[1] || match[2]) : null;
}

const convertToDirectLink = (url) => {
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : url;
}

onMounted(async () => {
  const veri = await $fetch('/api/icerik')
  if (veri.dergi?.length) dergiSayfalari.value = veri.dergi
  if (veri.belgesel) belgeselLink.value = veri.belgesel
  if (veri.landing) landingLink.value = veri.landing
  if (veri.yuklemeTipi) yuklemeTipi.value = veri.yuklemeTipi
  if (veri.pdf) pdfLink.value = veri.pdf
})

const yeniSayfaEkle = () => {
  dergiSayfalari.value.splice(dergiSayfalari.value.length - 1, 0, { 
    id: Date.now(), ad: `Sayfa ${dergiSayfalari.value.length - 1}`, link: '' 
  })
}

const kaydet = async () => {
  const islenmisDergi = dergiSayfalari.value.map(s => ({ ...s, gosterimLink: convertToDirectLink(s.link) }))
  const pdfId = extractDriveId(pdfLink.value)
  
  await $fetch('/api/icerik', {
    method: 'POST',
    body: {
      yuklemeTipi: yuklemeTipi.value,
      dergi: islenmisDergi,
      pdf: pdfId ? `https://drive.google.com/uc?export=download&id=${pdfId}` : pdfLink.value,
      belgesel: convertToDirectLink(belgeselLink.value),
      landing: convertToDirectLink(landingLink.value)
    }
  })

  basariMesaji.value = 'Veritabanına başarıyla kaydedildi! 🚀'
  setTimeout(() => basariMesaji.value = '', 3000)
}
</script>

<template>
  <div class="admin-container">
    <div class="admin-panel">
      <h1 class="admin-title">İçerik Yönetim Paneli</h1>
      <p class="admin-subtitle">Google Drive linklerini buraya yapıştırın</p>

      <section class="admin-section">
        <h2>Ana Sayfa Görseli</h2>
        <div class="input-group">
          <label>Arka Plan Görseli (Drive Linki):</label>
          <input 
            v-model="landingLink" 
            type="text" 
            placeholder="Örn: https://drive.google.com/file/d/.../view" 
            class="admin-input"
          />
        </div>
      </section>

      <section class="admin-section">
        <h2>Dergi Yükleme Seçeneği</h2>
        <div class="tab-buttons">
          <button :class="['tab-btn', { active: yuklemeTipi === 'tekil' }]" @click="yuklemeTipi = 'tekil'">Görsellerle (Tek Tek)</button>
          <button :class="['tab-btn', { active: yuklemeTipi === 'pdf' }]" @click="yuklemeTipi = 'pdf'">Tek PDF Dosyası</button>
        </div>

        <div v-if="yuklemeTipi === 'tekil'" class="tab-content">
          <div v-for="sayfa in dergiSayfalari" :key="sayfa.id" class="input-group">
            <label>{{ sayfa.ad }} (Drive Linki):</label>
            <input v-model="sayfa.link" type="text" class="admin-input" />
          </div>
          <button class="btn-add-page" @click="yeniSayfaEkle">+ Yeni Sayfa Ekle</button>
        </div>

        <div v-if="yuklemeTipi === 'pdf'" class="tab-content">
          <div class="input-group">
            <label>PDF Dosyası (Drive Linki):</label>
            <input v-model="pdfLink" type="text" class="admin-input" />
          </div>
        </div>
      </section>

      <section class="admin-section">
        <h2>Belgesel / Video</h2>
        <div class="input-group">
          <label>Video (Drive Linki):</label>
          <input v-model="belgeselLink" type="text" class="admin-input" />
        </div>
      </section>

      <div class="action-bar">
        <button class="btn-save" @click="kaydet">Tümünü Kaydet</button>
        <span v-if="basariMesaji" class="success-msg">{{ basariMesaji }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-container { min-height: 100vh; background-color: #f6f5f3; color: #1a1a1a; display: flex; justify-content: center; padding: 4rem 2rem; }
.admin-panel { background: white; width: 100%; max-width: 800px; padding: 3rem; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
.admin-title { font-size: 2rem; font-weight: 600; margin-bottom: 0.5rem; }
.admin-subtitle { color: #86868b; margin-bottom: 3rem; }
.admin-section { margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid #eee; }
.admin-section h2 { font-size: 1.2rem; margin-bottom: 1.5rem; color: #a39382; text-transform: uppercase; letter-spacing: 0.05em; }
.tab-buttons { display: flex; gap: 1rem; margin-bottom: 2rem; }
.tab-btn { padding: 0.8rem 1.5rem; background: #f6f5f3; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 500; color: #86868b; transition: all 0.2s; }
.tab-btn.active { background: #1a1a1a; color: white; border-color: #1a1a1a; }
.input-group { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
.input-group label { font-weight: 500; font-size: 0.9rem; }
.admin-input { padding: 1rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; }
.admin-input:focus { outline: none; border-color: #1a1a1a; }
.btn-add-page { background: none; border: 1px dashed #a39382; color: #a39382; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
.btn-add-page:hover { background: #f6f5f3; color: #1a1a1a; border-color: #1a1a1a; }
.action-bar { display: flex; align-items: center; gap: 2rem; }
.btn-save { background: #1a1a1a; color: white; border: none; padding: 1rem 3rem; border-radius: 8px; font-size: 1.1rem; cursor: pointer; transition: background 0.2s; }
.btn-save:hover { background: #434345; }
.success-msg { color: #34c759; font-weight: 500; }
</style>