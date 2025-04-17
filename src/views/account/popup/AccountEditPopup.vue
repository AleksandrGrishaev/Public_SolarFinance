<!-- src/views/account/popup/AccountEditPopup.vue -->
<template>
    <BasePopup
      v-model="isVisible"
      title="Edit account"
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
  
        <!-- Type selection -->
        <div class="form-row">
          <label>Type</label>
          <ToggleButtonGroup 
            v-model="accountData.type" 
            :options="typeOptions"
          />
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
  
        <!-- Current balance -->
        <div class="form-row">
          <label>Balance</label>
          <div class="input-wrapper">
            <input
              v-model.number="accountData.currentBalance"
              type="number"
              placeholder="0.00"
              class="custom-input"
            />
          </div>
        </div>
  
        <!-- Share selection (owner) -->
        <div class="form-row">
          <label>Share</label>
          <ToggleButtonGroup 
            v-model="accountData.ownerId" 
            :options="ownerOptions"
          />
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
      
      <!-- Delete button -->
      <div class="delete-account-button" @click="confirmDelete">
        Delete account
      </div>
    </BasePopup>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import BasePopup from '../../../components/ui/BasePopup.vue';
  import ColorPicker from '../../../components/ui/inputs/ColorPicker.vue';
  import IconPicker from '../../../components/ui/inputs/IconPicker.vue';
  import ToggleButtonGroup from '../../../components/ui/inputs/ToggleButtonGroup.vue';
  import ToggleSwitch from '../../../components/ui/inputs/ToggleSwitch.vue';
  import { useAccountStore } from '../../../stores/account';
  import { useBookStore } from '../../../stores/book';
  import { useCurrencyStore } from '../../../stores/currency';
  import { useUserStore } from '../../../stores/user';
  import type { Account, AccountType } from '../../../stores/account/types';
  import * as TablerIcons from '@tabler/icons-vue';
  
  const accountStore = useAccountStore();
  const bookStore = useBookStore();
  const currencyStore = useCurrencyStore();
  const userStore = useUserStore();
  
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    account: {
      type: Object as () => Account | null,
      default: null
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'save', 'delete']);
  
  // Popup visibility
  const isVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  });
  
  // Options for toggle groups
  const typeOptions = computed(() => [
    { label: 'Cash', value: 'cash' },
    { label: 'Bank', value: 'bank' },
    { label: 'Card', value: 'card' }
  ]);
  
  // Owner options
  const ownerOptions = computed(() => {
    return userStore.getAllUsers?.() || []
      .filter(user => user.isActive !== false)
      .map(user => ({
        label: user.name,
        value: user.id
      }));
  });
  
  // Account data with default values
  const accountData = ref({
    id: '',
    name: '',
    iconComponent: null,
    icon: '',
    color: '#949496',
    type: 'card' as AccountType,
    currency: 'USD',
    initialBalance: 0,
    currentBalance: 0,
    ownerId: userStore.currentUser?.id || 'user_1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Selected books
  const selectedBooks = ref<string[]>([]);
  
  // Initialize stores and load account data
  onMounted(async () => {
    if (!bookStore.isInitialized) {
      await bookStore.init();
    }
    if (!accountStore.isInitialized) {
      await accountStore.init();
    }
    if (!userStore.isInitialized) {
      await userStore.init();
    }
    
    loadAccountData();
  });
  
  // Watch for account changes and reload data
  watch(() => props.account, () => {
    loadAccountData();
  });
  
  // Load account data when the account prop changes
  const loadAccountData = () => {
    if (!props.account) return;
    
    const account = props.account;
    
    // Try to find icon component
    let iconComponent = null;
    if (account.icon) {
      // Get the icon component from TablerIcons
      const iconName = account.icon.replace(/^Icon/, '');
      iconComponent = TablerIcons[account.icon] || null;
    }
    
    // Load the account data
    accountData.value = {
      id: account.id,
      name: account.name,
      iconComponent: iconComponent,
      icon: account.icon || '',
      color: account.color || '#949496',
      type: account.type,
      currency: account.currency,
      initialBalance: account.initialBalance,
      currentBalance: account.currentBalance,
      ownerId: account.ownerId,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };
    
    // Set selected books
    selectedBooks.value = account.bookIds || [];
  };
  
  // Watch for icon component changes to update icon name
  watch(() => accountData.value.iconComponent, (newValue) => {
    if (newValue) {
      // Extract icon name from component
      const iconName = newValue.type?.name?.replace('Icon', '') || '';
      accountData.value.icon = iconName ? `Icon${iconName}` : '';
    } else {
      accountData.value.icon = '';
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
  
    if (!accountData.value.id || !props.account) {
      console.error('Account ID is missing');
      return;
    }
  
    // Prepare updated account data
    const updatedAccount = {
      name: accountData.value.name,
      icon: accountData.value.icon,
      color: accountData.value.color,
      type: accountData.value.type,
      currency: accountData.value.currency,
      currentBalance: accountData.value.currentBalance,
      ownerId: accountData.value.ownerId,
      bookIds: selectedBooks.value,
      isActive: accountData.value.isActive,
      symbol: currencyStore.getCurrency(accountData.value.currency)?.symbol || '$',
      updatedAt: new Date()
    };
  
    try {
      // Update the account via store
      const success = await accountStore.updateAccount(accountData.value.id, updatedAccount);
      
      if (success) {
        // Emit save event with updated account data
        emit('save', { ...props.account, ...updatedAccount });
        
        // Close popup
        isVisible.value = false;
      } else {
        console.error('Failed to update account');
      }
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };
  
  // Confirm account deletion
  const confirmDelete = async () => {
    if (!accountData.value.id) return;
    
    // In a real app, you'd show a confirmation dialog here
    const confirmDelete = confirm('Are you sure you want to delete this account?');
    
    if (confirmDelete) {
      try {
        const success = await accountStore.deleteAccount(accountData.value.id);
        
        if (success) {
          // Emit delete event
          emit('delete', accountData.value.id);
          
          // Close popup
          isVisible.value = false;
        } else {
          console.error('Failed to delete account');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
      }
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
  
  .delete-account-button {
    margin-bottom: 16px;
    padding: 9px 19px;
    background-color: transparent;
    color: #E05252;
    border-radius: 34px;
    font-size: 16px;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
    align-self: center;
    display: inline-block;
    border: 1px solid #E05252;
  }
  
  .save-button {
    color: #53B794;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
  }
  </style>