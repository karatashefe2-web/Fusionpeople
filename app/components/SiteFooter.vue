<script setup lang="ts">
defineProps<{
  siteTitle?: string
  issueDate?: string
}>()
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <div class="site-footer__inner">
        <div class="site-footer__brand">
          <span class="eyebrow">{{ siteTitle || 'FUSION PEOPLE' }}</span>
        </div>
        <div class="site-footer__meta">
          <span class="eyebrow">{{ issueDate || 'ISSUE 01 — 2026' }}</span>
          <span class="eyebrow">© {{ new Date().getFullYear() }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--color-line);
  padding: var(--space-md) 0;
  margin-top: auto;
  background: rgba(0, 0, 0, 0.4);
}
.site-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}
.site-footer__meta {
  display: flex;
  gap: var(--space-md);
}
</style>
