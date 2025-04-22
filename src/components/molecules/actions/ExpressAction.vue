<!-- src/components/molecules/actions/ExpressAction.vue -->
<template>
  <div class="express-action">
    <div class="button-line">
      <div class="decline" @click="onDecline">
        <div class="declire">{{ declineText }}</div>
      </div>
      <div class="view" @click="onView">
        <div class="declire2">{{ viewText }}</div>
      </div>
      <div class="accept" @click="onAccept">
        <div class="acccept">{{ acceptText }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ExpressAction',
  props: {
    declineText: {
      type: String,
      default: 'Decline'
    },
    viewText: {
      type: String,
      default: 'View'
    },
    acceptText: {
      type: String,
      default: 'Accept'
    }
  },
  emits: ['decline', 'view', 'accept'],
  setup(props, { emit }) {
    const onDecline = () => {
      emit('decline');
    };
    
    const onView = () => {
      emit('view');
    };
    
    const onAccept = () => {
      emit('accept');
    };
    
    return {
      onDecline,
      onView,
      onAccept
    };
  }
});
</script>

<style scoped>
.express-action {
  padding: 0px 8px 0px 0px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  height: 20px;
  position: relative;
}

.button-line {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.decline {
  border-radius: 34px;
  border-style: dashed;
  border-color: var(--maincolor-colorwarrning, #a44942);
  border-width: 1px;
  padding: 4px 8px 4px 8px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
}

.declire {
  color: var(--maincolor-colorwarrning, #a44942);
  text-align: left;
  font-family: var(--ensupersmall-font-family, "Inter-Regular", sans-serif);
  font-size: var(--ensupersmall-font-size, 10px);
  line-height: var(--ensupersmall-line-height, 12px);
  font-weight: var(--ensupersmall-font-weight, 400);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.view {
  background: var(--maincolor-colorneutral, #dbdadd);
  border-radius: 34px;
  padding: 4px 8px 4px 8px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
}

.declire2 {
  color: var(--text-textgrey, #949496);
  text-align: left;
  font-family: var(--ensupersmall-font-family, "Inter-Regular", sans-serif);
  font-size: var(--ensupersmall-font-size, 10px);
  line-height: var(--ensupersmall-line-height, 12px);
  font-weight: var(--ensupersmall-font-weight, 400);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.accept {
  background: var(--maincolor-colorsucces, #53b794);
  border-radius: 34px;
  padding: 4px 8px 4px 8px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
}

.acccept {
  color: var(--text-textcontrast, #ffffff);
  text-align: left;
  font-family: var(--ensupersmall-font-family, "Inter-Regular", sans-serif);
  font-size: var(--ensupersmall-font-size, 10px);
  line-height: var(--ensupersmall-line-height, 12px);
  font-weight: var(--ensupersmall-font-weight, 400);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>