<!-- src/views/account/components/AccountSharingPanel.vue -->
<template>
    <div class="sharing-panel">
      <h3 class="panel-title">Sharing Settings</h3>
      
      <div v-if="loading" class="loading-indicator">
        Loading...
      </div>
      
      <div v-else>
        <div class="owner-info">
          <span class="label">Owner:</span>
          <span class="owner-name">{{ ownerName }}</span>
        </div>
        
        <div v-if="otherUsers.length === 0" class="no-users-message">
          No other users to share with
        </div>
        
        <div v-else class="sharing-users">
          <div 
            v-for="user in otherUsers" 
            :key="user.id"
            class="user-row"
          >
            <span class="user-name">{{ user.name }}</span>
            
            <div class="permission-buttons">
              <div 
                v-for="permission in permissions" 
                :key="permission.value"
                class="permission-button"
                :class="{ 
                  'selected': getPermissionForUser(user.id) === permission.value
                }"
                @click="setPermission(user.id, permission.value)"
              >
                {{ permission.label }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="actions">
          <button 
            class="save-button" 
            @click="saveChanges"
            :disabled="!hasChanges"
          >
            Save Changes
          </button>
          
          <button 
            class="cancel-button" 
            @click="cancel"
            :disabled="!hasChanges"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import { useAccountSharing } from '../composables/useAccountSharing';
  import { useAccountStore } from '../../../stores/account';
  import type { SharingPermission } from '../../../stores/account/types';
  import type { User } from '../../../stores/user/types';
  
  const props = defineProps({
    accountId: {
      type: String,
      required: true
    }
  });
  
  const emit = defineEmits(['update', 'close']);
  
  // Store and composables
  const accountStore = useAccountStore();
  const { 
    otherUsers, 
    getUserNameById, 
    updateSharing,
    loadOtherUsers,
    init
  } = useAccountSharing();
  
  // State
  const loading = ref(true);
  const account = ref(null);
  const originalSharing = ref<Record<string, SharingPermission>>({});
  const currentSharing = ref<Record<string, SharingPermission>>({});
  
  // Available permissions
  const permissions = [
    { label: 'no', value: 'no' },
    { label: 'view', value: 'view' },
    { label: 'edit', value: 'edit' }
  ];
  
  // Get account owner name
  const ownerName = ref('Unknown');
  
  const loadOwnerName = async () => {
    if (!account.value) return 'Unknown';
    
    try {
      ownerName.value = await getUserNameById(account.value.ownerId);
    } catch (error) {
      console.error('Error loading owner name:', error);
    }
  };
  
  // Check if there are unsaved changes
  const hasChanges = computed(() => {
    // Check if the number of keys is different
    if (Object.keys(originalSharing.value).length !== Object.keys(currentSharing.value).length) {
      return true;
    }
    
    // Check if any permission values are different
    for (const userId in currentSharing.value) {
      if (currentSharing.value[userId] !== (originalSharing.value[userId] || 'no')) {
        return true;
      }
    }
    
    // Check if any permissions were removed
    for (const userId in originalSharing.value) {
      if (originalSharing.value[userId] !== 'no' && !currentSharing.value[userId]) {
        return true;
      }
    }
    
    return false;
  });
  
  // Get the current permission for a user
  const getPermissionForUser = (userId: string): SharingPermission => {
    return currentSharing.value[userId] || 'no';
  };
  
  // Set a permission for a user
  const setPermission = (userId: string, permission: SharingPermission) => {
    // Create a new object to trigger reactivity
    const newSharing = { ...currentSharing.value };
    
    if (permission === 'no') {
      // If permission is 'no', remove it from the object
      delete newSharing[userId];
    } else {
      // Otherwise set the permission
      newSharing[userId] = permission;
    }
    
    currentSharing.value = newSharing;
  };
  
  // Save changes to the account
  const saveChanges = async () => {
    if (!props.accountId) return;
    
    loading.value = true;
    
    try {
      // Update account sharing
      const success = await updateSharing(props.accountId, currentSharing.value);
      
      if (success) {
        // Update original sharing to match current
        originalSharing.value = { ...currentSharing.value };
        
        // Emit update event
        emit('update', currentSharing.value);
      }
    } catch (error) {
      console.error('Error updating sharing permissions:', error);
    } finally {
      loading.value = false;
    }
  };
  
  // Cancel changes and reset to original
  const cancel = () => {
    currentSharing.value = { ...originalSharing.value };
    emit('close');
  };
  
  // Load account data
  const loadAccount = async () => {
    loading.value = true;
    
    try {
      const accountData = accountStore.getAccountById(props.accountId);
      
      if (accountData) {
        account.value = accountData;
        
        // Initialize sharing
        originalSharing.value = { ...(accountData.sharing || {}) };
        currentSharing.value = { ...(accountData.sharing || {}) };
        
        // Load owner name
        await loadOwnerName();
        
        // Load available users
        await loadOtherUsers();
      }
    } catch (error) {
      console.error('Error loading account:', error);
    } finally {
      loading.value = false;
    }
  };
  
  // Watch for account ID changes
  watch(() => props.accountId, (newId) => {
    if (newId) {
      loadAccount();
    }
  });
  
  // Initialize on mount
  onMounted(async () => {
    // Initialize account sharing composable
    await init();
    
    // Load account data
    await loadAccount();
  });
  </script>
  
  <style scoped>
  .sharing-panel {
    padding: 16px;
    background-color: #2a2a2a;
    border-radius: 12px;
    color: white;
  }
  
  .panel-title {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 500;
  }
  
  .loading-indicator {
    text-align: center;
    padding: 20px;
    color: #949496;
  }
  
  .owner-info {
    margin-bottom: 16px;
    padding: 8px;
    background-color: #3a3a3a;
    border-radius: 8px;
    display: flex;
    align-items: center;
  }
  
  .label {
    font-weight: 500;
    margin-right: 8px;
  }
  
  .owner-name {
    color: #53B794;
  }
  
  .no-users-message {
    padding: 16px;
    text-align: center;
    color: #949496;
  }
  
  .sharing-users {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .user-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    background-color: #3a3a3a;
    border-radius: 8px;
  }
  
  .user-name {
    flex: 1;
    padding-left: 8px;
  }
  
  .permission-buttons {
    display: flex;
    background-color: #949496;
    border-radius: 28px;
    padding: 4px;
    gap: 4px;
  }
  
  .permission-button {
    padding: 6px 14px;
    border-radius: 34px;
    font-size: 12px;
    cursor: pointer;
    color: #404040;
    transition: all 0.2s ease;
  }
  
  .permission-button.selected {
    background-color: black;
    color: white;
  }
  
  .actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
  }
  
  .save-button {
    padding: 8px 16px;
    background-color: #53B794;
    color: white;
    border: none;
    border-radius: 34px;
    font-size: 14px;
    cursor: pointer;
  }
  
  .save-button:disabled {
    background-color: #949496;
    cursor: not-allowed;
  }
  
  .cancel-button {
    padding: 8px 16px;
    background-color: transparent;
    border: 1px solid #949496;
    color: #949496;
    border-radius: 34px;
    font-size: 14px;
    cursor: pointer;
  }
  
  .cancel-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  </style>