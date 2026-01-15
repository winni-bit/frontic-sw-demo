<script setup lang="ts">
/**
 * Customer Address Display
 * 
 * Shows the logged-in customer's address in a read-only format
 * Used in checkout when customer is already logged in
 */

interface Props {
  isIndustryTheme?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isIndustryTheme: false,
})

const { customer, billingAddress } = useShopwareAuth()

// Theme colors
const themeColors = computed(() => {
  if (props.isIndustryTheme) {
    return {
      cardBg: 'bg-slate-800',
      text: 'text-white',
      textMuted: 'text-slate-400',
      border: 'border-slate-700',
      accent: 'text-blue-400',
      success: 'bg-blue-600/20 text-blue-400',
    }
  }
  return {
    cardBg: 'bg-stone-50',
    text: 'text-stone-900',
    textMuted: 'text-stone-500',
    border: 'border-stone-200',
    accent: 'text-stone-900',
    success: 'bg-green-50 text-green-700',
  }
})
</script>

<template>
  <div v-if="customer && billingAddress" class="space-y-4">
    <!-- Success Badge -->
    <div :class="['inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium', themeColors.success]">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      Angemeldet als {{ customer.firstName }} {{ customer.lastName }}
    </div>

    <!-- Address Card -->
    <div :class="['p-4 rounded-lg', themeColors.cardBg]">
      <div class="flex items-start justify-between">
        <div>
          <p :class="['font-medium', themeColors.text]">
            {{ customer.firstName }} {{ customer.lastName }}
          </p>
          <p :class="['text-sm mt-1', themeColors.textMuted]">
            {{ billingAddress.street }}
          </p>
          <p :class="['text-sm', themeColors.textMuted]">
            {{ billingAddress.zipcode }} {{ billingAddress.city }}
          </p>
          <p v-if="billingAddress.country" :class="['text-sm', themeColors.textMuted]">
            {{ billingAddress.country.translated?.name || billingAddress.country.name }}
          </p>
          <p :class="['text-sm mt-2', themeColors.textMuted]">
            {{ customer.email }}
          </p>
        </div>
        
        <!-- Edit Link -->
        <NuxtLink 
          to="/account" 
          :class="['text-sm font-medium hover:underline', themeColors.accent]"
        >
          Bearbeiten
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
