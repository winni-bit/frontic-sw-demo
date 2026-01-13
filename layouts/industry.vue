<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <!-- Industry Navigation -->
    <nav 
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      :class="scrolled ? 'bg-slate-900/95 backdrop-blur-sm border-b border-slate-800' : 'bg-transparent'"
    >
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink to="/industry" class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-500 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span class="font-bold text-lg tracking-tight">INDUSTRY</span>
          </NuxtLink>

          <!-- Desktop Nav - Main Categories -->
          <div class="hidden md:flex items-center gap-1">
            <div 
              v-for="mainCat in mainCategories" 
              :key="mainCat.key"
              class="relative"
              @mouseenter="openCategory = mainCat.key"
              @mouseleave="openCategory = null"
            >
              <!-- Category Button -->
              <NuxtLink
                :to="`/industry/category/${mainCat.slug || mainCat.key}`"
                class="flex items-center gap-1 px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                {{ mainCat.title }}
                <svg 
                  v-if="getSubCategories(mainCat.key).length > 0"
                  class="w-3.5 h-3.5 transition-transform duration-200" 
                  :class="{ 'rotate-180': openCategory === mainCat.key }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
                </svg>
              </NuxtLink>

              <!-- Subcategories Dropdown -->
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 -translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-2"
              >
                <div 
                  v-if="openCategory === mainCat.key && getSubCategories(mainCat.key).length > 0"
                  class="absolute top-full left-0 mt-1 w-56 bg-slate-900 border border-slate-700 shadow-xl py-2"
                >
                  <NuxtLink
                    v-for="subCat in getSubCategories(mainCat.key)"
                    :key="subCat.key"
                    :to="`/industry/category/${subCat.slug || subCat.key}`"
                    class="block px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    {{ subCat.title }}
                  </NuxtLink>
                  
                  <!-- View All in Category -->
                  <div class="border-t border-slate-700 mt-2 pt-2">
                    <NuxtLink
                      :to="`/industry/category/${mainCat.slug || mainCat.key}`"
                      class="flex items-center justify-between px-4 py-2 text-sm text-blue-400 hover:bg-slate-800 transition-colors"
                    >
                      <span>All {{ mainCat.title }}</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </NuxtLink>
                  </div>
                </div>
              </Transition>
            </div>
            
            <!-- All Products Link -->
            <NuxtLink
              to="/industry"
              class="px-4 py-2 text-sm text-slate-500 hover:text-white transition-colors"
            >
              All Products
            </NuxtLink>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-4">
            <!-- Switch to Furniture -->
            <NuxtLink 
              to="/" 
              class="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Furniture Shop
            </NuxtLink>
            
            <!-- Divider -->
            <div class="hidden sm:block w-px h-5 bg-slate-700" />
            
            <!-- Search -->
            <button class="p-2 text-slate-400 hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <!-- Cart -->
            <NuxtLink to="/cart" class="p-2 text-slate-400 hover:text-white transition-colors relative">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span v-if="cartCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                {{ cartCount }}
              </span>
            </NuxtLink>

            <!-- Mobile Menu -->
            <button 
              class="md:hidden p-2 text-slate-400"
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
        <div v-if="mobileMenuOpen" class="md:hidden bg-slate-900 border-t border-slate-800 max-h-[80vh] overflow-y-auto">
          <div class="px-6 py-4">
            <!-- Categories -->
            <div v-if="categoriesLoading" class="space-y-2 py-2">
              <div v-for="i in 3" :key="i" class="h-4 bg-slate-800 animate-pulse rounded w-32" />
            </div>
            
            <div v-else class="space-y-1">
              <div v-for="mainCat in mainCategories" :key="mainCat.key" class="border-b border-slate-800 last:border-0">
                <!-- Main Category -->
                <div class="flex items-center justify-between py-3">
                  <NuxtLink
                    :to="`/industry/category/${mainCat.slug || mainCat.key}`"
                    class="text-slate-200 font-medium"
                    @click="mobileMenuOpen = false"
                  >
                    {{ mainCat.title }}
                  </NuxtLink>
                  <button 
                    v-if="getSubCategories(mainCat.key).length > 0"
                    class="p-1 text-slate-500"
                    @click="toggleMobileCategory(mainCat.key)"
                  >
                    <svg 
                      class="w-5 h-5 transition-transform duration-200"
                      :class="{ 'rotate-180': expandedMobileCategories.includes(mainCat.key) }"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                <!-- Sub Categories -->
                <div 
                  v-if="expandedMobileCategories.includes(mainCat.key)"
                  class="pb-3 pl-4 space-y-1"
                >
                  <NuxtLink
                    v-for="subCat in getSubCategories(mainCat.key)"
                    :key="subCat.key"
                    :to="`/industry/category/${subCat.slug || subCat.key}`"
                    class="block py-2 text-sm text-slate-400"
                    @click="mobileMenuOpen = false"
                  >
                    {{ subCat.title }}
                  </NuxtLink>
                </div>
              </div>
            </div>
            
            <!-- All Products -->
            <NuxtLink 
              to="/industry" 
              class="block py-3 text-slate-400 border-t border-slate-800 mt-2"
              @click="mobileMenuOpen = false"
            >
              All Products
            </NuxtLink>
            
            <!-- Switch Shop -->
            <NuxtLink 
              to="/" 
              class="flex items-center gap-2 text-slate-500 py-3 border-t border-slate-800"
              @click="mobileMenuOpen = false"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Switch to Furniture Shop
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </nav>

    <!-- Main Content -->
    <main class="pt-16">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-slate-900 border-t border-slate-800 mt-20">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand -->
          <div>
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 bg-blue-500 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span class="font-bold">INDUSTRY</span>
            </div>
            <p class="text-slate-500 text-sm">
              Professional equipment and tools for industry professionals.
            </p>
          </div>

          <!-- Categories -->
          <div>
            <h4 class="font-medium text-sm uppercase tracking-wider text-slate-400 mb-4">Categories</h4>
            <ul class="space-y-2 text-sm text-slate-500">
              <li v-for="cat in mainCategories" :key="cat.key">
                <NuxtLink :to="`/industry/category/${cat.slug || cat.key}`" class="hover:text-white transition-colors">
                  {{ cat.title }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="font-medium text-sm uppercase tracking-wider text-slate-400 mb-4">Support</h4>
            <ul class="space-y-2 text-sm text-slate-500">
              <li><a href="#" class="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Technical Support</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Documentation</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-medium text-sm uppercase tracking-wider text-slate-400 mb-4">B2B Services</h4>
            <ul class="space-y-2 text-sm text-slate-500">
              <li><a href="#" class="hover:text-white transition-colors">Volume Pricing</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Business Account</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Bulk Orders</a></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p class="text-sm text-slate-600">
            © 2024 Industry. All rights reserved.
          </p>
          <NuxtLink 
            to="/" 
            class="flex items-center gap-2 text-sm text-slate-600 hover:text-white transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Switch to Furniture Shop
          </NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import client from '../.frontstack/generated-client'

const { items } = useCart()
const cartCount = computed(() => items.value.length)
const scrolled = ref(false)
const mobileMenuOpen = ref(false)
const openCategory = ref<string | null>(null)
const expandedMobileCategories = ref<string[]>([])
const categoriesLoading = ref(true)

// Category data
const allCategories = ref<CategoryCard[]>([])
const INDUSTRY_KEY = '0195609b58697ea591dab38582f3e88b'

// Main categories (Level 2 under Industry)
const mainCategories = computed(() => {
  return allCategories.value.filter(c => c.parentKey === INDUSTRY_KEY)
})

// Get sub categories for a parent
const getSubCategories = (parentKey: string) => {
  return allCategories.value.filter(c => c.parentKey === parentKey)
}

// Toggle mobile category expansion
const toggleMobileCategory = (key: string) => {
  const index = expandedMobileCategories.value.indexOf(key)
  if (index > -1) {
    expandedMobileCategories.value.splice(index, 1)
  } else {
    expandedMobileCategories.value.push(key)
  }
}

// Fetch categories
const fetchCategories = async () => {
  try {
    categoriesLoading.value = true
    const response = await client.listing('AllCategories', {}, {
      query: { limit: 48 }
    })
    allCategories.value = response.items || []
    console.log('Industry categories loaded:', mainCategories.value.map(c => c.title))
  } catch (error) {
    console.error('Error fetching categories:', error)
  } finally {
    categoriesLoading.value = false
  }
}

onMounted(() => {
  // Scroll handler
  const handleScroll = () => {
    scrolled.value = window.scrollY > 20
  }
  window.addEventListener('scroll', handleScroll)
  handleScroll()
  
  // Fetch categories
  fetchCategories()
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})
</script>
