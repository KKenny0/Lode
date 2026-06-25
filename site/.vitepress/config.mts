import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

export default defineConfig({
  title: 'Lode',
  base: '/Lode/',
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'dark',

  sitemap: {
    hostname: 'https://kkenny0.github.io/Lode/'
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/Lode/mark.svg' }],
    ['meta', { name: 'theme-color', content: '#0B0F14' }]
  ],

  vite: {
    plugins: [llmstxt()]
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      description: 'Git tells you what changed. Lode tells your next coding agent why.',
      themeConfig: {
        nav: [
          { text: 'Showcase', link: '/showcase' },
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
      description: 'Git 记录了改了什么。Lode 让下一个 coding agent 知道为什么。',
      themeConfig: {
        nav: [
          { text: '效果展示', link: '/showcase' },
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
