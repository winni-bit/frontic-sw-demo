<template>
  <NuxtLink 
    :to="`/industry/product/${product.key}`"
    class="group flex gap-4 bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 p-4"
  >
    <!-- Small Image -->
    <div class="relative w-24 h-24 flex-shrink-0 overflow-hidden bg-slate-800">
      <img
        v-if="product.cover?.src"
        :src="product.cover.thumbnailSrc || product.cover.src"
        :alt="product.name"
        class="w-full h-full object-cover"
      />
      <div 
        v-else 
        class="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center"
      >
        <svg class="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <!-- Header Row -->
      <div class="flex items-start justify-between gap-4 mb-2">
        <div class="min-w-0">
          <!-- Product Name -->
          <h3 class="text-white font-medium text-sm group-hover:text-blue-400 transition-colors truncate">
            {{ product.name }}
          </h3>
          <!-- SKU -->
          <p class="text-slate-500 text-xs mt-0.5">
            SKU: {{ product.key.slice(-8).toUpperCase() }}
          </p>
        </div>
        
        <!-- Price -->
        <div class="text-right flex-shrink-0">
          <span class="text-blue-400 font-bold text-sm">
            {{ formattedPrice }}
          </span>
          <span v-if="hasDiscount" class="block text-slate-500 text-xs line-through">
            {{ formattedRefPrice }}
          </span>
        </div>
      </div>
      
      <!-- Details Row -->
      <div class="flex items-center gap-4 text-xs">
        <!-- Stock Status -->
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          <span class="text-green-400">In Stock</span>
        </div>
        
        <!-- Delivery -->
        <div class="flex items-center gap-1.5 text-slate-500">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>1-2 days</span>
        </div>
        
        <!-- Min Order -->
        <div class="flex items-center gap-1.5 text-slate-500">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>Min: 1 pc</span>
        </div>
      </div>
      
      <!-- Action Row -->
      <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
        <div class="flex items-center gap-2">
          <!-- Quick Add -->
          <button 
            @click.prevent="quickAdd"
            class="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
          
          <!-- Quantity Input -->
          <div class="flex items-center bg-slate-800 border border-slate-700">
            <button 
              @click.prevent="qty > 1 && qty--"
              class="px-2 py-1 text-slate-400 hover:text-white text-xs"
            >
              −
            </button>
            <input 
              v-model.number="qty"
              type="number"
              min="1"
              class="w-10 bg-transparent text-center text-white text-xs py-1 focus:outline-none"
              @click.prevent
            />
            <button 
              @click.prevent="qty++"
              class="px-2 py-1 text-slate-400 hover:text-white text-xs"
            >
              +
            </button>
          </div>
        </div>
        
        <!-- View Details -->
        <span class="text-slate-500 text-xs group-hover:text-blue-400 transition-colors flex items-center gap-1">
          Details
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  product: ProductCard
}>()

const qty = ref(1)

const hasDiscount = computed(() => {
  return props.product.price?.ref && props.product.price.ref > (props.product.price.amount || 0)
})

const formattedPrice = computed(() => {
  if (!props.product.price) return ''
  const amount = (props.product.price.amount || 0) / Math.pow(10, props.product.price.precision || 2)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.product.price.currency || 'USD'
  }).format(amount)
})

const formattedRefPrice = computed(() => {
  if (!props.product.price?.ref) return ''
  const amount = props.product.price.ref / Math.pow(10, props.product.price.precision || 2)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.product.price.currency || 'USD'
  }).format(amount)
})

const quickAdd = () => {
  console.log(`Quick add ${qty.value}x ${props.product.name}`)
  alert(`Added ${qty.value}x ${props.product.name} to cart!`)
}
</script>
