<!-- src/views/PinLoginView.vue -->
<template>
  <div class="pin-login-container">
    <n-card class="pin-login-card">
      <div class="pin-login-header">
        <n-icon size="48" class="logo-icon">
          <icon-app-window-filled />
        </n-icon>
        <h1 class="pin-login-title">Finance Login</h1>
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
import { ref } from 'vue';
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
const redirectPath = (route.query.redirect as string) || '/transaction';

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
    console.log('Validating PIN...');
    
    // Получаем пользователя по ПИН-коду
    const user = await userStore.validatePin(pinCode.value);
    
    if (user) {
      // ПИН-код верный
      console.log('PIN valid, user found:', user.name);
      
      // Установка пользователя в хранилище
      userStore.setUser(user);
      
      // Установка токена аутентификации
      userStore.setToken(`token-${user.id}-${Date.now()}`);
      
      // Показываем сообщение об успехе
      message.success('Login successful');
      
      // Перенаправление на дашборд или запрошенную страницу
      console.log('Redirecting to:', redirectPath);
      router.push(redirectPath);
    } else {
      // ПИН-код неверный
      console.log('PIN invalid');
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
  message.info('Please contact your family member to reset your PIN.');
};
</script>

<style scoped>
.pin-login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--app-background);
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
  color: var(--accent-color, #4CAF50);
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
  border: 2px solid var(--accent-color, #4CAF50);
  transition: all 0.2s ease;
}

.pin-digit-filled {
  background-color: var(--accent-color, #4CAF50);
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