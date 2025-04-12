<!-- src/components/transactions/NumberKeypad.vue -->
<template>
  <div class="keyboard">
    <div class="input">
      <div class="numbers">
        <div class="number-row">
          <div class="number-key" @click="$emit('input', '1')">1</div>
          <div class="number-key" @click="$emit('input', '2')">2</div>
          <div class="number-key" @click="$emit('input', '3')">3</div>
        </div>
        <div class="number-row">
          <div class="number-key" @click="$emit('input', '4')">4</div>
          <div class="number-key" @click="$emit('input', '5')">5</div>
          <div class="number-key" @click="$emit('input', '6')">6</div>
        </div>
        <div class="number-row">
          <div class="number-key" @click="$emit('input', '7')">7</div>
          <div class="number-key" @click="$emit('input', '8')">8</div>
          <div class="number-key" @click="$emit('input', '9')">9</div>
        </div>
        <div class="number-row">
          <div class="number-key" @click="$emit('input', '.')">.</div>
          <div class="number-key" @click="$emit('input', '0')">0</div>
          <div class="number-key" @click="$emit('input', '000')">000</div>
        </div>
      </div>
      
      <div class="button-line">
        <div class="add-button" @click="$emit('add')">
          <div class="add-text">Add</div>
        </div>
        
        <div class="erase-button" @click="$emit('delete')">
          <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M15.255 2.75C14.409 2.75 13.5923 3.06725 12.96 3.641L2.61001 13.181C2.49545 13.2864 2.40401 13.4144 2.34146 13.5569C2.27891 13.6994 2.24661 13.8534 2.24661 14.009C2.24661 14.1646 2.27891 14.3186 2.34146 14.4611C2.40401 14.6036 2.49545 14.7316 2.61001 14.837L12.96 24.377C13.5833 24.9508 14.4 25.268 15.255 25.268H30.375C31.2701 25.268 32.1286 24.9124 32.7615 24.2795C33.3944 23.6465 33.75 22.7881 33.75 21.893V6.143C33.75 5.24789 33.3944 4.38945 32.7615 3.75651C32.1286 3.12358 31.2701 2.768 30.375 2.768H15.255V2.75ZM11.4525 1.98725C12.489 1.03274 13.846 0.501997 15.255 0.5H30.375C31.8669 0.5 33.2976 1.09263 34.3525 2.14752C35.4074 3.20242 36 4.63316 36 6.125V21.875C36 23.3668 35.4074 24.7976 34.3525 25.8525C33.2976 26.9074 31.8669 27.5 30.375 27.5H15.255C13.846 27.498 12.489 26.9673 11.4525 26.0127L1.10251 16.4727C0.759334 16.1559 0.485472 15.7714 0.298165 15.3435C0.110857 14.9156 0.0141602 14.4536 0.0141602 13.9865C0.0141602 13.5194 0.110857 13.0574 0.298165 12.6295C0.485472 12.2016 0.759334 11.8171 1.10251 11.5002L11.4525 1.96025V1.98725Z" fill="#A44942"/>
            <!-- Внедренный крестик X внутри основного SVG -->
            <path d="M22.6624 7.58753C22.4502 7.3826 22.1661 7.26921 21.8711 7.27177C21.5761 7.27433 21.2939 7.39265 21.0854 7.60123C20.8768 7.80982 20.7585 8.09198 20.7559 8.38695C20.7533 8.68192 20.8667 8.9661 21.0717 9.17828L22.9092 11.0158L21.0717 12.8533C20.8667 13.0655 20.7533 13.3496 20.7559 13.6446C20.7585 13.9396 20.8768 14.2217 21.0854 14.4303C21.2939 14.6389 21.5761 14.7572 21.8711 14.7598C22.1661 14.7624 22.4502 14.649 22.6624 14.444L24.4999 12.6065L26.3374 14.444C26.5496 14.649 26.8338 14.7624 27.1287 14.7598C27.4237 14.7572 27.7059 14.6389 27.9145 14.4303C28.123 14.2217 28.2414 13.9396 28.2439 13.6446C28.2465 13.3496 28.1331 13.0655 27.9282 12.8533L26.0907 11.0158L27.9282 9.17828C28.1331 8.9661 28.2465 8.68192 28.2439 8.38695C28.2414 8.09198 28.123 7.80982 27.9145 7.60123C27.7059 7.39265 27.4237 7.27433 27.1287 7.27177C26.8338 7.26921 26.5496 7.3826 26.3374 7.58753L24.4999 9.42503L22.6624 7.58753Z" fill="#A44942"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['input', 'add', 'delete']);
</script>

<style scoped>
.keyboard {
  width: 100%;
  padding: 13px 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.input {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
}

.numbers {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.number-row {
  width: 100%;
  height: 48px;
  padding: 8px 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.number-key {
  color: white;
  font-size: 40px;
  font-weight: 400;
  line-height: 48px;
  cursor: pointer;
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.button-line {
  width: 100%;
  height: 56px;
  padding: 0 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
}

.add-button {
  flex: 1;
  height: 30px;
  padding: 10px;
  background: #53B794;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.add-text {
  color: white;
  font-size: 20px;
  font-weight: 500;
  line-height: 24px;
}

.erase-button {
  width: 36px;
  height: 36px;
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>