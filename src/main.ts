// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

//Store
import { useCurrencyStore } from './stores/currency';


// Типы для глобального message provider
declare global {
  interface Window {
    $message: any
  }
}

// Создание экземпляра приложения
const app = createApp(App)

// Инициализация Pinia
const pinia = createPinia()
app.use(pinia)

// Инициализация роутера
app.use(router)

// Инициализация хранилища валют
const currencyStore = useCurrencyStore();
currencyStore.init().catch(error => {
  console.error('Failed to initialize currency store:', error);
});


// Глобальный обработчик ошибок
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
}

// Монтирование приложения
app.mount('#app')