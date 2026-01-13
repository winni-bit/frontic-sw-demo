<template>
  <nav 
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="[
      scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
    ]"
  >
    <div class="container mx-auto px-6 lg:px-12">
      <div class="flex justify-between items-center h-20">
        <!-- Logo -->
        <NuxtLink 
          to="/" 
          class="font-serif text-2xl font-medium transition-colors"
          :class="[scrolled ? 'text-stone-900' : 'text-white']"
        >
          Store
        </NuxtLink>
        
        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-8">
          <!-- Categories Dropdown -->
          <div 
            class="relative"
            @mouseenter="categoriesOpen = true"
            @mouseleave="categoriesOpen = false"
          >
            <button 
              class="flex items-center gap-1 text-sm tracking-wider uppercase transition-colors py-2"
              :class="[scrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white/80 hover:text-white']"
            >
              Categories
              <svg 
                class="w-4 h-4 transition-transform duration-200" 
                :class="{ 'rotate-180': categoriesOpen }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div 
                v-if="categoriesOpen"
                class="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg border border-stone-100"
              >
                <!-- Loading State -->
                <div v-if="categoriesLoading" class="p-4 space-y-3">
                  <div v-for="i in 4" :key="i" class="h-4 bg-stone-100 animate-pulse rounded" />
                </div>

                <!-- Categories List -->
                <div v-else class="py-2">
                  <NuxtLink
                    v-for="category in categories"
                    :key="category.key"
                    :to="`/category/${category.slug || category.key}`"
                    class="block px-4 py-3 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                    @click="categoriesOpen = false"
                  >
                    {{ category.title }}
                  </NuxtLink>

                  <!-- No Categories -->
                  <div v-if="categories.length === 0" class="px-4 py-3 text-sm text-stone-400">
                    No categories available
                  </div>

                  <!-- View All Link -->
                  <div v-if="categories.length > 0" class="border-t border-stone-100 mt-2 pt-2">
                    <NuxtLink
                      to="/collections"
                      class="block px-4 py-3 text-sm font-medium text-stone-900 hover:bg-stone-50 transition-colors"
                      @click="categoriesOpen = false"
                    >
                      View All Collections →
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <NuxtLink 
            to="/products" 
            class="text-sm tracking-wider uppercase transition-colors"
            :class="[scrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white/80 hover:text-white']"
          >
            Shop
          </NuxtLink>
          <NuxtLink 
            to="/about" 
            class="text-sm tracking-wider uppercase transition-colors"
            :class="[scrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white/80 hover:text-white']"
          >
            About
          </NuxtLink>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-6">
          <!-- Search -->
          <button 
            class="transition-colors"
            :class="[scrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white/80 hover:text-white']"
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
            class="relative transition-colors"
            :class="[scrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white/80 hover:text-white']"
            aria-label="Wishlist"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span 
              v-if="likeCount > 0" 
              class="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center"
            >
              {{ likeCount }}
            </span>
          </NuxtLink>

          <!-- Cart -->
          <button 
            @click="openCartSidebar"
            class="relative transition-colors"
            :class="[scrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white/80 hover:text-white']"
            aria-label="Cart"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span 
              v-if="cartCount > 0" 
              class="absolute -top-2 -right-2 w-5 h-5 text-xs rounded-full flex items-center justify-center"
              :class="[scrolled ? 'bg-stone-900 text-white' : 'bg-white text-stone-900']"
            >
              {{ cartCount }}
            </span>
          </button>

          <!-- Mobile Menu Toggle -->
          <button 
            class="md:hidden transition-colors"
            :class="[scrolled ? 'text-stone-600' : 'text-white']"
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
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div 
        v-if="mobileMenuOpen" 
        class="md:hidden bg-white border-t border-stone-100"
      >
        <div class="container mx-auto px-6 py-6">
          <!-- Categories Section -->
          <div class="mb-6">
            <p class="text-xs text-stone-400 uppercase tracking-wider mb-3">Categories</p>
            <div v-if="categoriesLoading" class="space-y-2">
              <div v-for="i in 3" :key="i" class="h-4 bg-stone-100 animate-pulse rounded w-32" />
            </div>
            <div v-else class="space-y-1">
              <NuxtLink
                v-for="category in categories"
                :key="category.key"
                :to="`/category/${category.slug || category.key}`"
                class="block text-stone-900 text-sm py-2"
                @click="mobileMenuOpen = false"
              >
                {{ category.title }}
              </NuxtLink>
              <p v-if="categories.length === 0" class="text-stone-400 text-sm py-2">
                No categories available
              </p>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-stone-100 my-4" />

          <!-- Other Links -->
          <div class="space-y-1">
            <NuxtLink 
              to="/products" 
              class="block text-stone-900 text-sm tracking-wider uppercase py-2"
              @click="mobileMenuOpen = false"
            >
              All Products
            </NuxtLink>
            <NuxtLink 
              to="/collections" 
              class="block text-stone-900 text-sm tracking-wider uppercase py-2"
              @click="mobileMenuOpen = false"
            >
              All Collections
            </NuxtLink>
            <NuxtLink 
              to="/furniture/likes" 
              class="block text-stone-900 text-sm tracking-wider uppercase py-2"
              @click="mobileMenuOpen = false"
            >
              Wishlist
            </NuxtLink>
            <button 
              @click="openCartSidebar(); mobileMenuOpen = false"
              class="block text-stone-900 text-sm tracking-wider uppercase py-2 w-full text-left"
            >
              Cart ({{ cartCount }})
            </button>
            <NuxtLink 
              to="/about" 
              class="block text-stone-900 text-sm tracking-wider uppercase py-2"
              @click="mobileMenuOpen = false"
            >
              About
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>

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
            <div class="container mx-auto px-6 py-6">
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
  </nav>
</template>

<script setup lang="ts">
import client from '../../.frontstack/generated-client'

const FURNITURE_KEY = '019560702a3d71319d2544ae6a175c2c'

const { likeCount } = useLikeList()
const { itemCount, initCart } = useShopwareCart()

// Cart sidebar state
const cartSidebarOpen = ref(false)

// Use itemCount directly from composable
const cartCount = computed(() => itemCount.value)

const scrolled = ref(false)
const mobileMenuOpen = ref(false)
const categoriesOpen = ref(false)
const categories = ref<CategoryCard[]>([])
const categoriesLoading = ref(true)

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

// Fetch categories for navigation
const fetchCategories = async () => {
  try {
    categoriesLoading.value = true
    const response = await client.listing('AllCategories', {}, {
      query: {
        limit: 48
      }
    })
    categories.value = response.items || []
    console.log('Navigation categories loaded:', categories.value.length, categories.value.map(c => c.title))
  } catch (error) {
    console.error('Error fetching navigation categories:', error)
  } finally {
    categoriesLoading.value = false
  }
}

// Search functions
const openSearch = () => {
  searchOpen.value = true
  // Focus input after transition
  setTimeout(() => {
    searchInputRef.value?.focus()
  }, 100)
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
  // Scroll handler
  const handleScroll = () => {
    scrolled.value = window.scrollY > 50
  }
  
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('keydown', handleKeydown)
  handleScroll()
  
  // Fetch categories
  fetchCategories()
  
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
