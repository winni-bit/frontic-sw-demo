<script setup lang="ts">
/**
 * PriceSummary - Preisübersicht mit Zwischensumme, Versand, MwSt, Gesamt
 * ~55 Zeilen
 */

interface Tax {
  taxRate: number
  tax: number
}

interface Props {
  subtotal: number
  shippingCosts: number
  totalPrice: number
  taxes: Tax[]
  formatPrice: (price: number) => string
  themeColors: {
    text: string
    textMuted: string
    border: string
    success: string
  }
}

defineProps<Props>()
</script>

<template>
  <div :class="['space-y-3 pt-4 border-t', themeColors.border]">
    <!-- Subtotal -->
    <div class="flex justify-between text-sm">
      <span :class="themeColors.textMuted">Zwischensumme</span>
      <span :class="themeColors.text">{{ formatPrice(subtotal) }}</span>
    </div>

    <!-- Shipping -->
    <div class="flex justify-between text-sm">
      <span :class="themeColors.textMuted">Versandkosten</span>
      <span :class="[themeColors.text, shippingCosts === 0 && themeColors.success]">
        {{ shippingCosts === 0 ? 'Kostenlos' : formatPrice(shippingCosts) }}
      </span>
    </div>

    <!-- Taxes -->
    <div v-for="tax in taxes" :key="tax.taxRate" class="flex justify-between text-sm">
      <span :class="themeColors.textMuted">inkl. {{ tax.taxRate }}% MwSt.</span>
      <span :class="themeColors.text">{{ formatPrice(tax.tax) }}</span>
    </div>

    <!-- Total -->
    <div :class="['flex justify-between pt-3 border-t', themeColors.border]">
      <span :class="['text-lg font-medium', themeColors.text]">Gesamtsumme</span>
      <span :class="['text-lg font-medium', themeColors.text]">{{ formatPrice(totalPrice) }}</span>
    </div>
  </div>
</template>
