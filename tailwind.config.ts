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
        background: '#F7F7F5',
        foreground: '#0D0D0D',
        secondary: '#6B7280',
        accent: '#1A1A1A',
        border: '#E5E3DE',
        'path-strong': '#059669',
        'path-good': '#2563EB',
        'path-possible': '#D97706',
        'path-weak': '#9CA3AF',
        'path-none': '#DC2626',
        'path-needsdata': '#7C3AED',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
