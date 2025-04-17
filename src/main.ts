// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { appInitService } from './services/system/AppInitService'
import { messageService } from './services/system/MessageService'

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

// Глобальный обработчик ошибок
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
  // Оповещаем пользователя об ошибке через messageService, если он доступен
  if (messageService.hasProvider) {
    messageService.error('Произошла ошибка в приложении. Пожалуйста, обновите страницу.')
  }
}

// Монтируем приложение
app.mount('#app')

// Запускаем инициализацию приложения после монтирования
appInitService.initializeApp().catch(error => {
  console.error('Failed to initialize application:', error)
  if (messageService.hasProvider) {
    messageService.error('Ошибка инициализации приложения')
  }
})