// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { appInitService } from './services/system/AppInitService'
import { messageService } from './services/system/MessageService'
import './styles/main.scss';

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

// Добавьте это в main.ts после монтирования приложения

// Простой тест для проверки видимости тем
setTimeout(() => {
  console.log('[ThemeTest] Текущие классы на documentElement:', document.documentElement.className);
  
  const computedStyle = getComputedStyle(document.documentElement);
  
  // Проверяем несколько ключевых CSS переменных из светлой и темной тем
  console.log('[ThemeTest] CSS переменные:');
  console.log('  --text-header:', computedStyle.getPropertyValue('--text-header'));
  console.log('  --text-usual:', computedStyle.getPropertyValue('--text-usual'));
  console.log('  --bg-screen:', computedStyle.getPropertyValue('--bg-screen'));
  console.log('  --color-primary:', computedStyle.getPropertyValue('--color-primary'));
  
  // Изменяем тему напрямую и смотрим на изменения
  const currentTheme = document.documentElement.classList.contains('dark-theme') ? 'dark' : 'light';
  console.log('[ThemeTest] Текущая тема:', currentTheme);
  
  // Переключаем тему
  document.documentElement.classList.remove('dark-theme', 'light-theme');
  document.documentElement.classList.add(currentTheme === 'dark' ? 'light-theme' : 'dark-theme');
  
  console.log('[ThemeTest] Тема изменена на:', currentTheme === 'dark' ? 'light' : 'dark');
  console.log('[ThemeTest] Новые классы:', document.documentElement.className);
  
  // Проверяем переменные после изменения
  setTimeout(() => {
    const newComputedStyle = getComputedStyle(document.documentElement);
    console.log('[ThemeTest] Новые CSS переменные:');
    console.log('  --text-header:', newComputedStyle.getPropertyValue('--text-header'));
    console.log('  --text-usual:', newComputedStyle.getPropertyValue('--text-usual'));
    console.log('  --bg-screen:', newComputedStyle.getPropertyValue('--bg-screen'));
    console.log('  --color-primary:', newComputedStyle.getPropertyValue('--color-primary'));
    
    // Возвращаем тему назад
    document.documentElement.classList.remove('dark-theme', 'light-theme');
    document.documentElement.classList.add(currentTheme === 'dark' ? 'dark-theme' : 'light-theme');
  }, 500);
}, 2000);

// Запускаем инициализацию приложения после монтирования
appInitService.initializeApp().catch(error => {
  console.error('Failed to initialize application:', error)
  
  if (messageService.hasProvider) {
    messageService.error('Ошибка инициализации приложения')
  }
})