import { createApp } from 'vue'
import '@mdi/font/css/materialdesignicons.css'
import './assets/stylesheets/main.scss'
import App from './App.vue'
import { router } from './router'   
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary:   '#04CFD6',
          'on-primary':'#ffffff', 
          secondary: '#FCEB78',
          gray: '#484848'
        }
      }
    }
  }
})

createApp(App)
  .use(router)
  .use(vuetify)
  .mount('#app')
