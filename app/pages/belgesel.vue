<script setup lang="ts">
const { texts, belgeselLink } = useSiteContent()

const extractYouTubeId = (url: string) => {
  if (!url) return null
  const match = url.match(
    /(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([\w-]{11})/
  )
  return match ? match[1] : null
}

const extractDriveId = (url: string) => {
  if (!url) return null
  const match = url.match(/[-\w]{25,}/)
  return match ? match[0] : null
}

const ytId = computed(() => extractYouTubeId(belgeselLink.value))
const driveId = computed(() => (!ytId.value ? extractDriveId(belgeselLink.value) : null))

// YouTube watch/youtu.be linklerini embed URL'sine çevirir.
const embedUrl = computed(() => {
  if (ytId.value) {
    return `https://www.youtube.com/embed/${ytId.value}?rel=0&modestbranding=1`
  }
  if (driveId.value) {
    return `https://drive.google.com/file/d/${driveId.value}/preview`
  }
  return belgeselLink.value
})

const isDirectFile = computed(() => {
  const url = belgeselLink.value
  if (!url) return false
  return !ytId.value && !driveId.value
})
</script>

<template>
  <div class="video-page">
    <nav class="top-nav">
      <NuxtLink to="/" class="back-link">{{ texts.goBack }}</NuxtLink>
    </nav>

    <main class="player-wrap">
      <template v-if="belgeselLink">
        <iframe
          v-if="embedUrl && !isDirectFile"
          :src="embedUrl"
          class="video-frame"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          frameborder="0"
          allowfullscreen
          title="Documentary film"
        ></iframe>
        <video v-else-if="isDirectFile" :src="belgeselLink" class="video-frame" controls playsinline :title="''"></video>
      </template>
      <div v-else class="empty-state">
        <p>{{ texts.emptyVideo }}</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.video-page {
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
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.9) 0%, transparent 100%);
  pointer-events: none;
}

.back-link {
  pointer-events: auto;
  display: inline-flex;
  text-decoration: none;
  color: #fff;
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

.player-wrap {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
}

.video-frame {
  width: 85vw;
  max-width: 1600px;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: #000;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.9);
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
  border: 1px dashed rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 500;
}

@media (max-width: 768px) {
  .video-frame {
    width: 100vw;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
  .top-nav {
    padding: 1.5rem;
  }
}
</style>
