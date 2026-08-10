<script setup>
import { ref, onMounted } from 'vue'

const videoLink = ref(null)
const texts = ref({
  goBack: '← Go Back',
  emptyVideo: 'Content not loaded.'
})

onMounted(async () => {
  const data = await $fetch('/api/icerik')
  if (data.belgesel) videoLink.value = data.belgesel
  if (data.siteMetinleri) texts.value = { ...texts.value, ...data.siteMetinleri }
})
</script>

<template>
  <div class="video-page">
    <nav class="top-nav">
      <NuxtLink to="/" class="back-link">{{ texts.goBack }}</NuxtLink>
    </nav>
    <div class="player-wrapper">
      <iframe 
        v-if="videoLink" 
        :src="videoLink" 
        class="video-frame" 
        allowfullscreen="true">
      </iframe>
      <div v-else class="empty-state">{{ texts.emptyVideo }}</div>
    </div>
  </div>
</template>

<style scoped>
.video-page { min-height: 100vh; background: #0a0a0a; display: flex; flex-direction: column; }
.top-nav { padding: 2rem; }
.back-link { text-decoration: none; color: #ffffff; text-transform: uppercase; letter-spacing: 0.1em; }
.player-wrapper { flex: 1; display: flex; justify-content: center; align-items: center; padding: 2rem; }
.video-frame { width: 85vw; height: 80vh; border: none; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
.empty-state { color: #666; text-transform: uppercase; letter-spacing: 0.1em; }
</style>