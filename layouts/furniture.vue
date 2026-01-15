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

          <!-- Desktop Nav - Dynamic Categories -->
          <div class="hidden md:flex items-center gap-10">
            <template v-if="categoriesLoading">
              <div v-for="i in 4" :key="i" class="h-4 w-20 bg-stone-200 rounded animate-pulse" />
            </template>
            <template v-else>
              <NuxtLink 
                v-for="category in navCategories"
                :key="category.key"
                :to="`/furniture/category/${category.key}`"
                class="text-sm text-stone-600 hover:text-stone-900 transition-colors"
              >
                {{ category.title }}
              </NuxtLink>
            </template>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-4">
            <NuxtLink to="/industry" class="hidden sm:flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              B2B Shop
            </NuxtLink>
            
            <div class="hidden sm:block w-px h-5 bg-stone-200" />
            
            <button class="p-2 text-stone-500 hover:text-stone-900 transition-colors" @click="openSearch">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <!-- Account Dropdown -->
            <div class="relative" @mouseenter="accountDropdownOpen = true" @mouseleave="accountDropdownOpen = false">
              <NuxtLink :to="isLoggedIn ? '/account' : '/account/login'" class="p-2 text-stone-500 hover:text-stone-900 transition-colors relative block">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span v-if="isLoggedIn" class="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              </NuxtLink>
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 -translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-2"
              >
                <div v-if="accountDropdownOpen && isLoggedIn" class="absolute top-full right-0 mt-2 w-56 bg-white shadow-lg border border-stone-100">
                  <div class="py-2">
                    <div class="px-4 py-3 border-b border-stone-100">
                      <p class="text-sm font-medium text-stone-900 truncate">{{ customerName }}</p>
                      <p class="text-xs text-stone-500 truncate">{{ customerEmail }}</p>
                    </div>
                    <NuxtLink to="/account" class="block px-4 py-3 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50" @click="accountDropdownOpen = false">Mein Konto</NuxtLink>
                    <NuxtLink to="/account/orders" class="block px-4 py-3 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50" @click="accountDropdownOpen = false">Meine Bestellungen</NuxtLink>
                    <div class="border-t border-stone-100 my-2" />
                    <button @click="handleLogout" class="w-full px-4 py-3 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-left">Abmelden</button>
                  </div>
                </div>
              </Transition>
            </div>
            
            <NuxtLink to="/furniture/likes" class="p-2 text-stone-500 hover:text-stone-900 transition-colors relative">
              <svg class="w-5 h-5" :class="likeCount > 0 ? 'text-rose-500 fill-rose-500' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span v-if="likeCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">{{ likeCount > 9 ? '9+' : likeCount }}</span>
            </NuxtLink>
            
            <button @click="openCartSidebar" class="p-2 text-stone-500 hover:text-stone-900 transition-colors relative">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span v-if="shopwareCartCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center">{{ shopwareCartCount > 9 ? '9+' : shopwareCartCount }}</span>
            </button>

            <button class="md:hidden p-2 text-stone-500" @click="mobileMenuOpen = !mobileMenuOpen">
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
            <div class="pb-3 border-b border-stone-100">
              <template v-if="isLoggedIn">
                <p class="text-xs text-stone-400 uppercase tracking-wider mb-2">Angemeldet als</p>
                <p class="text-sm font-medium text-stone-900 mb-3">{{ customerName }}</p>
                <NuxtLink to="/account" class="block text-stone-600 text-sm py-2" @click="mobileMenuOpen = false">Mein Konto</NuxtLink>
                <NuxtLink to="/account/orders" class="block text-stone-600 text-sm py-2" @click="mobileMenuOpen = false">Meine Bestellungen</NuxtLink>
                <button @click="handleLogout(); mobileMenuOpen = false" class="block text-stone-600 text-sm py-2 w-full text-left">Abmelden</button>
              </template>
              <template v-else>
                <NuxtLink to="/account/login" class="block text-stone-900 text-sm font-medium py-2" @click="mobileMenuOpen = false">Anmelden</NuxtLink>
                <NuxtLink to="/account/register" class="block text-stone-600 text-sm py-2" @click="mobileMenuOpen = false">Konto erstellen</NuxtLink>
              </template>
            </div>
            <button class="flex items-center gap-2 text-stone-700 py-2 w-full" @click="mobileMenuOpen = false; openSearch()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Produkte suchen
            </button>
            <div class="border-t border-stone-100 pt-3" />
            <NuxtLink v-for="category in navCategories" :key="category.key" :to="`/furniture/category/${category.key}`" class="block text-stone-700 py-2" @click="mobileMenuOpen = false">{{ category.title }}</NuxtLink>
            <NuxtLink to="/furniture/likes" class="flex items-center gap-2 text-stone-700 py-2" @click="mobileMenuOpen = false">
              <svg class="w-5 h-5" :class="likeCount > 0 ? 'text-rose-500 fill-rose-500' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Wunschliste
            </NuxtLink>
            <button @click="mobileMenuOpen = false; openCartSidebar()" class="flex items-center gap-2 text-stone-700 py-2 w-full">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Warenkorb
            </button>
            <div class="border-t border-stone-100 pt-3 mt-3">
              <NuxtLink to="/industry" class="flex items-center gap-2 text-stone-400 py-2" @click="mobileMenuOpen = false">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Zum B2B Shop wechseln
              </NuxtLink>
            </div>
          </div>
        </div>
      </Transition>
    </nav>

    <!-- Search Overlay -->
    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="searchOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" @click.self="closeSearch">
          <div class="w-full bg-white">
            <div class="max-w-7xl mx-auto px-6 py-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="font-serif text-xl text-stone-900">Produkte suchen</h2>
                <button @click="closeSearch" class="p-2 text-stone-500 hover:text-stone-900">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="relative">
                <input ref="searchInputRef" v-model="searchQuery" type="text" placeholder="Suche nach Möbeln..." class="w-full px-6 py-4 text-lg border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none" @input="handleSearchInput" @keydown.enter="handleSearchSubmit" @keydown.esc="closeSearch" />
              </div>
              <div v-if="searchQuery.length >= 2" class="mt-6">
                <div v-if="searchLoading" class="py-8 text-center text-stone-500">Suche läuft...</div>
                <div v-else-if="searchResults.length > 0">
                  <p class="text-sm text-stone-500 mb-4">{{ searchResults.length }} Ergebnisse</p>
                  <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto">
                    <NuxtLink v-for="product in searchResults" :key="product.key" :to="`/product/${product.key}`" class="group block" @click="closeSearch">
                      <div class="aspect-square bg-stone-100 overflow-hidden mb-2">
                        <img v-if="product.cover?.thumbnailSrc || product.cover?.src" :src="product.cover.thumbnailSrc || product.cover.src" :alt="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <h3 class="text-sm text-stone-900 line-clamp-2">{{ product.name }}</h3>
                      <p class="text-sm text-stone-600 mt-1">{{ formatPrice(product.lowestPrice || product.price) }}</p>
                    </NuxtLink>
                  </div>
                </div>
                <div v-else class="py-8 text-center text-stone-500">Keine Produkte gefunden</div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <CheckoutCartSidebar :open="cartSidebarOpen" @close="cartSidebarOpen = false" />

    <main class="pt-20">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-stone-900 text-white mt-20">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 class="font-serif text-2xl mb-4">Furniture</h3>
            <p class="text-stone-400 text-sm">Wir schaffen schöne Räume mit durchdacht gestalteten Möbeln.</p>
          </div>
          <div>
            <h4 class="font-medium text-sm uppercase tracking-wider text-stone-400 mb-4">Shop</h4>
            <ul class="space-y-3 text-sm text-stone-400">
              <li v-for="category in navCategories" :key="category.key">
                <NuxtLink :to="`/furniture/category/${category.key}`" class="hover:text-white">{{ category.title }}</NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-sm uppercase tracking-wider text-stone-400 mb-4">Konto</h4>
            <ul class="space-y-3 text-sm text-stone-400">
              <li><NuxtLink to="/account/login" class="hover:text-white">Anmelden</NuxtLink></li>
              <li><NuxtLink to="/account/orders" class="hover:text-white">Bestellungen</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-sm uppercase tracking-wider text-stone-400 mb-4">Newsletter</h4>
            <div class="flex">
              <input type="email" placeholder="Ihre E-Mail" class="flex-1 bg-stone-800 px-4 py-2 text-sm text-white placeholder-stone-500" />
              <button class="bg-amber-600 px-4 py-2 text-sm font-medium hover:bg-amber-700">Anmelden</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import client from '../.frontstack/generated-client'

// Furniture root category key
const FURNITURE_KEY = '019560702a3d71319d2544ae6a175c2c'

const { likeCount } = useLikeList()
const { itemCount, initCart } = useShopwareCart()
const { isLoggedIn, customerName, customerEmail, logout, initAuth } = useShopwareAuth()
const { setLayout } = useShopLayout()

const navCategories = ref<Array<{ key: string; title: string }>>([])
const categoriesLoading = ref(true)
const shopwareCartCount = computed(() => itemCount.value)
const cartSidebarOpen = ref(false)
const accountDropdownOpen = ref(false)
const scrolled = ref(false)
const mobileMenuOpen = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const searchLoading = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchDebounceTimer = ref<ReturnType<typeof setTimeout> | null>(null)

// Load Furniture categories only (filter by parentKey or breadcrumb containing "Furniture")
const loadCategories = async () => {
  categoriesLoading.value = true
  try {
    const response = await client.listing('AllCategories', {}, {
      query: { limit: 48 }
    })
    
    if (response.items && response.items.length > 0) {
      // Filter for categories that belong to Furniture (parentKey = FURNITURE_KEY OR breadcrumb starts with "Furniture")
      const furnitureCategories = response.items.filter((cat: any) => {
        // Check if parentKey matches Furniture root
        if (cat.parentKey === FURNITURE_KEY) return true
        // Check if breadcrumb starts with "Furniture"
        if (cat.breadcrumb && cat.breadcrumb[0] === 'Furniture') return true
        return false
      })
      
      // Only take level 2 categories (direct children of Furniture)
      const level2Categories = furnitureCategories.filter((cat: any) => cat.level === 2)
      
      navCategories.value = level2Categories.slice(0, 5).map((cat: any) => ({
        key: cat.key,
        title: cat.title || cat.slug || 'Kategorie'
      }))
      
      console.log('[Furniture Nav] Categories loaded:', navCategories.value.map(c => c.title))
    }
  } catch (error) {
    console.error('[Furniture Nav] Error:', error)
  } finally {
    categoriesLoading.value = false
  }
}

const openCartSidebar = () => { cartSidebarOpen.value = true }
const handleLogout = async () => { await logout(); accountDropdownOpen.value = false }
const openSearch = () => {
  searchOpen.value = true
  nextTick(() => setTimeout(() => searchInputRef.value?.focus(), 100))
  if (import.meta.client) document.body.style.overflow = 'hidden'
}
const closeSearch = () => {
  searchOpen.value = false
  searchQuery.value = ''
  searchResults.value = []
  if (import.meta.client) document.body.style.overflow = ''
}

const handleSearchInput = () => {
  if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value)
  if (searchQuery.value.length < 2) { searchResults.value = []; return }
  searchDebounceTimer.value = setTimeout(performSearch, 300)
}

const performSearch = async () => {
  if (searchQuery.value.length < 2) return
  searchLoading.value = true
  try {
    // Search within Furniture category only
    const response = await client.listing('CategoryProducts', { categoryId: FURNITURE_KEY }, { query: { search: searchQuery.value, limit: 24 } })
    searchResults.value = response.items || []
  } catch (e) { searchResults.value = [] }
  finally { searchLoading.value = false }
}

const handleSearchSubmit = () => { if (searchQuery.value.length >= 2) performSearch() }

const formatPrice = (price?: { amount: number; currency: string; precision: number }) => {
  if (!price) return ''
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: price.currency || 'EUR' }).format(price.amount / Math.pow(10, price.precision || 2))
}

onMounted(() => {
  setLayout('furniture')
  const handleScroll = () => { scrolled.value = window.scrollY > 20 }
  window.addEventListener('scroll', handleScroll)
  handleScroll()
  initCart()
  initAuth()
  loadCategories()
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value)
  })
})
</script>
