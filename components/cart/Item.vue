<template>
  <div class="flex items-center justify-between bg-white p-4 rounded-lg shadow border">
    <div class="flex-1">
      <h3 class="font-semibold text-gray-900">{{ item.name }}</h3>
      <p class="text-gray-600">Quantity: {{ item.quantity }}</p>
      <p class="text-gray-600">Price: {{ formatPrice(item.price) }}</p>
    </div>
    <button 
      @click="$emit('remove-item', item)"
      class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
    >
      Remove
    </button>
  </div>
</template>

<script setup lang="ts">
interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

defineProps<{
  item: CartItem
}>()

defineEmits<{
  'remove-item': [item: CartItem]
}>()
</script>
