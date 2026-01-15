<script setup lang="ts">
/**
 * PlaceOrderButton - Button zum Abschließen der Bestellung
 * ~60 Zeilen
 */

interface Props {
  isProcessing: boolean
  isFormComplete: boolean
  orderStep: 'idle' | 'registering' | 'placing'
  isIndustryTheme?: boolean
  themeColors: {
    buttonPrimary: string
    buttonDisabled: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  isIndustryTheme: false
})

const emit = defineEmits<{
  click: []
}>()

const buttonClasses = computed(() => {
  const base = 'w-full py-4 text-sm font-medium uppercase tracking-wider transition-all text-white'
  if (props.isProcessing || !props.isFormComplete) {
    return `${base} ${props.themeColors.buttonDisabled} cursor-not-allowed`
  }
  return `${base} ${props.themeColors.buttonPrimary}`
})

const statusText = computed(() => {
  if (props.orderStep === 'registering') return 'Daten werden übermittelt...'
  if (props.orderStep === 'placing') return 'Bestellung wird verarbeitet...'
  return 'Bitte warten...'
})
</script>

<template>
  <div>
    <button
      @click="emit('click')"
      :disabled="isProcessing || !isFormComplete"
      :class="buttonClasses"
    >
      <span v-if="isProcessing" class="flex items-center justify-center gap-2">
        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>{{ statusText }}</span>
      </span>
      <span v-else>Zahlungspflichtig bestellen</span>
    </button>

    <!-- Form Status Hint -->
    <p 
      v-if="!isFormComplete && !isProcessing" 
      :class="['mt-2 text-xs text-center', isIndustryTheme ? 'text-amber-400' : 'text-amber-600']"
    >
      Bitte füllen Sie alle Pflichtfelder aus
    </p>
  </div>
</template>
