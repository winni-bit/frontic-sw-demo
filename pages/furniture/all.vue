<template>
  <div>
    <!-- Page Header -->
    <section class="bg-gradient-to-b from-amber-50 to-white py-16">
      <div class="max-w-7xl mx-auto px-6">
        <div class="max-w-2xl">
          <p class="text-amber-700 text-sm font-medium tracking-wider uppercase mb-3">
            Our Collection
          </p>
          <h1 class="font-serif text-4xl lg:text-5xl text-stone-900 mb-4">
            All Furniture
          </h1>
          <p class="text-stone-600 text-lg">
            Browse our complete collection of thoughtfully designed furniture for every room.
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="lg:grid lg:grid-cols-4 lg:gap-12">
          
          <!-- Mobile Filter Toggle -->
          <div class="lg:hidden mb-6">
            <button 
              @click="showMobileFilters = true"
              class="w-full flex items-center justify-center gap-2 border border-stone-200 py-3 text-stone-700"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              <span v-if="activeFilterCount > 0" class="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">
                {{ activeFilterCount }}
              </span>
            </button>
          </div>

          <!-- Desktop Sidebar Filters -->
          <aside class="hidden lg:block">
            <FurnitureFilterPanel 
              :category-facets="categoryFacets"
              :price-range="priceRange"
              :category-names="categoryNames"
              @filter="handleFilter"
            />
          </aside>

          <!-- Mobile Filters Drawer -->
          <Teleport to="body">
            <Transition
              enter-active-class="transition-opacity duration-300"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-300"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div 
                v-if="showMobileFilters" 
                class="fixed inset-0 bg-black/50 z-50 lg:hidden"
                @click="showMobileFilters = false"
              />
            </Transition>
            
            <Transition
              enter-active-class="transition-transform duration-300"
              enter-from-class="-translate-x-full"
              enter-to-class="translate-x-0"
              leave-active-class="transition-transform duration-300"
              leave-from-class="translate-x-0"
              leave-to-class="-translate-x-full"
            >
              <div 
                v-if="showMobileFilters"
                class="fixed inset-y-0 left-0 w-80 max-w-full bg-white z-50 overflow-y-auto lg:hidden"
              >
                <div class="p-6">
                  <div class="flex items-center justify-between mb-6">
                    <h2 class="font-serif text-xl text-stone-900">Filters</h2>
                    <button @click="showMobileFilters = false" class="p-2 text-stone-500">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <FurnitureFilterPanel 
                    :category-facets="categoryFacets"
                    :price-range="priceRange"
                    :category-names="categoryNames"
                    @filter="handleFilter"
                  />
                </div>
              </div>
            </Transition>
          </Teleport>

          <!-- Products Section -->
          <div class="lg:col-span-3">
            <!-- Toolbar -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-stone-100">
              <!-- Results Count -->
              <p class="text-stone-500 text-sm">
                <span v-if="!loading">{{ totalProducts }} products</span>
                <span v-else>Loading...</span>
              </p>
              
              <div class="flex items-center gap-4">
                <!-- Search -->
                <div class="relative flex-1 sm:flex-none">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search..."
                    class="w-full sm:w-48 border border-stone-200 text-stone-700 px-4 py-2 pr-10 text-sm focus:outline-none focus:border-amber-500 bg-white"
                    @input="debouncedSearch"
                  />
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <!-- Sort -->
                <select
                  v-model="sortOption"
                  class="border border-stone-200 text-stone-700 px-4 py-2 text-sm focus:outline-none focus:border-amber-500 bg-white"
                  @change="fetchProducts"
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="lowestPrice-asc">Price: Low to High</option>
                  <option value="lowestPrice-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              <div v-for="i in 9" :key="i" class="animate-pulse">
                <div class="aspect-[4/5] bg-stone-100 mb-4" />
                <div class="h-4 bg-stone-100 w-3/4 mb-2" />
                <div class="h-4 bg-stone-100 w-1/2" />
              </div>
            </div>

            <!-- Products Grid -->
            <div v-else-if="products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              <FurnitureProductCard 
                v-for="product in products" 
                :key="product.key" 
                :product="product" 
              />
            </div>

            <!-- No Products -->
            <div v-else class="text-center py-16">
              <div class="w-16 h-16 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p class="text-stone-500 mb-4">No furniture found matching your criteria.</p>
              <button 
                @click="clearAllFilters"
                class="text-amber-600 hover:text-amber-700 font-medium"
              >
                Clear all filters
              </button>
            </div>

            <!-- Pagination -->
            <div v-if="pagination && pagination.last > 1" class="mt-12 flex justify-center">
              <div class="flex items-center gap-2">
                <button
                  :disabled="!pagination.prev"
                  class="px-5 py-2 border border-stone-200 text-sm text-stone-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-stone-400 transition-colors"
                  @click="goToPage(pagination.prev)"
                >
                  Previous
                </button>
                
                <span class="px-4 py-2 text-sm text-stone-500">
                  {{ pagination.current }} / {{ pagination.last }}
                </span>
                
                <button
                  :disabled="!pagination.next"
                  class="px-5 py-2 border border-stone-200 text-sm text-stone-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-stone-400 transition-colors"
                  @click="goToPage(pagination.next)"
                >
                  Next
                </button>
              </div>
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
  layout: 'furniture'
})

const FURNITURE_KEY = '019560702a3d71319d2544ae6a175c2c'

// Known category mappings - comprehensive list as fallback
const KNOWN_CATEGORIES: Record<string, string> = {
  // Furniture main categories
  '019560702a3d71319d2544ae6a175c2c': 'Furniture',
  '01956079731972f4afc27084df43af9e': 'Living Room',
  '0195607c69c77dd4b42ba8f8c7fb1bfe': 'Bedroom',
  '0195607c9f2a73758338275791a0acde': 'Dining Room',
  '0195607cb24172d3b868d3c0b481e522': 'Office',
  // Living Room subcategories
  '0195607a61777406a6ac3e64a88464d2': 'Sofas',
  '0195607a6d797024a36300a962535f48': 'Armchairs',
  '0195607aef4678e39aa8975f4da1a617': 'Coffee Tables',
  // Bedroom subcategories
  '0195607d0cbe7cde94e9a42d51c7f3a3': 'Beds',
  '0195607d1dc175f7a1010aa3d654d0a1': 'Wardrobes',
  // Dining Room subcategories
  '0195607d75307790a41b82de3788bbe9': 'Dining Tables',
  '0195607d9cbe7409aa4d9e6f480eda93': 'Dining Chairs',
  // Industry categories
  '0195609b58697ea591dab38582f3e88b': 'Industry',
  '0195609bdfdb76f0828337e0241eab22': 'Tools',
  '0195609df6c973c6a3539bdf7c374ce6': 'Drills',
  '0195665f95ea718a8eb3b111dddb20fc': 'Construction Machines'
}

interface Pagination {
  current: number
  last: number
  next: number | null
  prev: number | null
}

interface FilterState {
  priceMin: number | null
  priceMax: number | null
  inStock: boolean
  onSale: boolean
  categories: string[]
}

interface FilterFacet {
  option: string
  value: string
  count: number
}

// State
const products = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const sortOption = ref('name-asc')
const currentPage = ref(1)
const pagination = ref<Pagination | null>(null)
const totalProducts = ref(0)
const showMobileFilters = ref(false)

// Filter state
const activeFilters = ref<FilterState>({
  priceMin: null,
  priceMax: null,
  inStock: false,
  onSale: false,
  categories: []
})

// Filter facets from API
const categoryFacets = ref<FilterFacet[]>([])
const priceRange = ref({ min: 0, max: 100000 })

// Category name mapping - start with known categories
const categoryNames = ref<Record<string, string>>({ ...KNOWN_CATEGORIES })

// Computed
const activeFilterCount = computed(() => {
  let count = 0
  if (activeFilters.value.priceMin || activeFilters.value.priceMax) count++
  if (activeFilters.value.inStock) count++
  if (activeFilters.value.onSale) count++
  count += activeFilters.value.categories.length
  return count
})

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchProducts()
  }, 300)
}

// Handle filter changes
const handleFilter = (filters: FilterState) => {
  activeFilters.value = filters
  currentPage.value = 1
  showMobileFilters.value = false
  fetchProducts()
}

const clearAllFilters = () => {
  activeFilters.value = {
    priceMin: null,
    priceMax: null,
    inStock: false,
    onSale: false,
    categories: []
  }
  searchQuery.value = ''
  currentPage.value = 1
  fetchProducts()
}

// Build filter array for API
const buildFilters = () => {
  const filters: any[] = []
  
  // Price filter using lowestPrice
  if (activeFilters.value.priceMin || activeFilters.value.priceMax) {
    const priceFilter: any = {
      type: 'range',
      field: 'lowestPrice.amount'
    }
    if (activeFilters.value.priceMin) {
      priceFilter.from = activeFilters.value.priceMin
    }
    if (activeFilters.value.priceMax) {
      priceFilter.to = activeFilters.value.priceMax
    }
    filters.push(priceFilter)
  }
  
  // Category filters
  if (activeFilters.value.categories.length > 0) {
    filters.push({
      type: 'equals',
      field: 'categoryIds',
      value: activeFilters.value.categories
    })
  }
  
  return filters.length > 0 ? filters : undefined
}

// Parse sort option
const parseSort = () => {
  const [field, order] = sortOption.value.split('-')
  return {
    field: field === 'lowestPrice' ? 'lowestPrice.amount' : field,
    order: order as 'asc' | 'desc'
  }
}

// Fetch products using CategoryProducts listing (product-level, not variants)
const fetchProducts = async () => {
  try {
    loading.value = true
    console.log('Fetching furniture products...')
    
    const response = await client.listing('CategoryProducts', {
      categoryId: FURNITURE_KEY
    }, {
      query: {
        search: searchQuery.value || undefined,
        filter: buildFilters(),
        sort: parseSort(),
        page: currentPage.value,
        limit: 12
      }
    })
    
    console.log('Products response:', response)
    
    // Filter out sale items client-side if onSale filter is active
    let items = response.items || []
    if (activeFilters.value.onSale) {
      items = items.filter((p: any) => p.price?.ref && p.price.ref > p.price.amount)
    }
    
    products.value = items
    pagination.value = response.page || null
    totalProducts.value = activeFilters.value.onSale ? items.length : (response.total || 0)
    
    // Update facets - filter out the root category
    if (response.filter?.categoryIds) {
      categoryFacets.value = response.filter.categoryIds.filter(
        (f: FilterFacet) => f.value !== FURNITURE_KEY
      )
    }
    
    // Update price range from aggregation
    if (response.aggregation?.['lowestPrice.amount']) {
      const priceAgg = response.aggregation['lowestPrice.amount'].total
      priceRange.value = {
        min: priceAgg.min || 0,
        max: priceAgg.max || 100000
      }
    }
  } catch (error) {
    console.error('Error fetching furniture products:', error)
  } finally {
    loading.value = false
  }
}

// Pagination
const goToPage = (page: number | null) => {
  if (page) {
    currentPage.value = page
    fetchProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Fetch category names from API and merge with known categories
const fetchCategoryNames = async () => {
  try {
    console.log('Fetching category names from API...')
    
    const response = await client.listing('AllCategories', {}, {
      query: { limit: 100 }
    })
    
    if (response.items && response.items.length > 0) {
      // Create new object with known categories + API categories
      const newNames: Record<string, string> = { ...KNOWN_CATEGORIES }
      
      response.items.forEach((cat: any) => {
        if (cat.key && cat.title) {
          newNames[cat.key] = cat.title
        }
      })
      
      categoryNames.value = newNames
      console.log('Category names loaded:', Object.keys(newNames).length)
    }
  } catch (error) {
    console.error('Error fetching category names:', error)
    // Keep using KNOWN_CATEGORIES as fallback
  }
}

// Initialize - fetch category names FIRST, then products
const init = async () => {
  // IMPORTANT: Load category names first
  await fetchCategoryNames()
  // Then fetch products
  await fetchProducts()
}

init()
</script>
