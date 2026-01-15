<script setup lang="ts">
/**
 * FilterPanel - Hauptkomponente für Produkt-Filter
 * Verwendet Sub-Komponenten für einzelne Filter-Sektionen
 * ~95 Zeilen
 */

interface FilterFacet {
  option: string
  value: string
  count: number
}

interface Props {
  categoryFacets: FilterFacet[]
  priceRange: { min: number; max: number }
  categoryNames: Record<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  filter: [filters: FilterState]
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

const priceRangeRef = ref<InstanceType<typeof import('./filter/FilterPriceRange.vue').default> | null>(null)

// Computed
const hasActiveFilters = computed(() => {
  return filters.priceMin !== null || 
         filters.priceMax !== null || 
         filters.inStock || 
         filters.onSale || 
         filters.categories.length > 0
})

const formatPriceRangeDisplay = computed(() => {
  const min = filters.priceMin ? `$${filters.priceMin / 100}` : ''
  const max = filters.priceMax ? `$${filters.priceMax / 100}` : ''
  if (min && max) return `${min} - ${max}`
  if (min) return `From ${min}`
  if (max) return `Up to ${max}`
  return ''
})

// Methods
const emitFilters = () => emit('filter', { ...filters })

const handlePriceChange = (min: number | null, max: number | null) => {
  filters.priceMin = min ? min * 100 : null
  filters.priceMax = max ? max * 100 : null
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
  if (index > -1) filters.categories.splice(index, 1)
  emitFilters()
}

const clearPriceFilter = () => {
  filters.priceMin = null
  filters.priceMax = null
  priceRangeRef.value?.clear()
  emitFilters()
}

const clearAllFilters = () => {
  filters.priceMin = null
  filters.priceMax = null
  filters.inStock = false
  filters.onSale = false
  filters.categories = []
  priceRangeRef.value?.clear()
  emitFilters()
}

const getCategoryName = (categoryId: string) => {
  return props.categoryNames?.[categoryId] || categoryId.slice(0, 8) + '...'
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
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

    <!-- Active Filter Tags -->
    <div v-if="hasActiveFilters" class="flex flex-wrap gap-2">
      <FurnitureFilterTag 
        v-if="filters.onSale" 
        label="On Sale" 
        variant="sale"
        @remove="filters.onSale = false; emitFilters()" 
      />
      <FurnitureFilterTag 
        v-if="filters.inStock" 
        label="In Stock" 
        variant="stock"
        @remove="filters.inStock = false; emitFilters()" 
      />
      <FurnitureFilterTag 
        v-if="filters.priceMin || filters.priceMax" 
        :label="formatPriceRangeDisplay"
        @remove="clearPriceFilter" 
      />
      <FurnitureFilterTag 
        v-for="catId in filters.categories"
        :key="catId"
        :label="getCategoryName(catId)"
        @remove="removeCategory(catId)" 
      />
    </div>

    <!-- Price Filter -->
    <FurnitureFilterSection title="Price">
      <FurnitureFilterPriceRange
        ref="priceRangeRef"
        :min-placeholder="priceRange.min"
        :max-placeholder="priceRange.max"
        @change="handlePriceChange"
      />
    </FurnitureFilterSection>

    <!-- Availability Filter -->
    <FurnitureFilterSection title="Availability">
      <FurnitureFilterCheckbox
        v-model="filters.inStock"
        label="In Stock Only"
        @update:model-value="emitFilters"
      />
    </FurnitureFilterSection>

    <!-- Sale Filter -->
    <FurnitureFilterSection title="Special Offers">
      <FurnitureFilterCheckbox
        v-model="filters.onSale"
        label="On Sale"
        badge="Sale"
        badge-class="text-rose-500"
        @update:model-value="emitFilters"
      />
    </FurnitureFilterSection>

    <!-- Category Filter -->
    <FurnitureFilterSection 
      v-if="categoryFacets.length > 0" 
      title="Category"
      :has-border="false"
    >
      <FurnitureFilterCategoryList
        :facets="categoryFacets"
        :selected="filters.categories"
        :category-names="categoryNames"
        @toggle="toggleCategory"
      />
    </FurnitureFilterSection>
  </div>
</template>
