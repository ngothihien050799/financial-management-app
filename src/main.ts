import { createApp } from 'vue'
import App from './App.vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1F3A93',        // Deep Blue - Sang trọng
          secondary: '#06D6A0',      // Teal Green - Tươi mới
          accent: '#FFB84D',         // Gold - Nổi bật
          background: '#FAFBFC',     // Soft White
          surface: '#FFFFFF',        // Pure White
          error: '#E53935',          // Red
          warning: '#FB8500',        // Orange
          info: '#00A6D6',           // Cyan
          success: '#06D6A0'         // Teal
        }
      }
    }
  }
})

const app = createApp(App)

app.use(vuetify)
app.mount('#app')
