/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'bg-gradient-to-r',
    'from-emerald-500','via-emerald-600','to-green-600',
    'from-violet-500','via-violet-600','to-purple-500',
    'from-red-600','via-red-500','to-red-400',
    'shadow-emerald-300','shadow-violet-400','shadow-red-300',
    'bg-emerald-500','bg-violet-500','bg-red-500','bg-blue-500','bg-rose-600','bg-violet-600'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}; 