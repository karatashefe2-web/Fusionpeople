<script setup>
import { ref, onMounted, nextTick } from 'vue'

const heroImage = ref('')
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
    const ytId = extractYouTubeId(data.landingVideo)
    if (ytId) {
      ytVideoId.value = ytId
      await nextTick()
      initYouTubeAPI()
    }
  }
})

const initYouTubeAPI = () => {
  if (window.YT && window.YT.Player) {
    createPlayer()
  } else {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    window.onYouTubeIframeAPIReady = () => createPlayer()
  }
}

const createPlayer = () => {
  player = new window.YT.Player('yt-bg-iframe', {
    events: {
      onReady: (event) => { 
        isPlayerReady.value = true
        event.target.mute()
        event.target.playVideo()
        
        // YouTube API üzerinden gereksiz tüm eklentileri yok et
        event.target.unloadModule('captions')
        event.target.unloadModule('cc')
      },
      onStateChange: (event) => {
        // VİDEO BİTTİĞİ AN: YouTube'un kendi loop'u yerine biz 0. saniyeye sarıyoruz!
        if (event.data === window.YT.PlayerState.ENDED) {
          event.target.seekTo(0)
          event.target.playVideo()
        }
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
      <!-- DİKKAT: loop=1 ve playlist parametreleri tamamen SİLİNDİ! -->
      <iframe
        v-if="ytVideoId"
        id="yt-bg-iframe"
        class="iframe-video yt-scaled"
        :src="`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&mute=1&controls=0&playsinline=1&enablejsapi=1&rel=0&showinfo=0&modestbranding=1&cc_load_policy=0&iv_load_policy=3&fs=0&disablekb=1`"
        allow="autoplay; fullscreen"
        frameborder="0"
      ></iframe>
      
      <img v-if="!ytVideoId && heroImage" :src="heroImage" alt="Hero Background" class="bg-image" />
      
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
      
      <button v-if="ytVideoId && isPlayerReady" class="minimal-mute-btn" @click="toggleSound" :title="isMuted ? 'Unmute' : 'Mute'">
        <svg v-if="isMuted" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      </button>
    </div>
    
  </div>
</template>

<style scoped>
.cinematic-layout { min-height: 100vh; display: flex; flex-direction: column; color: #ffffff; position: relative; overflow: hidden; background: transparent; }

.background-media { 
  position: fixed; inset: 0; z-index: 0; 
  width: 100vw; height: 100vh; overflow: hidden; background: #000; 
  display: flex; justify-content: center; align-items: center;
}
.bg-image { width: 100%; height: 100%; object-fit: cover; }

.iframe-video { 
  width: 100vw; height: 56.25vw; 
  min-height: 100vh; min-width: 177.77vh; 
  position: absolute; top: 50%; left: 50%; 
  pointer-events: none; border: none;
}

.yt-scaled {
  transform: translate(-50%, -50%) scale(1.25);
}

.overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%); }

.content-layer { position: relative; z-index: 10; display: flex; flex-direction: column; flex: 1; padding: 2rem; }

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

.minimal-mute-btn {
  position: absolute;
  bottom: 2.5rem;
  left: 2.5rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.4s ease;
  z-index: 50;
}
.minimal-mute-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.08);
}

@media (max-width: 768px) {
  .grid-container { grid-template-columns: 1fr; }
  .side-content { border-left: none; padding-left: 0; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 2rem; }
  .minimal-mute-btn {
    bottom: 1.5rem;
    left: 1.5rem;
    width: 42px;
    height: 42px;
  }
}
</style>
