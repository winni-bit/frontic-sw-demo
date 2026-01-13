<template>
  <div>
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-b from-slate-900 to-slate-950 py-12 lg:py-16">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div class="max-w-xl">
            <p class="text-blue-400 text-sm font-medium tracking-wider uppercase mb-2">
              Professional Equipment
            </p>
            <h1 class="text-3xl lg:text-4xl font-bold text-white mb-3">
              Industrial Products Catalog
            </h1>
            <p class="text-slate-400">
              Browse our complete range of professional tools and machinery.
            </p>
          </div>
          
          <!-- Search Bar -->
          <div class="relative w-full lg:w-96">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name or SKU..."
              class="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 pr-10 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              @input="debouncedSearch"
            />
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Products Section -->
    <section class="py-8 bg-slate-950">
      <div class="max-w-7xl mx-auto px-6">
        <!-- Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div class="flex items-center gap-4">
            <span class="text-slate-400 text-sm">
              <span v-if="!loading">{{ totalProducts }} products</span>
              <span v-else>Loading...</span>
            </span>
            
            <!-- View Toggle -->
            <div class="flex items-center border border-slate-700">
              <button 
                @click="viewMode = 'list'"
                class="p-2 transition-colors"
                :class="viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button 
                @click="viewMode = 'grid'"
                class="p-2 transition-colors"
                :class="viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <label class="text-slate-500 text-sm">Sort:</label>
            <select
              v-model="sortOrder"
              class="bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              @change="fetchProducts"
            >
              <option value="asc">Name A-Z</option>
              <option value="desc">Name Z-A</option>
            </select>
          </div>
        </div>

        <!-- Table Header (List View) -->
        <div v-if="viewMode === 'list' && !loading && products.length > 0" class="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800 mb-2">
          <div class="col-span-5">Product</div>
          <div class="col-span-2 text-right">Price</div>
          <div class="col-span-2">Availability</div>
          <div class="col-span-3">Actions</div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 6" :key="i" class="bg-slate-900 border border-slate-800 p-4 animate-pulse">
            <div class="flex gap-4">
              <div class="w-24 h-24 bg-slate-800" />
              <div class="flex-1 space-y-3">
                <div class="h-4 bg-slate-800 w-1/3" />
                <div class="h-3 bg-slate-800 w-1/4" />
                <div class="h-3 bg-slate-800 w-1/2" />
              </div>
            </div>
          </div>
        </div>

        <!-- Products List View -->
        <div v-else-if="products.length > 0 && viewMode === 'list'" class="space-y-3">
          <IndustryProductCard 
            v-for="product in products" 
            :key="product.key" 
            :product="product" 
          />
        </div>

        <!-- Products Grid View -->
        <div v-else-if="products.length > 0 && viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <IndustryProductCardGrid 
            v-for="product in products" 
            :key="product.key" 
            :product="product" 
          />
        </div>

        <!-- No Products -->
        <div v-else class="text-center py-16">
          <svg class="w-16 h-16 text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p class="text-slate-500 mb-4">No products found.</p>
          <button 
            v-if="searchQuery"
            @click="clearSearch"
            class="text-blue-400 hover:text-blue-300 text-sm"
          >
            Clear search
          </button>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.last > 1" class="mt-8 flex items-center justify-between">
          <span class="text-slate-500 text-sm">
            Showing {{ (pagination.current - 1) * 12 + 1 }}-{{ Math.min(pagination.current * 12, totalProducts) }} of {{ totalProducts }}
          </span>
          
          <div class="flex items-center gap-2">
            <button
              :disabled="!pagination.prev"
              class="px-4 py-2 bg-slate-800 border border-slate-700 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              @click="goToPage(pagination.prev)"
            >
              Previous
            </button>
            
            <button
              :disabled="!pagination.next"
              class="px-4 py-2 bg-slate-800 border border-slate-700 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              @click="goToPage(pagination.next)"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- B2B Banner -->
    <section class="py-12 bg-slate-900 border-t border-slate-800">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-white font-medium mb-1">Volume Discounts</h3>
              <p class="text-slate-400 text-sm">Get better prices on bulk orders. Contact us for custom quotes.</p>
            </div>
          </div>
          
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-white font-medium mb-1">Fast Shipping</h3>
              <p class="text-slate-400 text-sm">Most items ship within 1-2 business days.</p>
            </div>
          </div>
          
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-white font-medium mb-1">Technical Support</h3>
              <p class="text-slate-400 text-sm">Expert assistance for all your equipment needs.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import client from '../../.frontstack/generated-client'

definePageMeta({
  layout: 'industry'
})

const INDUSTRY_KEY = '0195609b58697ea591dab38582f3e88b'

// State
const products = ref<ProductCard[]>([])
const loading = ref(true)
const searchQuery = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')
const viewMode = ref<'list' | 'grid'>('list')
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

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchProducts()
}

// Fetch products
const fetchProducts = async () => {
  try {
    loading.value = true
    
    const response = await client.listing('CategoryProducts', {
      categoryId: INDUSTRY_KEY
    }, {
      query: {
        search: searchQuery.value || undefined,
        sort: {
          field: 'name',
          order: sortOrder.value
        },
        page: currentPage.value,
        limit: 12
      }
    })
    
    products.value = response.items || []
    pagination.value = response.page || null
    totalProducts.value = response.total || 0
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    loading.value = false
  }
}

// Pagination
const goToPage = (page: number | null) => {
  if (page) {
    currentPage.value = page
    fetchProducts()
    window.scrollTo({ top: 200, behavior: 'smooth' })
  }
}

onMounted(fetchProducts)
</script>
