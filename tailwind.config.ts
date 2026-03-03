import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        consola: ['Consolas', 'monospace'],
        roboto: ['Roboto', 'sans-serif']
      },
      colors: {
        neon: '#00ffff',
        cyberpink: '#ff00ff',
        darkbg: '#0f0f1a'
      }
    }
  },
  plugins: [],
} satisfies Config