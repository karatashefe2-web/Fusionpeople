<script setup>
import { ref, onMounted } from 'vue'

const heroImage = ref('https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=2000&auto=format&fit=crop')
const rawVideoLink = ref(null)
const ytVideoId = ref(null)
const isMuted = ref(true)
const isPlayerReady = ref(false)
let player = null

const texts = ref({
  siteTitle: 'FUSION PEOPLE',
  issueDate: 'ISSUE 01 — 2026',
  mainHeadline: 'DIGITAL<br>CULTURE.',
  editorTitle: "EDITOR'S NOTE",
  editorText: 'In the chaos of the modern age, we rediscover the power of simplicity. Aesthetics and functionality combined.',
  btnMagazine: 'READ ISSUE',
  btnVideo: 'WATCH'
})

// Kurşun geçirmez YouTube ID yakalayıcı (Her formatı tanır)
const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

onMounted(async () => {
  const data = await $fetch('/api/icerik')
  if (data.landing) heroImage.value = data.landing
  if (data.siteMetinleri) texts.value = { ...texts.value, ...data.siteMetinleri }
  
  if (data.landingVideo) {
    rawVideoLink.value = data.landingVideo
    const ytId = extractYouTubeId(data.landingVideo)
    
    // Eğer YouTube linkiyse özel motoru kur
    if (ytId) {
      ytVideoId.value = ytId
      initYouTubeAPI()
    }
  }
})

const initYouTubeAPI = () => {
  if (!window.YT) {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    
    window.onYouTubeIframeAPIReady = () => {
      createPlayer()
    }
  } else if (window.YT && window.YT.Player) {
    createPlayer()
  } else {
    setTimeout(createPlayer, 1000)
  }
}

const createPlayer = () => {
  player = new window.YT.Player('yt-player-container', {
    videoId: ytVideoId.value,
    playerVars: {
      autoplay: 1,
      controls: 0,
      mute: 1,
      loop: 1,
      playlist: ytVideoId.value, 
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
      disablekb: 1,
      playsinline: 1
    },
    events: {
      onReady: (event) => { 
        isPlayerReady.value = true
        event.target.playVideo()
      }
    }
  })
}

const toggleSound = () => {
  if (player && typeof player.unMute === 'function') {
    if (isMuted.value) {
      player.unMute()
      player.setVolume(100)
    } else {
      player.mute()
    }
    isMuted.value = !isMuted.value
  }
}
</script>

<template>
  <div class="cinematic-layout">
    
    <div class="background-media">
      
      <!-- MOTOR 1: YouTube Videosu Yüklendiyse (Ses kontrollü) -->
      <div v-show="ytVideoId" id="yt-player-container" class="iframe-video"></div>
      
      <!-- MOTOR 2: Google Drive Videosu Yüklendiyse (Eski usul) -->
      <iframe 
        v-if="!ytVideoId && rawVideoLink" 
        :src="rawVideoLink" 
        class="iframe-video" 
        allow="autoplay; fullscreen; muted" 
        frameborder="0">
      </iframe>
      
      <!-- MOTOR 3: Hiç video yoksa Resim göster -->
      <img v-show="!rawVideoLink" :src="heroImage" alt="Hero Background" class="bg-image" />
      
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
      
      <!-- SADECE YOUTUBE VİDEOLARINDA ÇIKAN SES BUTONU -->
      <button v-if="ytVideoId && isPlayerReady" class="sound-toggle-btn" @click="toggleSound">
        <span class="icon">{{ isMuted ? '🔇' : '🔊' }}</span>
        <span class="text">{{ isMuted ? 'SOUND OFF' : 'SOUND ON' }}</span>
      </button>
    </div>
    
  </div>
</template>

<style scoped>
.cinematic-layout { min-height: 100vh; display: flex; flex-direction: column; color: #ffffff; position: relative; overflow: hidden; }

.background-media { 
  position: fixed; inset: 0; z-index: -1; 
  width: 100vw; height: 100vh; overflow: hidden; background: #000; 
  display: flex; justify-content: center; align-items: center;
}
.bg-image { width: 100%; height: 100%; object-fit: cover; }

.iframe-video { 
  width: 100vw; height: 56.25vw; 
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

.sound-toggle-btn {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: #fff;
  padding: 0.8rem 1.2rem;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  transition: all 0.3s ease;
  z-index: 50;
}
.sound-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .grid-container { grid-template-columns: 1fr; }
  .side-content { border-left: none; padding-left: 0; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 2rem; }
  .sound-toggle-btn {
    bottom: 1rem;
    right: 1rem;
    padding: 0.6rem 1rem;
    font-size: 0.65rem;
  }
}
</style>
