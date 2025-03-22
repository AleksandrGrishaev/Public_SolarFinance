// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Create app instance
const app = createApp(App)

// Install plugins
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error: ', err)
  console.error('Error info: ', info)
}

// Mount the app
app.mount('#app')

// Create a global message function for use outside of components
// Needed for router navigation guards
declare global {
  interface Window {
    $message: any
  }
}