<!-- src/views/PinLoginView.vue -->
<template>
    <div class="pin-login-container">
      <n-card class="pin-login-card">
        <div class="pin-login-header">
          <n-icon size="48" class="logo-icon">
            <icon-app-window-filled />
          </n-icon>
          <h1 class="pin-login-title">Console Login</h1>
        </div>
        
        <div class="pin-login-content">
          <p class="pin-login-instruction">Enter your 4-digit PIN code</p>
          
          <!-- PIN Input Display -->
          <div class="pin-display">
            <div
              v-for="(digit, index) in 4"
              :key="index"
              class="pin-digit"
              :class="{ 'pin-digit-filled': pinCode.length > index }"
            />
          </div>
          
          <!-- Error Message -->
          <n-text type="error" v-if="errorMessage">
            {{ errorMessage }}
          </n-text>
          
          <!-- PIN Keypad -->
          <div class="pin-keypad">
            <div class="pin-keypad-row" v-for="row in keypadRows" :key="row.join('')">
              <n-button
                class="pin-key"
                v-for="number in row"
                :key="number"
                circle
                size="large"
                :disabled="loading"
                :quaternary="number !== 'backspace'"
                @click="handleKeyPress(number)"
              >
                <template v-if="number !== 'backspace'">{{ number }}</template>
                <template v-else>
                  <n-icon>
                    <icon-backspace />
                  </n-icon>
                </template>
              </n-button>
            </div>
          </div>
        </div>
        
        <!-- Loading state and forgot PIN option -->
        <div class="pin-login-footer">
          <n-spin size="small" v-if="loading" />
          <n-button text size="small" @click="handleForgotPin" :disabled="loading">
            Forgot PIN?
          </n-button>
        </div>
      </n-card>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { 
    NCard, 
    NButton, 
    NIcon, 
    NSpin, 
    NText,
    useMessage
  } from 'naive-ui';
  import { 
    IconAppWindowFilled,
    IconBackspace 
  } from '@tabler/icons-vue';
  import { useUserStore } from '@/stores/user';
  
  // Router and route
  const router = useRouter();
  const route = useRoute();
  const redirectPath = (route.query.redirect as string) || '/dashboard';
  
  // User store
  const userStore = useUserStore();
  
  // Message provider
  const message = useMessage();
  
  // PIN code state
  const pinCode = ref('');
  const maxLength = 4;
  const loading = ref(false);
  const errorMessage = ref('');
  
  // Create keypad layout
  const keypadRows = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ['', 0, 'backspace']
  ];
  
  // Handle keypad button press
  const handleKeyPress = (value: number | string) => {
    if (loading.value) return;
    
    // Clear any previous error
    errorMessage.value = '';
    
    if (value === 'backspace') {
      // Remove last digit
      if (pinCode.value.length > 0) {
        pinCode.value = pinCode.value.slice(0, -1);
      }
    } else if (typeof value === 'number') {
      // Add digit if not at max length
      if (pinCode.value.length < maxLength) {
        pinCode.value += value.toString();
        
        // Auto-submit when pin code is complete
        if (pinCode.value.length === maxLength) {
          validatePin();
        }
      }
    }
  };
  
  // Validate PIN code
  const validatePin = async () => {
    try {
      loading.value = true;
      
      // Simulate API validation delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check against valid PINs (in real app, this would be an API call)
      const validPins = {
        '1234': { id: 1, name: 'Admin User', role: 'Administrator' },
        '5678': { id: 2, name: 'Test User', role: 'User' }
      };
      
      if (pinCode.value in validPins) {
        // PIN is valid
        const userData = validPins[pinCode.value as keyof typeof validPins];
        
        // Set user in store
        userStore.setUser({
          id: userData.id,
          name: userData.name,
          role: userData.role,
          pin: pinCode.value
        });
        
        // Set authentication token
        userStore.setToken(`token-${userData.id}-${Date.now()}`);
        
        // Show success message
        message.success('Login successful');
        
        // Redirect to dashboard or requested page
        router.push(redirectPath);
      } else {
        // PIN is invalid
        errorMessage.value = 'Invalid PIN code. Please try again.';
        pinCode.value = '';
      }
    } catch (error) {
      console.error('PIN validation error:', error);
      errorMessage.value = 'An error occurred. Please try again.';
      pinCode.value = '';
    } finally {
      loading.value = false;
    }
  };
  
  // Handle forgot PIN
  const handleForgotPin = () => {
    message.info('Please contact your administrator to reset your PIN.');
  };
  </script>
  
  <style scoped>
  .pin-login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: var(--body-color);
  }
  
  .pin-login-card {
    width: 360px;
    max-width: 90vw;
  }
  
  .pin-login-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .logo-icon {
    color: var(--primary-color, #18a058);
    margin-bottom: 16px;
  }
  
  .pin-login-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  }
  
  .pin-login-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .pin-login-instruction {
    font-size: 16px;
    margin-bottom: 24px;
    text-align: center;
  }
  
  .pin-display {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .pin-digit {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--primary-color, #18a058);
    transition: all 0.2s ease;
  }
  
  .pin-digit-filled {
    background-color: var(--primary-color, #18a058);
  }
  
  .pin-keypad {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 16px;
    width: 100%;
  }
  
  .pin-keypad-row {
    display: flex;
    justify-content: space-between;
  }
  
  .pin-key {
    width: 64px;
    height: 64px;
    font-size: 20px;
    font-weight: 600;
  }
  
  .pin-login-footer {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }
  </style>