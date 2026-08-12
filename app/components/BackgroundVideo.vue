<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps<{
  src: string
  fallbackImage?: string
  poster?: string
  overlay?: boolean
}>()

const videoElement = ref<HTMLVideoElement | null>(null)
const ytContainer = ref<HTMLElement | null>(null)
const isYtPlaying = ref(false)
let ytPlayer: any = null

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

const isYouTube = computed(() => !!ytId.value)
const isDriveEmbed = computed(() => !!driveId.value)
const isDirectFile = computed(() => !isYouTube.value && !isDriveEmbed.value && !!props.src)

const driveUrl = computed(() => {
  if (driveId.value) {
    return `https://drive.google.com/file/d/${driveId.value}/preview?autoplay=1&mute=1&controls=0&loop=1`
  }
  return ''
})

// YOUTUBE RESMİ API MOTORU (Kırmızı Play Tuşunu ve Safari Engelini Yok Eder)
const initYouTubeAPI = () => {
  if (!isYouTube.value || !ytId.value) return

  const createPlayer = () => {
    if (!ytContainer.value) return
    ytPlayer = new (window as any).YT.Player(ytContainer.value, {
      videoId: ytId.value,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 0,
        playsinline: 1,
        loop: 1,
        playlist: ytId.value,
        rel: 0,
        showinfo: 0,
        modestbranding: 1,
        disablekb: 1,
        fs: 0,
        cc_load_policy: 0,
        iv_load_policy: 3
      },
      events: {
        onReady: (event: any) => {
          // Motor hazır olduğunda %100 sessize al ve zorla başlat
          event.target.mute() 
          event.target.playVideo()
        },
        onStateChange: (event: any) => {
          // 1 = PLAYING (Oynuyor) demektir. 
          // Video resmen oynamaya başladığında şeffaflığı (opacity) kaldır ve videoyu göster!
          if (event.data === 1) {
            isYtPlaying.value = true
          }
        }
      }
    })
  }

  // Motor zaten yüklüyse direkt çalıştır, değilse Google'dan çek
  if ((window as any).YT && (window as any).YT.Player) {
    createPlayer()
  } else {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }
    ;(window as any).onYouTubeIframeAPIReady = () => {
      createPlayer()
    }
  }
}

watch(ytId, (newId) => {
  if (newId) {
    isYtPlaying.value = false // Yeni link girildiğinde videoyu tekrar görünmez yap
    nextTick(() => {
      if (ytPlayer && typeof ytPlayer.destroy === 'function') {
        ytPlayer.destroy()
      }
      initYouTubeAPI()
    })
  }
})

onMounted(() => {
  if (isYouTube.value) {
    initYouTubeAPI()
  }
})

onBeforeUnmount(() => {
  if (ytPlayer && typeof ytPlayer.destroy === 'function') {
    ytPlayer.destroy()
  }
})
</script>

<template>
  <div class="background-media">
    
    <!-- YOUTUBE SİSTEMİ (Oynamaya başlayana kadar şeffaf kalır) -->
    <div v-show="isYouTube" class="bg-video-wrapper" :class="{ 'is-playing': isYtPlaying }">
      <div ref="ytContainer"></div>
    </div>
    
    <iframe
      v-if="isDriveEmbed"
      :src="driveUrl"
      class="bg-video-embed"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>
    
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
    
    <!-- Video görünmez halde arkada yüklenirken izleyiciye bu fotoğraf gösterilir (Kusursuz Fade-in) -->
    <img v-if="fallbackImage" :src="fallbackImage" alt="Background Fallback" class="bg-image" />
    
    <div v-if="overlay" class="overlay">
      <div class="chrome-top"></div>
      <div class="chrome-bottom"></div>
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

/* Fallback fotoğrafı z-index: 1 ile hep altta tutulur */
.bg-image { width: 100%; height: 100%; object-fit: cover; opacity: 0.5; position: absolute; top:0; left:0; z-index: 1; }

.bg-video {
  width: 100%; height: 100%; object-fit: cover;
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  pointer-events: none; border: none; z-index: 2;
}

/* 16:9 Kusursuz Oranlama Kapsayıcısı */
.bg-video-wrapper, .bg-video-embed {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100vw;
  height: 56.25vw;
  min-height: 100vh;
  min-width: 177.77vh;
  transform: translate(-50%, -50%) scale(1.15);
  border: none;
  pointer-events: none;
  z-index: 2;
}

/* YouTube iframe'inin wrapper'ı tam doldurması için */
.bg-video-wrapper :deep(iframe) {
  width: 100%;
  height: 100%;
  border: none;
  pointer-events: none;
}

/* HAYALET MODU ANIMASYONU: YouTube Videosu Oynamaya Başladığında Görünür Olur */
.bg-video-wrapper {
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
}
.bg-video-wrapper.is-playing {
  opacity: 1;
}

.overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%);
  pointer-events: none;
  z-index: 3;
}

.chrome-top { position: absolute; top: 0; left: 0; right: 0; height: 10vh; background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%); }
.chrome-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 15vh; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%); }
</style>
