<!-- src/views/account/popup/components/AccountSharingPicker.vue -->
<template>
  <div class="sharing-picker">
    <div v-if="isLoading" class="loading">
      <span>Loading users...</span>
    </div>
    
    <div v-else-if="!hasOtherUsers" class="no-users">
      <span>No other users to share with</span>
    </div>
    
    <div v-else>
      <div 
        v-for="user in otherUsers" 
        :key="user.id" 
        class="user-sharing"
      >
        <div class="user-name">{{ user.name }}</div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useUserStore } from '../../../../stores/user';
import type { AccountSharing } from '../../../../stores/account/types';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  ownerId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'update-sharing']);

// State
const isLoading = ref(true);
const currentSharing = ref<AccountSharing>({ ...props.modelValue });
const otherUsers = ref<any[]>([]);

// Available permissions
const permissions = [
  { label: 'no', value: 'no' },
  { label: 'view', value: 'view' },
  { label: 'edit', value: 'edit' }
];

// User store for access to users
const userStore = useUserStore();

// Current user
const currentUser = computed(() => userStore.currentUser);

// Check if we have other users
const hasOtherUsers = computed(() => otherUsers.value.length > 0);

// Load other users
const loadOtherUsers = async () => {
  if (!userStore.isInitialized || !currentUser.value?.id) {
    otherUsers.value = [];
    return;
  }
  
  try {
    // Get other users using userService
    const users = await userStore.userService.getOtherUsers(currentUser.value.id);
    
    // Filter out owner if ownerId is provided
    if (props.ownerId) {
      otherUsers.value = users?.filter(user => user.id !== props.ownerId) || [];
    } else {
      otherUsers.value = users || [];
    }
  } catch (error) {
    console.error('Error loading other users:', error);
    otherUsers.value = [];
  }
};

// Get permission for a specific user
const getPermissionForUser = (userId: string) => {
  return currentSharing.value[userId] || 'no';
};

// Set permission for a specific user
const setPermission = (userId: string, permission: string) => {
  const newSharing = { ...currentSharing.value };
  
  if (permission === 'no') {
    delete newSharing[userId];
  } else {
    newSharing[userId] = permission;
  }
  
  currentSharing.value = newSharing;
  emit('update:modelValue', newSharing);
  emit('update-sharing', newSharing);
};

// Watch for changes in owner ID from parent
watch(() => props.modelValue, (newValue) => {
  if (newValue && typeof newValue === 'object') {
    currentSharing.value = { ...newValue };
  } else {
    currentSharing.value = {};
  }
}, { deep: true });

// Watch for changes in owner ID
watch(() => props.ownerId, (newOwnerId) => {
  if (newOwnerId && currentSharing.value[newOwnerId]) {
    // Remove owner from sharing permissions
    const updatedSharing = { ...currentSharing.value };
    delete updatedSharing[newOwnerId];
    currentSharing.value = updatedSharing;
    emit('update:modelValue', updatedSharing);
    emit('update-sharing', updatedSharing);
  }
  
  // Reload users list to filter out the owner
  loadOtherUsers();
});

// Initialize
onMounted(async () => {
  try {
    // Make sure user store is initialized
    if (!userStore.isInitialized) {
      await userStore.init();
    }
    
    // Load other users
    await loadOtherUsers();
  } catch (error) {
    console.error('Error initializing AccountSharingPicker:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.sharing-picker {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
}

.loading, .no-users {
  padding: var(--spacing-sm);
  text-align: center;
  color: var(--text-grey);
  font-size: var(--font-body-size);
  background-color: var(--bg-dropdown);
  border-radius: var(--border-radius-sm);
}

.user-sharing {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
}

.user-name {
  min-width: 80px;
  color: var(--text-usual);
  font-size: var(--font- small-size);
}

.permission-buttons {
  display: flex;
  background-color: var(--bg-field-light);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xs);
  gap: var(--spacing-xs);
}

.permission-button {
  padding: 6px var(--spacing-md);
  border-radius: var(--border-radius-xl);
  font-size: var(--font-small-size);
  cursor: pointer;
  color: var(--bg-contrast);
  transition: all var(--transition-speed) var(--transition-fn);
}

.permission-button:hover {
  opacity: var(--state-hover-opacity);
}

.permission-button.selected {
  background-color: var(--dropdown-item-selected);
  color: var(--text-contrast);
}
</style>