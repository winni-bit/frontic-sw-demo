<script setup lang="ts">
/**
 * Payment Section
 * 
 * Payment method selection with radio buttons and icons
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
  paymentMethods,
  selectedPaymentMethodId,
  setPaymentMethod,
} = useCheckout()

const updatingPayment = ref(false)

// Handle payment method change
const handlePaymentChange = async (methodId: string) => {
  if (updatingPayment.value || props.disabled) return
  
  updatingPayment.value = true
  try {
    await setPaymentMethod(methodId)
  } catch (error) {
    console.error('Error setting payment method:', error)
  } finally {
    updatingPayment.value = false
  }
}

// Payment method icon mapping
const getPaymentIcon = (method: ShopwarePaymentMethod) => {
  const technicalName = method.technicalName?.toLowerCase() || ''
  const name = method.name?.toLowerCase() || ''
  
  if (technicalName.includes('paypal') || name.includes('paypal')) return 'paypal'
  if (technicalName.includes('credit') || technicalName.includes('card') || name.includes('kreditkarte')) return 'card'
  if (technicalName.includes('invoice') || name.includes('rechnung')) return 'invoice'
  if (technicalName.includes('prepayment') || name.includes('vorkasse')) return 'prepayment'
  if (technicalName.includes('cash') || name.includes('nachnahme')) return 'cash'
  if (technicalName.includes('sepa') || name.includes('lastschrift')) return 'sepa'
  
  return 'default'
}

// Theme colors
const themeColors = computed(() => {
  if (props.isIndustryTheme) {
    return {
      cardBg: 'bg-slate-900',
      text: 'text-white',
      textMuted: 'text-slate-400',
      textSecondary: 'text-slate-500',
      border: 'border-slate-700',
      stepBg: 'bg-blue-600',
      selectedBorder: 'border-blue-500',
      selectedBg: 'bg-slate-800',
      iconBg: 'bg-slate-800',
      radioColor: 'text-blue-600',
    }
  }
  return {
    cardBg: 'bg-white',
    text: 'text-stone-900',
    textMuted: 'text-stone-500',
    textSecondary: 'text-stone-400',
    border: 'border-stone-200',
    stepBg: 'bg-stone-900',
    selectedBorder: 'border-stone-900',
    selectedBg: 'bg-stone-50',
    iconBg: 'bg-stone-100',
    radioColor: 'text-stone-900',
  }
})
</script>

<template>
  <div :class="['p-6 shadow-sm', themeColors.cardBg]">
    <h2 :class="['text-lg font-medium mb-6 flex items-center gap-3', themeColors.text]">
      <span :class="['w-8 h-8 text-white text-sm font-medium rounded-full flex items-center justify-center', themeColors.stepBg]">
        3
      </span>
      Zahlungsart
    </h2>

    <div class="space-y-3">
      <label
        v-for="method in paymentMethods"
        :key="method.id"
        :class="[
          'block p-4 border cursor-pointer transition-all',
          selectedPaymentMethodId === method.id
            ? [themeColors.selectedBorder, themeColors.selectedBg]
            : [themeColors.border, 'hover:opacity-80'],
          (disabled || updatingPayment) && 'opacity-50 cursor-not-allowed'
        ]"
      >
        <div class="flex items-start gap-4">
          <div class="pt-2">
            <input
              type="radio"
              :value="method.id"
              :checked="selectedPaymentMethodId === method.id"
              :disabled="disabled || updatingPayment"
              @change="handlePaymentChange(method.id)"
              :class="['w-5 h-5', themeColors.radioColor]"
            />
          </div>
          
          <div :class="['w-12 h-12 flex items-center justify-center rounded shrink-0', themeColors.iconBg]">
            <!-- PayPal -->
            <svg v-if="getPaymentIcon(method) === 'paypal'" class="w-8 h-8 text-[#003087]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.23c-.412 0-.764.312-.832.74l-1.322 8.266z"/>
            </svg>
            <!-- Credit Card -->
            <svg v-else-if="getPaymentIcon(method) === 'card'" :class="['w-8 h-8', themeColors.textMuted]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <!-- Invoice -->
            <svg v-else-if="getPaymentIcon(method) === 'invoice'" :class="['w-8 h-8', themeColors.textMuted]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <!-- Prepayment -->
            <svg v-else-if="getPaymentIcon(method) === 'prepayment'" :class="['w-8 h-8', themeColors.textMuted]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <!-- Default -->
            <svg v-else :class="['w-8 h-8', themeColors.textSecondary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span :class="['font-medium', themeColors.text]">
                {{ method.translated?.name || method.name }}
              </span>
              <svg 
                v-if="updatingPayment && selectedPaymentMethodId === method.id" 
                :class="['w-4 h-4 animate-spin', themeColors.textMuted]" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p v-if="method.translated?.description || method.description" :class="['mt-1 text-sm line-clamp-1', themeColors.textMuted]">
              {{ method.translated?.description || method.description }}
            </p>
          </div>
        </div>
      </label>
    </div>
  </div>
</template>
