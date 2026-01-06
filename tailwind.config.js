module.exports = {
  // DİKKAT: Buradaki yolların senin klasör yapınla birebir tutması lazım.
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"  // <-- src altındaki her şeyi kapsa
  ],
  theme: {
    extend: {
      colors: {
        background: { dark: '#100c14' },
        primary: { DEFAULT: '#7e12e2' },
      },
      fontFamily: {
        serif: ['serif'], // Şimdilik sistem fontu
        sans: ['sans-serif'],
      },
    },
  },
  plugins: [],
}