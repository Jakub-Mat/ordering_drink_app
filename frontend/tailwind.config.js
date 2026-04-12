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
        'brand-black': '#0A0908',
        'brand-slate': '#19647E',
        'brand-blue': '#51BBFE',
        'brand-ghost': '#FFFAFF',
        'brand-red': '#FF4757',
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