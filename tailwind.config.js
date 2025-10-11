export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        terracota: '#D8AFA0',
        rosa: '#EAD5D3',
        fondo: '#F9F7F3',
        cafe: '#5D4A44'
      },
      fontFamily: {
        serif: ['Lora', 'serif'],
        body: ['Lato', 'sans-serif']
      }
    }
  },
  plugins: []
}
