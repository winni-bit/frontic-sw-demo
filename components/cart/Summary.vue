<template>
  <div class="border-t pt-4 mt-6">
    <div class="flex justify-between items-center mb-4">
      <span class="text-xl font-semibold text-gray-900">Total: {{ formatPrice(total) }}</span>
      <button 
        @click="$emit('clear-cart')"
        class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
      >
        Clear Cart
      </button>
    </div>
    <button 
      @click="$emit('checkout')"
      class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
    >
      Proceed to Checkout
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  total: number
}>()

defineEmits<{
  'clear-cart': []
  'checkout': []
}>()
</script>
