<script setup lang="ts">
/**
 * Order Confirmation Page
 * 
 * Displays order confirmation after successful checkout.
 * Retrieves order data from sessionStorage (saved before redirect).
 */

// Get the current shop layout
const { getLayout } = useShopLayout()
const currentLayout = getLayout()

// Define page meta - use dynamic layout based on shop context
definePageMeta({
  layout: false,
})

// Use SEO
useHead({
  title: 'Bestellbestätigung - Store',
})

const router = useRouter()

// Order data
const order = ref<ShopwareOrder | null>(null)
const loading = ref(true)

// Load order from sessionStorage
onMounted(() => {
  if (import.meta.client) {
    try {
      const storedData = sessionStorage.getItem('lastOrder')
      
      if (storedData) {
        const orderData: OrderConfirmationData = JSON.parse(storedData)
        
        // Check if order is recent (within last hour)
        const isRecent = Date.now() - orderData.timestamp < 60 * 60 * 1000
        
        if (isRecent && orderData.order) {
          order.value = orderData.order
          console.log('[OrderConfirmation] Order loaded:', orderData.order.orderNumber)
        } else {
          console.log('[OrderConfirmation] Order data expired or invalid')
          // Clear expired data
          sessionStorage.removeItem('lastOrder')
        }
      } else {
        console.log('[OrderConfirmation] No order data found')
      }
    } catch (error) {
      console.error('[OrderConfirmation] Error loading order:', error)
    }
  }
  
  loading.value = false
})

// Redirect if no order after a delay
watch(loading, (isLoading) => {
  if (!isLoading && !order.value) {
    // Give user time to see the message before redirecting
    setTimeout(() => {
      if (!order.value) {
        router.push('/')
      }
    }, 5000)
  }
})
</script>

<template>
  <NuxtLayout :name="currentLayout">
    <div class="min-h-screen bg-white pt-24 pb-16">
      <div class="container mx-auto px-6 lg:px-12">
        <!-- Loading State -->
        <div v-if="loading" class="max-w-2xl mx-auto py-12">
          <div class="flex items-center justify-center gap-3">
            <svg class="w-6 h-6 animate-spin text-stone-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span class="text-stone-500">Bestelldaten werden geladen...</span>
          </div>
        </div>

        <!-- Order Confirmation -->
        <CheckoutOrderConfirmation v-else :order="order" />
      </div>
    </div>
  </NuxtLayout>
</template>
