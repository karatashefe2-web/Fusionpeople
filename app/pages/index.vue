<script setup>
</script>


<template>
  <div class="landing-page">
    <header class="header">
      <div class="logo">PAGERIE</div>
    </header>
    
    <section class="hero">
      <div class="hero-image-container">
        <!-- Hatayı çözen kısım: Gerçek bir web görseli linki verdik -->
        <img src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=2000&auto=format&fit=crop" alt="Hero Image" class="hero-image" />
        <h1 class="hero-title">PAGERIE</h1>
      </div>
    </section>

    <section class="action-buttons">
      <NuxtLink to="/dergi" class="btn-outline">Dergiyi Keşfet</NuxtLink>
      <NuxtLink to="/belgesel" class="btn-outline">Belgeseli İzle</NuxtLink>
    </section>
  </div>
</template>

<style scoped>
.header {
  padding: 2rem;
  text-align: center;
}
.logo {
  font-size: 1.5rem;
  letter-spacing: 0.2em;
}
.hero {
  position: relative;
  width: 100%;
  height: 80vh; 
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.hero-image-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover; 
}
.hero-title {
  position: absolute;
  font-size: 5rem;
  color: white;
  letter-spacing: 0.3em;
  font-weight: 300;
  margin: 0;
}
.action-buttons {
  display: flex;
  gap: 2rem;
  justify-content: center;
  padding: 4rem 0;
}
.btn-outline {
  padding: 1rem 2rem;
  border: 1px solid var(--text-color);
  background: transparent;
  color: var(--text-color);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.3s ease;
}
.btn-outline:hover {
  background-color: var(--text-color);
  color: white;
}
</style>