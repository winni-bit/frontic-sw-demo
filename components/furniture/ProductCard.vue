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
      </div>

      <!-- Info -->
      <div>
        <h3 class="text-stone-900 font-medium mb-1 group-hover:text-amber-700 transition-colors">
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

    <!-- Like/Wishlist Button - Outside the NuxtLink to prevent navigation -->
    <button 
      class="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-white z-10"
      :class="[
        liked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
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
  product: ProductCard
}>()

const { isLiked, toggleLike: toggleLikeAction } = useLikeList()

// Check if this product is liked
const liked = computed(() => isLiked(props.product.key))

const hasDiscount = computed(() => {
  const price = props.product.lowestPrice || props.product.price
  return price?.ref && price.ref > (price.amount || 0)
})

const formattedPrice = computed(() => {
  const price = props.product.lowestPrice || props.product.price
  if (!price) return ''
  const amount = (price.amount || 0) / Math.pow(10, price.precision || 2)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency || 'USD'
  }).format(amount)
})

const formattedRefPrice = computed(() => {
  const price = props.product.lowestPrice || props.product.price
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
    lowestPrice: props.product.lowestPrice,
    cover: props.product.cover
  })
}
</script>
