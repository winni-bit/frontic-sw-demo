<script setup lang="ts">
definePageMeta({
  layout: 'furniture',
  middleware: 'auth',
})

useHead({
  title: 'Meine Bestellungen - Furniture',
})

const { fetchOrders, fetchCustomer, loading, isLoggedIn, customer, isInitialized } = useShopwareAuth()

const orders = ref<ShopwareOrder[]>([])
const totalOrders = ref(0)
const currentPage = ref(1)
const itemsPerPage = 10
const initialLoading = ref(true)
const error = ref<string | null>(null)

// Calculate total pages
const totalPages = computed(() => Math.ceil(totalOrders.value / itemsPerPage))

// Load orders
const loadOrders = async (page: number = 1) => {
  // Only load orders on client side
  if (!import.meta.client) {
    console.log('[Orders Page] Skipping orders load on server')
    return
  }
  
  error.value = null
  console.log('[Orders Page] Loading orders for page:', page)
  console.log('[Orders Page] Auth state:', {
    isLoggedIn: isLoggedIn.value,
    hasCustomer: !!customer.value,
    customerEmail: customer.value?.email,
    isGuest: customer.value?.guest
  })
  
  // Check if user is logged in
  if (!isLoggedIn.value) {
    console.log('[Orders Page] User not logged in, cannot load orders')
    error.value = 'Sie müssen angemeldet sein, um Ihre Bestellungen zu sehen.'
    return
  }
  
  try {
    const response = await fetchOrders(page, itemsPerPage)
    console.log('[Orders Page] Response received:', {
      elements: response.elements?.length || 0,
      total: response.total,
      firstOrder: response.elements?.[0]?.orderNumber
    })
    
    orders.value = response.elements || []
    totalOrders.value = response.total || 0
    currentPage.value = page
    console.log('[Orders Page] Orders loaded:', orders.value.length, 'of', totalOrders.value)
  } catch (err: any) {
    console.error('[Orders Page] Error loading orders:', err)
    
    // Check if it's an auth error
    if (err.message?.includes('Forbidden') || err.message?.includes('403')) {
      error.value = 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.'
      // Try to refresh customer data
      console.log('[Orders Page] Attempting to refresh customer data...')
      try {
        await fetchCustomer()
        if (isLoggedIn.value) {
          // Retry loading orders
          console.log('[Orders Page] Customer refreshed, retrying orders...')
          const retryResponse = await fetchOrders(page, itemsPerPage)
          orders.value = retryResponse.elements || []
          totalOrders.value = retryResponse.total || 0
          currentPage.value = page
          error.value = null
          return
        }
      } catch (refreshErr) {
        console.error('[Orders Page] Failed to refresh customer:', refreshErr)
      }
    } else {
      error.value = err.message || 'Bestellungen konnten nicht geladen werden'
    }
  }
}

// Handle pagination
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    loadOrders(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Initial load - only on client
onMounted(async () => {
  console.log('[Orders Page] Mounted, initializing...')
  
  // Wait for auth to be initialized
  if (!isInitialized.value) {
    console.log('[Orders Page] Auth not initialized, fetching customer...')
    await fetchCustomer()
  }
  
  // Wait a tick for Vue reactivity
  await nextTick()
  
  console.log('[Orders Page] Auth state after init:', {
    isLoggedIn: isLoggedIn.value,
    hasCustomer: !!customer.value,
    customerEmail: customer.value?.email
  })
  
  // Only load orders if logged in
  if (isLoggedIn.value) {
    await loadOrders()
  } else {
    console.log('[Orders Page] Not logged in, skipping orders load')
    error.value = 'Sie müssen angemeldet sein, um Ihre Bestellungen zu sehen.'
  }
  
  initialLoading.value = false
})

// Watch for login state changes
watch(isLoggedIn, async (newValue) => {
  console.log('[Orders Page] Login state changed:', newValue)
  if (newValue && !initialLoading.value) {
    await loadOrders()
  }
})
</script>

<template>
  <div class="min-h-screen bg-stone-50 pt-8 pb-16">
    <div class="container mx-auto px-6 lg:px-12">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <NuxtLink 
              to="/account" 
              class="inline-flex items-center text-sm text-stone-500 hover:text-stone-900 mb-2"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
              </svg>
              Zurück zum Konto
            </NuxtLink>
            <h1 class="font-serif text-2xl text-stone-900">Meine Bestellungen</h1>
          </div>
          <p v-if="!initialLoading && totalOrders > 0" class="text-sm text-stone-500">
            {{ totalOrders }} Bestellung{{ totalOrders === 1 ? '' : 'en' }}
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="initialLoading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="bg-white p-6 shadow-sm animate-pulse">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <div class="h-5 w-40 bg-stone-200 rounded" />
                <div class="h-4 w-24 bg-stone-100 rounded" />
              </div>
              <div class="h-4 w-20 bg-stone-100 rounded" />
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-white p-8 shadow-sm text-center">
          <svg class="w-12 h-12 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="text-lg font-medium text-stone-900 mb-2">Fehler beim Laden</h2>
          <p class="text-stone-500 mb-4">{{ error }}</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              v-if="isLoggedIn"
              @click="loadOrders(currentPage)"
              class="px-4 py-2 bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              Erneut versuchen
            </button>
            <NuxtLink
              v-else
              to="/account/login"
              class="px-4 py-2 bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Jetzt anmelden
            </NuxtLink>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="orders.length === 0" class="bg-white p-8 shadow-sm text-center">
          <svg class="w-16 h-16 mx-auto text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 class="text-lg font-medium text-stone-900 mb-2">Noch keine Bestellungen</h2>
          <p class="text-stone-500 mb-6">Sie haben noch keine Bestellungen aufgegeben.</p>
          <NuxtLink
            to="/"
            class="inline-block px-6 py-3 bg-stone-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-stone-800 transition-colors"
          >
            Jetzt einkaufen
          </NuxtLink>
        </div>

        <!-- Orders List -->
        <div v-else class="space-y-4">
          <AccountOrderCard
            v-for="order in orders"
            :key="order.id"
            :order="order"
          />

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-6">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1 || loading"
              class="p-2 border border-stone-200 hover:border-stone-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div class="flex items-center gap-1">
              <button
                v-for="page in totalPages"
                :key="page"
                @click="goToPage(page)"
                :disabled="loading"
                :class="[
                  'w-10 h-10 text-sm font-medium transition-colors',
                  currentPage === page
                    ? 'bg-stone-900 text-white'
                    : 'border border-stone-200 text-stone-600 hover:border-stone-300'
                ]"
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages || loading"
              class="p-2 border border-stone-200 hover:border-stone-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Loading Overlay -->
          <div v-if="loading && !initialLoading" class="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
            <svg class="w-8 h-8 animate-spin text-stone-900" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
