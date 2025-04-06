// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Объявление типов для глобального message provider
declare global {
  interface Window {
    $message: any
  }
}

// Простое логирование
console.log('Application starting');

// Create app instance
const app = createApp(App)

// Install plugins
const pinia = createPinia()
app.use(pinia)
console.log('Pinia installed');

app.use(router)
console.log('Router installed');
console.log('Available routes:', router.getRoutes().map(route => route.path));

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
}

// Mount the app
app.mount('#app')
console.log('App mounted to DOM');