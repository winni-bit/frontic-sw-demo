<template>
  <div class="space-y-8">
    <!-- Filter Header -->
    <div class="flex items-center justify-between">
      <h3 class="font-medium text-stone-900">Filters</h3>
      <button 
        v-if="hasActiveFilters"
        @click="clearAllFilters"
        class="text-sm text-amber-600 hover:text-amber-700"
      >
        Clear all
      </button>
    </div>

    <!-- Active Filters Tags -->
    <div v-if="hasActiveFilters" class="flex flex-wrap gap-2">
      <span 
        v-if="filters.onSale"
        class="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm"
      >
        On Sale
        <button @click="filters.onSale = false; emitFilters()" class="hover:text-amber-900">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </span>
      <span 
        v-if="filters.inStock"
        class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm"
      >
        In Stock
        <button @click="filters.inStock = false; emitFilters()" class="hover:text-green-900">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </span>
      <span 
        v-if="priceInputMin || priceInputMax"
        class="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-800 text-sm"
      >
        {{ formatPriceRangeDisplay }}
        <button @click="clearPriceFilter" class="hover:text-stone-900">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </span>
      <span 
        v-for="catId in filters.categories"
        :key="catId"
        class="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-800 text-sm"
      >
        {{ getCategoryName(catId) }}
        <button @click="removeCategory(catId)" class="hover:text-stone-900">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </span>
    </div>

    <!-- Price Filter -->
    <div class="border-b border-stone-100 pb-6">
      <button 
        @click="expandedSections.price = !expandedSections.price"
        class="flex items-center justify-between w-full text-left"
      >
        <span class="font-medium text-stone-900">Price</span>
        <svg 
          class="w-5 h-5 text-stone-400 transition-transform"
          :class="{ 'rotate-180': expandedSections.price }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div v-show="expandedSections.price" class="mt-4 space-y-4">
        <div class="flex items-center gap-3">
          <div class="flex-1">
            <label class="text-xs text-stone-500 mb-1 block">Min</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input 
                v-model.number="priceInputMin"
                type="number"
                :placeholder="formatPriceDollars(priceRange.min)"
                class="w-full pl-7 pr-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-amber-500"
                @change="updatePriceFilter"
              />
            </div>
          </div>
          <span class="text-stone-300 mt-5">—</span>
          <div class="flex-1">
            <label class="text-xs text-stone-500 mb-1 block">Max</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input 
                v-model.number="priceInputMax"
                type="number"
                :placeholder="formatPriceDollars(priceRange.max)"
                class="w-full pl-7 pr-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-amber-500"
                @change="updatePriceFilter"
              />
            </div>
          </div>
        </div>
        
        <!-- Price Range Display -->
        <p class="text-xs text-stone-400">
          Range: ${{ formatPriceDollars(priceRange.min) }} - ${{ formatPriceDollars(priceRange.max) }}
        </p>
      </div>
    </div>

    <!-- Availability Filter -->
    <div class="border-b border-stone-100 pb-6">
      <button 
        @click="expandedSections.availability = !expandedSections.availability"
        class="flex items-center justify-between w-full text-left"
      >
        <span class="font-medium text-stone-900">Availability</span>
        <svg 
          class="w-5 h-5 text-stone-400 transition-transform"
          :class="{ 'rotate-180': expandedSections.availability }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div v-show="expandedSections.availability" class="mt-4 space-y-3">
        <label class="flex items-center gap-3 cursor-pointer group">
          <input 
            v-model="filters.inStock"
            type="checkbox"
            class="w-5 h-5 border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
            @change="emitFilters"
          />
          <span class="text-stone-700 group-hover:text-stone-900">In Stock Only</span>
        </label>
      </div>
    </div>

    <!-- Sale Filter -->
    <div class="border-b border-stone-100 pb-6">
      <button 
        @click="expandedSections.sale = !expandedSections.sale"
        class="flex items-center justify-between w-full text-left"
      >
        <span class="font-medium text-stone-900">Special Offers</span>
        <svg 
          class="w-5 h-5 text-stone-400 transition-transform"
          :class="{ 'rotate-180': expandedSections.sale }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div v-show="expandedSections.sale" class="mt-4 space-y-3">
        <label class="flex items-center gap-3 cursor-pointer group">
          <input 
            v-model="filters.onSale"
            type="checkbox"
            class="w-5 h-5 border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
            @change="emitFilters"
          />
          <span class="text-stone-700 group-hover:text-stone-900">On Sale</span>
          <span class="ml-auto text-rose-500 text-sm">Sale</span>
        </label>
      </div>
    </div>

    <!-- Category Filter -->
    <div class="pb-6" v-if="categoryFacets.length > 0">
      <button 
        @click="expandedSections.category = !expandedSections.category"
        class="flex items-center justify-between w-full text-left"
      >
        <span class="font-medium text-stone-900">Category</span>
        <svg 
          class="w-5 h-5 text-stone-400 transition-transform"
          :class="{ 'rotate-180': expandedSections.category }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div v-show="expandedSections.category" class="mt-4 space-y-3">
        <label 
          v-for="facet in categoryFacets"
          :key="facet.value"
          class="flex items-center gap-3 cursor-pointer group"
        >
          <input 
            type="checkbox"
            :checked="filters.categories.includes(facet.value)"
            class="w-5 h-5 border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
            @change="toggleCategory(facet.value)"
          />
          <span class="text-stone-700 group-hover:text-stone-900 flex-1">
            {{ getCategoryName(facet.value) }}
          </span>
          <span class="text-stone-400 text-sm">{{ facet.count }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FilterFacet {
  option: string
  value: string
  count: number
  selected?: boolean
  disabled?: boolean
}

interface PriceAggregation {
  min: number
  max: number
}

interface CategoryMapping {
  [key: string]: string
}

const props = defineProps<{
  categoryFacets: FilterFacet[]
  priceRange: PriceAggregation
  categoryNames: CategoryMapping
}>()

const emit = defineEmits<{
  (e: 'filter', filters: FilterState): void
}>()

interface FilterState {
  priceMin: number | null
  priceMax: number | null
  inStock: boolean
  onSale: boolean
  categories: string[]
}

// State
const filters = reactive<FilterState>({
  priceMin: null,
  priceMax: null,
  inStock: false,
  onSale: false,
  categories: []
})

// Store dollar values for display (not cents)
const priceInputMin = ref<number | null>(null)
const priceInputMax = ref<number | null>(null)

const expandedSections = reactive({
  price: true,
  availability: true,
  sale: true,
  category: true
})

// Computed
const hasActiveFilters = computed(() => {
  return priceInputMin.value !== null || 
         priceInputMax.value !== null || 
         filters.inStock || 
         filters.onSale || 
         filters.categories.length > 0
})

// Format price range for active filter tag - use the dollar input values directly
const formatPriceRangeDisplay = computed(() => {
  const min = priceInputMin.value ? `$${priceInputMin.value}` : ''
  const max = priceInputMax.value ? `$${priceInputMax.value}` : ''
  if (min && max) return `${min} - ${max}`
  if (min) return `From ${min}`
  if (max) return `Up to ${max}`
  return ''
})

// Methods
// Convert cents to dollars for display
const formatPriceDollars = (cents: number) => {
  return Math.round(cents / 100).toString()
}

const getCategoryName = (categoryId: string) => {
  // Check if we have the name in props
  if (props.categoryNames && props.categoryNames[categoryId]) {
    return props.categoryNames[categoryId]
  }
  // Fallback: show truncated ID
  return categoryId.slice(0, 8) + '...'
}

const updatePriceFilter = () => {
  // Convert dollar input to cents for API
  filters.priceMin = priceInputMin.value ? priceInputMin.value * 100 : null
  filters.priceMax = priceInputMax.value ? priceInputMax.value * 100 : null
  emitFilters()
}

const clearPriceFilter = () => {
  filters.priceMin = null
  filters.priceMax = null
  priceInputMin.value = null
  priceInputMax.value = null
  emitFilters()
}

const toggleCategory = (categoryId: string) => {
  const index = filters.categories.indexOf(categoryId)
  if (index > -1) {
    filters.categories.splice(index, 1)
  } else {
    filters.categories.push(categoryId)
  }
  emitFilters()
}

const removeCategory = (categoryId: string) => {
  const index = filters.categories.indexOf(categoryId)
  if (index > -1) {
    filters.categories.splice(index, 1)
  }
  emitFilters()
}

const clearAllFilters = () => {
  filters.priceMin = null
  filters.priceMax = null
  filters.inStock = false
  filters.onSale = false
  filters.categories = []
  priceInputMin.value = null
  priceInputMax.value = null
  emitFilters()
}

const emitFilters = () => {
  emit('filter', { ...filters })
}
</script>
