<script setup lang="ts">
// Saf HTML5 arka plan videosu: kontroller yok, altyazı yok, autoplay muted loop.
// Video yüklenemezse veya hata verirse fallback görsele düşer.
defineProps<{
  src: string
  poster?: string
  fallbackImage?: string
  overlay?: boolean
}>()

const videoError = ref(false)

const handleError = () => {
  videoError.value = true
}
</script>

<template>
  <div class="bg-media">
    <video
      v-if="src && !videoError"
      :src="src"
      class="bg-media__video"
      autoplay
      loop
      muted
      playsinline
      preload="auto"
      :poster="poster"
      :title="''"
      @error="handleError"
    ></video>
    <img v-else-if="fallbackImage" :src="fallbackImage" alt="" class="bg-media__image" />
    <div v-if="overlay" class="bg-media__overlay"></div>
  </div>
</template>

<style scoped>
.bg-media {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background: #000;
}
.bg-media__video {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  pointer-events: none;
}
.bg-media__image {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
}
.bg-media__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.6) 100%);
}
</style>
