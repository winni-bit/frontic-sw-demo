<script setup lang="ts">
/**
 * Address Section
 * 
 * Shows either:
 * - Customer address display (if logged in)
 * - Guest address form (if not logged in)
 */

interface Props {
  isIndustryTheme?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isIndustryTheme: false,
  disabled: false,
})

// Get auth state directly from useShopwareAuth for better reactivity
const { isLoggedIn, customer: authCustomer } = useShopwareAuth()

// Compute isCustomerLoggedIn locally for better reactivity
const isCustomerLoggedIn = computed(() => {
  const loggedIn = isLoggedIn.value && authCustomer.value && !authCustomer.value.guest
  console.log('[AddressSection] isCustomerLoggedIn check:', {
    isLoggedIn: isLoggedIn.value,
    hasCustomer: !!authCustomer.value,
    isGuest: authCustomer.value?.guest,
    result: loggedIn
  })
  return loggedIn
})

// Theme colors
const themeColors = computed(() => {
  if (props.isIndustryTheme) {
    return {
      cardBg: 'bg-slate-900',
      text: 'text-white',
      stepBg: 'bg-blue-600',
    }
  }
  return {
    cardBg: 'bg-white',
    text: 'text-stone-900',
    stepBg: 'bg-stone-900',
  }
})
</script>

<template>
  <div :class="['p-6 shadow-sm', themeColors.cardBg]">
    <h2 :class="['text-lg font-medium mb-6 flex items-center gap-3', themeColors.text]">
      <span :class="['w-8 h-8 text-white text-sm font-medium rounded-full flex items-center justify-center', themeColors.stepBg]">
        1
      </span>
      Lieferadresse
    </h2>

    <!-- Debug Info (remove in production) -->
    <div v-if="false" class="mb-4 p-2 bg-yellow-100 text-yellow-800 text-xs">
      isLoggedIn: {{ isLoggedIn }}, 
      hasCustomer: {{ !!authCustomer }}, 
      isGuest: {{ authCustomer?.guest }},
      isCustomerLoggedIn: {{ isCustomerLoggedIn }}
    </div>

    <!-- Logged-in customer: Show address display -->
    <CheckoutCustomerAddressDisplay 
      v-if="isCustomerLoggedIn" 
      :is-industry-theme="isIndustryTheme" 
    />

    <!-- Guest: Show address form -->
    <CheckoutGuestAddressForm 
      v-else 
      :is-industry-theme="isIndustryTheme"
      :disabled="disabled"
    />
  </div>
</template>
