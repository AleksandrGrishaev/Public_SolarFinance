// src/stores/theme.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'
import { useOsTheme } from 'naive-ui'

export const useThemeStore = defineStore('theme', () => {
  // State
  const osThemeRef = useOsTheme()
  const isDark = ref(localStorage.getItem('darkMode') === 'true' || osThemeRef.value === 'dark')
  const theme = ref(isDark.value ? darkTheme : null)
  
  // Light theme overrides
  const lightThemeOverrides: GlobalThemeOverrides = {
    common: {
      primaryColor: '#18a058',
      primaryColorHover: '#36ad6a',
      primaryColorPressed: '#0c7a43',
      primaryColorSuppl: '#36ad6a'
    },
    Card: {
      borderRadius: '10px'
    },
    Button: {
      borderRadiusMedium: '6px'
    }
  }
  
  // Dark theme overrides
  const darkThemeOverrides: GlobalThemeOverrides = {
    common: {
      primaryColor: '#36ad6a',
      primaryColorHover: '#18a058',
      primaryColorPressed: '#0c7a43',
      primaryColorSuppl: '#18a058'
    },
    Card: {
      borderRadius: '10px'
    },
    Button: {
      borderRadiusMedium: '6px'
    }
  }
  
  // Current theme overrides based on mode
  const themeOverrides = ref(isDark.value ? darkThemeOverrides : lightThemeOverrides)
  
  // Actions
  function toggleDarkMode() {
    isDark.value = !isDark.value
    theme.value = isDark.value ? darkTheme : null
    themeOverrides.value = isDark.value ? darkThemeOverrides : lightThemeOverrides
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', isDark.value.toString())
  }
  
  // Initialize from localStorage if available
  function initTheme() {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode !== null) {
      isDark.value = savedDarkMode === 'true'
      theme.value = isDark.value ? darkTheme : null
      themeOverrides.value = isDark.value ? darkThemeOverrides : lightThemeOverrides
    }
  }
  
  // Watch for OS theme changes
  watch(osThemeRef, (newValue) => {
    // Only update if user hasn't set a preference
    if (localStorage.getItem('darkMode') === null) {
      isDark.value = newValue === 'dark'
      theme.value = isDark.value ? darkTheme : null
      themeOverrides.value = isDark.value ? darkThemeOverrides : lightThemeOverrides
    }
  })
  
  return { 
    isDark, 
    theme, 
    themeOverrides, 
    toggleDarkMode, 
    initTheme 
  }
})