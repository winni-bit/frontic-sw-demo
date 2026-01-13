<template>
  <div class="mb-8">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">Available Products</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="product in products" :key="product.id" class="bg-gray-50 p-4 rounded-lg border">
        <h3 class="font-medium text-gray-900">{{ product.name }}</h3>
        <p class="text-gray-600">{{ formatPrice(product.price) }}</p>
        <button 
          @click="$emit('add-product', product)"
          class="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Product {
  id: number
  name: string
  price: number
  quantity: number
}

defineProps<{
  products: Product[]
}>()

defineEmits<{
  'add-product': [product: Product]
}>()
</script>
