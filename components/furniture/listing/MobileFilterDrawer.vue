<template>
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
        v-if="isOpen" 
        class="fixed inset-0 bg-black/50 z-50 lg:hidden"
        @click="$emit('close')"
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
        v-if="isOpen"
        class="fixed inset-y-0 left-0 w-80 max-w-full bg-white z-50 overflow-y-auto lg:hidden"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="font-serif text-xl text-stone-900">Filters</h2>
            <button @click="$emit('close')" class="p-2 text-stone-500">
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
</template>

<script setup lang="ts">
interface FilterFacet {
  option: string
  value: string
  count: number
}

interface FilterState {
  priceMin: number | null
  priceMax: number | null
  inStock: boolean
  onSale: boolean
  categories: string[]
}

interface Props {
  isOpen: boolean
  categoryFacets: FilterFacet[]
  priceRange: { min: number; max: number }
  categoryNames: Record<string, string>
}

defineProps<Props>()
const emit = defineEmits<{
  close: []
  filter: [filters: FilterState]
}>()

const handleFilter = (filters: FilterState) => {
  emit('filter', filters)
  emit('close')
}
</script>
