/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F6F7FB',
        card: '#FFFFFF',
        foreground: '#0F172A',
        muted: '#64748B',
        positive: '#22C55E',
        negative: '#EF4444',
        brand: '#3B82F6',
        gold: '#EAB308',
        border: 'rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl: '16px',
        lg: '12px',
        md: '8px',
        sm: '4px'
      },
    },
  },
  plugins: [],
}
