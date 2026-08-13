// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'FUSION PEOPLE — Digital Culture Magazine',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0a0a0a' },
        {
          name: 'description',
          content:
            'FUSION PEOPLE — a cinematic digital magazine exploring digital culture, design and the modern age.'
        },
        { property: 'og:title', content: 'FUSION PEOPLE — Digital Culture Magazine' },
        {
          property: 'og:description',
          content: 'A cinematic digital magazine exploring digital culture, design and the modern age.'
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'FUSION PEOPLE' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Inter:wght@400;500;600;700&display=swap'
        }
      ]
    }
  }
})
