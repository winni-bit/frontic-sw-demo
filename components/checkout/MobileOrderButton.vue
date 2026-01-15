<script setup lang="ts">
/**
 * Mobile Order Button
 * 
 * Sticky bottom bar for mobile with:
 * - Total price
 * - Place order button
 */

interface Props {
  isIndustryTheme?: boolean
  isProcessing?: boolean
  orderStep?: 'idle' | 'registering' | 'placing'
}

const props = withDefaults(defineProps<Props>(), {
  isIndustryTheme: false,
  isProcessing: false,
  orderStep: 'idle',
})

const emit = defineEmits<{
  placeOrder: []
}>()

const { totalPrice, isFormComplete, formatPrice } = useCheckout()

// Theme colors
const themeColors = computed(() => {
  if (props.isIndustryTheme) {
    return {
      bg: 'bg-slate-900',
      border: 'border-slate-700',
      text: 'text-white',
      textMuted: 'text-slate-400',
      buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
      buttonDisabled: 'bg-slate-700 text-slate-500',
    }
  }
  return {
    bg: 'bg-white',
    border: 'border-stone-200',
    text: 'text-stone-900',
    textMuted: 'text-stone-500',
    buttonPrimary: 'bg-amber-600 hover:bg-amber-700',
    buttonDisabled: 'bg-stone-200 text-stone-400',
  }
})
</script>

<template>
  <!-- Mobile Sticky Footer -->
  <div :class="['lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg', themeColors.bg, themeColors.border]">
    <div class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between gap-4">
        <!-- Price -->
        <div>
          <p :class="['text-xs', themeColors.textMuted]">Gesamtsumme</p>
          <p :class="['text-lg font-medium', themeColors.text]">{{ formatPrice(totalPrice) }}</p>
        </div>
        
        <!-- Order Button -->
        <button
          @click="emit('placeOrder')"
          :disabled="isProcessing || !isFormComplete"
          :class="[
            'flex-1 max-w-xs py-3 text-sm font-medium uppercase tracking-wider transition-all text-white',
            isProcessing || !isFormComplete
              ? themeColors.buttonDisabled + ' cursor-not-allowed'
              : themeColors.buttonPrimary
          ]"
        >
          <span v-if="isProcessing" class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span v-if="orderStep === 'registering'">Übermitteln...</span>
            <span v-else-if="orderStep === 'placing'">Verarbeiten...</span>
            <span v-else>Bitte warten...</span>
          </span>
          <span v-else>Jetzt bestellen</span>
        </button>
      </div>
    </div>
  </div>
</template>
