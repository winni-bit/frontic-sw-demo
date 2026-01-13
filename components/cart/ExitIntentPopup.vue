<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isVisible"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        @click.self="dismiss"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        <!-- Modal -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out delay-100"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div 
            v-if="isVisible"
            class="relative bg-white max-w-lg w-full shadow-2xl overflow-hidden"
          >
            <!-- Close Button -->
            <button
              @click="dismiss"
              class="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors z-10"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Header Image/Decoration -->
            <div class="bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 px-8 py-10 text-center">
              <div class="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg class="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h2 class="font-serif text-2xl md:text-3xl text-stone-900 mb-2">
                Wait! Don't leave yet
              </h2>
              <p class="text-stone-600">
                Your cart is waiting for you
              </p>
            </div>

            <!-- Content -->
            <div class="px-8 py-6">
              <!-- Cart Preview -->
              <div v-if="cartItems.length > 0" class="mb-6">
                <p class="text-sm text-stone-500 mb-3">
                  You have {{ cartItems.length }} item{{ cartItems.length > 1 ? 's' : '' }} in your cart:
                </p>
                <div class="flex gap-2 overflow-x-auto pb-2">
                  <div 
                    v-for="item in cartItems.slice(0, 4)" 
                    :key="item.id"
                    class="flex-shrink-0 w-16 h-16 bg-stone-100 overflow-hidden"
                  >
                    <img
                      v-if="item.cover?.url"
                      :src="item.cover.url"
                      :alt="item.label"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>
                  <div 
                    v-if="cartItems.length > 4"
                    class="flex-shrink-0 w-16 h-16 bg-stone-100 flex items-center justify-center text-stone-500 text-sm font-medium"
                  >
                    +{{ cartItems.length - 4 }}
                  </div>
                </div>
              </div>

              <!-- Incentive -->
              <div class="bg-amber-50 border border-amber-200 p-4 mb-6">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-stone-900 mb-1">
                      Complete your order now and get:
                    </p>
                    <ul class="text-sm text-stone-600 space-y-1">
                      <li class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Free shipping on orders over €50
                      </li>
                      <li class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        30-day easy returns
                      </li>
                      <li class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Secure payment
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- CTA Buttons -->
              <div class="space-y-3">
                <button
                  @click="goToCheckout"
                  class="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 px-6 font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Complete My Order
                </button>
                
                <button
                  @click="continueShopping"
                  class="w-full border border-amber-600 hover:bg-amber-600 text-amber-700 hover:text-white py-3 px-6 text-sm transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

              <!-- Trust Badges -->
              <div class="mt-6 pt-4 border-t border-stone-100 flex items-center justify-center gap-6 text-stone-400 text-xs">
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  SSL Secure
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Buyer Protection
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const router = useRouter()
const { cart, itemCount } = useShopwareCart()

// State
const isVisible = ref(false)
const hasBeenShown = ref(false)
const isEnabled = ref(true)

// Computed
const cartItems = computed(() => cart.value?.lineItems || [])

// Methods
const show = () => {
  if (!hasBeenShown.value && isEnabled.value && itemCount.value > 0) {
    isVisible.value = true
    hasBeenShown.value = true
    document.body.style.overflow = 'hidden'
  }
}

const dismiss = () => {
  isVisible.value = false
  document.body.style.overflow = ''
  
  // Store in session that popup was shown
  if (import.meta.client) {
    sessionStorage.setItem('exitIntentShown', 'true')
  }
}

const goToCheckout = () => {
  dismiss()
  router.push('/checkout')
}

const continueShopping = () => {
  dismiss()
}

// Exit intent detection
const handleMouseLeave = (e: MouseEvent) => {
  // Only trigger when mouse leaves through the top of the viewport
  if (e.clientY <= 0 && !hasBeenShown.value && itemCount.value > 0) {
    show()
  }
}

// Back button detection (mobile)
const handlePopState = () => {
  if (!hasBeenShown.value && itemCount.value > 0) {
    // Prevent actual navigation
    history.pushState(null, '', window.location.href)
    show()
  }
}

// Initialize
onMounted(() => {
  // Check if already shown in this session
  if (import.meta.client) {
    hasBeenShown.value = sessionStorage.getItem('exitIntentShown') === 'true'
  }
  
  // Desktop: mouse leave detection
  document.addEventListener('mouseleave', handleMouseLeave)
  
  // Mobile: back button detection
  history.pushState(null, '', window.location.href)
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  document.removeEventListener('mouseleave', handleMouseLeave)
  window.removeEventListener('popstate', handlePopState)
  document.body.style.overflow = ''
})

// Reset when cart becomes empty
watch(itemCount, (count) => {
  if (count === 0) {
    isVisible.value = false
  }
})

// Expose show method for manual triggering
defineExpose({ show })
</script>
