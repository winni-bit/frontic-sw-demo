<template>
  <div>
    <!-- Page Header -->
    <FurnitureListingPageHeader />

    <!-- Main Content -->
    <section class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="lg:grid lg:grid-cols-4 lg:gap-12">
          
          <!-- Mobile Filter Toggle -->
          <FurnitureListingMobileFilterToggle 
            :active-filter-count="activeFilterCount"
            @toggle="showMobileFilters = true"
          />

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
          <FurnitureListingMobileFilterDrawer
            :is-open="showMobileFilters"
            :category-facets="categoryFacets"
            :price-range="priceRange"
            :category-names="categoryNames"
            @close="showMobileFilters = false"
            @filter="handleFilter"
          />

          <!-- Products Section -->
          <div class="lg:col-span-3">
            <!-- Toolbar -->
            <FurnitureListingToolbar
              :loading="loading"
              :total-products="totalProducts"
              v-model:search-query="searchQuery"
              v-model:sort-option="sortOption"
              @update:search-query="debouncedSearch"
              @update:sort-option="fetchProducts"
            />

            <!-- Product Grid -->
            <FurnitureListingProductGrid
              :loading="loading"
              :products="products"
              @clear-filters="clearAllFilters"
            />

            <!-- Pagination -->
            <FurnitureListingPagination
              :pagination="pagination"
              @go-to-page="goToPage"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import client from '../../.frontstack/generated-client'

definePageMeta({ layout: 'furniture' })

const FURNITURE_KEY = '019560702a3d71319d2544ae6a175c2c'

// Known category mappings
const KNOWN_CATEGORIES: Record<string, string> = {
  '019560702a3d71319d2544ae6a175c2c': 'Furniture',
  '01956079731972f4afc27084df43af9e': 'Living Room',
  '0195607c69c77dd4b42ba8f8c7fb1bfe': 'Bedroom',
  '0195607c9f2a73758338275791a0acde': 'Dining Room',
  '0195607cb24172d3b868d3c0b481e522': 'Office',
  '0195607a61777406a6ac3e64a88464d2': 'Sofas',
  '0195607a6d797024a36300a962535f48': 'Armchairs',
  '0195607aef4678e39aa8975f4da1a617': 'Coffee Tables',
  '0195607d0cbe7cde94e9a42d51c7f3a3': 'Beds',
  '0195607d1dc175f7a1010aa3d654d0a1': 'Wardrobes',
  '0195607d75307790a41b82de3788bbe9': 'Dining Tables',
  '0195607d9cbe7409aa4d9e6f480eda93': 'Dining Chairs',
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
const products = ref<FurnitureProductCard[]>([])
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
  activeFilters.value = { priceMin: null, priceMax: null, inStock: false, onSale: false, categories: [] }
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
  return { field: field === 'lowestPrice' ? 'lowestPrice.amount' : field, order: order as 'asc' | 'desc' }
}

// Fetch products
const fetchProducts = async () => {
  try {
    loading.value = true
    
    const response = await client.listing('CategoryProducts', { categoryId: FURNITURE_KEY }, {
      query: { search: searchQuery.value || undefined, filter: buildFilters(), sort: parseSort(), page: currentPage.value, limit: 12 }
    })
    
    let items = response.items || []
    if (activeFilters.value.onSale) {
      items = items.filter((p: any) => p.price?.ref && p.price.ref > p.price.amount)
    }
    
    products.value = items
    pagination.value = response.page || null
    totalProducts.value = activeFilters.value.onSale ? items.length : (response.total || 0)
    
    if (response.filter?.categoryIds) {
      categoryFacets.value = response.filter.categoryIds.filter((f: FilterFacet) => f.value !== FURNITURE_KEY)
    }
    
    if (response.aggregation?.['lowestPrice.amount']) {
      const priceAgg = response.aggregation['lowestPrice.amount'].total
      priceRange.value = { min: priceAgg.min || 0, max: priceAgg.max || 100000 }
    }
  } catch (error) {
    console.error('Error fetching furniture products:', error)
  } finally {
    loading.value = false
  }
}

// Pagination
const goToPage = (page: number) => {
  currentPage.value = page
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Fetch category names
const fetchCategoryNames = async () => {
  try {
    const response = await client.listing('AllCategories', {}, { query: { limit: 100 } })
    
    if (response.items?.length > 0) {
      const newNames: Record<string, string> = { ...KNOWN_CATEGORIES }
      response.items.forEach((cat: any) => {
        if (cat.key && cat.title) newNames[cat.key] = cat.title
      })
      categoryNames.value = newNames
    }
  } catch (error) {
    console.error('Error fetching category names:', error)
  }
}

// Initialize
const init = async () => {
  await fetchCategoryNames()
  await fetchProducts()
}

init()
</script>
