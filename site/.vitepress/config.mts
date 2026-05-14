import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

export default defineConfig({
  title: 'Lode',
  description: "Agentic coding's persistent memory — capture the why, then compound it into reports, reviews, and decision roadmaps.",
  lang: 'en-US',
  base: '/Lode/',
  cleanUrls: true,
  lastUpdated: true,

  sitemap: {
    hostname: 'https://kkenny0.github.io/Lode/'
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/Lode/mark.svg' }],
    ['meta', { name: 'theme-color', content: '#25636A' }]
  ],

  vite: {
    plugins: [llmstxt()]
  },

  themeConfig: {
    logo: '/mark.svg',

    nav: [
      { text: 'Skills', link: '/skills' },
      { text: 'Workflow', link: '/workflow' },
      { text: 'Quick Start', link: '/quick-start' },
      { text: 'GitHub', link: 'https://github.com/KKenny0/Lode' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/KKenny0/Lode' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2025 Kennywu'
    }
  }
})
