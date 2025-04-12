<!-- /Users/peaker/dev/solar-finance/src/components/transactions/NumberKeypad.vue -->
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
            </svg>
            <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.66241 0.587529C2.45023 0.382601 2.16606 0.269208 1.87108 0.271771C1.57611 0.274334 1.29395 0.392649 1.08536 0.601233C0.87678 0.809817 0.758465 1.09198 0.755902 1.38695C0.753339 1.68192 0.866732 1.9661 1.07166 2.17828L5.90916 7.01578L1.07166 11.8533C0.866732 12.0655 0.753339 12.3496 0.755902 12.6446C0.758465 12.9396 0.87678 13.2217 1.08536 13.4303C1.29395 13.6389 1.57611 13.7572 1.87108 13.7598C2.16606 13.7624 2.45023 13.649 2.66241 13.444L7.49991 8.60653L12.3374 13.444C12.5496 13.649 12.8338 13.7624 13.1287 13.7598C13.4237 13.7572 13.7059 13.6389 13.9145 13.4303C14.123 13.2217 14.2414 12.9396 14.2439 12.6446C14.2465 12.3496 14.1331 12.0655 13.9282 11.8533L9.09066 7.01578L13.9282 2.17828C14.1331 1.9661 14.2465 1.68192 14.2439 1.38695C14.2414 1.09198 14.123 0.809817 13.9145 0.601233C13.7059 0.392649 13.4237 0.274334 13.1287 0.271771C12.8338 0.269208 12.5496 0.382601 12.3374 0.587529L7.49991 5.42503L2.66241 0.587529Z" fill="#A44942"/>
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
    overflow: hidden;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  </style>