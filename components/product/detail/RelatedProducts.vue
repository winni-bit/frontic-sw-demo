<template>
  <section v-if="products.length > 0" class="py-16 bg-stone-50">
    <div class="max-w-7xl mx-auto px-6">
      <h2 class="font-serif text-2xl text-stone-900 mb-8">You May Also Like</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <FurnitureProductCard 
          v-for="product in products" 
          :key="product.key" 
          :product="product" 
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  products: FurnitureProductCard[]
}

defineProps<Props>()
</script>
