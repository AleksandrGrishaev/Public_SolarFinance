<!-- src/views/account/popup/AccountAddPopup.vue -->
<template>
  <BasePopup
    v-model="isVisible"
    title="New account"
    :rightContent="true"
    :closeOnOverlayClick="false"
    :hasFooter="true"
  >
    <template #rightContent>
      <div class="save-button color-success" @click="saveAccount">Save</div>
    </template>

    <div class="form-container">
      <!-- Icon and Color selection row -->
      <div class="form-row icon-color-row">
        <div class="form-group">
          <div class="form-label">Icon</div>
          <div @click="showIconPopup = true">
            <IconPicker 
              v-model="accountData.iconComponent"
              :iconBackgroundColor="accountData.color || 'var(--bg-field-light)'"
            />
          </div>
        </div>
        
        <div class="form-group">
          <div class="form-label text-right">Color</div>
          <ColorPicker v-model="accountData.color" />
        </div>
      </div>
      <!-- Name input -->
      <div class="form-row">
        <div class="form-label">Name</div>
        <div class="form-field">
          <TextInput
            v-model="accountData.name"
            placeholder="Account name"
          />
        </div>
      </div>

      <!-- Type selection с использованием AccountTypeSelector -->
      <div class="form-row">
        <div class="form-label">Type</div>
        <div class="form-field">
          <AccountTypeSelector v-model="accountData.type" />
        </div>
      </div>

      <!-- Currency selection -->
      <div class="form-row">
        <div class="form-label">Currency</div>
        <div class="form-field">
          <CurrencySelector 
            :currencyCode="accountData.currency"
            :currencySymbol="currencyStore.getCurrency(accountData.currency)?.symbol || '$'"
            @open-popup="showCurrencyPopup = true"
          />
        </div>
      </div>

      <!-- Initial balance -->
      <div class="form-row">
        <div class="form-label">Balance</div>
        <div class="form-field">
          <TextInput
            v-model.number="accountData.initialBalance"
            type="number"
            placeholder="0.00"
          />
        </div>
      </div>

      <!-- Share permissions -->
      <div class="form-row sharing-row" v-if="userStore.isInitialized">
        <div class="form-label">Share</div>
        <div class="form-field sharing-field">
          <AccountSharingPicker 
            v-model="accountData.sharing" 
            :ownerId="accountData.ownerId" 
            @update-sharing="updateSharing"
          />
        </div>
      </div>

      <!-- Book selection -->
      <div class="form-row">
        <div class="form-label">Book</div>
        <div class="form-field">
          <!-- Используем модифицированный BookSelector -->
          <BookSelector 
            v-model="selectedBooks" 
            :multiSelect="true"
            :showIcon="false"
            backgroundColor="var(--bg-light)"
            selectedColor="var(--dropdown-item-selected)"
          />
        </div>
      </div>

      <!-- Use in balance toggle -->
      <div class="form-row use-in-balance-row">
        <div class="form-label">Use in balance</div>
        <ToggleSwitch v-model="accountData.isActive" />
      </div>
    </div>

    <!-- Save button at the bottom -->
    <template #footer>
      <button class="form-button bg-color-success" @click="saveAccount">
        Save account
      </button>
    </template>
  </BasePopup>

  <!-- Currency selection popup -->
  <CurrencyPopup
    v-model="showCurrencyPopup"
    v-model:selectedCurrency="accountData.currency"
  />
  
  <!-- Icon selection popup -->
  <IconSelectorPopup
    v-model="showIconPopup"
    v-model:selectedIcon="accountData.iconComponent"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import BasePopup from '../../../components/ui/BasePopup.vue';
import ColorPicker from '../../../components/ui/inputs/ColorPicker.vue';
import TextInput from '../../../components/ui/inputs/TextInput.vue';
import AccountTypeSelector from './components/AccountTypeSelector.vue';
import ToggleSwitch from '../../../components/ui/inputs/ToggleSwitch.vue';
import CurrencyPopup from '../../currency/popup/CurrencyPopup.vue';
import IconSelectorPopup from '../../icon/popup/IconSelectorPopup.vue';
import IconPicker from '../../../components/ui/inputs/IconPicker.vue';
import CurrencySelector from '../../../components/ui/selectors/CurrencySelector.vue';
import AccountSharingPicker from './components/AccountSharingPicker.vue';
import BookSelector from '../../../components/ui/selectors/BookSelector.vue';
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
  set: (value) => {
    emit('update:modelValue', value);
    // Reset form when popup is closed
    if (!value) {
      resetForm();
    }
  }
});

// Currency popup visibility
const showCurrencyPopup = ref(false);

// Icon popup visibility
const showIconPopup = ref(false);

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

// Computed property for currency display
const selectedCurrencyInfo = computed(() => {
  const currency = currencyStore.getCurrency(accountData.value.currency);
  if (currency) {
    return `${currency.code} (${currency.symbol})`;
  }
  return accountData.value.currency;
});

// Update sharing permissions
const updateSharing = (sharing: AccountSharing) => {
  accountData.value.sharing = sharing;
};

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

// Save the account
const saveAccount = async () => {
  // Validate form
  if (!accountData.value.name.trim()) {
    // Show error or handle validation
    console.error('Account name is required');
    return;
  }
  
  // Reset icon and color popups if they're open
  showIconPopup.value = false;
  showCurrencyPopup.value = false;

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
  
  // Reset popup visibilities
  showIconPopup.value = false;
  showCurrencyPopup.value = false;
};
</script>

<style scoped>
.save-button {
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
}

.sharing-field {
  max-width: 100%;
}

.sharing-row {
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
}

.icon-color-row {
  justify-content: flex-start;
  gap: var(--spacing-md);
}

.form-button {
  padding: var(--spacing-sm) var(--spacing-lg);
  color: var(--text-contrast);
  border-radius: var(--border-radius-xl);
  font-size: var(--font-button-size);
  font-weight: var(--font-button-weight);
  border: none;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-speed) var(--transition-fn);
  min-width: 180px;
}

.form-button:hover {
  filter: brightness(1.1);
}

.select-arrow {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid var(--text-usual);
}

.icon-color-row {
  justify-content: flex-start;
  gap: var(--spacing-md);
}

.text-right {
  text-align: right;
  width: 100%;
}
</style>