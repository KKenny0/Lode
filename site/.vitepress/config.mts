import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

export default defineConfig({
  title: 'Lode',
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

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      description: "Agentic coding's persistent memory — capture the why, then compound it into reports, reviews, and decision roadmaps.",
      themeConfig: {
        nav: [
          { text: 'Skills', link: '/skills' },
          { text: 'Workflow', link: '/workflow' },
          { text: 'Quick Start', link: '/quick-start' },
          { text: 'GitHub', link: 'https://github.com/KKenny0/Lode' }
        ],
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright 2025 Kennywu'
        }
      }
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      description: 'Agentic coding 的持久记忆 — 记录为什么，然后将其积累为报告、回顾和决策路线图。',
      themeConfig: {
        nav: [
          { text: '技能', link: '/zh/skills' },
          { text: '工作流', link: '/zh/workflow' },
          { text: '快速开始', link: '/zh/quick-start' },
          { text: 'GitHub', link: 'https://github.com/KKenny0/Lode' }
        ],
        footer: {
          message: '基于 MIT 许可发布。',
          copyright: 'Copyright 2025 Kennywu'
        }
      }
    }
  },

  themeConfig: {
    logo: '/mark.svg',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/KKenny0/Lode' }
    ]
  }
})
