<template>
  <div class="min-h-screen bg-white">
    <!-- Header Section -->
    <section class="pt-32 pb-12 bg-stone-50">
      <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <h1 class="font-serif text-4xl md:text-5xl lg:text-6xl text-stone-900 mb-4">
          All Products
        </h1>
        <p class="text-lg text-stone-600 max-w-2xl">
          Discover our complete collection of premium products, crafted with exceptional quality and timeless design.
        </p>
        <p v-if="totalProducts > 0" class="mt-4 text-sm text-stone-500">
          {{ totalProducts }} Products
        </p>
      </div>
    </section>

    <!-- Products Section -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <!-- Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-stone-200">
          <!-- Search -->
          <div class="relative flex-1 max-w-md">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products..."
              class="w-full pl-10 pr-4 py-3 border border-stone-200 focus:border-stone-900 focus:outline-none text-sm"
              @input="debouncedSearch"
            />
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Sort -->
          <div class="flex items-center gap-4">
            <label class="text-sm text-stone-500">Sort by:</label>
            <select
              v-model="sortOrder"
              class="border border-stone-200 px-4 py-2 text-sm focus:border-stone-900 focus:outline-none bg-white"
              @change="fetchProducts"
            >
              <option value="asc">Name A-Z</option>
              <option value="desc">Name Z-A</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div v-for="i in 12" :key="i" class="space-y-4 animate-pulse">
            <div class="aspect-[3/4] bg-stone-100" />
            <div class="h-4 w-3/4 bg-stone-100" />
            <div class="h-4 w-1/2 bg-stone-100" />
          </div>
        </div>

        <!-- Products Grid -->
        <div v-else-if="products.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCard 
            v-for="product in products" 
            :key="product.key" 
            :product="product" 
          />
        </div>

        <!-- No Products -->
        <div v-else class="text-center py-16">
          <p class="text-stone-500 mb-4">No products found.</p>
          <button 
            v-if="searchQuery"
            @click="clearSearch"
            class="text-stone-900 underline hover:no-underline"
          >
            Clear search
          </button>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.last > 1" class="mt-12 flex justify-center">
          <div class="flex items-center gap-2">
            <button
              :disabled="!pagination.prev"
              class="px-4 py-2 border border-stone-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-stone-900 transition-colors"
              @click="goToPage(pagination.prev)"
            >
              Previous
            </button>
            
            <span class="px-4 py-2 text-sm text-stone-600">
              Page {{ pagination.current }} of {{ pagination.last }}
            </span>
            
            <button
              :disabled="!pagination.next"
              class="px-4 py-2 border border-stone-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-stone-900 transition-colors"
              @click="goToPage(pagination.next)"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import client from '../.frontstack/generated-client'

// State
const products = ref<ProductCard[]>([])
const loading = ref(true)
const searchQuery = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const pagination = ref<Pagination | null>(null)
const totalProducts = ref(0)

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchProducts()
  }, 300)
}

// Clear search
const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchProducts()
}

// Fetch products
const fetchProducts = async () => {
  try {
    loading.value = true
    
    const response = await client.listing('FeaturedProducts', {}, {
      query: {
        search: searchQuery.value || undefined,
        page: currentPage.value,
        limit: 12
      }
    })
    
    products.value = response.items || []
    pagination.value = response.page || null
    totalProducts.value = response.total || 0
    
    console.log('Products loaded:', products.value.length, 'of', totalProducts.value)
  } catch (err) {
    console.error('Error fetching products:', err)
  } finally {
    loading.value = false
  }
}

// Pagination
const goToPage = (page: number | null) => {
  if (page) {
    currentPage.value = page
    fetchProducts()
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }
}

// Initialize
onMounted(fetchProducts)
</script>
