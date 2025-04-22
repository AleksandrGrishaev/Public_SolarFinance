<template>
    <div class="notification">
      <InfoBlock 
        :iconSrc="iconSrc" 
        :iconAlt="iconAlt"
        :title="title"
        :notes="notes"
        :description="description"
      />
      
      <ExpressAction
        :declineText="declineText"
        :acceptText="acceptText"
        @decline="onDecline"
        @accept="onAccept"
      />
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import { InfoBlock } from '../../molecules/information';
  import { ExpressAction } from '../../molecules/actions';
  
  export default defineComponent({
    name: 'NotificationCard',
    components: {
      InfoBlock,
      ExpressAction
    },
    props: {
      iconSrc: {
        type: String,
        default: 'icon-box0.svg'
      },
      iconAlt: {
        type: String,
        default: 'Notification icon'
      },
      title: {
        type: String,
        default: 'New debt'
      },
      notes: {
        type: String,
        default: 'Notes: family expense'
      },
      description: {
        type: String,
        default: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
      },
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
  .notification,
  .notification * {
    box-sizing: border-box;
  }
  
  .notification {
    background: var(--bg-popup, var(--text-subheader, #444444));
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-sm) 0px var(--spacing-sm) 0px;
    display: flex;
    flex-direction: column;
    gap: 0px;
    align-items: flex-start;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
  }
  </style>