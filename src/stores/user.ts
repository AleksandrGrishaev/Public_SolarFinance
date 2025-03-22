// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

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
  
  // Available users (in a real app, this would be fetched from API)
  const users = ref<User[]>([
    { id: 1, name: 'Admin User', role: 'Administrator', pin: '1234', email: 'admin@example.com' },
    { id: 2, name: 'Test User', role: 'User', pin: '5678', email: 'user@example.com' },
    { id: 3, name: 'John Doe', role: 'Operator', pin: '9999', email: 'john@example.com' },
  ])
  
  // Getters
  const userRoleIs = (role: string) => {
    return user.value?.role === role
  }
  
  const isAdmin = () => {
    return userRoleIs('Administrator')
  }
  
  // Actions
  function setUser(userData: User) {
    user.value = userData
    isAuthenticated.value = true
  }
  
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('auth_token', newToken)
  }
  
  function logout() {
    user.value = null
    isAuthenticated.value = false
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_id')
  }
  
  async function validatePin(pin: string): Promise<User | null> {
    loading.value = true
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Find user with matching PIN
      const foundUser = users.value.find(u => u.pin === pin) || null
      return foundUser
    } catch (error) {
      console.error('PIN validation error:', error)
      return null
    } finally {
      loading.value = false
    }
  }
  
  async function getAllUsers(): Promise<User[]> {
    // In a real app, this would be an API call
    return users.value
  }
  
  function addUser(newUser: Omit<User, 'id'>) {
    // Generate a new ID (in a real app, this would be done by the backend)
    const id = Math.max(0, ...users.value.map(u => u.id)) + 1
    
    // Add the user
    const userWithId = { ...newUser, id }
    users.value.push(userWithId)
    
    return userWithId
  }
  
  function updateUser(id: number, userData: Partial<User>) {
    const userIndex = users.value.findIndex(u => u.id === id)
    if (userIndex !== -1) {
      users.value[userIndex] = { ...users.value[userIndex], ...userData }
      
      // Update current user if it's the same
      if (user.value?.id === id) {
        user.value = { ...user.value, ...userData }
      }
      
      return true
    }
    return false
  }
  
  function deleteUser(id: number) {
    const initialLength = users.value.length
    users.value = users.value.filter(u => u.id !== id)
    
    return users.value.length !== initialLength
  }
  
  // Initialize from localStorage if available
  function init() {
    const savedToken = localStorage.getItem('auth_token')
    const savedUserId = localStorage.getItem('user_id')
    
    if (savedToken && savedUserId) {
      const userId = parseInt(savedUserId)
      const savedUser = users.value.find(u => u.id === userId)
      
      if (savedUser) {
        token.value = savedToken
        user.value = savedUser
        isAuthenticated.value = true
      } else {
        // Clear invalid storage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_id')
      }
    }
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