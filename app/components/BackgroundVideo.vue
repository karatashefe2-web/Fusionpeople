<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  src: string
  fallbackImage?: string
  poster?: string
  overlay?: boolean
}>()

const isVisible = ref(false)

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

const embedUrl = computed(() => {
  if (ytId.value) {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `https://www.youtube.com/embed/${ytId.value}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId.value}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&fs=0&disablekb=1&playsinline=1&origin=${encodeURIComponent(origin)}`
  }
  return ''
})

const driveUrl = computed(() => {
  if (driveId.value) {
    return `https://drive.google.com/file/d/${driveId.value}/preview?autoplay=1&mute=1&controls=0&loop=1`
  }
  return ''
})

// Video yüklendiği an karanlıktan çıkar
const onVideoReady = () => {
  isVisible.value = true
}

onMounted(() => {
  // 2 SANİYE KURALI: Safari videoyu dondursa bile sayfa siyah kalmasın diye zorla görünür yapıyoruz.
  setTimeout(() => {
    isVisible.value = true
  }, 2000)
})
</script>

<template>
  <div class="background-media">
    
    <iframe
      v-if="isYouTube"
      :src="embedUrl"
      class="bg-video-embed"
      :class="{ 'is-visible': isVisible }"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      @load="onVideoReady">
    </iframe>
    
    <iframe
      v-else-if="isDriveEmbed"
      :src="driveUrl"
      class="bg-video-embed"
      :class="{ 'is-visible': isVisible }"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      @load="onVideoReady">
    </iframe>
    
    <video
      v-else-if="isDirectFile"
      :src="src"
      :poster="poster || fallbackImage"
      class="bg-video"
      :class="{ 'is-visible': isVisible }"
      autoplay
      loop
      muted
      playsinline
      @loadeddata="onVideoReady">
    </video>
    
    <!-- YEDEK FOTOĞRAF: Video yüklenene kadar veya Apple videoyu engellerse bu görünür -->
    <img v-if="fallbackImage" :src="fallbackImage" alt="Background Fallback" class="bg-image" />
    
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

.bg-image { width: 100%; height: 100%; object-fit: cover; opacity: 0.5; position: absolute; top:0; left:0; z-index: 1; }

.bg-video {
  width: 100%; height: 100%; object-fit: cover;
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  pointer-events: none; border: none; z-index: 2;
}

.bg-video-embed {
  position: absolute; top: 50%; left: 50%; width: 100vw; height: 56.25vw; min-height: 100vh; min-width: 177.77vh;
  transform: translate(-50%, -50%) scale(1.15);
  border: none; pointer-events: none; z-index: 2;
}

/* YUMUŞAK GEÇİŞ (Fade-in) EFEKTİ */
.bg-video, .bg-video-embed {
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
}
.is-visible {
  opacity: 1;
}

.overlay {
  position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%);
  pointer-events: none; z-index: 3;
}

.chrome-top { position: absolute; top: 0; left: 0; right: 0; height: 10vh; background: linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%); }
.chrome-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 15vh; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%); }
</style>
