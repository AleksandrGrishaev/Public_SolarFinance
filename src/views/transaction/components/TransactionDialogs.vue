<!-- src/views/transaction/components/TransactionDialogs.vue -->
<template>
    <div>
      <!-- Selector popup for categories -->
      <CategorySelector
        :modelValue="showCategorySelector"
        @update:modelValue="updateCategorySelector"
        :categories="categories"
        :bookId="bookId"
        :transactionType="transactionType"
        @select="$emit('select-category', $event)"
        @add="$emit('add-category')"
        @edit="$emit('open-category-list')"
      />
      
      <!-- List/Edit popup for categories -->
      <CategoryListPopup
        :modelValue="showCategoryList"
        @update:modelValue="updateCategoryList"
        :initialBook="bookId"
        :initialType="transactionType === 'transfer' ? 'expense' : transactionType"
        @select="$emit('category-list-select', $event)"
        @add="$emit('add-category-from-list', $event)"
        @reorder="$emit('categories-reordered', $event)"
        @toggleActive="$emit('toggle-active-category', $event)"
      />
  
      <!-- Distribution confirmation dialog -->
      <DistributionConfirmDialog
        :modelValue="confirmationDialog.show"
        @update:modelValue="updateConfirmDialog"
        :title="confirmationDialog.title"
        :message="confirmationDialog.message"
        :confirm-text="confirmationDialog.confirmText"
        :cancel-text="confirmationDialog.cancelText"
        :current-distribution="distributionPercentage"
        :standard-distribution="confirmationDialog.standardDistribution"
        :sides="distributionOwners"
        :preview-amount="parseFloat(amount) || 1000"
        :currency="sourceCurrencySymbol"
        @confirm="$emit('confirm-dialog')"
        @cancel="$emit('cancel-dialog')"
      />
    
      <!-- Debtor selection dialog -->
      <DebtorSelectionDialog
        :modelValue="debtorDialog.show"
        @update:modelValue="updateDebtorDialog"
        :users="availableDebtors"
        :currentUserId="currentUserId"
        @select="$emit('select-debtor', $event)"
        @cancel="$emit('cancel-debtor')"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits } from 'vue';
  import CategorySelector from '@/components/categories/CategorySelector.vue';
  import CategoryListPopup from '@/components/categories/CategoryListPopup.vue';
  import DistributionConfirmDialog from './DistributionConfirmDialog.vue';
  import DebtorSelectionDialog from './DebtorSelectionDialog.vue';
  
  const props = defineProps({
    showCategorySelector: {
      type: Boolean,
      required: true
    },
    showCategoryList: {
      type: Boolean,
      required: true
    },
    categories: {
      type: Array,
      required: true
    },
    bookId: {
      type: String,
      required: true
    },
    transactionType: {
      type: String,
      required: true
    },
    confirmationDialog: {
      type: Object,
      required: true
    },
    debtorDialog: {
      type: Object,
      required: true
    },
    availableDebtors: {
      type: Array,
      required: true
    },
    currentUserId: {
      type: String,
      required: true
    },
    distributionPercentage: {
      type: Number,
      required: true
    },
    distributionOwners: {
      type: Array,
      required: true
    },
    sourceCurrencySymbol: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    }
  });
  
  const emit = defineEmits([
    'update:show-category-selector',
    'update:show-category-list',
    'select-category',
    'add-category',
    'open-category-list',
    'category-list-select',
    'add-category-from-list',
    'categories-reordered',
    'toggle-active-category',
    'confirm-dialog',
    'cancel-dialog',
    'select-debtor',
    'cancel-debtor'
  ]);
  
  // Update methods for v-model
  const updateCategorySelector = (value) => {
    emit('update:show-category-selector', value);
  };
  
  const updateCategoryList = (value) => {
    emit('update:show-category-list', value);
  };
  
  const updateConfirmDialog = (value) => {
    if (!value) {
      emit('cancel-dialog');
    }
  };
  
  const updateDebtorDialog = (value) => {
    if (!value) {
      emit('cancel-debtor');
    }
  };
  </script>