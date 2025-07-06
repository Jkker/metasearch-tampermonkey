// vite.config.js
import monkey from 'vite-plugin-monkey'
import { defineConfig } from 'vitest/config'

import { config } from './src/config.ts'

const match = config.engines
  .filter((e) => !e.disabled)
  .map((engine) => {
    const { hostname, pathname } = new URL(engine.url)
    const domain = hostname.split('.').slice(-2).join('.')

    return [`*://${domain}${pathname}*`, `*://*.${domain}${pathname}*`]
    // return [`*//${hostname}${pathname}*`, `*//${hostname}${pathname}`]
  })
  .flat()

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      build: {
        fileName: 'metasearch.user.js',
      },
      userscript: {
        match,
        // match: ['*://*/*'],
        icon: 'https://raw.githubusercontent.com/Jkker/metasearch-tampermonkey/main/favicon.ico',
        namespace: 'https://github.com/Jkker/metasearch-tampermonkey',
        updateURL: 'https://github.com/Jkker/metasearch-tampermonkey/blob/main/dist/metasearch.user.js',
        downloadURL: 'https://github.com/Jkker/metasearch-tampermonkey/blob/main/dist/metasearch.user.js',
        supportURL: 'https://github.com/Jkker/metasearch-tampermonkey/issues',
      },
    }),
  ],
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      // https://vitest.dev/guide/browser/playwright
      instances: [{ browser: 'chromium' }],
    },
  },
})
