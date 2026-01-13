<script setup lang="ts">
/**
 * Industry Shop Checkout Page
 * Uses the industry layout for consistent navigation
 */

definePageMeta({
  layout: 'industry',
})

useHead({
  title: 'Checkout - Industry B2B Store',
})
</script>

<template>
  <CheckoutCheckoutForm
    shop-base-path="/industry"
    products-path="/industry"
    confirmation-path="/industry/order-confirmation"
  />
</template>
