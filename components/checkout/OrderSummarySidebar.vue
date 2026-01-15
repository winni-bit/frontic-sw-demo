<script setup lang="ts">
/**
 * Order Summary Sidebar
 * 
 * Sticky sidebar showing:
 * - Free shipping progress
 * - Cart items with quantity controls
 * - Price summary
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

const {
  lineItems,
  taxes,
  subtotal,
  shippingCosts,
  totalPrice,
  amountToFreeShipping,
  freeShippingProgress,
  isFormComplete,
  formatPrice,
  updateQuantity,
  removeFromCart,
} = useCheckout()

const updatingItems = ref<Set<string>>(new Set())

// Get line item image
const getItemImage = (item: ShopwareLineItem) => {
  return item.cover?.url || null
}

// Handle quantity change
const handleQuantityChange = async (item: ShopwareLineItem, newQuantity: number) => {
  if (newQuantity < 1 || updatingItems.value.has(item.id)) return
  
  updatingItems.value.add(item.id)
  
  try {
    await updateQuantity(item.id, newQuantity)
  } catch (error) {
    console.error('Error updating quantity:', error)
  } finally {
    updatingItems.value.delete(item.id)
  }
}

// Handle remove item
const handleRemoveItem = async (item: ShopwareLineItem) => {
  if (updatingItems.value.has(item.id)) return
  
  updatingItems.value.add(item.id)
  
  try {
    await removeFromCart(item.id)
  } catch (error) {
    console.error('Error removing item:', error)
  } finally {
    updatingItems.value.delete(item.id)
  }
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
      divider: 'divide-slate-700',
      itemBg: 'bg-slate-800',
      buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
      buttonDisabled: 'bg-slate-700 text-slate-500',
      success: 'text-green-400',
      progressBg: 'bg-slate-800',
      progressBarBg: 'bg-slate-700',
      progressBar: 'bg-amber-500',
      progressText: 'text-amber-400',
    }
  }
  return {
    cardBg: 'bg-white',
    text: 'text-stone-900',
    textMuted: 'text-stone-500',
    textSecondary: 'text-stone-400',
    border: 'border-stone-200',
    divider: 'divide-stone-100',
    itemBg: 'bg-stone-100',
    buttonPrimary: 'bg-amber-600 hover:bg-amber-700',
    buttonDisabled: 'bg-stone-200 text-stone-400',
    success: 'text-green-600',
    progressBg: 'bg-amber-50',
    progressBarBg: 'bg-amber-200',
    progressBar: 'bg-amber-500',
    progressText: 'text-amber-800',
  }
})
</script>

<template>
  <div class="lg:sticky lg:top-28">
    <div :class="['p-6 shadow-sm', themeColors.cardBg]">
      <div class="flex items-center justify-between mb-6">
        <h2 :class="['text-lg font-medium', themeColors.text]">Bestellübersicht</h2>
        <span :class="['text-sm', themeColors.textMuted]">{{ lineItems.length }} Artikel</span>
      </div>

      <!-- Free Shipping Progress -->
      <div 
        v-if="amountToFreeShipping > 0 && shippingCosts > 0" 
        :class="['mb-6 p-3 rounded-lg', themeColors.progressBg]"
      >
        <div class="flex items-center gap-2 mb-2">
          <svg :class="['w-5 h-5', themeColors.progressText]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span :class="['text-sm font-medium', themeColors.progressText]">
            Noch {{ formatPrice(amountToFreeShipping) }} bis kostenloser Versand!
          </span>
        </div>
        <div :class="['h-2 rounded-full', themeColors.progressBarBg]">
          <div 
            :class="['h-full rounded-full transition-all duration-500', themeColors.progressBar]"
            :style="{ width: `${freeShippingProgress}%` }"
          />
        </div>
      </div>

      <!-- Cart Items -->
      <div :class="['divide-y mb-6 max-h-80 overflow-y-auto', themeColors.divider]">
        <div
          v-for="item in lineItems"
          :key="item.id"
          :class="['py-4 transition-opacity', updatingItems.has(item.id) && 'opacity-50']"
        >
          <div class="flex gap-3">
            <div :class="['w-16 h-16 shrink-0 overflow-hidden', themeColors.itemBg]">
              <img
                v-if="getItemImage(item)"
                :src="getItemImage(item)!"
                :alt="item.label"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg :class="['w-6 h-6', themeColors.textSecondary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p :class="['text-sm line-clamp-2 mb-2', themeColors.text]">{{ item.label }}</p>
              
              <!-- Quantity Controls -->
              <div class="flex items-center gap-2">
                <div :class="['flex items-center border rounded', themeColors.border]">
                  <button
                    @click="handleQuantityChange(item, item.quantity - 1)"
                    :disabled="item.quantity <= 1 || updatingItems.has(item.id)"
                    :class="['w-7 h-7 flex items-center justify-center transition-colors disabled:opacity-30', themeColors.textMuted]"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <span :class="['w-8 text-center text-sm', themeColors.text]">{{ item.quantity }}</span>
                  <button
                    @click="handleQuantityChange(item, item.quantity + 1)"
                    :disabled="updatingItems.has(item.id)"
                    :class="['w-7 h-7 flex items-center justify-center transition-colors disabled:opacity-30', themeColors.textMuted]"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                
                <!-- Remove Button -->
                <button
                  @click="handleRemoveItem(item)"
                  :disabled="updatingItems.has(item.id)"
                  class="text-red-400 hover:text-red-500 transition-colors disabled:opacity-30"
                  title="Entfernen"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <p :class="['text-sm font-medium shrink-0', themeColors.text]">
              {{ formatPrice(item.price.totalPrice) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Price Summary -->
      <div :class="['space-y-3 pt-4 border-t', themeColors.border]">
        <div class="flex justify-between text-sm">
          <span :class="themeColors.textMuted">Zwischensumme</span>
          <span :class="themeColors.text">{{ formatPrice(subtotal) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span :class="themeColors.textMuted">Versandkosten</span>
          <span :class="[themeColors.text, shippingCosts === 0 && themeColors.success]">
            {{ shippingCosts === 0 ? 'Kostenlos' : formatPrice(shippingCosts) }}
          </span>
        </div>
        <div v-for="tax in taxes" :key="tax.taxRate" class="flex justify-between text-sm">
          <span :class="themeColors.textMuted">inkl. {{ tax.taxRate }}% MwSt.</span>
          <span :class="themeColors.text">{{ formatPrice(tax.tax) }}</span>
        </div>
        <div :class="['flex justify-between pt-3 border-t', themeColors.border]">
          <span :class="['text-lg font-medium', themeColors.text]">Gesamtsumme</span>
          <span :class="['text-lg font-medium', themeColors.text]">{{ formatPrice(totalPrice) }}</span>
        </div>
      </div>

      <!-- Legal Notice -->
      <p :class="['text-xs leading-relaxed mt-6', themeColors.textSecondary]">
        Mit Klick auf "Zahlungspflichtig bestellen" bestätigen Sie, dass Sie unsere 
        <a href="#" :class="['underline', isIndustryTheme ? 'hover:text-white' : 'hover:text-stone-600']">AGB</a> und 
        <a href="#" :class="['underline', isIndustryTheme ? 'hover:text-white' : 'hover:text-stone-600']">Datenschutzbestimmungen</a> 
        gelesen haben und diesen zustimmen.
      </p>

      <!-- Place Order Button (Desktop) -->
      <button
        @click="emit('placeOrder')"
        :disabled="isProcessing || !isFormComplete"
        :class="[
          'hidden lg:block w-full mt-6 py-4 text-sm font-medium uppercase tracking-wider transition-all text-white',
          isProcessing || !isFormComplete
            ? themeColors.buttonDisabled + ' cursor-not-allowed'
            : themeColors.buttonPrimary
        ]"
      >
        <span v-if="isProcessing" class="flex items-center justify-center gap-2">
          <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span v-if="orderStep === 'registering'">Daten werden übermittelt...</span>
          <span v-else-if="orderStep === 'placing'">Bestellung wird verarbeitet...</span>
          <span v-else>Bitte warten...</span>
        </span>
        <span v-else>Zahlungspflichtig bestellen</span>
      </button>

      <!-- Form Status Hint -->
      <p 
        v-if="!isFormComplete && !isProcessing" 
        :class="['hidden lg:block mt-2 text-xs text-center', isIndustryTheme ? 'text-amber-400' : 'text-amber-600']"
      >
        Bitte füllen Sie alle Pflichtfelder aus
      </p>
    </div>

    <!-- Trust Badges -->
    <div :class="['mt-4 p-4 shadow-sm', themeColors.cardBg]">
      <div :class="['flex items-center justify-center gap-6', themeColors.textSecondary]">
        <div class="flex items-center gap-2 text-xs">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          SSL-verschlüsselt
        </div>
        <div class="flex items-center gap-2 text-xs">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Käuferschutz
        </div>
      </div>
    </div>
  </div>
</template>
