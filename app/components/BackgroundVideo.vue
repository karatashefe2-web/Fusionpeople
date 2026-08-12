<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  src: string
  fallbackImage?: string
  poster?: string
  overlay?: boolean
}>()

const iframeRef = ref<HTMLIFrameElement | null>(null)
const videoElement = ref<HTMLVideoElement | null>(null)

// Link Çözücüler
const extractYouTubeId = (url: string) => {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([\w-]{11})/)
  return match ? match[1] : null
}

const extractDriveId = (url: string) => {
  if (!url) return null
  const match = url.match(/[-\w]{25,}/)
  return match ? match[0] : null
}

const ytId = computed(() => extractYouTubeId(props.src))
const driveId = computed(() => (!ytId.value ? extractDriveId(props.src) : null))

// Hangi Motorun Çalışacağını Belirleyen Zeka
const isYouTube = computed(() => !!ytId.value)
const isDriveEmbed = computed(() => !!driveId.value)
const isDirectFile = computed(() => !isYouTube.value && !isDriveEmbed.value && !!props.src)

// Özel Oynatıcı Linkleri (Kromsuz, yazısız, sessiz ve autoplay)
const embedUrl = computed(() => {
  if (ytId.value) {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `https://www.youtube.com/embed/${ytId.value}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId.value}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&fs=0&disablekb=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`
  }
  return ''
})

const driveUrl = computed(() => {
  if (driveId.value) {
    return `https://drive.google.com/file/d/${driveId.value}/preview?autoplay=1&mute=1&controls=0&loop=1`
  }
  return ''
})

// YouTube'u zorla başlatmak için API Sinyali
const forcePlayYouTube = () => {
  if (!iframeRef.value || !iframeRef.value.contentWindow) return
  iframeRef.value.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*')
  iframeRef.value.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*')
}

onMounted(() => {
  if (isYouTube.value) {
    setTimeout(forcePlayYouTube, 1000)
    setTimeout(forcePlayYouTube, 2500)
    setInterval(forcePlayYouTube, 3000)
  }
})
</script>

<template>
  <div class="background-media">
    
    <!-- YOUTUBE SİSTEMİ -->
    <iframe
      v-if="isYouTube"
      ref="iframeRef"
      :src="embedUrl"
      class="bg-video-embed"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      @load="forcePlayYouTube">
    </iframe>
    
    <!-- DRIVE SİSTEMİ -->
    <iframe
      v-else-if="isDriveEmbed"
      :src="driveUrl"
      class="bg-video-embed drive-fix"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>
    
    <!-- DOĞRUDAN MP4 / VİDEO SİSTEMİ -->
    <video
      v-else-if="isDirectFile"
      ref="videoElement"
      :src="src"
      :poster="poster || fallbackImage"
      class="bg-video"
      autoplay
      loop
      muted
      playsinline>
    </video>
    
    <!-- HİÇBİRİ YOKSA FOTOĞRAF -->
    <img v-else-if="fallbackImage" :src="fallbackImage" alt="Background Fallback" class="bg-image" />
    
    <!-- SİNEMATİK SİYAH EFEKTLER (Overlay) -->
    <div v-if="overlay" class="overlay">
      <div v-if="isYouTube" class="chrome-top"></div>
      <div v-if="isYouTube" class="chrome-bottom"></div>
    </div>
  </div>
</template>

<style scoped>
.background-media {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  background: #000;
}
.bg-image { width: 100%; height: 100%; object-fit: cover; opacity: 0.6; }

.bg-video {
  width: 100%; height: 100%; object-fit: cover;
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  pointer-events: none; border: none;
}

/* YOUTUBE HİLESİ: Yazıları ekran dışına itmek için devasa (2.2) yapıyoruz */
.bg-video-embed {
  position: absolute; top: 0; left: 0; width: 100vw; height: 100vh;
  transform: translateY(-55%) scale(2.2); border: none; pointer-events: none; background: #000;
}

/* DRIVE HİLESİ: Hafifçe büyütüyoruz ki kenarlıklar gitsin */
.drive-fix {
  transform: translate(-50%, -50%) scale(1.15);
  top: 50%; left: 50%;
}

.overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%);
  pointer-events: none;
}

.chrome-top { position: absolute; top: 0; left: 0; right: 0; height: 10vh; background: linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%); }
.chrome-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 15vh; background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%); }
</style>
