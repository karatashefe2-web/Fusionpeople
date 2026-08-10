<script setup>
import { ref, onMounted } from 'vue'

// --- ŞİFRE VE GİRİŞ KONTROLLERİ ---
const girisBasarili = ref(false)
const girilenSifre = ref('')
const hataMesaji = ref('')
const GECERLI_SIFRE = 'fusion2026' // Şifreni buradan değiştirebilirsin

const girisYap = () => {
  if (girilenSifre.value === GECERLI_SIFRE) {
    girisBasarili.value = true
    localStorage.setItem('adminYetkisi', 'aktif')
    veriCek() // Şifre doğruysa verileri çek
  } else {
    hataMesaji.value = 'Hatalı şifre, tekrar dene.'
    setTimeout(() => hataMesaji.value = '', 3000)
  }
}

const cikisYap = () => {
  girisBasarili.value = false
  localStorage.removeItem('adminYetkisi')
  girilenSifre.value = ''
}
// ----------------------------------

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

const veriCek = async () => {
  const veri = await $fetch('/api/icerik')
  if (veri.dergi?.length) dergiSayfalari.value = veri.dergi
  if (veri.belgesel) belgeselLink.value = veri.belgesel
  if (veri.landing) landingLink.value = veri.landing
  if (veri.yuklemeTipi) yuklemeTipi.value = veri.yuklemeTipi
  if (veri.pdf) pdfLink.value = veri.pdf
}

onMounted(() => {
  // Sayfa yüklendiğinde daha önce giriş yapılmış mı kontrol et
  if (localStorage.getItem('adminYetkisi') === 'aktif') {
    girisBasarili.value = true
    veriCek()
  }
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
  <div>
    <!-- ŞİFRE EKRANI -->
    <div v-if="!girisBasarili" class="login-container">
      <div class="login-box">
        <h2>FUSION YÖNETİM</h2>
        <p>Devam etmek için şifrenizi girin.</p>
        <div class="input-group">
          <input 
            v-model="girilenSifre" 
            type="password" 
            placeholder="Şifre" 
            class="admin-input"
            @keyup.enter="girisYap"
          />
        </div>
        <button class="btn-save" @click="girisYap">Giriş Yap</button>
        <p v-if="hataMesaji" class="error-msg">{{ hataMesaji }}</p>
      </div>
    </div>

    <!-- YÖNETİM PANELİ (Şifre doğruysa görünür) -->
    <div v-else class="admin-container">
      <div class="admin-panel">
        <div class="panel-header">
          <div>
            <h1 class="admin-title">İçerik Yönetim Paneli</h1>
            <p class="admin-subtitle">Google Drive linklerini buraya yapıştırın</p>
          </div>
          <button class="btn-logout" @click="cikisYap">Çıkış Yap</button>
        </div>

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
  </div>
</template>

<style scoped>
/* GİRİŞ EKRANI STİLLERİ */
.login-container { min-height: 100vh; background-color: #f4f4f0; display: flex; justify-content: center; align-items: center; color: #111; }
.login-box { background: white; padding: 4rem; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); text-align: center; width: 100%; max-width: 400px; }
.login-box h2 { font-size: 1.5rem; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
.login-box p { color: #666; margin-bottom: 2rem; }
.error-msg { color: #ff3b30 !important; margin-top: 1rem !important; font-weight: 500; }
.panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.btn-logout { background: none; border: 1px solid #111; color: #111; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
.btn-logout:hover { background: #111; color: white; }

/* MEVCUT PANEL STİLLERİ */
.admin-container { min-height: 100vh; background-color: #f4f4f0; color: #1a1a1a; display: flex; justify-content: center; padding: 4rem 2rem; }
.admin-panel { background: white; width: 100%; max-width: 800px; padding: 3rem; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
.admin-title { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
.admin-subtitle { color: #86868b; }
.admin-section { margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid #eee; }
.admin-section h2 { font-size: 1.1rem; margin-bottom: 1.5rem; color: #111; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
.tab-buttons { display: flex; gap: 1rem; margin-bottom: 2rem; }
.tab-btn { padding: 0.8rem 1.5rem; background: #f6f5f3; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600; color: #86868b; transition: all 0.2s; }
.tab-btn.active { background: #111; color: white; border-color: #111; }
.input-group { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; text-align: left; }
.input-group label { font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
.admin-input { padding: 1rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; width: 100%; box-sizing: border-box; }
.admin-input:focus { outline: none; border-color: #111; }
.btn-add-page { background: none; border: 1px dashed #111; color: #111; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
.btn-add-page:hover { background: #111; color: white; }
.action-bar { display: flex; align-items: center; gap: 2rem; }
.btn-save { background: #111; color: white; border: none; padding: 1rem 3rem; border-radius: 8px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; width: 100%; }
.btn-save:hover { background: #333; }
.success-msg { color: #34c759; font-weight: 600; }
</style>