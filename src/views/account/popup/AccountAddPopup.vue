<!-- src/views/account/popup/AccountAddPopup.vue -->
<template>
  <BasePopup
    v-model="isVisible"
    title="New account"
    :rightContent="true"
    :closeOnOverlayClick="false"
  >
    <template #rightContent>
      <div class="save-button" @click="saveAccount">Save</div>
    </template>

    <div class="account-form">
      <!-- Icon and Color selection row -->
      <div class="form-row icon-color-row">
        <div class="form-group">
          <label>Icon</label>
          <IconPicker v-model="accountData.iconComponent" />
        </div>
        
        <div class="form-group">
          <label>Color</label>
          <ColorPicker v-model="accountData.color" />
        </div>
      </div>

      <!-- Name input -->
      <div class="form-row">
        <label>Name</label>
        <div class="input-wrapper">
          <input
            v-model="accountData.name"
            placeholder="Account name"
            class="custom-input"
          />
        </div>
      </div>

      <!-- Type selection с использованием AccountTypeSelector -->
      <div class="form-row">
        <label>Type</label>
        <div class="input-wrapper">
          <AccountTypeSelector v-model="accountData.type" />
        </div>
      </div>

      <!-- Currency selection -->
      <div class="form-row">
        <label>Currency</label>
        <div class="currency-selector">
          <select v-model="accountData.currency" class="currency-select">
            <option v-for="currency in currencyStore.currencies" :key="currency.code" :value="currency.code">
              {{ currency.code }} ({{ currency.symbol }})
            </option>
          </select>
        </div>
      </div>

      <!-- Initial balance -->
      <div class="form-row">
        <label>Balance</label>
        <div class="input-wrapper">
          <input
            v-model.number="accountData.initialBalance"
            type="number"
            placeholder="0.00"
            class="custom-input"
          />
        </div>
      </div>

      <!-- Share permissions -->
      <div class="form-row sharing-row" v-if="userStore.isInitialized">
        <label>Share</label>
        <div class="sharing-wrapper">
          <SharePicker v-model="accountData.sharing" />
        </div>
      </div>

      <!-- Book selection -->
      <div class="form-row">
        <label>Book</label>
        <div class="books-wrapper">
          <div 
            v-for="book in bookStore.books" 
            :key="book.id"
            class="book-chip"
            :class="{ 'selected': selectedBooks.includes(book.id) }"
            @click="toggleBook(book.id)"
          >
            {{ book.name }}
          </div>
        </div>
      </div>

      <!-- Use in balance toggle -->
      <div class="form-row">
        <label>Use in balance</label>
        <ToggleSwitch v-model="accountData.isActive" />
      </div>
    </div>

    <!-- Save button at the bottom -->
    <div class="save-account-button" @click="saveAccount">
      Save account
    </div>
  </BasePopup>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import BasePopup from '../../../components/ui/BasePopup.vue';
import ColorPicker from '../../../components/ui/inputs/ColorPicker.vue';
import IconPicker from '../../../components/ui/inputs/IconPicker.vue';
import SharePicker from '../../../components/ui/inputs/SharePicker.vue';
import AccountTypeSelector from './components/AccountTypeSelector.vue';
import ToggleSwitch from '../../../components/ui/inputs/ToggleSwitch.vue';
import { useAccountManagement } from './composables/useAccountManagement';
import { useAccountTypes } from './composables/useAccountTypes';
import { useBookStore } from '../../../stores/book';
import { useCurrencyStore } from '../../../stores/currency';
import { useUserStore } from '../../../stores/user';
import type { AccountType, AccountSharing } from '../../../stores/account/types';

// Используем кастомные хуки
const { accountStore, init } = useAccountManagement();
const { 
  getDefaultIconForAccountType, 
  getDefaultColorForAccountType
} = useAccountTypes();
const bookStore = useBookStore();
const currencyStore = useCurrencyStore();
const userStore = useUserStore();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialBookId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

// Popup visibility
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Initialize stores if needed
onMounted(async () => {
  try {
    // First initialize account and book stores
    await init();
    
    // Then make sure user store is initialized
    if (!userStore.isInitialized) {
      await userStore.init();
    }
    
    // Set default book if provided
    if (props.initialBookId && !selectedBooks.value.includes(props.initialBookId)) {
      selectedBooks.value = [props.initialBookId];
    } else if (bookStore.books.length > 0 && selectedBooks.value.length === 0) {
      // Default to first book if none selected
      selectedBooks.value = [bookStore.books[0].id];
    }
    
    // Set default currency as user's base currency or app base currency
    accountData.value.currency = userStore.userSettings?.baseCurrency || currencyStore.appBaseCurrency;
    
    // Set default owner to current user if available
    if (userStore.currentUser?.id) {
      accountData.value.ownerId = userStore.currentUser.id;
    }
    
    console.log('Account popup initialized successfully');
  } catch (error) {
    console.error('Error initializing account popup:', error);
  }
});

// Account data с использованием значений по умолчанию
const defaultAccountType: AccountType = 'card';
const accountData = ref({
  name: '',
  iconComponent: null,
  icon: getDefaultIconForAccountType(defaultAccountType),
  color: getDefaultColorForAccountType(defaultAccountType),
  type: defaultAccountType,
  currency: 'USD',
  initialBalance: 0,
  ownerId: userStore.currentUser?.id || 'user_1',
  isActive: true,
  sharing: {} as AccountSharing
});

// Selected books
const selectedBooks = ref<string[]>([]);

// Watch for icon component changes to update icon name
watch(() => accountData.value.iconComponent, (newValue) => {
  if (newValue) {
    // Extract icon name from component
    const iconName = newValue.type?.name?.replace('Icon', '') || '';
    accountData.value.icon = iconName ? `Icon${iconName}` : '';
  } else {
    // Если компонент иконки удален, установим иконку по умолчанию для текущего типа
    accountData.value.icon = getDefaultIconForAccountType(accountData.value.type);
  }
});

// Watch for initial book ID changes
watch(() => props.initialBookId, (newValue) => {
  if (newValue && !selectedBooks.value.includes(newValue)) {
    selectedBooks.value = [newValue];
  }
});

// Watch for owner changes to update sharing
watch(() => accountData.value.ownerId, (newOwnerId) => {
  // Owner should not be in sharing permissions
  if (accountData.value.sharing[newOwnerId]) {
    const updatedSharing = { ...accountData.value.sharing };
    delete updatedSharing[newOwnerId];
    accountData.value.sharing = updatedSharing;
  }
});

// Watch for type changes to update defaults
watch(() => accountData.value.type, (newType) => {
  // Если иконка не была установлена пользователем, установим иконку по умолчанию для нового типа
  if (!accountData.value.iconComponent) {
    accountData.value.icon = getDefaultIconForAccountType(newType);
  }
  
  // Можно также автоматически предлагать цвет по умолчанию, но только если пользователь
  // еще не выбрал собственный цвет (опционально)
  if (accountData.value.color === '#949496') {
    accountData.value.color = getDefaultColorForAccountType(newType);
  }
});

// Toggle book selection
const toggleBook = (bookId: string) => {
  const index = selectedBooks.value.indexOf(bookId);
  if (index === -1) {
    selectedBooks.value.push(bookId);
  } else if (selectedBooks.value.length > 1) {
    // Ensure at least one book is selected
    selectedBooks.value.splice(index, 1);
  }
};

// Save the account
const saveAccount = async () => {
  // Validate form
  if (!accountData.value.name.trim()) {
    // Show error or handle validation
    console.error('Account name is required');
    return;
  }

  // Prepare account data
  const newAccount = {
    name: accountData.value.name,
    icon: accountData.value.icon,
    color: accountData.value.color,
    type: accountData.value.type,
    currency: accountData.value.currency,
    initialBalance: accountData.value.initialBalance,
    currentBalance: accountData.value.initialBalance, // Initially same as initial balance
    ownerId: accountData.value.ownerId,
    bookIds: selectedBooks.value,
    isActive: accountData.value.isActive,
    symbol: currencyStore.getCurrency(accountData.value.currency)?.symbol || '$',
    sharing: accountData.value.sharing
  };

  try {
    // Add the account via store
    const savedAccount = await accountStore.addAccount(newAccount);
    
    // Emit save event with new account data
    emit('save', savedAccount);
    
    // Close popup
    isVisible.value = false;
    
    // Reset form
    resetForm();
  } catch (error) {
    console.error('Error saving account:', error);
  }
};

// Reset the form
const resetForm = () => {
  const defaultType: AccountType = 'card';
  accountData.value = {
    name: '',
    iconComponent: null,
    icon: getDefaultIconForAccountType(defaultType),
    color: getDefaultColorForAccountType(defaultType),
    type: defaultType,
    currency: userStore.userSettings?.baseCurrency || currencyStore.appBaseCurrency,
    initialBalance: 0,
    ownerId: userStore.currentUser?.id || 'user_1',
    isActive: true,
    sharing: {}
  };
  
  // Reset to initial book or first book
  if (props.initialBookId) {
    selectedBooks.value = [props.initialBookId];
  } else if (bookStore.books.length > 0) {
    selectedBooks.value = [bookStore.books[0].id];
  } else {
    selectedBooks.value = [];
  }
};
</script>

<style scoped>
.account-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.icon-color-row {
  justify-content: space-between;
}

.sharing-row {
  align-items: flex-start;
}

.form-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

label {
  color: white;
  font-size: 16px;
  font-weight: 400;
  min-width: 100px;
}

.input-wrapper {
  flex: 1;
  max-width: 100%;
}

.sharing-wrapper {
  flex: 1;
}

.custom-input {
  height: 36px;
  width: 100%;
  background-color: #949496;
  border: none;
  border-radius: 14px;
  padding: 8px 12px;
  color: #FFFFFF;
  font-size: 16px;
  box-sizing: border-box;
}

.custom-input:focus {
  outline: none;
}

.custom-input::placeholder {
  color: rgba(64, 64, 64, 0.7);
}

.currency-selector {
  flex: 1;
}

.currency-select {
  height: 36px;
  width: 100%;
  background-color: #949496;
  border: none;
  border-radius: 14px;
  padding: 0 12px;
  color: #FFFFFF;
  font-size: 16px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 12px top 50%;
  background-size: 10px auto;
}

.books-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.book-chip {
  padding: 8px 16px;
  background-color: #949496;
  border-radius: 14px;
  color: #404040;
  font-size: 14px;
  cursor: pointer;
}

.book-chip.selected {
  background-color: black;
  color: white;
}

.save-account-button {
  margin-top: 20px;
  margin-bottom: 16px;
  padding: 9px 19px;
  background-color: #53B794;
  color: white;
  border-radius: 34px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  align-self: center;
  display: inline-block;
}

.save-button {
  color: #53B794;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
</style>