/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F1115',
        card: '#171A21',
        foreground: '#F5F7FA',
        muted: '#9CA3AF',
        positive: '#22C55E',
        negative: '#EF4444',
        brand: '#3B82F6',
        gold: '#EAB308',
        border: 'rgba(255, 255, 255, 0.04)',
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
