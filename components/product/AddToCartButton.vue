<script setup lang="ts">
/**
 * Add to Cart Button Component
 * 
 * Adds products to the Shopware cart with:
 * - Loading state
 * - Success feedback
 * - Error handling
 * - Quantity selection
 */

interface Props {
  productId: string
  productName?: string
  disabled?: boolean
  showQuantity?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  productName: 'Produkt',
  disabled: false,
  showQuantity: true,
  variant: 'primary',
  size: 'md',
})

const emit = defineEmits<{
  added: [productId: string, quantity: number]
  error: [error: string]
}>()

const { addToCart, loading } = useShopwareCart()

const quantity = ref(1)
const isAdding = ref(false)
const showSuccess = ref(false)
const errorMessage = ref<string | null>(null)

// Increase quantity
const increaseQuantity = () => {
  quantity.value++
}

// Decrease quantity
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// Handle add to cart
const handleAddToCart = async () => {
  if (isAdding.value || props.disabled) return
  
  isAdding.value = true
  errorMessage.value = null
  
  try {
    await addToCart(props.productId, quantity.value)
    
    // Show success feedback
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 2000)
    
    emit('added', props.productId, quantity.value)
    
    // Reset quantity
    quantity.value = 1
  } catch (error: any) {
    console.error('Add to cart error:', error)
    errorMessage.value = error.message || 'Fehler beim Hinzufügen zum Warenkorb'
    emit('error', errorMessage.value)
  } finally {
    isAdding.value = false
  }
}

// Button classes based on variant and size
const buttonClasses = computed(() => {
  const base = 'font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-2'
  
  const variants = {
    primary: 'bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400',
    secondary: 'bg-amber-600 text-white hover:bg-amber-700 disabled:bg-stone-200 disabled:text-stone-400',
    outline: 'border-2 border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white disabled:border-stone-200 disabled:text-stone-400',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-sm',
  }
  
  return `${base} ${variants[props.variant]} ${sizes[props.size]}`
})
</script>

<template>
  <div class="space-y-3">
    <!-- Quantity Selector -->
    <div v-if="showQuantity" class="flex items-center gap-4">
      <span class="text-sm text-stone-500">Menge</span>
      <div class="flex items-center border border-stone-200">
        <button
          @click="decreaseQuantity"
          :disabled="quantity <= 1 || isAdding"
          class="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>
        <span class="w-12 text-center text-stone-900 font-medium">
          {{ quantity }}
        </span>
        <button
          @click="increaseQuantity"
          :disabled="isAdding"
          class="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Add to Cart Button -->
    <button
      @click="handleAddToCart"
      :disabled="disabled || isAdding"
      :class="buttonClasses"
    >
      <!-- Loading State -->
      <template v-if="isAdding">
        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>Wird hinzugefügt...</span>
      </template>

      <!-- Success State -->
      <template v-else-if="showSuccess">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>Hinzugefügt!</span>
      </template>

      <!-- Default State -->
      <template v-else>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span>In den Warenkorb</span>
      </template>
    </button>

    <!-- Error Message -->
    <p v-if="errorMessage" class="text-sm text-red-500">
      {{ errorMessage }}
    </p>
  </div>
</template>
