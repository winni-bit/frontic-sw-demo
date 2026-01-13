<template>
  <div class="group relative">
    <NuxtLink 
      :to="`/product/${product.key}`"
      class="block cursor-pointer"
    >
      <!-- Image -->
      <div class="relative aspect-[4/5] overflow-hidden bg-stone-100 mb-4">
        <img
          v-if="product.cover?.src"
          :src="product.cover.thumbnailSrc || product.cover.src"
          :alt="product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div 
          v-else 
          class="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center"
        >
          <svg class="w-16 h-16 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        
        <!-- Sale Badge -->
        <div v-if="hasDiscount" class="absolute top-4 left-4 bg-rose-500 text-white text-xs font-medium px-2 py-1">
          Sale
        </div>

        <!-- Stock Warning Badge -->
        <div 
          v-if="showLowStockWarning" 
          class="absolute top-4 right-4 bg-amber-500 text-white text-xs font-medium px-2 py-1 flex items-center gap-1"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Only {{ product.stock }} left
        </div>

        <!-- Out of Stock Overlay -->
        <div 
          v-if="isOutOfStock" 
          class="absolute inset-0 bg-stone-900/60 flex items-center justify-center"
        >
          <span class="bg-white text-stone-900 px-4 py-2 text-sm font-medium">
            Out of Stock
          </span>
        </div>
      </div>

      <!-- Info -->
      <div>
        <h3 class="text-stone-900 font-medium mb-1 group-hover:text-amber-700 transition-colors line-clamp-1">
          {{ product.name }}
        </h3>
        
        <div class="flex items-baseline gap-2">
          <span class="text-stone-900">
            {{ formattedPrice }}
          </span>
          <span v-if="hasDiscount" class="text-stone-400 text-sm line-through">
            {{ formattedRefPrice }}
          </span>
        </div>
      </div>
    </NuxtLink>

    <!-- Quick Actions Overlay -->
    <div 
      class="absolute bottom-[88px] left-0 right-0 px-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto"
      :class="{ 'opacity-0 pointer-events-none': isOutOfStock }"
    >
      <!-- Quick Add to Cart Button -->
      <button 
        @click.stop.prevent="handleQuickAddToCart"
        :disabled="isAdding || isOutOfStock"
        class="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:bg-stone-300 disabled:cursor-not-allowed"
      >
        <template v-if="isAdding">
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Adding...</span>
        </template>
        <template v-else-if="showAddedFeedback">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Added!</span>
        </template>
        <template v-else>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>Quick Add</span>
        </template>
      </button>
    </div>

    <!-- Like/Wishlist Button - Outside the NuxtLink to prevent navigation -->
    <button 
      class="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-white z-10"
      :class="[
        liked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        showLowStockWarning ? 'top-12' : 'top-4'
      ]"
      @click.stop.prevent="toggleLike"
      :aria-label="liked ? 'Remove from wishlist' : 'Add to wishlist'"
    >
      <svg 
        class="w-5 h-5 transition-colors duration-200"
        :class="liked ? 'text-rose-500 fill-rose-500' : 'text-stone-600'"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="1.5" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  product: FurnitureProductCard
}>()

const { isLiked, toggleLike: toggleLikeAction } = useLikeList()
const { addToCart } = useShopwareCart()

// Local state
const isAdding = ref(false)
const showAddedFeedback = ref(false)

// Check if this product is liked
const liked = computed(() => isLiked(props.product.key))

// Stock checks
const isOutOfStock = computed(() => {
  return props.product.stock !== undefined && props.product.stock <= 0
})

const showLowStockWarning = computed(() => {
  return props.product.stock !== undefined && props.product.stock > 0 && props.product.stock <= 5
})

const hasDiscount = computed(() => {
  const price = props.product.price
  return price?.ref && price.ref > (price.amount || 0)
})

const formattedPrice = computed(() => {
  const price = props.product.price
  if (!price) return ''
  const amount = (price.amount || 0) / Math.pow(10, price.precision || 2)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency || 'USD'
  }).format(amount)
})

const formattedRefPrice = computed(() => {
  const price = props.product.price
  if (!price?.ref) return ''
  const amount = price.ref / Math.pow(10, price.precision || 2)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency || 'USD'
  }).format(amount)
})

const toggleLike = () => {
  toggleLikeAction({
    key: props.product.key,
    name: props.product.name,
    price: props.product.price,
    cover: props.product.cover
  })
}

// Quick Add to Cart
const handleQuickAddToCart = async () => {
  if (isAdding.value || isOutOfStock.value) return
  
  isAdding.value = true
  
  try {
    await addToCart(props.product.key, 1)
    showAddedFeedback.value = true
    
    setTimeout(() => {
      showAddedFeedback.value = false
    }, 2000)
  } catch (error) {
    console.error('Error adding to cart:', error)
  } finally {
    isAdding.value = false
  }
}
</script>
