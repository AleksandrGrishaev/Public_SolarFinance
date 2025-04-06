import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Состояние
  const isDark = ref(true) // По умолчанию используем темную тему
  const themeName = ref('dark') // 'dark' или 'light'
  
  // Действия
  const toggleTheme = () => {
    isDark.value = !isDark.value
    themeName.value = isDark.value ? 'dark' : 'light'
    applyTheme()
  }
  
  const setDarkTheme = () => {
    isDark.value = true
    themeName.value = 'dark'
    applyTheme()
  }
  
  const setLightTheme = () => {
    isDark.value = false
    themeName.value = 'light'
    applyTheme()
  }
  
  // Вспомогательная функция для применения темы
  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark-theme')
    } else {
      document.documentElement.classList.remove('dark-theme')
    }
  }
  
  // Инициализация темы
  const initTheme = () => {
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
    initTheme
  }
})