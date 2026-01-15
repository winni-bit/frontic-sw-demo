<script setup lang="ts">
/**
 * Checkout Customer Info
 * Shows logged-in customer information with option to use different address
 */

const props = defineProps<{
  isIndustryTheme: boolean
}>()

const emit = defineEmits<{
  (e: 'use-different-address'): void
  (e: 'logout'): void
}>()

const { customer, customerName, customerEmail, logout } = useShopwareAuth()

const themeColors = computed(() => {
  if (props.isIndustryTheme) {
    return {
      cardBg: 'bg-slate-900',
      text: 'text-white',
      textMuted: 'text-slate-400',
      border: 'border-slate-700',
      success: 'text-green-400',
      successBg: 'bg-green-900/30',
      successBorder: 'border-green-700',
    }
  }
  return {
    cardBg: 'bg-white',
    text: 'text-stone-900',
    textMuted: 'text-stone-500',
    border: 'border-stone-200',
    success: 'text-green-600',
    successBg: 'bg-green-50',
    successBorder: 'border-green-200',
  }
})

// Get default billing address
const billingAddress = computed(() => {
  return customer.value?.defaultBillingAddress || customer.value?.activeBillingAddress
})

// Get default shipping address
const shippingAddress = computed(() => {
  return customer.value?.defaultShippingAddress || customer.value?.activeShippingAddress
})

// Format address for display
const formatAddress = (address: any) => {
  if (!address) return null
  const parts = [
    address.street,
    `${address.zipcode} ${address.city}`,
    address.country?.translated?.name || address.country?.name
  ].filter(Boolean)
  return parts.join(', ')
}

const handleLogout = async () => {
  await logout()
  emit('logout')
}
</script>

<template>
  <div :class="['p-6 shadow-sm mb-6', themeColors.successBg, themeColors.successBorder, 'border']">
    <!-- Header with success indicator -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div :class="['w-10 h-10 rounded-full flex items-center justify-center', isIndustryTheme ? 'bg-green-900' : 'bg-green-100']">
          <svg :class="['w-5 h-5', themeColors.success]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 :class="['text-lg font-medium', themeColors.text]">
            Angemeldet als
          </h2>
          <p :class="['text-sm', themeColors.textMuted]">
            {{ customerName || customerEmail }}
          </p>
        </div>
      </div>
      <button
        @click="handleLogout"
        :class="['text-sm underline', themeColors.textMuted]"
      >
        Abmelden
      </button>
    </div>

    <!-- Customer Details -->
    <div class="grid md:grid-cols-2 gap-4">
      <!-- Billing Address -->
      <div v-if="billingAddress" :class="['p-4 rounded', isIndustryTheme ? 'bg-slate-800' : 'bg-white']">
        <h3 :class="['text-sm font-medium mb-2', themeColors.text]">Rechnungsadresse</h3>
        <p :class="['text-sm', themeColors.textMuted]">
          {{ billingAddress.firstName }} {{ billingAddress.lastName }}<br>
          {{ billingAddress.street }}<br>
          {{ billingAddress.zipcode }} {{ billingAddress.city }}<br>
          <span v-if="billingAddress.country">
            {{ billingAddress.country.translated?.name || billingAddress.country.name }}
          </span>
        </p>
      </div>

      <!-- Shipping Address -->
      <div v-if="shippingAddress" :class="['p-4 rounded', isIndustryTheme ? 'bg-slate-800' : 'bg-white']">
        <h3 :class="['text-sm font-medium mb-2', themeColors.text]">Lieferadresse</h3>
        <p :class="['text-sm', themeColors.textMuted]">
          {{ shippingAddress.firstName }} {{ shippingAddress.lastName }}<br>
          {{ shippingAddress.street }}<br>
          {{ shippingAddress.zipcode }} {{ shippingAddress.city }}<br>
          <span v-if="shippingAddress.country">
            {{ shippingAddress.country.translated?.name || shippingAddress.country.name }}
          </span>
        </p>
      </div>
    </div>

    <!-- Action to use different address -->
    <div class="mt-4 pt-4" :class="[isIndustryTheme ? 'border-t border-slate-700' : 'border-t border-green-200']">
      <button
        @click="emit('use-different-address')"
        :class="['text-sm underline', themeColors.textMuted]"
      >
        Andere Adresse verwenden
      </button>
    </div>
  </div>
</template>
