<script setup lang="ts">
/**
 * Furniture Layout - Hauptlayout für den Furniture Shop
 * Verwendet Sub-Komponenten für Navigation, Search, Footer
 * ~95 Zeilen
 */
import client from '../.frontstack/generated-client'

const FURNITURE_KEY = '019560702a3d71319d2544ae6a175c2c'

// Composables
const { likeCount } = useLikeList()
const { itemCount, initCart } = useShopwareCart()
const { isLoggedIn, customerName, customerEmail, logout, initAuth } = useShopwareAuth()
const { setLayout } = useShopLayout()

// State
const navCategories = ref<Array<{ key: string; title: string }>>([])
const categoriesLoading = ref(true)
const cartSidebarOpen = ref(false)
const mobileMenuOpen = ref(false)
const scrolled = ref(false)

// Search State
const searchOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const searchLoading = ref(false)
const searchDebounceTimer = ref<ReturnType<typeof setTimeout> | null>(null)

// Computed
const shopwareCartCount = computed(() => itemCount.value)

// Load Categories
const loadCategories = async () => {
  categoriesLoading.value = true
  try {
    const response = await client.listing('AllCategories', {}, { query: { limit: 48 } })
    
    if (response.items?.length > 0) {
      const furnitureCategories = response.items.filter((cat: any) => 
        cat.parentKey === FURNITURE_KEY || cat.breadcrumb?.[0] === 'Furniture'
      )
      const level2Categories = furnitureCategories.filter((cat: any) => cat.level === 2)
      
      navCategories.value = level2Categories.slice(0, 5).map((cat: any) => ({
        key: cat.key,
        title: cat.title || cat.slug || 'Kategorie'
      }))
    }
  } catch (error) {
    console.error('[Furniture Nav] Error:', error)
  } finally {
    categoriesLoading.value = false
  }
}

// Search Handlers
const handleSearchInput = () => {
  if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value)
  if (searchQuery.value.length < 2) { searchResults.value = []; return }
  searchDebounceTimer.value = setTimeout(performSearch, 300)
}

const performSearch = async () => {
  if (searchQuery.value.length < 2) return
  searchLoading.value = true
  try {
    const response = await client.listing('CategoryProducts', { categoryId: FURNITURE_KEY }, { query: { search: searchQuery.value, limit: 24 } })
    searchResults.value = response.items || []
  } catch (e) { searchResults.value = [] }
  finally { searchLoading.value = false }
}

const closeSearch = () => {
  searchOpen.value = false
  searchQuery.value = ''
  searchResults.value = []
}

// Lifecycle
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

<template>
  <div class="min-h-screen bg-amber-50/30">
    <!-- Navigation -->
    <nav 
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      :class="scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'"
    >
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex items-center justify-between h-20">
          <LayoutFurnitureNavLogo />
          
          <LayoutFurnitureNavCategories 
            :categories="navCategories" 
            :loading="categoriesLoading" 
          />
          
          <LayoutFurnitureNavActions
            :is-logged-in="isLoggedIn"
            :customer-name="customerName"
            :customer-email="customerEmail"
            :like-count="likeCount"
            :cart-count="shopwareCartCount"
            @open-search="searchOpen = true"
            @open-cart="cartSidebarOpen = true"
            @logout="logout"
            @toggle-mobile-menu="mobileMenuOpen = !mobileMenuOpen"
          />
        </div>
      </div>

      <!-- Mobile Menu -->
      <LayoutFurnitureMobileMenu
        :open="mobileMenuOpen"
        :categories="navCategories"
        :is-logged-in="isLoggedIn"
        :customer-name="customerName"
        :like-count="likeCount"
        @close="mobileMenuOpen = false"
        @open-search="searchOpen = true"
        @open-cart="cartSidebarOpen = true"
        @logout="logout"
      />
    </nav>

    <!-- Search Overlay -->
    <LayoutFurnitureSearchOverlay
      :open="searchOpen"
      :loading="searchLoading"
      :results="searchResults"
      :query="searchQuery"
      @close="closeSearch"
      @update:query="searchQuery = $event; handleSearchInput()"
      @search="performSearch"
    />

    <!-- Cart Sidebar -->
    <CheckoutCartSidebar :open="cartSidebarOpen" @close="cartSidebarOpen = false" />

    <!-- Main Content -->
    <main class="pt-20">
      <slot />
    </main>

    <!-- Footer -->
    <LayoutFurnitureFooterSection :categories="navCategories" />
  </div>
</template>
