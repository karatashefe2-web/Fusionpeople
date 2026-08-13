<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps<{
  src: string
  fallbackImage?: string
  poster?: string
  overlay?: boolean
}>()

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

// AKILLI KAPAK FOTOĞRAFI: Admin resim yüklememişse bile YouTube'un HD kapağını otomatik çeker
const smartFallback = computed(() => {
  if (props.fallbackImage) return props.fallbackImage
  if (ytId.value) return `https://img.youtube.com/vi/${ytId.value}/maxresdefault.jpg`
  return ''
})

const driveUrl = computed(() => {
  if (driveId.value) {
    return `https://drive.google.com/file/d/${driveId.value}/preview?autoplay=1&mute=1&controls=0&loop=1`
  }
  return ''
})

// YOUTUBE RESMİ I-FRAME API MOTORU
const initYouTubeAPI = () => {
  if (!isYouTube.value || !ytId.value) return

  const createPlayer = () => {
    if (!ytContainer.value) return
    ytPlayer = new (window as any).YT.Player(ytContainer.value, {
      videoId: ytId.value,
      playerVars: {
        autoplay: 1, mute: 1, controls: 0, playsinline: 1, loop: 1,
        playlist: ytId.value, rel: 0, showinfo: 0, modestbranding: 1,
        disablekb: 1, fs: 0, cc_load_policy: 0, iv_load_policy: 3
      },
      events: {
        onReady: (event: any) => {
          event.target.mute()
          event.target.playVideo()
        },
        onStateChange: (event: any) => {
          // Video "GERÇEKTEN" oynamaya başladığında şeffaflığı kaldır ve göster!
          if (event.data === 1) { 
            isYtPlaying.value = true
          }
          // Tek video loop'u: playlist parametresi olmadan (0 = ENDED)
          if (event.data === 0 && ytPlayer && typeof ytPlayer.playVideo === 'function') {
            ytPlayer.playVideo()
          }
        }
      }
    })
  }

  if ((window as any).YT && (window as any).YT.Player) {
    createPlayer()
  } else {
    if (!document.getElementById('yt-api-script')) {
      const tag = document.createElement('script')
      tag.id = 'yt-api-script'
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      } else {
        document.head.appendChild(tag)
      }
    }
    ;(window as any).onYouTubeIframeAPIReady = () => {
      createPlayer()
    }
  }
}

// GÖRÜNMEZ TETİKLEYİCİ: Kullanıcı ekrana dokunduğu an Safari kilidini açar
const handleUserInteraction = () => {
  if (ytPlayer && typeof ytPlayer.playVideo === 'function' && !isYtPlaying.value) {
    ytPlayer.mute()
    ytPlayer.playVideo()
  }
}

watch(ytId, (newId) => {
  if (newId) {
    isYtPlaying.value = false
    nextTick(() => {
      if (ytPlayer && typeof ytPlayer.destroy === 'function') ytPlayer.destroy()
      initYouTubeAPI()
    })
  }
})

onMounted(() => {
  if (isYouTube.value) initYouTubeAPI()
  
  // Tüm ekrandaki dokunuşları dinle
  window.addEventListener('click', handleUserInteraction, { passive: true })
  window.addEventListener('touchstart', handleUserInteraction, { passive: true })
  window.addEventListener('scroll', handleUserInteraction, { passive: true })
})

onBeforeUnmount(() => {
  if (ytPlayer && typeof ytPlayer.destroy === 'function') ytPlayer.destroy()
  window.removeEventListener('click', handleUserInteraction)
  window.removeEventListener('touchstart', handleUserInteraction)
  window.removeEventListener('scroll', handleUserInteraction)
})
</script>

<template>
  <div class="background-media">
    
    <!-- YOUTUBE (Görünmez başlar, oynayınca animasyonla ortaya çıkar) -->
    <div v-show="isYouTube" class="bg-video-wrapper yt-hack" :class="{ 'is-visible': isYtPlaying }">
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
      :src="src"
      :poster="smartFallback"
      class="bg-video"
      autoplay
      loop
      muted
      playsinline>
    </video>
    
    <!-- AKILLI YEDEK FOTOĞRAF (Siyah ekranı kalıcı olarak bitirir) -->
    <img v-if="smartFallback" :src="smartFallback" alt="Background Fallback" class="bg-image" />
    
    <div v-if="overlay" class="overlay">
      <div v-if="isYouTube" class="chrome-top"></div>
      <div v-if="isYouTube" class="chrome-bottom"></div>
    </div>
  </div>
</template>

<style scoped>
.background-media {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; overflow: hidden; background: #050505;
}

/* Fallback fotoğrafı hep en altta kalır */
.bg-image { width: 100%; height: 100%; object-fit: cover; opacity: 0.6; position: absolute; top:0; left:0; z-index: 1; }

.bg-video {
  width: 100%; height: 100%; object-fit: cover;
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  pointer-events: none; border: none; z-index: 2;
}

.bg-video-wrapper, .bg-video-embed {
  position: absolute; top: 50%; left: 50%; width: 100vw; height: 56.25vw; min-height: 100vh; min-width: 177.77vh;
  transform: translate(-50%, -50%) scale(1.15); border: none; pointer-events: none; z-index: 2;
}

.bg-video-wrapper :deep(iframe) { width: 100%; height: 100%; border: none; pointer-events: none; }

/* KUSURSUZ YOUTUBE ORANLAMASI (Sadece UI'yi dışarı atacak kadar 1.5 zoom) */
.yt-hack {
  transform: translate(-50%, -50%) scale(1.5);
}

/* HAYALET MODU */
.bg-video-wrapper {
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
}
.bg-video-wrapper.is-visible {
  opacity: 1;
}

.overlay {
  position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%);
  pointer-events: none; z-index: 3;
}

.chrome-top { position: absolute; top: 0; left: 0; right: 0; height: 10vh; background: linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%); }
.chrome-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 15vh; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%); }
</style>
