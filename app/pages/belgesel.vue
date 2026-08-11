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
  <div class="cinematic-video-page">
    <nav class="top-nav">
      <NuxtLink to="/" class="back-link">{{ texts.goBack }}</NuxtLink>
    </nav>
    
    <main class="player-container">
      <div v-if="videoLink" class="video-wrapper">
        <iframe 
          :src="videoLink" 
          class="video-frame" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          frameborder="0"
          allowfullscreen>
        </iframe>
      </div>
      <div v-else class="empty-state">
        <p>{{ texts.emptyVideo }}</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.cinematic-video-page {
  min-height: 100vh;
  background-color: #050505;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
}

.top-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2.5rem 3rem;
  z-index: 10;
  background: linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%);
  pointer-events: none;
}

.back-link {
  pointer-events: auto;
  display: inline-flex;
  text-decoration: none;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.back-link:hover {
  opacity: 1;
  transform: translateX(-5px);
}

.player-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0; 
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
}

.video-wrapper {
  position: relative;
  width: 85vw;
  max-width: 1600px;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0,0,0,0.9), 0 0 40px rgba(255,255,255,0.03);
  background: #000;
  border: 1px solid rgba(255,255,255,0.05);
}

.video-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 85vw;
  max-width: 1000px;
  aspect-ratio: 16 / 9;
  background: #0a0a0a;
  border-radius: 16px;
  border: 1px dashed rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 500;
}

@media (max-width: 768px) {
  .video-wrapper {
    width: 100vw;
    border-radius: 0;
    border: none;
  }
  .top-nav {
    padding: 1.5rem;
  }
}
</style>
