<template>
  <div id="add-to-cart-trigger" class="mb-8">
    <div class="flex items-start gap-4">
      <div class="flex-1">
        <ProductAddToCartButton
          :product-id="productId"
          :product-name="productName"
          :disabled="isOutOfStock"
          variant="secondary"
          size="lg"
          @added="handleAddedToCart"
          @error="handleCartError"
        />
      </div>
      
      <!-- Like Button -->
      <button 
        @click="handleToggleLike"
        class="p-4 border transition-all duration-300 shrink-0"
        :class="[
          isLiked 
            ? 'border-rose-200 bg-rose-50 hover:bg-rose-100' 
            : 'border-stone-200 hover:border-stone-400'
        ]"
        :aria-label="isLiked ? 'Remove from wishlist' : 'Add to wishlist'"
      >
        <svg 
          class="w-5 h-5 transition-colors duration-300" 
          :class="[
            isLiked 
              ? 'text-rose-500 fill-rose-500' 
              : 'text-stone-600 fill-transparent'
          ]"
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
    
    <!-- Cart Success Feedback -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <p v-if="showCartFeedback" class="text-sm text-green-600 mt-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Added to cart successfully
      </p>
    </Transition>
    
    <!-- Like Feedback -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <p v-if="showLikeFeedback" class="text-sm text-rose-600 mt-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        Added to your wishlist
      </p>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  productId: string
  productName: string
  isOutOfStock?: boolean
  isLiked?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOutOfStock: false,
  isLiked: false
})

const emit = defineEmits<{
  added: [productId: string, quantity: number]
  error: [message: string]
  toggleLike: []
}>()

const showCartFeedback = ref(false)
const showLikeFeedback = ref(false)

const handleAddedToCart = (productId: string, quantity: number) => {
  showCartFeedback.value = true
  setTimeout(() => {
    showCartFeedback.value = false
  }, 3000)
  emit('added', productId, quantity)
}

const handleCartError = (errorMsg: string) => {
  emit('error', errorMsg)
}

const handleToggleLike = () => {
  if (!props.isLiked) {
    showLikeFeedback.value = true
    setTimeout(() => {
      showLikeFeedback.value = false
    }, 2500)
  }
  emit('toggleLike')
}

// Reset feedback when product changes
watch(() => props.productId, () => {
  showCartFeedback.value = false
  showLikeFeedback.value = false
})
</script>
