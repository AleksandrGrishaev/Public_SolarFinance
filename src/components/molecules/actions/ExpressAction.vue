<template>
    <div class="express-action form-group">
      <div class="button">
        <BaseButton 
          variant="outline" 
          :text="declineText" 
          @click="onDecline" 
        />
        <BaseButton 
          variant="primary" 
          :text="acceptText" 
          @click="onAccept" 
        />
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import { BaseButton } from '../../atoms/buttons';
  
  export default defineComponent({
    name: 'ExpressAction',
    components: {
      BaseButton
    },
    props: {
      declineText: {
        type: String,
        default: 'Decline'
      },
      acceptText: {
        type: String,
        default: 'Accept'
      }
    },
    emits: ['decline', 'accept'],
    methods: {
      onDecline(): void {
        this.$emit('decline')
      },
      onAccept(): void {
        this.$emit('accept')
      }
    }
  });
  </script>
  
  <style scoped>
  .express-action {
    padding: 0px 29px 0px 10px;
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  
  .button {
    display: flex;
    flex-direction: row;
    gap: 12px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
  }
  
  /* Стили для form-group из предоставленных стилей */
  .form-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
  </style>