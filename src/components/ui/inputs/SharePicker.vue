<!-- src/components/ui/inputs/SharePicker.vue -->
<template>
  <div class="share-picker">
    <div v-if="isLoading" class="loading">
      Loading users...
    </div>
    
    <div v-else-if="!hasOtherUsers" class="no-users">
      No other users to share with
    </div>
    
    <div 
      v-else
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
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useUserStore } from '../../../stores/user';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue']);

// State
const isLoading = ref(true);
const selectedPermissions = ref<Record<string, string>>(
  props.modelValue ? { ...props.modelValue } : {}
);
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
    otherUsers.value = users || [];
  } catch (error) {
    console.error('Error loading other users:', error);
    otherUsers.value = [];
  }
};

// Get permission for a specific user
const getPermissionForUser = (userId: string) => {
  return selectedPermissions.value[userId] || 'no';
};

// Set permission for a specific user
const setPermission = (userId: string, permission: string) => {
  const newPermissions = { ...selectedPermissions.value };
  
  if (permission === 'no') {
    delete newPermissions[userId];
  } else {
    newPermissions[userId] = permission;
  }
  
  selectedPermissions.value = newPermissions;
  emit('update:modelValue', newPermissions);
};

// Watch for changes in owner ID from parent
watch(() => props.modelValue, (newValue) => {
  if (newValue && typeof newValue === 'object') {
    selectedPermissions.value = { ...newValue };
  } else {
    selectedPermissions.value = {};
  }
}, { deep: true });

// Watch for changes in current user ID
watch(() => currentUser.value?.id, async (newUserId) => {
  if (newUserId) {
    await loadOtherUsers();
  }
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
    console.error('Error initializing SharePicker:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.share-picker {
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
}

.user-sharing {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.user-name {
  min-width: 80px;
  color: var(--text-usual);
  font-size: var(--font-body-size);
}

.permission-buttons {
  display: flex;
  background-color: var(--bg-light);
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
  background-color: black;
  color: var(--text-contrast);
}
</style>