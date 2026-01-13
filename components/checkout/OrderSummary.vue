<script setup lang="ts">
/**
 * Order Summary Component
 * 
 * Displays final order overview:
 * - Cart items with images
 * - Subtotal, shipping, total
 * - Selected shipping & payment methods
 * - Place order button
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
  placeOrder: []
}>()

const {
  cart,
  subtotal,
  shippingCosts,
  totalPrice,
  selectedShippingMethod,
  selectedPaymentMethod,
  loading: cartLoading,
} = useShopwareCart()

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

// Get line item image
const getItemImage = (item: ShopwareLineItem) => {
  return item.cover?.url || null
}

// Handle place order
const handlePlaceOrder = () => {
  emit('placeOrder')
}

// Computed
const lineItems = computed(() => cart.value?.lineItems || [])
const taxes = computed(() => cart.value?.price?.calculatedTaxes || [])
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-lg font-medium text-stone-900">Bestellübersicht</h2>

    <!-- Cart Items -->
    <div class="divide-y divide-stone-100">
      <div
        v-for="item in lineItems"
        :key="item.id"
        class="py-4 flex gap-4"
      >
        <!-- Product Image -->
        <div class="w-20 h-20 bg-stone-100 shrink-0 overflow-hidden">
          <img
            v-if="getItemImage(item)"
            :src="getItemImage(item)!"
            :alt="item.label"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg class="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>

        <!-- Product Info -->
        <div class="flex-1 min-w-0">
          <h3 class="font-medium text-stone-900 line-clamp-2">{{ item.label }}</h3>
          
          <!-- Variant Options -->
          <div v-if="item.payload?.options?.length" class="mt-1 flex flex-wrap gap-2">
            <span
              v-for="option in item.payload.options"
              :key="`${option.group}-${option.option}`"
              class="text-xs text-stone-500"
            >
              {{ option.group }}: {{ option.option }}
            </span>
          </div>

          <p class="mt-1 text-sm text-stone-500">Menge: {{ item.quantity }}</p>
        </div>

        <!-- Price -->
        <div class="text-right shrink-0">
          <p class="font-medium text-stone-900">
            {{ formatPrice(item.price.totalPrice) }}
          </p>
          <p v-if="item.quantity > 1" class="text-sm text-stone-500">
            {{ formatPrice(item.price.unitPrice) }} / Stück
          </p>
        </div>
      </div>
    </div>

    <!-- Selected Methods -->
    <div class="space-y-3 pt-4 border-t border-stone-200">
      <!-- Shipping Method -->
      <div v-if="selectedShippingMethod" class="flex justify-between text-sm">
        <span class="text-stone-500">Versandart</span>
        <span class="text-stone-900">
          {{ selectedShippingMethod.translated?.name || selectedShippingMethod.name }}
        </span>
      </div>

      <!-- Payment Method -->
      <div v-if="selectedPaymentMethod" class="flex justify-between text-sm">
        <span class="text-stone-500">Zahlungsart</span>
        <span class="text-stone-900">
          {{ selectedPaymentMethod.translated?.name || selectedPaymentMethod.name }}
        </span>
      </div>
    </div>

    <!-- Price Summary -->
    <div class="space-y-3 pt-4 border-t border-stone-200">
      <!-- Subtotal -->
      <div class="flex justify-between text-sm">
        <span class="text-stone-500">Zwischensumme</span>
        <span class="text-stone-900">{{ formatPrice(subtotal) }}</span>
      </div>

      <!-- Shipping -->
      <div class="flex justify-between text-sm">
        <span class="text-stone-500">Versandkosten</span>
        <span class="text-stone-900">
          {{ shippingCosts === 0 ? 'Kostenlos' : formatPrice(shippingCosts) }}
        </span>
      </div>

      <!-- Taxes -->
      <div v-for="tax in taxes" :key="tax.taxRate" class="flex justify-between text-sm">
        <span class="text-stone-500">inkl. {{ tax.taxRate }}% MwSt.</span>
        <span class="text-stone-900">{{ formatPrice(tax.tax) }}</span>
      </div>

      <!-- Total -->
      <div class="flex justify-between pt-3 border-t border-stone-200">
        <span class="text-lg font-medium text-stone-900">Gesamtsumme</span>
        <span class="text-lg font-medium text-stone-900">{{ formatPrice(totalPrice) }}</span>
      </div>
    </div>

    <!-- Legal Notice -->
    <p class="text-xs text-stone-400 leading-relaxed">
      Mit Klick auf "Zahlungspflichtig bestellen" bestätigen Sie, dass Sie unsere 
      <a href="#" class="underline hover:text-stone-600">AGB</a> und 
      <a href="#" class="underline hover:text-stone-600">Datenschutzbestimmungen</a> 
      gelesen haben und diesen zustimmen.
    </p>

    <!-- Place Order Button -->
    <button
      @click="handlePlaceOrder"
      :disabled="loading || disabled || cartLoading || lineItems.length === 0"
      :class="[
        'w-full py-4 text-sm font-medium uppercase tracking-wider transition-all',
        loading || disabled || cartLoading || lineItems.length === 0
          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
          : 'bg-stone-900 text-white hover:bg-stone-800'
      ]"
    >
      <span v-if="loading" class="flex items-center justify-center gap-2">
        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Bestellung wird verarbeitet...
      </span>
      <span v-else>Zahlungspflichtig bestellen</span>
    </button>
  </div>
</template>
