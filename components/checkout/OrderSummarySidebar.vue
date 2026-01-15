<script setup lang="ts">
/**
 * OrderSummarySidebar - Bestellübersicht im Checkout
 * Verwendet Sub-Komponenten für einzelne Sektionen
 * ~95 Zeilen
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

// Handlers
const handleQuantityChange = async (itemId: string, newQuantity: number) => {
  if (newQuantity < 1 || updatingItems.value.has(itemId)) return
  updatingItems.value.add(itemId)
  try {
    await updateQuantity(itemId, newQuantity)
  } catch (error) {
    console.error('Error updating quantity:', error)
  } finally {
    updatingItems.value.delete(itemId)
  }
}

const handleRemoveItem = async (itemId: string) => {
  if (updatingItems.value.has(itemId)) return
  updatingItems.value.add(itemId)
  try {
    await removeFromCart(itemId)
  } catch (error) {
    console.error('Error removing item:', error)
  } finally {
    updatingItems.value.delete(itemId)
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
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 :class="['text-lg font-medium', themeColors.text]">Bestellübersicht</h2>
        <span :class="['text-sm', themeColors.textMuted]">{{ lineItems.length }} Artikel</span>
      </div>

      <!-- Free Shipping Progress -->
      <CheckoutSummaryFreeShippingProgress
        v-if="amountToFreeShipping > 0 && shippingCosts > 0"
        :amount="amountToFreeShipping"
        :progress="freeShippingProgress"
        :format-price="formatPrice"
        :theme-colors="themeColors"
      />

      <!-- Cart Items -->
      <div :class="['divide-y mb-6 max-h-80 overflow-y-auto', themeColors.divider]">
        <CheckoutSummaryCartLineItem
          v-for="item in lineItems"
          :key="item.id"
          :item="item"
          :is-updating="updatingItems.has(item.id)"
          :format-price="formatPrice"
          :theme-colors="themeColors"
          @update-quantity="handleQuantityChange(item.id, $event)"
          @remove="handleRemoveItem(item.id)"
        />
      </div>

      <!-- Price Summary -->
      <CheckoutSummaryPriceSummary
        :subtotal="subtotal"
        :shipping-costs="shippingCosts"
        :total-price="totalPrice"
        :taxes="taxes"
        :format-price="formatPrice"
        :theme-colors="themeColors"
      />

      <!-- Legal Notice -->
      <p :class="['text-xs leading-relaxed mt-6', themeColors.textSecondary]">
        Mit Klick auf "Zahlungspflichtig bestellen" bestätigen Sie, dass Sie unsere 
        <a href="#" :class="['underline', isIndustryTheme ? 'hover:text-white' : 'hover:text-stone-600']">AGB</a> und 
        <a href="#" :class="['underline', isIndustryTheme ? 'hover:text-white' : 'hover:text-stone-600']">Datenschutzbestimmungen</a> 
        gelesen haben und diesen zustimmen.
      </p>

      <!-- Place Order Button (Desktop) -->
      <div class="hidden lg:block mt-6">
        <CheckoutSummaryPlaceOrderButton
          :is-processing="isProcessing"
          :is-form-complete="isFormComplete"
          :order-step="orderStep"
          :is-industry-theme="isIndustryTheme"
          :theme-colors="themeColors"
          @click="emit('placeOrder')"
        />
      </div>
    </div>

    <!-- Trust Badges -->
    <CheckoutSummaryTrustBadges :theme-colors="themeColors" />
  </div>
</template>
