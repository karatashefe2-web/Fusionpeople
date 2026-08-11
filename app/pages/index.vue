<script setup>
import { ref, onMounted } from 'vue'

const heroImage = ref('https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=2000&auto=format&fit=crop')
const heroVideo = ref(null)
const texts = ref({
  siteTitle: 'FUSION PEOPLE',
  issueDate: 'ISSUE 01 — 2026',
  mainHeadline: 'DIGITAL<br>CULTURE.',
  editorTitle: "EDITOR'S NOTE",
  editorText: 'In the chaos of the modern age, we rediscover the power of simplicity. Aesthetics and functionality combined.',
  btnMagazine: 'READ ISSUE',
  btnVideo: 'WATCH'
})

onMounted(async () => {
  const data = await $fetch('/api/icerik')
  if (data.landing) heroImage.value = data.landing
  if (data.landingVideo) heroVideo.value = data.landingVideo
  if (data.siteMetinleri) texts.value = { ...texts.value, ...data.siteMetinleri }
})
</script>

<template>
  <div class="cinematic-layout">
    
    <div class="background-media">
      <iframe 
        v-if="heroVideo" 
        :src="heroVideo" 
        class="iframe-video" 
        allow="autoplay; fullscreen; muted" 
        frameborder="0">
      </iframe>
      <img v-else :src="heroImage" alt="Hero Background" class="bg-image" />
      <div class="overlay"></div>
    </div>

    <div class="content-layer">
      <header class="top-bar">
        <div class="logo">{{ texts.siteTitle }}</div>
        <div class="date-issue">{{ texts.issueDate }}</div>
      </header>

      <main class="grid-container">
        <section class="hero-section">
          <h1 class="headline" v-html="texts.mainHeadline"></h1>
        </section>

        <section class="side-content">
          <div class="editorial-note">
            <h3>{{ texts.editorTitle }}</h3>
            <p>{{ texts.editorText }}</p>
          </div>
          
          <div class="action-links">
            <NuxtLink to="/dergi" class="ed-btn">{{ texts.btnMagazine }} <span>→</span></NuxtLink>
            <NuxtLink to="/belgesel" class="ed-btn">{{ texts.btnVideo }} <span>→</span></NuxtLink>
          </div>
        </section>
      </main>
    </div>
    
  </div>
</template>

<style scoped>
.cinematic-layout { min-height: 100vh; display: flex; flex-direction: column; color: #ffffff; position: relative; overflow: hidden; }

/* YouTube videosunun ekrana tam oturması için CSS formülü */
.background-media { 
  position: fixed; inset: 0; z-index: -1; 
  width: 100vw; height: 100vh; overflow: hidden; background: #000; 
  display: flex; justify-content: center; align-items: center;
}
.bg-image { width: 100%; height: 100%; object-fit: cover; }

.iframe-video { 
  width: 100vw; height: 56.25vw; /* 16:9 Oranı korur */
  min-height: 100vh; min-width: 177.77vh; 
  position: absolute; top: 50%; left: 50%; 
  transform: translate(-50%, -50%); 
  pointer-events: none; border: none;
}

.overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%); }

.content-layer { position: relative; z-index: 1; display: flex; flex-direction: column; flex: 1; padding: 2rem; }

.top-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 1rem; margin-bottom: 3rem; }
.logo { font-size: 1.2rem; font-weight: 800; letter-spacing: -0.02em; }
.date-issue { font-size: 0.85rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }

.grid-container { display: grid; grid-template-columns: 2fr 1fr; gap: 4rem; flex: 1; }
.headline { font-size: clamp(4rem, 8vw, 8rem); line-height: 0.9; letter-spacing: -0.04em; margin: 0; }
.side-content { display: flex; flex-direction: column; justify-content: flex-end; border-left: 1px solid rgba(255,255,255,0.3); padding-left: 4rem; padding-bottom: 2rem; }

.editorial-note { margin-bottom: 3rem; }
.editorial-note h3 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; border-bottom: 1px solid #fff; display: inline-block; }
.editorial-note p { font-size: 1.3rem; line-height: 1.5; font-weight: 400; color: #e0e0e0; }

.action-links { display: flex; flex-direction: column; gap: 1rem; }
.ed-btn { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: rgba(255,255,255,0.1); color: #fff; text-decoration: none; font-weight: 600; text-transform: uppercase; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); transition: all 0.3s; }
.ed-btn:hover { background: #fff; color: #000; }

@media (max-width: 768px) {
  .grid-container { grid-template-columns: 1fr; }
  .side-content { border-left: none; padding-left: 0; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 2rem; }
}
</style>
