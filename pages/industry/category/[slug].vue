<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="py-16">
      <div class="max-w-7xl mx-auto px-6">
        <div class="animate-pulse space-y-8">
          <div class="h-8 w-64 bg-slate-800 rounded" />
          <div class="h-4 w-96 bg-slate-800 rounded" />
          <div class="space-y-3 mt-12">
            <div v-for="i in 6" :key="i" class="bg-slate-900 border border-slate-800 p-4">
              <div class="flex gap-4">
                <div class="w-24 h-24 bg-slate-800" />
                <div class="flex-1 space-y-3">
                  <div class="h-4 bg-slate-800 w-1/3" />
                  <div class="h-3 bg-slate-800 w-1/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-16">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <h1 class="text-3xl font-bold text-white mb-4">Category Not Found</h1>
        <p class="text-slate-400 mb-8">The category you're looking for doesn't exist.</p>
        <NuxtLink to="/industry" class="text-blue-400 hover:text-blue-300">
          ← Back to All Products
        </NuxtLink>
      </div>
    </div>

    <!-- Category Content -->
    <template v-else>
      <!-- Header -->
      <section class="bg-gradient-to-b from-slate-900 to-slate-950 py-12">
        <div class="max-w-7xl mx-auto px-6">
          <!-- Breadcrumb -->
          <nav v-if="category?.breadcrumb?.length" class="mb-4">
            <ol class="flex items-center gap-2 text-sm text-slate-500">
              <li>
                <NuxtLink to="/industry" class="hover:text-white transition-colors">Products</NuxtLink>
              </li>
              <template v-for="(crumb, index) in category.breadcrumb.slice(1)" :key="index">
                <li class="flex items-center gap-2">
                  <span>/</span>
                  <span :class="index === category.breadcrumb.length - 2 ? 'text-slate-300' : ''">
                    {{ crumb }}
                  </span>
                </li>
              </template>
            </ol>
          </nav>

          <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 class="text-3xl lg:text-4xl font-bold text-white mb-2">
                {{ category?.title }}
              </h1>
              <p v-if="totalProducts > 0" class="text-slate-400">
                {{ totalProducts }} products available
              </p>
            </div>
            
            <!-- Search -->
            <div class="relative w-full lg:w-80">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search in category..."
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

      <!-- Products -->
      <section class="py-8 bg-slate-950">
        <div class="max-w-7xl mx-auto px-6">
          <!-- Toolbar -->
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div class="flex items-center gap-4">
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

          <!-- Products Loading -->
          <div v-if="productsLoading" class="space-y-3">
            <div v-for="i in 6" :key="i" class="bg-slate-900 border border-slate-800 p-4 animate-pulse">
              <div class="flex gap-4">
                <div class="w-24 h-24 bg-slate-800" />
                <div class="flex-1 space-y-3">
                  <div class="h-4 bg-slate-800 w-1/3" />
                  <div class="h-3 bg-slate-800 w-1/4" />
                </div>
              </div>
            </div>
          </div>

          <!-- Products List -->
          <div v-else-if="products.length > 0 && viewMode === 'list'" class="space-y-3">
            <IndustryProductCard 
              v-for="product in products" 
              :key="product.key" 
              :product="product" 
            />
          </div>

          <!-- Products Grid -->
          <div v-else-if="products.length > 0 && viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <IndustryProductCardGrid 
              v-for="product in products" 
              :key="product.key" 
              :product="product" 
            />
          </div>

          <!-- No Products -->
          <div v-else class="text-center py-16">
            <p class="text-slate-500 mb-4">No products found in this category.</p>
            <NuxtLink to="/industry" class="text-blue-400 hover:text-blue-300">
              ← Browse all products
            </NuxtLink>
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
    </template>
  </div>
</template>

<script setup lang="ts">
import client from '../../../.frontstack/generated-client'

definePageMeta({
  layout: 'industry'
})

const route = useRoute()
const slug = computed(() => route.params.slug as string)

// State
const category = ref<CategoryDetail | null>(null)
const products = ref<ProductCard[]>([])
const loading = ref(true)
const productsLoading = ref(false)
const error = ref(false)
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

// Fetch category
const fetchCategory = async () => {
  try {
    // Find category by slug or key
    const response = await client.listing('AllCategories', {}, {
      query: {
        filter: [
          {
            type: 'or',
            filter: [
              { type: 'equals', field: 'slug', value: slug.value },
              { type: 'equals', field: 'key', value: slug.value }
            ]
          }
        ],
        limit: 1
      }
    })
    
    const found = response.items?.[0]
    if (found) {
      category.value = await client.block('CategoryDetail', found.key)
      return found.key
    }
    
    error.value = true
    return null
  } catch (err) {
    console.error('Error fetching category:', err)
    error.value = true
    return null
  }
}

// Fetch products
const fetchProducts = async () => {
  if (!category.value?.key) return
  
  try {
    productsLoading.value = true
    
    const response = await client.listing('CategoryProducts', {
      categoryId: category.value.key
    }, {
      query: {
        search: searchQuery.value || undefined,
        sort: { field: 'name', order: sortOrder.value },
        page: currentPage.value,
        limit: 12
      }
    })
    
    products.value = response.items || []
    pagination.value = response.page || null
    totalProducts.value = response.total || 0
  } catch (err) {
    console.error('Error fetching products:', err)
  } finally {
    productsLoading.value = false
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

// Initialize
const init = async () => {
  loading.value = true
  error.value = false
  const categoryKey = await fetchCategory()
  if (categoryKey) {
    await fetchProducts()
  }
  loading.value = false
}

onMounted(init)

watch(slug, () => {
  searchQuery.value = ''
  currentPage.value = 1
  init()
})
</script>
