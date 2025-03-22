// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { availableUsers, hasPermission } from '@/data/UserData'

export interface User {
  id: number
  name: string
  role: string
  pin?: string
  email?: string
  avatar?: string
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const token = ref<string | null>(null)
  const loading = ref(false)
  
  // Пользователи загружаются из отдельного файла
  const users = ref<User[]>(availableUsers)
  
  // Getters
  const userRoleIs = (role: string) => {
    return user.value?.role === role
  }
  
  const isAdmin = () => {
    return userRoleIs('Administrator')
  }
  
  const hasUserPermission = (permission: string) => {
    if (!user.value) return false
    return hasPermission(user.value.role, permission)
  }
  
  // Actions
  function setUser(userData: User) {
    user.value = userData
    isAuthenticated.value = true
    
    // Сохраняем в localStorage
    localStorage.setItem('user_id', userData.id.toString())
    localStorage.setItem('user_data', JSON.stringify(userData))
    
    console.log('User set:', userData.name, 'role:', userData.role)
  }
  
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('auth_token', newToken)
    console.log('Auth token set')
  }
  
  function logout() {
    console.log('Logging out user:', user.value?.name)
    user.value = null
    isAuthenticated.value = false
    token.value = null
    
    // Очищаем localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_data')
    
    console.log('User logged out, session data cleared')
  }
  
  async function validatePin(pin: string): Promise<User | null> {
    console.log('Validating PIN')
    loading.value = true
    
    try {
      // Симуляция API задержки
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Поиск пользователя с соответствующим PIN
      const foundUser = users.value.find(u => u.pin === pin) || null
      
      if (foundUser) {
        console.log('PIN validation successful for:', foundUser.name)
      } else {
        console.log('PIN validation failed: invalid PIN')
      }
      
      return foundUser
    } catch (error) {
      console.error('PIN validation error:', error)
      return null
    } finally {
      loading.value = false
    }
  }
  
  async function getAllUsers(): Promise<User[]> {
    // В реальном приложении это был бы API-вызов
    return users.value
  }
  
  function addUser(newUser: Omit<User, 'id'>) {
    // Генерация нового ID (в реальном приложении это делал бы бэкенд)
    const id = Math.max(0, ...users.value.map(u => u.id)) + 1
    
    // Добавление пользователя
    const userWithId = { ...newUser, id }
    users.value.push(userWithId)
    
    console.log('New user added:', userWithId.name)
    
    return userWithId
  }
  
  function updateUser(id: number, userData: Partial<User>) {
    const userIndex = users.value.findIndex(u => u.id === id)
    if (userIndex !== -1) {
      users.value[userIndex] = { ...users.value[userIndex], ...userData }
      
      // Обновление текущего пользователя, если это тот же
      if (user.value?.id === id) {
        user.value = { ...user.value, ...userData }
        
        // Обновляем данные в localStorage
        localStorage.setItem('user_data', JSON.stringify(user.value))
        console.log('Current user updated in localStorage')
      }
      
      console.log('User updated, id:', id)
      return true
    }
    
    console.log('User update failed: user not found, id:', id)
    return false
  }
  
  function deleteUser(id: number) {
    const initialLength = users.value.length
    users.value = users.value.filter(u => u.id !== id)
    
    const success = users.value.length !== initialLength
    
    if (success) {
      console.log('User deleted, id:', id)
    } else {
      console.log('User deletion failed: user not found, id:', id)
    }
    
    return success
  }
  
  // Инициализация из localStorage
  function init() {
    console.log('Initializing user store from localStorage')
    
    const savedToken = localStorage.getItem('auth_token')
    const savedUserId = localStorage.getItem('user_id')
    const savedUserData = localStorage.getItem('user_data')
    
    if (savedToken && savedUserData) {
      try {
        // Попытка восстановить пользователя из сохраненных данных
        const userData = JSON.parse(savedUserData) as User
        
        if (userData && userData.id && userData.name) {
          token.value = savedToken
          user.value = userData
          isAuthenticated.value = true
          
          console.log('User session restored from localStorage:', userData.name)
          return true
        }
      } catch (error) {
        console.error('Failed to parse user data from localStorage:', error)
      }
    } else if (savedToken && savedUserId) {
      // Запасной вариант: поиск пользователя по ID
      const userId = parseInt(savedUserId)
      const savedUser = users.value.find(u => u.id === userId)
      
      if (savedUser) {
        token.value = savedToken
        user.value = savedUser
        isAuthenticated.value = true
        
        // Сохраняем более полные данные для следующего входа
        localStorage.setItem('user_data', JSON.stringify(savedUser))
        console.log('User session restored from ID:', savedUser.name)
        return true
      }
    }
    
    // Очистка недействительного хранилища
    if (savedToken || savedUserId) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_data')
      console.log('Invalid session data cleared from localStorage')
    } else {
      console.log('No session data found in localStorage')
    }
    
    return false
  }
  
  return {
    // State
    user,
    isAuthenticated,
    token,
    loading,
    users,
    
    // Getters
    userRoleIs,
    isAdmin,
    hasUserPermission,
    
    // Actions
    setUser,
    setToken,
    logout,
    validatePin,
    getAllUsers,
    addUser,
    updateUser,
    deleteUser,
    init
  }
})