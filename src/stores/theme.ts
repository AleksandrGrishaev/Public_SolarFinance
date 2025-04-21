// src/stores/theme.ts 
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from '../stores/user'

export const useThemeStore = defineStore('theme', () => {
  // Состояние
  const isDark = ref(true) // По умолчанию используем темную тему
  const themeName = ref('dark') // 'dark' или 'light'
  
  // Действия
  const toggleTheme = () => {
    isDark.value = !isDark.value
    themeName.value = isDark.value ? 'dark' : 'light'
    applyTheme()
    saveThemeToUserSettings()
  }
  
  const setDarkTheme = () => {
    isDark.value = true
    themeName.value = 'dark'
    applyTheme()
    saveThemeToUserSettings()
  }
  
  const setLightTheme = () => {
    isDark.value = false
    themeName.value = 'light'
    applyTheme()
    saveThemeToUserSettings()
  }
  
  // Сохранение темы в настройках пользователя
  const saveThemeToUserSettings = () => {
    // Сохраняем в localStorage
    localStorage.setItem('theme', themeName.value)
    
    // Если пользователь авторизован, сохраняем в его профиле
    const userStore = useUserStore()
    if (userStore.isAuthenticated && userStore.currentUser) {
      userStore.updateUserSettings({
        theme: themeName.value as 'light' | 'dark' | 'system'
      })
    }
  }
  
  // Вспомогательная функция для применения темы
  const applyTheme = () => {
    // Удаляем все классы тем
    document.documentElement.classList.remove('dark-theme', 'light-theme')
    
    // Применяем нужный класс
    if (isDark.value) {
      document.documentElement.classList.add('dark-theme')
    } else {
      document.documentElement.classList.add('light-theme')
    }
  }
  
  // Инициализация темы
  const initTheme = () => {
    // Сначала проверяем настройки авторизованного пользователя
    const userStore = useUserStore()
    if (userStore.isAuthenticated && userStore.userSettings?.theme) {
      const userTheme = userStore.userSettings.theme
      if (userTheme !== 'system') {
        isDark.value = userTheme === 'dark'
        themeName.value = userTheme
        applyTheme()
        return
      }
    }
    
    // Проверяем сохраненную тему в localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
      themeName.value = savedTheme
    } else {
      // Если нет сохраненной темы, проверяем предпочтения системы
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = prefersDark
      themeName.value = prefersDark ? 'dark' : 'light'
    }
    applyTheme()
  }
  
  return {
    isDark,
    themeName,
    toggleTheme,
    setDarkTheme,
    setLightTheme,
    initTheme,
    applyTheme  // Добавили applyTheme в возвращаемый объект, чтобы сделать его публичным
  }
})