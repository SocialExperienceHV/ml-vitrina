import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ml: {
          yellow: '#FFE600',
          'yellow-dark': '#F0D800',
          blue: '#3483FA',
          'blue-dark': '#2968C8',
          dark: '#1A1A2E',
          gray: '#F5F5F5',
        },
      },
    },
  },
  plugins: [],
}
export default config
