<script setup lang="ts">
/**
 * Cart Sidebar Component
 * 
 * Slide-in cart panel with:
 * - Cart items management
 * - Quantity updates
 * - Remove items
 * - Proceed to checkout
 */

interface Props {
  open: boolean
  /** Override the checkout path (defaults to auto-detection based on current route) */
  checkoutPath?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  checkout: []
}>()

const router = useRouter()
const route = useRoute()

const {
  cart,
  loading,
  itemCount,
  subtotal,
  updateQuantity,
  removeFromCart,
} = useShopwareCart()

// Local loading state for individual items
const updatingItems = ref<Set<string>>(new Set())

// Determine checkout path based on current route
const checkoutPagePath = computed(() => {
  if (props.checkoutPath) {
    return props.checkoutPath
  }
  
  // Auto-detect based on current path
  const currentPath = route.path
  
  if (currentPath.startsWith('/furniture')) {
    return '/furniture/checkout'
  }
  if (currentPath.startsWith('/industry')) {
    return '/industry/checkout'
  }
  
  // Default checkout
  return '/checkout'
})

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

// Get line item image
const getItemImage = (item: ShopwareLineItem) => {
  return item.cover?.url || null
}

// Handle quantity change
const handleQuantityChange = async (item: ShopwareLineItem, newQuantity: number) => {
  if (newQuantity < 1 || updatingItems.value.has(item.id)) return
  
  updatingItems.value.add(item.id)
  
  try {
    await updateQuantity(item.id, newQuantity)
  } catch (error) {
    console.error('Error updating quantity:', error)
  } finally {
    updatingItems.value.delete(item.id)
  }
}

// Handle remove item
const handleRemove = async (item: ShopwareLineItem) => {
  if (updatingItems.value.has(item.id)) return
  
  updatingItems.value.add(item.id)
  
  try {
    await removeFromCart(item.id)
  } catch (error) {
    console.error('Error removing item:', error)
  } finally {
    updatingItems.value.delete(item.id)
  }
}

// Handle checkout - navigate directly to checkout page
const handleCheckout = () => {
  emit('close')
  router.push(checkoutPagePath.value)
}

// Close on escape key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) {
    emit('close')
  }
}

// Prevent body scroll when open
watch(() => props.open, (isOpen) => {
  if (import.meta.client) {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  }
})

// Computed
const lineItems = computed(() => cart.value?.lineItems || [])
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 bg-black/50 z-50"
        @click="emit('close')"
      />
    </Transition>

    <!-- Sidebar -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="open"
        class="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 class="text-lg font-medium text-stone-900">
            Warenkorb
            <span v-if="itemCount > 0" class="text-stone-400 font-normal">
              ({{ itemCount }} {{ itemCount === 1 ? 'Artikel' : 'Artikel' }})
            </span>
          </h2>
          <button
            @click="emit('close')"
            class="p-2 text-stone-400 hover:text-stone-600 transition-colors"
            aria-label="Schließen"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Cart Content -->
        <div class="flex-1 overflow-y-auto">
          <!-- Empty State -->
          <div
            v-if="lineItems.length === 0"
            class="h-full flex flex-col items-center justify-center px-6 text-center"
          >
            <svg class="w-16 h-16 text-stone-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p class="text-stone-500 mb-2">Ihr Warenkorb ist leer</p>
            <p class="text-sm text-stone-400">Fügen Sie Produkte hinzu, um fortzufahren</p>
            <button
              @click="emit('close')"
              class="mt-6 px-6 py-3 text-sm font-medium text-stone-900 border border-stone-200 hover:border-stone-300 transition-colors"
            >
              Weiter einkaufen
            </button>
          </div>

          <!-- Cart Items -->
          <div v-else class="divide-y divide-stone-100">
            <div
              v-for="item in lineItems"
              :key="item.id"
              :class="[
                'p-4 flex gap-4 transition-opacity',
                updatingItems.has(item.id) && 'opacity-50'
              ]"
            >
              <!-- Product Image -->
              <div class="w-20 h-20 bg-stone-100 shrink-0 overflow-hidden">
                <img
                  v-if="getItemImage(item)"
                  :src="getItemImage(item)!"
                  :alt="item.label"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>

              <!-- Product Info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-medium text-stone-900 line-clamp-2">{{ item.label }}</h3>
                
                <!-- Variant Options -->
                <div v-if="item.payload?.options?.length" class="mt-1 flex flex-wrap gap-1">
                  <span
                    v-for="option in item.payload.options"
                    :key="`${option.group}-${option.option}`"
                    class="text-xs text-stone-400"
                  >
                    {{ option.option }}
                  </span>
                </div>

                <!-- Price -->
                <p class="mt-1 text-sm font-medium text-stone-900">
                  {{ formatPrice(item.price.unitPrice) }}
                </p>

                <!-- Quantity Controls -->
                <div class="mt-2 flex items-center gap-3">
                  <div class="flex items-center border border-stone-200">
                    <button
                      @click="handleQuantityChange(item, item.quantity - 1)"
                      :disabled="item.quantity <= 1 || updatingItems.has(item.id)"
                      class="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <span class="w-10 text-center text-sm text-stone-900">
                      {{ item.quantity }}
                    </span>
                    <button
                      @click="handleQuantityChange(item, item.quantity + 1)"
                      :disabled="updatingItems.has(item.id)"
                      class="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <!-- Remove Button -->
                  <button
                    @click="handleRemove(item)"
                    :disabled="updatingItems.has(item.id)"
                    class="text-stone-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Line Total -->
              <div class="text-right shrink-0">
                <p class="text-sm font-medium text-stone-900">
                  {{ formatPrice(item.price.totalPrice) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="lineItems.length > 0" class="border-t border-stone-100 p-6 space-y-4">
          <!-- Subtotal -->
          <div class="flex justify-between">
            <span class="text-stone-500">Zwischensumme</span>
            <span class="font-medium text-stone-900">{{ formatPrice(subtotal) }}</span>
          </div>
          
          <p class="text-xs text-stone-400">
            Versandkosten werden im Checkout berechnet
          </p>

          <!-- Checkout Button -->
          <button
            @click="handleCheckout"
            :disabled="loading"
            :class="[
              'w-full py-4 text-sm font-medium uppercase tracking-wider transition-all',
              loading
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            ]"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Wird geladen...
            </span>
            <span v-else>Zur Kasse</span>
          </button>

          <!-- Continue Shopping -->
          <button
            @click="emit('close')"
            class="w-full py-3 text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            Weiter einkaufen
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
