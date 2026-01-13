<template>
  <div class="min-h-screen bg-white">
    <!-- Loading State -->
    <div v-if="pageLoading" class="py-16">
      <div class="max-w-7xl mx-auto px-6">
        <div class="animate-pulse space-y-8">
          <div class="h-8 w-64 bg-stone-200 rounded" />
          <div class="h-4 w-96 bg-stone-100 rounded" />
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-12">
            <div v-for="i in 8" :key="i" class="space-y-4">
              <div class="aspect-[4/5] bg-stone-100" />
              <div class="h-4 w-3/4 bg-stone-100" />
              <div class="h-4 w-1/2 bg-stone-100" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-16">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 class="font-serif text-3xl text-stone-900 mb-4">Category Not Found</h1>
        <p class="text-stone-600 mb-8">The category you're looking for doesn't exist.</p>
        <NuxtLink 
          to="/" 
          class="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Back to Home
        </NuxtLink>
      </div>
    </div>

    <!-- Category Content -->
    <template v-else>
      <!-- Category Header -->
      <section class="py-16 bg-gradient-to-b from-amber-50 to-white">
        <div class="max-w-7xl mx-auto px-6">
          <!-- Breadcrumb -->
          <nav v-if="category?.breadcrumb?.length" class="mb-6">
            <ol class="flex items-center gap-2 text-sm text-stone-500">
              <li>
                <NuxtLink to="/" class="hover:text-stone-900 transition-colors">Home</NuxtLink>
              </li>
              <template v-for="(crumb, index) in category.breadcrumb" :key="index">
                <li class="flex items-center gap-2">
                  <span>/</span>
                  <span :class="index === category.breadcrumb.length - 1 ? 'text-stone-900' : ''">
                    {{ crumb }}
                  </span>
                </li>
              </template>
            </ol>
          </nav>

          <div class="max-w-2xl">
            <p class="text-amber-700 text-sm font-medium tracking-wider uppercase mb-3">
              Collection
            </p>
            <h1 class="font-serif text-4xl lg:text-5xl text-stone-900 mb-4">
              {{ category?.title }}
            </h1>
            <p v-if="category?.description" class="text-stone-600 text-lg">
              {{ category.description }}
            </p>
            <p class="mt-4 text-stone-500">
              {{ totalProducts }} pieces
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
                <div class="relative flex-1 max-w-md">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search products..."
                    class="w-full pl-10 pr-4 py-3 border border-stone-200 focus:border-amber-500 focus:outline-none text-sm"
                    @input="debouncedSearch"
                  />
                  <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <div class="flex items-center gap-4">
                  <select
                    v-model="sortOption"
                    class="border border-stone-200 px-4 py-2 text-sm focus:border-amber-500 focus:outline-none bg-white"
                    @change="fetchProducts"
                  >
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="lowestPrice-asc">Price: Low to High</option>
                    <option value="lowestPrice-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              <!-- Products Loading -->
              <div v-if="productsLoading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                <div v-for="i in 9" :key="i" class="animate-pulse">
                  <div class="aspect-[4/5] bg-stone-100 mb-4" />
                  <div class="h-4 w-3/4 bg-stone-100 mb-2" />
                  <div class="h-4 w-1/2 bg-stone-100" />
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
                <p class="text-stone-500 mb-4">No products found.</p>
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
    </template>
  </div>
</template>

<script setup lang="ts">
import client from '../../../.frontstack/generated-client'

definePageMeta({
  layout: 'furniture'
})

const route = useRoute()
const slug = computed(() => route.params.slug as string)

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

// Known category mappings - comprehensive list
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

// State
const category = ref<any>(null)
const products = ref<any[]>([])
const pageLoading = ref(true)
const productsLoading = ref(false)
const error = ref(false)
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

// Category name mapping - reactive to ensure updates propagate
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
  
  if (activeFilters.value.priceMin || activeFilters.value.priceMax) {
    const priceFilter: any = { type: 'range', field: 'lowestPrice.amount' }
    if (activeFilters.value.priceMin) priceFilter.from = activeFilters.value.priceMin
    if (activeFilters.value.priceMax) priceFilter.to = activeFilters.value.priceMax
    filters.push(priceFilter)
  }
  
  if (activeFilters.value.categories.length > 0) {
    filters.push({ type: 'equals', field: 'categoryIds', value: activeFilters.value.categories })
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

// Fetch all categories to build name mapping
const fetchAllCategoryNames = async () => {
  try {
    console.log('Fetching all category names...')
    
    const response = await client.listing('AllCategories', {}, { 
      query: { 
        limit: 100
      } 
    })
    
    if (response.items && response.items.length > 0) {
      // Create a new object with all categories
      const newNames: Record<string, string> = { ...KNOWN_CATEGORIES }
      
      response.items.forEach((cat: any) => {
        if (cat.key && cat.title) {
          newNames[cat.key] = cat.title
        }
      })
      
      // Update the ref with all names
      categoryNames.value = newNames
      console.log('Category names loaded:', Object.keys(categoryNames.value).length)
    }
  } catch (err) {
    console.error('Error fetching category names:', err)
    // Keep using KNOWN_CATEGORIES as fallback
  }
}

// Fetch category details
const fetchCategory = async () => {
  try {
    console.log('Fetching category for slug:', slug.value)
    
    const categoriesResponse = await client.listing('AllCategories', {}, {
      query: {
        filter: [{
          type: 'or',
          filter: [
            { type: 'equals', field: 'slug', value: slug.value },
            { type: 'equals', field: 'key', value: slug.value }
          ]
        }],
        limit: 1
      }
    })
    
    const foundCategory = categoriesResponse.items?.[0]
    
    if (foundCategory) {
      console.log('Found category:', foundCategory)
      const categoryDetail = await client.block('CategoryDetail', foundCategory.key)
      category.value = categoryDetail
      
      // Also add this category to our names map
      if (categoryDetail.key && categoryDetail.title) {
        categoryNames.value = { ...categoryNames.value, [categoryDetail.key]: categoryDetail.title }
      }
      
      return foundCategory.key
    }
    
    console.warn('Category not found for slug:', slug.value)
    error.value = true
    return null
  } catch (err) {
    console.error('Error fetching category:', err)
    error.value = true
    return null
  }
}

// Fetch products using CategoryProducts listing
const fetchProducts = async () => {
  if (!category.value?.key) {
    console.warn('No category key available')
    return
  }
  
  try {
    productsLoading.value = true
    console.log('Fetching products for category:', category.value.key)
    
    const response = await client.listing('CategoryProducts', {
      categoryId: category.value.key
    }, {
      query: {
        search: searchQuery.value || undefined,
        filter: buildFilters(),
        sort: parseSort(),
        page: currentPage.value,
        limit: 12
      }
    })
    
    let items = response.items || []
    if (activeFilters.value.onSale) {
      items = items.filter((p: any) => p.price?.ref && p.price.ref > p.price.amount)
    }
    
    products.value = items
    pagination.value = response.page || null
    totalProducts.value = activeFilters.value.onSale ? items.length : (response.total || 0)
    
    // Update facets - filter out the current category and parent categories
    if (response.filter?.categoryIds) {
      categoryFacets.value = response.filter.categoryIds.filter(
        (f: FilterFacet) => f.value !== category.value.key && f.value !== category.value.parentKey
      )
      
      // Fetch names for any unknown category IDs in facets
      const unknownCategories = categoryFacets.value.filter(f => !categoryNames.value[f.value])
      
      if (unknownCategories.length > 0) {
        console.log('Fetching names for unknown categories:', unknownCategories.length)
        const newNames = { ...categoryNames.value }
        
        for (const facet of unknownCategories) {
          try {
            const catDetail = await client.block('CategoryDetail', facet.value)
            if (catDetail?.title) {
              newNames[facet.value] = catDetail.title
            }
          } catch (e) {
            console.warn('Could not fetch category name for:', facet.value)
          }
        }
        
        // Update with all new names at once
        categoryNames.value = newNames
      }
      
      console.log('Category facets:', categoryFacets.value)
    }
    
    // Update price range from aggregation
    if (response.aggregation?.['lowestPrice.amount']) {
      const priceAgg = response.aggregation['lowestPrice.amount'].total
      priceRange.value = { min: priceAgg.min || 0, max: priceAgg.max || 100000 }
    }
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Initialize
const init = async () => {
  pageLoading.value = true
  error.value = false
  
  console.log('=== Initializing category page ==='
  )
  
  // IMPORTANT: Fetch ALL category names FIRST before anything else
  await fetchAllCategoryNames()
  
  // Then fetch the current category
  const categoryKey = await fetchCategory()
  
  if (categoryKey) {
    await fetchProducts()
  }
  
  pageLoading.value = false
}

init()

watch(slug, () => {
  searchQuery.value = ''
  currentPage.value = 1
  activeFilters.value = { priceMin: null, priceMax: null, inStock: false, onSale: false, categories: [] }
  init()
})
</script>
