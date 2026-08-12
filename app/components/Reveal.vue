<script setup lang="ts">
// Scroll ile görünüme girince yumuşak yukarı animasyonu tetikler.
const el = ref<HTMLElement | null>(null)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15 }
  )
  if (el.value) observer.observe(el.value)
})
</script>

<template>
  <div ref="el" class="reveal">
    <slot />
  </div>
</template>
