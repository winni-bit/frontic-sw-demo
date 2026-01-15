<script setup lang="ts">
/**
 * Shipping Section
 * 
 * Shipping method selection with radio buttons
 */

interface Props {
  isIndustryTheme?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isIndustryTheme: false,
  disabled: false,
})

const {
  shippingMethods,
  selectedShippingMethodId,
  setShippingMethod,
  formatPrice,
} = useCheckout()

const updatingShipping = ref(false)

// Get shipping price from method
const getShippingPrice = (method: ShopwareShippingMethod): number => {
  if (method.prices?.length > 0) {
    const price = method.prices[0]
    if (price.currencyPrice?.length > 0) {
      return price.currencyPrice[0].gross || 0
    }
  }
  return 0
}

// Handle shipping method change
const handleShippingChange = async (methodId: string) => {
  if (updatingShipping.value || props.disabled) return
  
  updatingShipping.value = true
  try {
    await setShippingMethod(methodId)
  } catch (error) {
    console.error('Error setting shipping method:', error)
  } finally {
    updatingShipping.value = false
  }
}

// Theme colors
const themeColors = computed(() => {
  if (props.isIndustryTheme) {
    return {
      cardBg: 'bg-slate-900',
      text: 'text-white',
      textMuted: 'text-slate-400',
      border: 'border-slate-700',
      stepBg: 'bg-blue-600',
      selectedBorder: 'border-blue-500',
      selectedBg: 'bg-slate-800',
      radioColor: 'text-blue-600',
    }
  }
  return {
    cardBg: 'bg-white',
    text: 'text-stone-900',
    textMuted: 'text-stone-500',
    border: 'border-stone-200',
    stepBg: 'bg-stone-900',
    selectedBorder: 'border-stone-900',
    selectedBg: 'bg-stone-50',
    radioColor: 'text-stone-900',
  }
})
</script>

<template>
  <div :class="['p-6 shadow-sm', themeColors.cardBg]">
    <h2 :class="['text-lg font-medium mb-6 flex items-center gap-3', themeColors.text]">
      <span :class="['w-8 h-8 text-white text-sm font-medium rounded-full flex items-center justify-center', themeColors.stepBg]">
        2
      </span>
      Versandart
    </h2>

    <div class="space-y-3">
      <label
        v-for="method in shippingMethods"
        :key="method.id"
        :class="[
          'block p-4 border cursor-pointer transition-all',
          selectedShippingMethodId === method.id
            ? [themeColors.selectedBorder, themeColors.selectedBg]
            : [themeColors.border, 'hover:opacity-80'],
          (disabled || updatingShipping) && 'opacity-50 cursor-not-allowed'
        ]"
      >
        <div class="flex items-start gap-4">
          <div class="pt-0.5">
            <input
              type="radio"
              :value="method.id"
              :checked="selectedShippingMethodId === method.id"
              :disabled="disabled || updatingShipping"
              @change="handleShippingChange(method.id)"
              :class="['w-5 h-5', themeColors.radioColor]"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span :class="['font-medium', themeColors.text]">
                {{ method.translated?.name || method.name }}
              </span>
              <svg 
                v-if="updatingShipping && selectedShippingMethodId === method.id" 
                :class="['w-4 h-4 animate-spin', themeColors.textMuted]" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p v-if="method.deliveryTime" :class="['mt-1 text-sm', themeColors.textMuted]">
              {{ method.deliveryTime.min }}-{{ method.deliveryTime.max }} {{ method.deliveryTime.unit === 'day' ? 'Tage' : method.deliveryTime.unit }}
            </p>
          </div>
          <span :class="['font-medium shrink-0', themeColors.text]">
            {{ getShippingPrice(method) === 0 ? 'Kostenlos' : formatPrice(getShippingPrice(method)) }}
          </span>
        </div>
      </label>
    </div>
  </div>
</template>
