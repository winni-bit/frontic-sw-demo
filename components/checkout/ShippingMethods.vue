<script setup lang="ts">
/**
 * Shipping Method Selection Component
 * 
 * Displays available shipping methods with:
 * - Radio button selection
 * - Delivery time information
 * - Shipping costs
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
  shippingMethods,
  selectedShippingMethod,
  fetchShippingMethods,
  setShippingMethod,
  loading: cartLoading,
} = useShopwareCart()

const selectedId = ref<string>('')
const isLoading = ref(true)
const isUpdating = ref(false)

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

// Get shipping price from method
const getShippingPrice = (method: ShopwareShippingMethod): number => {
  // Try to get price from prices array
  if (method.prices?.length > 0) {
    const price = method.prices[0]
    if (price.currencyPrice?.length > 0) {
      return price.currencyPrice[0].gross || 0
    }
  }
  return 0
}

// Handle selection change
const handleSelect = async (methodId: string) => {
  if (isUpdating.value || props.disabled) return
  
  selectedId.value = methodId
  isUpdating.value = true
  
  try {
    await setShippingMethod(methodId)
    emit('select', methodId)
  } catch (error) {
    console.error('Error setting shipping method:', error)
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

// Load shipping methods
onMounted(async () => {
  try {
    await fetchShippingMethods()
    
    // Set initial selection
    if (selectedShippingMethod.value) {
      selectedId.value = selectedShippingMethod.value.id
    } else if (shippingMethods.value.length > 0) {
      selectedId.value = shippingMethods.value[0].id
      await setShippingMethod(selectedId.value)
    }
  } catch (error) {
    console.error('Error loading shipping methods:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-lg font-medium text-stone-900">Versandart</h2>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="p-4 border border-stone-200">
        <div class="flex items-start gap-4">
          <div class="w-5 h-5 rounded-full bg-stone-100 animate-pulse" />
          <div class="flex-1 space-y-2">
            <div class="h-5 bg-stone-100 animate-pulse rounded w-1/3" />
            <div class="h-4 bg-stone-100 animate-pulse rounded w-2/3" />
          </div>
          <div class="h-5 bg-stone-100 animate-pulse rounded w-16" />
        </div>
      </div>
    </div>

    <!-- Shipping Methods -->
    <div v-else-if="shippingMethods.length > 0" class="space-y-3">
      <label
        v-for="method in shippingMethods"
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
          <div class="pt-0.5">
            <input
              type="radio"
              :value="method.id"
              :checked="selectedId === method.id"
              :disabled="disabled || isUpdating"
              @change="handleSelect(method.id)"
              class="w-5 h-5 text-stone-900 border-stone-300 focus:ring-stone-900 focus:ring-offset-0"
            />
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
              class="mt-1 text-sm text-stone-500"
            >
              {{ method.translated?.description || method.description }}
            </p>

            <!-- Delivery Time -->
            <p v-if="method.deliveryTime" class="mt-1 text-sm text-stone-500">
              Lieferzeit: {{ method.deliveryTime.min }}-{{ method.deliveryTime.max }} {{ method.deliveryTime.unit === 'day' ? 'Tage' : method.deliveryTime.unit }}
            </p>
          </div>

          <!-- Price -->
          <div class="text-right">
            <span class="font-medium text-stone-900">
              {{ getShippingPrice(method) === 0 ? 'Kostenlos' : formatPrice(getShippingPrice(method)) }}
            </span>
          </div>
        </div>
      </label>
    </div>

    <!-- No Methods Available -->
    <div v-else class="p-6 bg-stone-50 text-center">
      <p class="text-stone-500">Keine Versandarten verfügbar</p>
    </div>

    <!-- Continue Button -->
    <button
      v-if="shippingMethods.length > 0"
      @click="handleContinue"
      :disabled="!selectedId || loading || disabled || isUpdating"
      :class="[
        'w-full py-4 text-sm font-medium uppercase tracking-wider transition-all',
        !selectedId || loading || disabled || isUpdating
          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
          : 'bg-stone-900 text-white hover:bg-stone-800'
      ]"
    >
      Weiter zur Zahlungsart
    </button>
  </div>
</template>
