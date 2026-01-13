<script setup lang="ts">
/**
 * Payment Method Selection Component
 * 
 * Displays available payment methods with:
 * - Radio button selection
 * - Payment method icons
 * - Description
 */

interface Props {
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  select: [methodId: string]
  continue: []
}>()

const {
  paymentMethods,
  selectedPaymentMethod,
  fetchPaymentMethods,
  setPaymentMethod,
} = useShopwareCart()

const selectedId = ref<string>('')
const isLoading = ref(true)
const isUpdating = ref(false)

// Payment method icon mapping
const getPaymentIcon = (method: ShopwarePaymentMethod) => {
  const technicalName = method.technicalName?.toLowerCase() || ''
  const name = method.name?.toLowerCase() || ''
  
  // Check for common payment methods
  if (technicalName.includes('paypal') || name.includes('paypal')) {
    return 'paypal'
  }
  if (technicalName.includes('credit') || technicalName.includes('card') || name.includes('kreditkarte')) {
    return 'card'
  }
  if (technicalName.includes('invoice') || name.includes('rechnung') || name.includes('invoice')) {
    return 'invoice'
  }
  if (technicalName.includes('prepayment') || name.includes('vorkasse')) {
    return 'prepayment'
  }
  if (technicalName.includes('cash') || name.includes('nachnahme') || name.includes('cash')) {
    return 'cash'
  }
  if (technicalName.includes('sepa') || name.includes('lastschrift') || name.includes('sepa')) {
    return 'sepa'
  }
  if (technicalName.includes('klarna') || name.includes('klarna')) {
    return 'klarna'
  }
  
  return 'default'
}

// Handle selection change
const handleSelect = async (methodId: string) => {
  if (isUpdating.value || props.disabled) return
  
  selectedId.value = methodId
  isUpdating.value = true
  
  try {
    await setPaymentMethod(methodId)
    emit('select', methodId)
  } catch (error) {
    console.error('Error setting payment method:', error)
  } finally {
    isUpdating.value = false
  }
}

// Handle continue
const handleContinue = () => {
  if (selectedId.value) {
    emit('continue')
  }
}

// Load payment methods
onMounted(async () => {
  try {
    await fetchPaymentMethods()
    
    // Set initial selection
    if (selectedPaymentMethod.value) {
      selectedId.value = selectedPaymentMethod.value.id
    } else if (paymentMethods.value.length > 0) {
      selectedId.value = paymentMethods.value[0].id
      await setPaymentMethod(selectedId.value)
    }
  } catch (error) {
    console.error('Error loading payment methods:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-lg font-medium text-stone-900">Zahlungsart</h2>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="p-4 border border-stone-200">
        <div class="flex items-start gap-4">
          <div class="w-5 h-5 rounded-full bg-stone-100 animate-pulse" />
          <div class="w-10 h-10 bg-stone-100 animate-pulse rounded" />
          <div class="flex-1 space-y-2">
            <div class="h-5 bg-stone-100 animate-pulse rounded w-1/3" />
            <div class="h-4 bg-stone-100 animate-pulse rounded w-2/3" />
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Methods -->
    <div v-else-if="paymentMethods.length > 0" class="space-y-3">
      <label
        v-for="method in paymentMethods"
        :key="method.id"
        :class="[
          'block p-4 border cursor-pointer transition-all',
          selectedId === method.id
            ? 'border-stone-900 bg-stone-50'
            : 'border-stone-200 hover:border-stone-300',
          (disabled || isUpdating) && 'opacity-50 cursor-not-allowed'
        ]"
      >
        <div class="flex items-start gap-4">
          <!-- Radio Button -->
          <div class="pt-2">
            <input
              type="radio"
              :value="method.id"
              :checked="selectedId === method.id"
              :disabled="disabled || isUpdating"
              @change="handleSelect(method.id)"
              class="w-5 h-5 text-stone-900 border-stone-300 focus:ring-stone-900 focus:ring-offset-0"
            />
          </div>

          <!-- Payment Icon -->
          <div class="w-12 h-12 flex items-center justify-center bg-stone-100 rounded shrink-0">
            <!-- PayPal -->
            <svg v-if="getPaymentIcon(method) === 'paypal'" class="w-8 h-8 text-[#003087]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.23c-.412 0-.764.312-.832.74l-1.322 8.266z"/>
            </svg>

            <!-- Credit Card -->
            <svg v-else-if="getPaymentIcon(method) === 'card'" class="w-8 h-8 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>

            <!-- Invoice -->
            <svg v-else-if="getPaymentIcon(method) === 'invoice'" class="w-8 h-8 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>

            <!-- Prepayment -->
            <svg v-else-if="getPaymentIcon(method) === 'prepayment'" class="w-8 h-8 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>

            <!-- Cash on Delivery -->
            <svg v-else-if="getPaymentIcon(method) === 'cash'" class="w-8 h-8 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>

            <!-- SEPA -->
            <svg v-else-if="getPaymentIcon(method) === 'sepa'" class="w-8 h-8 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>

            <!-- Klarna -->
            <svg v-else-if="getPaymentIcon(method) === 'klarna'" class="w-8 h-8 text-[#FFB3C7]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.592 2H0v20h4.592V2zm11.46 0H9.14c0 4.194-1.678 8.2-4.592 11.318V22h4.592V2h6.912z"/>
              <circle cx="18" cy="18" r="3"/>
            </svg>

            <!-- Default -->
            <svg v-else class="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <!-- Method Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-stone-900">
                {{ method.translated?.name || method.name }}
              </span>
              <span 
                v-if="isUpdating && selectedId === method.id" 
                class="inline-flex items-center"
              >
                <svg class="w-4 h-4 animate-spin text-stone-400" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </span>
            </div>
            
            <!-- Description -->
            <p 
              v-if="method.translated?.description || method.description" 
              class="mt-1 text-sm text-stone-500 line-clamp-2"
            >
              {{ method.translated?.description || method.description }}
            </p>
          </div>
        </div>
      </label>
    </div>

    <!-- No Methods Available -->
    <div v-else class="p-6 bg-stone-50 text-center">
      <p class="text-stone-500">Keine Zahlungsarten verfügbar</p>
    </div>

    <!-- Continue Button -->
    <button
      v-if="paymentMethods.length > 0"
      @click="handleContinue"
      :disabled="!selectedId || loading || disabled || isUpdating"
      :class="[
        'w-full py-4 text-sm font-medium uppercase tracking-wider transition-all',
        !selectedId || loading || disabled || isUpdating
          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
          : 'bg-stone-900 text-white hover:bg-stone-800'
      ]"
    >
      Weiter zur Bestellübersicht
    </button>
  </div>
</template>
