<script setup>
import { ref, onMounted } from 'vue'

const isLoggedIn = ref(false)
const enteredPassword = ref('')
const errorMessage = ref('')
const VALID_PASSWORD = 'fusion2026'

const texts = ref({
  seoTitle: 'FUSION PEOPLE',
  seoDescription: '',
  siteTitle: 'FUSION PEOPLE',
  issueDate: 'ISSUE 01 — 2026',
  mainHeadline: 'DIGITAL<br>CULTURE.',
  editorTitle: "EDITOR'S NOTE",
  editorText: 'In the chaos of the modern age, we rediscover the power of simplicity. Aesthetics and functionality combined.',
  btnMagazine: 'READ ISSUE',
  btnVideo: 'WATCH',
  goBack: '← Go Back',
  magazineTopTitle: 'ISSUE 01',
  emptyMagazine: 'No pages added from the admin panel.',
  emptyVideo: 'Content not loaded.'
})

const login = () => {
  if (enteredPassword.value === VALID_PASSWORD) {
    isLoggedIn.value = true
    localStorage.setItem('adminAccess', 'active')
    fetchData()
  } else {
    errorMessage.value = 'Incorrect password, please try again.'
    setTimeout(() => errorMessage.value = '', 3000)
  }
}

const logout = () => {
  isLoggedIn.value = false
  localStorage.removeItem('adminAccess')
  enteredPassword.value = ''
}

const uploadType = ref('single') 
const magazinePages = ref([
  { id: 1, name: 'Cover', link: '' },
  { id: 2, name: 'Page 1', link: '' },
  { id: 3, name: 'Page 2', link: '' },
  { id: 4, name: 'Back Cover', link: '' }
])
const pdfLink = ref('')
const documentaryLink = ref('')
const landingLink = ref('')
const landingVideoLink = ref('')
const successMessage = ref('')

const extractDriveId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

const convertToDirectLink = (url) => {
  if (!url) return '';
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : url;
}

// Ana sayfa için sessiz arka plan videosu formatı
const convertToVideoEmbed = (url) => {
  if (!url) return '';
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview?autoplay=1&mute=1&controls=0&loop=1` : url;
}

// Belgesel sayfası için standart oynatıcı formatı (virüs uyarısını atlar)
const convertToPlayerEmbed = (url) => {
  if (!url) return '';
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : url;
}

const fetchData = async () => {
  try {
    const data = await $fetch('/api/icerik')
    if (data.dergi?.length) magazinePages.value = data.dergi
    if (data.belgesel) documentaryLink.value = data.belgesel
    if (data.landing) landingLink.value = data.landing
    if (data.landingVideo) landingVideoLink.value = data.landingVideo
    if (data.yuklemeTipi) uploadType.value = data.yuklemeTipi
    if (data.pdf) pdfLink.value = data.pdf
    if (data.siteMetinleri) texts.value = { ...texts.value, ...data.siteMetinleri }
  } catch (err) {
    console.error('Veri çekme hatası:', err)
  }
}

onMounted(() => {
  if (localStorage.getItem('adminAccess') === 'active') {
    isLoggedIn.value = true
    fetchData()
  }
})

const addNewPage = () => {
  magazinePages.value.splice(magazinePages.value.length - 1, 0, { 
    id: Date.now(), name: `Page ${magazinePages.value.length - 1}`, link: '' 
  })
}

const saveAll = async () => {
  try {
    const processedMagazine = magazinePages.value.map(p => ({ ...p, gosterimLink: convertToDirectLink(p.link) }))
    const pdfId = extractDriveId(pdfLink.value)
    
    const res = await $fetch('/api/icerik', {
      method: 'POST',
      body: {
        yuklemeTipi: uploadType.value,
        dergi: processedMagazine,
        pdf: pdfId ? `https://drive.google.com/uc?export=download&id=${pdfId}` : pdfLink.value,
        belgesel: convertToPlayerEmbed(documentaryLink.value),
        landing: convertToDirectLink(landingLink.value),
        landingVideo: convertToVideoEmbed(landingVideoLink.value),
        siteMetinleri: texts.value
      }
    })

    if (res?.error) {
      alert('Sunucu Hatası: ' + res.error)
    } else {
      successMessage.value = 'Successfully saved to database! 🚀'
      setTimeout(() => successMessage.value = '', 3000)
    }
  } catch (err) {
    alert('Bağlantı Hatası: Veritabanına ulaşılamıyor! .env dosyası eksik olabilir veya bağlantı koptu.')
  }
}
</script>

<template>
  <div>
    <div v-if="!isLoggedIn" class="login-container">
      <div class="login-box">
        <h2>FUSION MANAGEMENT</h2>
        <p>Enter your password to continue.</p>
        <div class="input-group">
          <input v-model="enteredPassword" type="password" placeholder="Password" class="admin-input" @keyup.enter="login"/>
        </div>
        <button class="btn-save" @click="login">Log In</button>
        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
      </div>
    </div>

    <div v-else class="admin-container">
      <div class="admin-panel">
        <div class="panel-header">
          <div>
            <h1 class="admin-title">Content Management Panel</h1>
            <p class="admin-subtitle">Manage all links and texts from here</p>
          </div>
          <button class="btn-logout" @click="logout">Log Out</button>
        </div>

        <section class="admin-section">
          <h2>Website Texts (Global)</h2>
          <div class="input-grid">
            <div class="input-group">
              <label>Browser Tab Title (SEO):</label>
              <input v-model="texts.seoTitle" type="text" class="admin-input" />
            </div>
            <div class="input-group">
              <label>Site Description (SEO):</label>
              <input v-model="texts.seoDescription" type="text" class="admin-input" />
            </div>
            <div class="input-group">
              <label>Site Title:</label>
              <input v-model="texts.siteTitle" type="text" class="admin-input" />
            </div>
            <div class="input-group">
              <label>Issue Date / Info:</label>
              <input v-model="texts.issueDate" type="text" class="admin-input" />
            </div>
            <div class="input-group full-width">
              <label>Main Headline (Use &lt;br&gt; for line breaks):</label>
              <input v-model="texts.mainHeadline" type="text" class="admin-input" />
            </div>
            <div class="input-group">
              <label>Editor's Note Title:</label>
              <input v-model="texts.editorTitle" type="text" class="admin-input" />
            </div>
            <div class="input-group full-width">
              <label>Editor's Note Text:</label>
              <textarea v-model="texts.editorText" class="admin-input" rows="3"></textarea>
            </div>
            <div class="input-group">
              <label>Magazine Button Text:</label>
              <input v-model="texts.btnMagazine" type="text" class="admin-input" />
            </div>
            <div class="input-group">
              <label>Video Button Text:</label>
              <input v-model="texts.btnVideo" type="text" class="admin-input" />
            </div>
            <div class="input-group">
              <label>Go Back Button Text:</label>
              <input v-model="texts.goBack" type="text" class="admin-input" />
            </div>
            <div class="input-group">
              <label>Magazine Navbar Title:</label>
              <input v-model="texts.magazineTopTitle" type="text" class="admin-input" />
            </div>
          </div>
        </section>

        <section class="admin-section">
          <h2>Homepage Background (Hero)</h2>
          <p style="font-size: 0.85rem; color: #666; margin-bottom: 1rem;">
            * If you upload a video, it will play behind the texts. The image will act as a backup.
          </p>
          <div class="input-group">
            <label>Background Video (Drive Link - Optional):</label>
            <input v-model="landingVideoLink" type="text" class="admin-input" />
          </div>
          <div class="input-group">
            <label>Background Image (Drive Link):</label>
            <input v-model="landingLink" type="text" class="admin-input" />
          </div>
        </section>

        <section class="admin-section">
          <h2>Magazine Upload Option</h2>
          <div class="tab-buttons">
            <button :class="['tab-btn', { active: uploadType === 'single' }]" @click="uploadType = 'single'">Images (One by One)</button>
            <button :class="['tab-btn', { active: uploadType === 'pdf' }]" @click="uploadType = 'pdf'">Single PDF File</button>
          </div>

          <div v-if="uploadType === 'single'" class="tab-content">
            <div v-for="page in magazinePages" :key="page.id" class="input-group">
              <label>{{ page.name }} (Drive Link):</label>
              <input v-model="page.link" type="text" class="admin-input" />
            </div>
            <button class="btn-add-page" @click="addNewPage">+ Add New Page</button>
          </div>

          <div v-if="uploadType === 'pdf'" class="tab-content">
            <div class="input-group">
              <label>PDF File (Drive Link):</label>
              <input v-model="pdfLink" type="text" class="admin-input" />
            </div>
          </div>
        </section>

        <section class="admin-section">
          <h2>Documentary / Video Page</h2>
          <div class="input-group">
            <label>Video (Drive Link):</label>
            <input v-model="documentaryLink" type="text" class="admin-input" />
          </div>
        </section>

        <div class="action-bar">
          <button class="btn-save" @click="saveAll">Save All</button>
          <span v-if="successMessage" class="success-msg">{{ successMessage }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container { min-height: 100vh; background-color: #f4f4f0; display: flex; justify-content: center; align-items: center; color: #111; }
.login-box { background: white; padding: 4rem; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); text-align: center; width: 100%; max-width: 400px; }
.login-box h2 { font-size: 1.5rem; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
.login-box p { color: #666; margin-bottom: 2rem; }
.error-msg { color: #ff3b30 !important; margin-top: 1rem !important; font-weight: 500; }
.panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.btn-logout { background: none; border: 1px solid #111; color: #111; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
.btn-logout:hover { background: #111; color: white; }
.admin-container { min-height: 100vh; background-color: #f4f4f0; color: #1a1a1a; display: flex; justify-content: center; padding: 4rem 2rem; }
.admin-panel { background: white; width: 100%; max-width: 800px; padding: 3rem; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
.admin-title { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
.admin-subtitle { color: #86868b; margin-bottom: 2rem; }
.admin-section { margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid #eee; }
.admin-section h2 { font-size: 1.1rem; margin-bottom: 1rem; color: #111; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
.tab-buttons { display: flex; gap: 1rem; margin-bottom: 2rem; }
.tab-btn { padding: 0.8rem 1.5rem; background: #f6f5f3; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600; color: #86868b; transition: all 0.2s; }
.tab-btn.active { background: #111; color: white; border-color: #111; }
.input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.full-width { grid-column: 1 / -1; }
.input-group { display: flex; flex-direction: column; gap: 0.5rem; text-align: left; margin-bottom: 1rem;}
.input-group label { font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #666; }
.admin-input { padding: 1rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; width: 100%; box-sizing: border-box; font-family: inherit; }
.admin-input:focus { outline: none; border-color: #111; }
textarea.admin-input { resize: vertical; }
.btn-add-page { background: none; border: 1px dashed #111; color: #111; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; margin-top: 1rem; }
.btn-add-page:hover { background: #111; color: white; }
.action-bar { display: flex; align-items: center; gap: 2rem; margin-top: 2rem; }
.btn-save { background: #111; color: white; border: none; padding: 1rem 3rem; border-radius: 8px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; width: 100%; }
.btn-save:hover { background: #333; }
.success-msg { color: #34c759; font-weight: 600; }
</style>
