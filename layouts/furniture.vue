<template>
  <div class="min-h-screen bg-amber-50/30">
    <!-- Furniture Navigation -->
    <nav 
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      :class="scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'"
    >
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2">
            <span class="font-serif text-2xl text-stone-900">Furniture</span>
          </NuxtLink>

          <!-- Desktop Nav -->
          <div class="hidden md:flex items-center gap-10">
            <NuxtLink 
              to="/furniture/all" 
              class="text-sm text-stone-600 hover:text-stone-900 transition-colors"
            >
              Shop All
            </NuxtLink>
            <NuxtLink 
              to="/3d-demo" 
              class="text-sm text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              3D Demo
            </NuxtLink>
            <NuxtLink 
              to="/furniture/category/living-room" 
              class="text-sm text-stone-600 hover:text-stone-900 transition-colors"
            >
              Living Room
            </NuxtLink>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-5">
            <!-- Switch to B2B -->
            <NuxtLink 
              to="/industry" 
              class="hidden sm:flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              B2B Shop
            </NuxtLink>
            
            <!-- Divider -->
            <div class="hidden sm:block w-px h-5 bg-stone-200" />
            
            <!-- Search -->
            <button 
              class="p-2 text-stone-500 hover:text-stone-900 transition-colors"
              @click="openSearch"
              aria-label="Search products"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <!-- Wishlist -->
            <NuxtLink 
              to="/furniture/likes" 
              class="p-2 text-stone-500 hover:text-stone-900 transition-colors relative"
            >
              <svg 
                class="w-5 h-5" 
                :class="likeCount > 0 ? 'text-rose-500 fill-rose-500' : ''"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span 
                v-if="likeCount > 0" 
                class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center"
              >
                {{ likeCount > 9 ? '9+' : likeCount }}
              </span>
            </NuxtLink>
            
            <!-- Cart - Opens Sidebar -->
            <button 
              @click="openCartSidebar"
              class="p-2 text-stone-500 hover:text-stone-900 transition-colors relative"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span 
                v-if="shopwareCartCount > 0" 
                class="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center"
              >
                {{ shopwareCartCount > 9 ? '9+' : shopwareCartCount }}
              </span>
            </button>

            <!-- Mobile Menu -->
            <button 
              class="md:hidden p-2 text-stone-500"
              @click="mobileMenuOpen = !mobileMenuOpen"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="mobileMenuOpen" class="md:hidden bg-white border-t border-stone-100">
          <div class="px-6 py-4 space-y-3">
            <!-- Mobile Search -->
            <button 
              class="flex items-center gap-2 text-stone-700 py-2 w-full"
              @click="mobileMenuOpen = false; openSearch()"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Products
            </button>
            
            <div class="border-t border-stone-100 pt-3" />
            
            <NuxtLink 
              to="/furniture/all" 
              class="block text-stone-700 py-2"
              @click="mobileMenuOpen = false"
            >
              Shop All
            </NuxtLink>
            <NuxtLink 
              to="/3d-demo" 
              class="flex items-center gap-2 text-amber-600 py-2"
              @click="mobileMenuOpen = false"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              3D Demo
            </NuxtLink>
            <NuxtLink 
              to="/furniture/category/living-room" 
              class="block text-stone-700 py-2"
              @click="mobileMenuOpen = false"
            >
              Living Room
            </NuxtLink>
            <NuxtLink 
              to="/furniture/category/bedroom" 
              class="block text-stone-700 py-2"
              @click="mobileMenuOpen = false"
            >
              Bedroom
            </NuxtLink>
            <NuxtLink 
              to="/furniture/likes" 
              class="flex items-center gap-2 text-stone-700 py-2"
              @click="mobileMenuOpen = false"
            >
              <svg 
                class="w-5 h-5" 
                :class="likeCount > 0 ? 'text-rose-500 fill-rose-500' : ''"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              My Wishlist
              <span v-if="likeCount > 0" class="ml-auto text-rose-500 text-sm">{{ likeCount }}</span>
            </NuxtLink>
            
            <!-- Cart in Mobile Menu -->
            <button 
              @click="mobileMenuOpen = false; openCartSidebar()"
              class="flex items-center gap-2 text-stone-700 py-2 w-full"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Cart
              <span v-if="shopwareCartCount > 0" class="ml-auto text-amber-600 text-sm">{{ shopwareCartCount }}</span>
            </button>
            
            <div class="border-t border-stone-100 pt-3 mt-3">
              <NuxtLink 
                to="/industry" 
                class="flex items-center gap-2 text-stone-400 py-2"
                @click="mobileMenuOpen = false"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Switch to B2B Shop
              </NuxtLink>
            </div>
          </div>
        </div>
      </Transition>
    </nav>

    <!-- Search Overlay -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="searchOpen"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          @click.self="closeSearch"
        >
          <!-- Search Container -->
          <div class="w-full bg-white">
            <div class="max-w-7xl mx-auto px-6 py-6">
              <!-- Search Header -->
              <div class="flex items-center justify-between mb-6">
                <h2 class="font-serif text-xl text-stone-900">Search Products</h2>
                <button 
                  @click="closeSearch"
                  class="p-2 text-stone-500 hover:text-stone-900 transition-colors"
                  aria-label="Close search"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Search Input -->
              <div class="relative">
                <input
                  ref="searchInputRef"
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search for furniture, decor, lighting..."
                  class="w-full px-6 py-4 text-lg border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  @input="handleSearchInput"
                  @keydown.enter="handleSearchSubmit"
                  @keydown.esc="closeSearch"
                />
                <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span v-if="searchLoading" class="text-stone-400">
                    <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </span>
                  <button 
                    v-else-if="searchQuery"
                    @click="clearSearch"
                    class="text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <svg v-else class="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <!-- Search Results -->
              <div v-if="searchQuery.length >= 2" class="mt-6">
                <!-- Loading -->
                <div v-if="searchLoading" class="py-8 text-center text-stone-500">
                  Searching...
                </div>

                <!-- Results -->
                <div v-else-if="searchResults.length > 0">
                  <p class="text-sm text-stone-500 mb-4">
                    {{ searchResults.length }} result{{ searchResults.length === 1 ? '' : 's' }} found
                  </p>
                  <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto">
                    <NuxtLink
                      v-for="product in searchResults"
                      :key="product.key"
                      :to="`/product/${product.key}`"
                      class="group block"
                      @click="closeSearch"
                    >
                      <div class="aspect-square bg-stone-100 overflow-hidden mb-2">
                        <img
                          v-if="product.cover?.thumbnailSrc || product.cover?.src"
                          :src="product.cover.thumbnailSrc || product.cover.src"
                          :alt="product.name"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div v-else class="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
                          <svg class="w-8 h-8 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      </div>
                      <h3 class="text-sm text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                        {{ product.name }}
                      </h3>
                      <p class="text-sm text-stone-600 mt-1">
                        {{ formatPrice(product.lowestPrice || product.price) }}
                      </p>
                    </NuxtLink>
                  </div>
                </div>

                <!-- No Results -->
                <div v-else class="py-8 text-center">
                  <p class="text-stone-500 mb-2">No products found for "{{ searchQuery }}"</p>
                  <p class="text-sm text-stone-400">Try a different search term</p>
                </div>
              </div>

              <!-- Quick Links (when no search) -->
              <div v-else class="mt-6">
                <p class="text-sm text-stone-500 mb-4">Popular searches</p>
                <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="term in popularSearches" 
                    :key="term"
                    @click="searchQuery = term; handleSearchInput()"
                    class="px-4 py-2 text-sm bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  >
                    {{ term }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Cart Sidebar -->
    <CheckoutCartSidebar
      :open="cartSidebarOpen"
      @close="cartSidebarOpen = false"
    />

    <!-- Main Content -->
    <main class="pt-20">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-stone-900 text-white mt-20">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
          <!-- Brand -->
          <div>
            <h3 class="font-serif text-2xl mb-4">Furniture</h3>
            <p class="text-stone-400 text-sm leading-relaxed">
              Creating beautiful spaces with thoughtfully designed furniture for your home.
            </p>
          </div>

          <!-- Shop -->
          <div>
            <h4 class="font-medium text-sm uppercase tracking-wider text-stone-400 mb-4">Shop</h4>
            <ul class="space-y-3 text-sm text-stone-400">
              <li><NuxtLink to="/furniture/all" class="hover:text-white transition-colors">All Furniture</NuxtLink></li>
              <li><NuxtLink to="/furniture/category/living-room" class="hover:text-white transition-colors">Living Room</NuxtLink></li>
              <li><NuxtLink to="/furniture/category/bedroom" class="hover:text-white transition-colors">Bedroom</NuxtLink></li>
              <li><NuxtLink to="/furniture/likes" class="hover:text-white transition-colors">My Wishlist</NuxtLink></li>
            </ul>
          </div>

          <!-- Features -->
          <div>
            <h4 class="font-medium text-sm uppercase tracking-wider text-stone-400 mb-4">Features</h4>
            <ul class="space-y-3 text-sm text-stone-400">
              <li>
                <NuxtLink to="/3d-demo" class="hover:text-white transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  3D Product Viewer
                </NuxtLink>
              </li>
              <li><a href="#" class="hover:text-white transition-colors">Delivery Information</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Returns & Refunds</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div>
            <h4 class="font-medium text-sm uppercase tracking-wider text-stone-400 mb-4">Stay Inspired</h4>
            <p class="text-stone-400 text-sm mb-4">Get design tips and exclusive offers.</p>
            <div class="flex">
              <input 
                type="email" 
                placeholder="Your email"
                class="flex-1 bg-stone-800 border-0 px-4 py-2 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button class="bg-amber-600 px-4 py-2 text-sm font-medium hover:bg-amber-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div class="border-t border-stone-800 mt-12 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p class="text-sm text-stone-500">
            © 2024 Furniture. All rights reserved.
          </p>
          <NuxtLink 
            to="/industry" 
            class="flex items-center gap-2 text-sm text-stone-500 hover:text-white transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Switch to B2B Shop
          </NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import client from '../.frontstack/generated-client'

const FURNITURE_KEY = '019560702a3d71319d2544ae6a175c2c'

const { likeCount } = useLikeList()
const { itemCount, initCart } = useShopwareCart()
const { setLayout } = useShopLayout()

// Set this layout as current when mounted
onMounted(() => {
  setLayout('furniture')
})

// Shopware cart count
const shopwareCartCount = computed(() => itemCount.value)

// Cart sidebar state
const cartSidebarOpen = ref(false)

const scrolled = ref(false)
const mobileMenuOpen = ref(false)

// Search state
const searchOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const searchLoading = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchDebounceTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const popularSearches = ['Sofa', 'Chair', 'Table', 'Lamp', 'Bed', 'Storage']

// Open cart sidebar
const openCartSidebar = () => {
  cartSidebarOpen.value = true
}

// Search functions
const openSearch = () => {
  searchOpen.value = true
  // Focus input after transition
  nextTick(() => {
    setTimeout(() => {
      searchInputRef.value?.focus()
    }, 100)
  })
  // Prevent body scroll
  if (import.meta.client) {
    document.body.style.overflow = 'hidden'
  }
}

const closeSearch = () => {
  searchOpen.value = false
  searchQuery.value = ''
  searchResults.value = []
  // Restore body scroll
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  searchInputRef.value?.focus()
}

const handleSearchInput = () => {
  // Debounce search
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }
  
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  
  searchDebounceTimer.value = setTimeout(() => {
    performSearch()
  }, 300)
}

const performSearch = async () => {
  if (searchQuery.value.length < 2) return
  
  try {
    searchLoading.value = true
    console.log('Searching for:', searchQuery.value)
    
    const response = await client.listing('CategoryProducts', {
      categoryId: FURNITURE_KEY
    }, {
      query: {
        search: searchQuery.value,
        limit: 24
      }
    })
    
    searchResults.value = response.items || []
    console.log('Search results:', searchResults.value.length)
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

const handleSearchSubmit = () => {
  if (searchQuery.value.length >= 2) {
    performSearch()
  }
}

const formatPrice = (price?: { amount: number; currency: string; precision: number }) => {
  if (!price) return ''
  const amount = price.amount / Math.pow(10, price.precision || 2)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency || 'USD'
  }).format(amount)
}

// Keyboard shortcut for search (Cmd/Ctrl + K)
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    if (searchOpen.value) {
      closeSearch()
    } else {
      openSearch()
    }
  }
}

onMounted(() => {
  const handleScroll = () => {
    scrolled.value = window.scrollY > 20
  }
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('keydown', handleKeydown)
  handleScroll()
  
  // Initialize Shopware cart
  initCart()
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('keydown', handleKeydown)
    if (searchDebounceTimer.value) {
      clearTimeout(searchDebounceTimer.value)
    }
  })
})
</script>
