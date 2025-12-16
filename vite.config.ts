// vite.config.js
import monkey from 'vite-plugin-monkey'
import { defineConfig } from 'vite'

import { config } from './src/config.ts'

const match = config.engines
  .filter((e) => !e.disabled)
  .flatMap((engine) => {
    const { hostname, pathname } = new URL(engine.url)
    const domain = hostname.split('.').slice(-2).join('.')

    return [`*://${domain}${pathname}*`, `*://*.${domain}${pathname}*`]
  })

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      build: {
        fileName: 'metasearch.user.js',
      },
      userscript: {
        name: 'metasearch',
        match: [...new Set(match)],
        icon: 'https://raw.githubusercontent.com/Jkker/metasearch-tampermonkey/main/favicon.ico',
        namespace: 'https://github.com/Jkker/metasearch-tampermonkey',
        updateURL:
          'https://github.com/Jkker/metasearch-tampermonkey/blob/main/dist/metasearch.user.js',
        downloadURL:
          'https://github.com/Jkker/metasearch-tampermonkey/blob/main/dist/metasearch.user.js',
        supportURL: 'https://github.com/Jkker/metasearch-tampermonkey/issues',
      },
    }),
  ],
  build: {
    target: 'baseline-widely-available',
  },
})
