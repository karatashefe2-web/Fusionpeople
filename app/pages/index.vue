<script setup lang="ts">
const { texts, backgroundVideo, landscapeImage } = useSiteContent()
</script>

<template>
  <div class="home">
    <!-- Sinematik arka plan: saf HTML5 video, hata durumunda görsel -->
    <BackgroundVideo
      :src="backgroundVideo || '/bg.mp4'"
      :fallback-image="landscapeImage || ''"
      :poster="landscapeImage || ''"
      overlay
    />

    <div class="container">
      <header class="top-bar">
        <div class="top-bar__logo">{{ texts.siteTitle }}</div>
        <div class="top-bar__meta">
          <span class="eyebrow">{{ texts.issueDate }}</span>
        </div>
      </header>

      <main class="hero-grid">
        <section class="hero-copy">
          <h1 class="display-title hero-copy__headline" v-html="texts.mainHeadline"></h1>
        </section>

        <section class="hero-side">
          <div class="hero-side__note">
            <h2 class="eyebrow hero-side__note-title">{{ texts.editorTitle }}</h2>
            <p>{{ texts.editorText }}</p>
          </div>

          <nav class="hero-side__actions" aria-label="Primary">
            <NuxtLink to="/dergi" class="btn">
              <span>{{ texts.btnMagazine }}</span>
              <span class="btn-arrow">→</span>
            </NuxtLink>
            <NuxtLink to="/belgesel" class="btn">
              <span>{{ texts.btnVideo }}</span>
              <span class="btn-arrow">→</span>
            </NuxtLink>
          </nav>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  color: var(--color-ink);
  position: relative;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-line);
}
.top-bar__logo {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.hero-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: var(--space-lg);
  align-items: center;
  padding: var(--space-xl) 0 var(--space-lg);
}

.hero-copy__headline {
  font-size: clamp(3.5rem, 8vw, 8.5rem);
  text-shadow: 0 4px 60px rgba(0, 0, 0, 0.6);
}

.hero-side {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding-left: var(--space-md);
  border-left: 1px solid var(--color-line);
}
.hero-side__note-title {
  margin-bottom: var(--space-sm);
  border-bottom: 2px solid var(--color-ink);
  display: inline-block;
  padding-bottom: 2px;
}
.hero-side__note p {
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--color-muted);
}
.hero-side__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

@media (max-width: 768px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
    align-items: start;
    padding: var(--space-lg) 0 var(--space-md);
  }
  .hero-side {
    padding-left: 0;
    border-left: none;
  }
}
</style>
