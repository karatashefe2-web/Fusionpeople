<script setup>
import { ref, onMounted } from 'vue'

const heroImage = ref('')
const landingVideo = ref('')
const embedUrl = ref('')
const videoElement = ref(null)
const iframeRef = ref(null)
const hasVideo = ref(false)
const isYouTube = ref(false)
const isDriveEmbed = ref(false)
const isDirectFile = ref(false)

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
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([\w-]{11})/)
  return match ? match[1] : null
}

const extractDriveId = (url) => {
  if (!url) return null
  const match = url.match(/\/d\/([\w-]{25,})/)
  return match ? match[1] : null
}

// YouTube embed URL'si: kontroller, başlık, logo, algoritmayla gelen öneriler ve
// altyazı tamamen kapalı. enablejsapi=1 sayesinde postMessage ile komut gönderilebilir.
const buildYouTubeEmbedUrl = (videoId) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&fs=0&disablekb=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`
}

// Oynatıcıya postMessage ile komut gönderir — tarayıcı autoplay politikasını aşar.
const forcePlayYouTube = () => {
  const frame = iframeRef.value
  if (!frame || !frame.contentWindow) return
  frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*')
  frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*')
}

onMounted(async () => {
  const data = await $fetch('/api/icerik')
  if (data.landing) heroImage.value = data.landing
  if (data.landingVideo) {
    landingVideo.value = data.landingVideo
    const ytId = extractYouTubeId(data.landingVideo)
    const driveId = extractDriveId(data.landingVideo)
    isYouTube.value = Boolean(ytId)
    isDriveEmbed.value = Boolean(driveId && !ytId)
    isDirectFile.value = !ytId && !driveId
    hasVideo.value = true
    if (ytId) embedUrl.value = buildYouTubeEmbedUrl(ytId)
  }
  if (data.siteMetinleri) texts.value = { ...texts.value, ...data.siteMetinleri }

  // Autoplay garantisi: iframe yüklendiğinde ve düzenli aralıklarla postMessage ile
  // mute + play gönder. Video asla durağan kalmaz → YouTube'un play butonu/başlık/altyazı görünmez.
  if (isYouTube.value) {
    setTimeout(forcePlayYouTube, 1000)
    setTimeout(forcePlayYouTube, 2500)
    setTimeout(forcePlayYouTube, 5000)
    setInterval(forcePlayYouTube, 3000)
    window.addEventListener('pointerdown', forcePlayYouTube)
  }
})

const toggleSound = () => {
  isMuted.value = !isMuted.value
  if (videoElement.value) {
    videoElement.value.muted = isMuted.value
  }
}

const handleVideoError = () => {
  hasVideo.value = false
}
</script>

<template>
  <div class="cinematic-layout">
    
    <div class="background-media">
      <!-- YouTube: ham embed + postMessage ile zorla oynatma; scale ile krom ekran dışına itilir (mp4 hissi) -->
      <iframe
        v-if="hasVideo && isYouTube"
        ref="iframeRef"
        :src="embedUrl"
        class="bg-video-embed"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        @load="forcePlayYouTube">
      </iframe>

      <!-- Drive embed (yalın oynatıcı, cover ölçekli) -->
      <iframe
        v-else-if="hasVideo && isDriveEmbed"
        :src="`https://drive.google.com/file/d/${extractDriveId(landingVideo)}/preview?autoplay=1&mute=1&controls=0&loop=1`"
        class="bg-video-embed"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>

      <!-- Doğrudan video dosyası (mp4 vb.) -->
      <video 
        v-else-if="hasVideo && isDirectFile"
        ref="videoElement"
        :src="landingVideo"
        class="bg-video"
        autoplay 
        loop 
        muted 
        playsinline
        preload="auto"
        @error="handleVideoError">
      </video>
      
      <!-- Video yüklenemezse veya yoksa yedek görsel devreye girer -->
      <img v-else-if="heroImage" :src="heroImage" alt="Hero Background" class="bg-image" />
      
      <div class="overlay">
        <!-- YouTube krom kalıntılarını (başlık/kontrol bantları) yumuşatan siyah geçişler -->
        <div class="chrome-top"></div>
        <div class="chrome-bottom"></div>
      </div>
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
      
      <!-- MİNİMAL SES BUTONU (Sadece doğrudan video dosyalarında — mp4 hissi için) -->
      <button v-if="hasVideo && isDirectFile" class="minimal-mute-btn" @click="toggleSound" :title="isMuted ? 'Unmute' : 'Mute'">
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

.bg-video {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  border: none;
}

/* YouTube ve Drive için çerçeveleme çözümü (kesin mp4 hissi):
   iframe'i 2.2x büyütüp görüntünün merkezini ekranın üstüne taşırız.
   Böylece YouTube'un paused durumda gösterdiği merkez play/pause overlay'i,
   üst başlık barı, logo, alt kontrol/progress barı ve "Diğer videolar"
   önerileri fiziksel olarak ekranın DIŞINA taşar. Ekranda yalnızca videonun
   orta-alt bölgesi kalır — oynuyor ya da durağan fark etmeksizin arayüzden
   hiçbir şey görünmez. */
.bg-video-embed {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  transform: translateY(-55%) scale(2.2);
  border: none;
  pointer-events: none;
  background: #000;
}

.overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%); }

/* YouTube krom (başlık/kontrol) kalıntılarını yumuşatan siyah geçiş bantları */
.chrome-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8vh;
  background: linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%);
}
.chrome-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 12vh;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%);
}

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
