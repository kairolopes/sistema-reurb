/** @type {import('tailwindcss').Config} */
module.exports = {
  // ESSA PARTE É A MAIS IMPORTANTE! 
  // Ela diz ao Tailwind onde procurar as classes que você usou.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Inclui todos os arquivos .jsx na pasta src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
