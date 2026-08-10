<script setup>
// Veritabanından verileri sunucu tarafında (SSR) çekiyoruz ki Google botları görebilsin
const { data } = await useFetch('/api/icerik')

const seoTitle = data.value?.siteMetinleri?.seoTitle || 'FUSION PEOPLE'
const seoDesc = data.value?.siteMetinleri?.seoDescription || ''

useHead({
  title: seoTitle,
  meta: [
    { name: 'description', content: seoDesc }
  ]
})
</script>

<template>
  <NuxtPage />
</template>