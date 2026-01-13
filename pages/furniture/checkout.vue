<script setup lang="ts">
/**
 * Furniture Shop Checkout Page
 * Uses the furniture layout for consistent navigation
 */

definePageMeta({
  layout: 'furniture',
})

useHead({
  title: 'Checkout - Furniture Store',
})
</script>

<template>
  <CheckoutCheckoutForm
    shop-base-path="/furniture"
    products-path="/furniture/all"
    confirmation-path="/furniture/order-confirmation"
  />
</template>
