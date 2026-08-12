<script setup lang="ts">
const { data, error } = await useFetch<any>('/api/icerik')

const seoTitle = computed(() => data.value?.siteMetinleri?.seoTitle || 'FUSION PEOPLE')
const seoDesc = computed(
  () =>
    data.value?.siteMetinleri?.seoDescription ||
    'FUSION PEOPLE — a cinematic digital magazine exploring digital culture, design and the modern age.'
)

useHead({
  title: seoTitle,
  meta: [{ name: 'description', content: seoDesc }]
})
</script>

<template>
  <NuxtPage />
</template>
