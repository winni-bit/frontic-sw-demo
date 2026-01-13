<template>
  <div class="min-h-screen bg-white">
    <!-- Loading State -->
    <div v-if="loading" class="pt-32 pb-16">
      <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="animate-pulse space-y-8">
          <div class="h-8 w-64 bg-stone-200 rounded" />
          <div class="h-4 w-96 bg-stone-100 rounded" />
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">
            <div v-for="i in 8" :key="i" class="space-y-4">
              <div class="aspect-[3/4] bg-stone-100 rounded" />
              <div class="h-4 w-3/4 bg-stone-100 rounded" />
              <div class="h-4 w-1/2 bg-stone-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="pt-32 pb-16">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 text-center">
        <h1 class="font-serif text-4xl text-stone-900 mb-4">Category Not Found</h1>
        <p class="text-stone-600 mb-8">The category you're looking for doesn't exist.</p>
        <NuxtLink to="/collections" class="inline-flex items-center gap-2 text-stone-900 hover:text-stone-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          View All Collections
        </NuxtLink>
      </div>
    </div>

    <!-- Category Content -->
    <template v-else>
      <!-- Category Header -->
      <section class="pt-32 pb-12 bg-stone-50">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
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

          <h1 class="font-serif text-4xl md:text-5xl lg:text-6xl text-stone-900 mb-4">
            {{ category?.title }}
          </h1>
          <p v-if="category?.description" class="text-lg text-stone-600 max-w-2xl">
            {{ category.description }}
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

          <!-- Products Loading -->
          <div v-if="productsLoading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div v-for="i in 8" :key="i" class="space-y-4 animate-pulse">
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
            <p class="text-stone-500">No products found in this category.</p>
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
    </template>
  </div>
</template>

<script setup lang="ts">
import client from '../../.frontstack/generated-client'

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

// Fetch category details
const fetchCategory = async () => {
  try {
    console.log('Looking for category with slug:', slug.value)
    
    // Use AllCategories listing to find category by slug or key
    const categoriesResponse = await client.listing('AllCategories', {}, {
      query: {
        filter: [
          {
            type: 'or',
            filter: [
              {
                type: 'equals',
                field: 'slug',
                value: slug.value
              },
              {
                type: 'equals',
                field: 'key',
                value: slug.value
              }
            ]
          }
        ],
        limit: 1
      }
    })
    
    console.log('Category search response:', categoriesResponse)
    
    const foundCategory = categoriesResponse.items?.[0]
    
    if (foundCategory) {
      // Fetch full category details using the key
      const categoryDetail = await client.block('CategoryDetail', foundCategory.key)
      category.value = categoryDetail
      console.log('Category loaded:', categoryDetail)
      return foundCategory.key
    }
    
    console.log('Category not found for slug:', slug.value)
    error.value = true
    return null
  } catch (err) {
    console.error('Error fetching category:', err)
    error.value = true
    return null
  }
}

// Fetch products for this category
const fetchProducts = async () => {
  if (!category.value?.key) return
  
  try {
    productsLoading.value = true
    
    const response = await client.listing('CategoryProducts', {
      categoryId: category.value.key
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
    
    console.log('Products loaded:', products.value.length, 'of', totalProducts.value)
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
    // Scroll to top of products
    window.scrollTo({ top: 300, behavior: 'smooth' })
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

// Watch for route changes
watch(slug, () => {
  searchQuery.value = ''
  currentPage.value = 1
  init()
})
</script>
