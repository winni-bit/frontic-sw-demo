<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div 
        v-if="isVisible"
        class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-lg lg:hidden safe-area-bottom"
      >
        <div class="px-4 py-3">
          <!-- Product Info Row -->
          <div class="flex items-center gap-3 mb-3">
            <!-- Thumbnail -->
            <div class="w-12 h-12 bg-stone-100 overflow-hidden flex-shrink-0">
              <img
                v-if="product.cover?.src"
                :src="product.cover.thumbnailSrc || product.cover.src"
                :alt="product.name"
                class="w-full h-full object-cover"
              />
            </div>
            
            <!-- Name & Price -->
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-stone-900 truncate">{{ product.name }}</h4>
              <div class="flex items-baseline gap-2">
                <span class="text-stone-900 font-medium">{{ formattedPrice }}</span>
                <span v-if="hasDiscount" class="text-stone-400 text-sm line-through">{{ formattedRefPrice }}</span>
              </div>
            </div>

            <!-- Stock Badge -->
            <div v-if="showLowStock" class="flex-shrink-0">
              <span class="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                {{ product.stock }} left
              </span>
            </div>
          </div>

          <!-- Action Row -->
          <div class="flex items-center gap-3">
            <!-- Quantity Selector -->
            <div class="flex items-center border border-stone-200 rounded-lg overflow-hidden">
              <button
                @click="decreaseQuantity"
                :disabled="quantity <= 1 || isAdding"
                class="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <span class="w-10 text-center text-stone-900 font-medium text-sm">
                {{ quantity }}
              </span>
              <button
                @click="increaseQuantity"
                :disabled="isAdding || (product.stock !== undefined && quantity >= product.stock)"
                class="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <!-- Add to Cart Button -->
            <button
              @click="handleAddToCart"
              :disabled="isAdding || isOutOfStock"
              class="flex-1 py-3 px-4 text-sm font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-lg"
              :class="[
                isOutOfStock
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : showSuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
              ]"
            >
              <template v-if="isAdding">
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </template>
              <template v-else-if="showSuccess">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Added!</span>
              </template>
              <template v-else-if="isOutOfStock">
                <span>Out of Stock</span>
              </template>
              <template v-else>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Add to Cart</span>
              </template>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Product {
  key: string
  name: string
  cover?: {
    src?: string
    thumbnailSrc?: string
  }
  price?: {
    amount: number
    currency: string
    precision: number
    ref?: number
  }
  stock?: number
}

const props = defineProps<{
  product: Product
  triggerElementId?: string
}>()

const emit = defineEmits<{
  added: [productId: string, quantity: number]
}>()

const { addToCart } = useShopwareCart()

// State
const isVisible = ref(false)
const quantity = ref(1)
const isAdding = ref(false)
const showSuccess = ref(false)

// Computed
const isOutOfStock = computed(() => {
  return props.product.stock !== undefined && props.product.stock <= 0
})

const showLowStock = computed(() => {
  return props.product.stock !== undefined && props.product.stock > 0 && props.product.stock <= 5
})

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

// Methods
const increaseQuantity = () => {
  if (props.product.stock === undefined || quantity.value < props.product.stock) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const handleAddToCart = async () => {
  if (isAdding.value || isOutOfStock.value) return
  
  isAdding.value = true
  
  try {
    await addToCart(props.product.key, quantity.value)
    showSuccess.value = true
    emit('added', props.product.key, quantity.value)
    
    setTimeout(() => {
      showSuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Error adding to cart:', error)
  } finally {
    isAdding.value = false
  }
}

// Scroll-based visibility
const checkVisibility = () => {
  const triggerId = props.triggerElementId || 'add-to-cart-trigger'
  const triggerElement = document.getElementById(triggerId)
  
  if (triggerElement) {
    const rect = triggerElement.getBoundingClientRect()
    // Show sticky bar when the original add-to-cart button is out of view
    isVisible.value = rect.bottom < 0 || rect.top > window.innerHeight
  } else {
    // If no trigger element, show after scrolling 300px
    isVisible.value = window.scrollY > 300
  }
}

onMounted(() => {
  window.addEventListener('scroll', checkVisibility, { passive: true })
  checkVisibility()
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkVisibility)
})

// Reset quantity when product changes
watch(() => props.product.key, () => {
  quantity.value = 1
  showSuccess.value = false
})
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
