/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms' // 1. Importuj plugin takto

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        status: {
          pending: '#fbbf24',    // amber
          preparing: '#3b82f6',  // blue
          ready: '#10b981',      // emerald
        }
      },
      fontSize: {
        'btn': '1.125rem',
      },
      padding: {
        'btn': ['1rem', '1.5rem'],
      }
    },
  },
  plugins: [
    forms, // 2. Použij importovanou proměnnou místo require
  ],
}