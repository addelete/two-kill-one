import { createApp } from 'vue'
import VueKonva from 'vue-konva';
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(VueKonva);
app.mount('#app')
