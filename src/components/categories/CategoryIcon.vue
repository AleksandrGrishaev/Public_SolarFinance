<!-- src/components/categories/CategoryIcon.vue -->
<template>
  <div 
    class="category-icon"
    :class="[size]"
    :style="{ 'background-color': backgroundColor || 'white' }"
  >
    <component 
      v-if="iconComponent" 
      :is="iconComponent" 
      class="icon"
      :style="{ color: iconColor || '#404040' }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  IconTool, 
  IconBread, 
  IconCar, 
  IconDeviceTv, 
  IconHome, 
  IconHeartbeat,
  IconBook, 
  IconShoppingCart,
  IconPigMoney,
  IconBuildingBank,
  IconBriefcase,
  IconDeviceGamepad,
  IconGift,
  IconPlane
} from '@tabler/icons-vue';

const props = defineProps({
  iconName: {
    type: String,
    default: ''
  },
  backgroundColor: {
    type: String,
    default: 'white'
  },
  iconColor: {
    type: String,
    default: '#404040'
  },
  size: {
    type: String,
    default: 'medium' // 'xsmall', 'small', 'medium', 'large'
  }
});

const iconMap = {
  'IconTool': IconTool,
  'IconBread': IconBread,
  'IconCar': IconCar,
  'IconDeviceTv': IconDeviceTv,
  'IconHome': IconHome,
  'IconHeartbeat': IconHeartbeat,
  'IconBook': IconBook,
  'IconShoppingCart': IconShoppingCart,
  'IconPigMoney': IconPigMoney,
  'IconBuildingBank': IconBuildingBank,
  'IconBriefcase': IconBriefcase,
  'IconDeviceGamepad': IconDeviceGamepad,
  'IconGift': IconGift,
  'IconPlane': IconPlane
};

const iconComponent = computed(() => {
  return iconMap[props.iconName] || null;
});
</script>

<style scoped>
.category-icon {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon {
  width: 28px;
  height: 28px;
}

/* Size variants */
.category-icon.xsmall {
  width: 30px;
  height: 30px;
  border-radius: 15px;
}

.category-icon.xsmall .icon {
  width: 16px;
  height: 16px;
}

.category-icon.small {
  width: 40px;
  height: 40px;
  border-radius: 20px;
}

.category-icon.small .icon {
  width: 22px;
  height: 22px;
}

.category-icon.large {
  width: 80px;
  height: 80px;
  border-radius: 40px;
}

.category-icon.large .icon {
  width: 48px;
  height: 48px;
}
</style>