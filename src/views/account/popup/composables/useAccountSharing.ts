// src/views/account/composables/useAccountSharing.ts
import { ref, computed } from 'vue';
import { useAccountStore } from '../../../stores/account';
import { useUserStore } from '../../../stores/user';
import type { SharingPermission } from '../../../stores/account/types';
import type { User } from '../../../stores/user/types';

/**
 * Composable for handling account sharing functionality
 */
export function useAccountSharing() {
  const accountStore = useAccountStore();
  const userStore = useUserStore();
  
  // Current user
  const currentUser = computed(() => userStore.currentUser);
  
  // Get all other users
  const otherUsers = computed(() => {
    const allUsers = userStore.getAllUsers?.() || [];
    return allUsers.filter(user => 
      user.isActive !== false && 
      user.id !== currentUser.value?.id
    );
  });
  
  /**
   * Check if user has access to an account
   */
  const hasAccountAccess = (accountId: string, userId: string = currentUser.value?.id || '') => {
    return accountStore.hasAccountAccess(accountId, userId);
  };
  
  /**
   * Check if user can edit an account
   */
  const canEditAccount = (accountId: string, userId: string = currentUser.value?.id || '') => {
    return accountStore.canEditAccount(accountId, userId);
  };
  
  /**
   * Get accounts shared with the current user
   */
  const getAccountsSharedWithMe = () => {
    if (!currentUser.value) return [];
    return accountStore.getAccountsSharedWithUser(currentUser.value.id);
  };
  
  /**
   * Update sharing permissions for an account
   */
  const updateSharing = async (
    accountId: string, 
    sharingPermissions: Record<string, SharingPermission>
  ) => {
    return await accountStore.updateAccountSharing(accountId, sharingPermissions);
  };
  
  /**
   * Get user's name by ID
   */
  const getUserNameById = async (userId: string, defaultName: string = 'Unknown User'): Promise<string> => {
    try {
      return await userStore.userService.getUserNameById(userId, defaultName);
    } catch (error) {
      console.error(`[useAccountSharing] Error getting user name for ID ${userId}:`, error);
      return defaultName;
    }
  };
  
  return {
    // Properties
    currentUser,
    otherUsers,
    
    // Methods
    hasAccountAccess,
    canEditAccount,
    getAccountsSharedWithMe,
    updateSharing,
    getUserNameById
  };
}