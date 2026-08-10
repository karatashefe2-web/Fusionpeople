<script setup>
import { ref, onMounted } from 'vue'

const heroImage = ref('https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=2000&auto=format&fit=crop')

onMounted(async () => {
  const data = await $fetch('/api/icerik')
  if (data.landing) heroImage.value = data.landing
})
</script>

<template>
  <div class="editorial-layout">
    <header class="top-bar">
      <div class="logo">FUSION PEOPLE</div>
      <div class="date-issue">ISSUE 01 &mdash; 2026</div>
    </header>

    <main class="grid-container">
      <section class="hero-section">
        <h1 class="headline">DIGITAL<br>CULTURE.</h1>
        <div class="image-wrapper">
          <img :src="heroImage" alt="Hero" class="main-image" />
        </div>
      </section>

      <section class="side-content">
        <div class="editorial-note">
          <h3>EDITOR'S NOTE</h3>
          <p>In the chaos of the modern age, we rediscover the power of simplicity. Aesthetics and functionality combined.</p>
        </div>
        
        <div class="action-links">
          <NuxtLink to="/dergi" class="ed-btn">READ ISSUE <span>→</span></NuxtLink>
          <NuxtLink to="/belgesel" class="ed-btn">WATCH <span>→</span></NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.editorial-layout { min-height: 100vh; background-color: #f4f4f0; color: #111; padding: 2rem; display: flex; flex-direction: column; }
.top-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #111; padding-bottom: 1rem; margin-bottom: 3rem; }
.logo { font-size: 1.2rem; font-weight: 800; letter-spacing: -0.02em; }
.date-issue { font-size: 0.85rem; text-transform: uppercase; font-weight: 600; }
.grid-container { display: grid; grid-template-columns: 2fr 1fr; gap: 4rem; flex: 1; }
.headline { font-size: clamp(4rem, 8vw, 8rem); line-height: 0.9; letter-spacing: -0.04em; margin: 0 0 2rem 0; }
.image-wrapper { width: 100%; height: 60vh; overflow: hidden; }
.main-image { width: 100%; height: 100%; object-fit: cover; filter: grayscale(20%) contrast(1.1); }
.side-content { display: flex; flex-direction: column; justify-content: space-between; border-left: 1px solid #dcdcd8; padding-left: 4rem; }
.editorial-note h3 { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; border-bottom: 1px solid #111; display: inline-block; }
.editorial-note p { font-size: 1.4rem; line-height: 1.4; font-weight: 400; }
.action-links { display: flex; flex-direction: column; gap: 1rem; }
.ed-btn { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: #111; color: #fff; text-decoration: none; font-weight: 600; text-transform: uppercase; transition: background 0.3s; }
.ed-btn:hover { background: #333; }
</style>