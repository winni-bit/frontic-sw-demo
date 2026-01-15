<template>
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
          :value="searchQuery"
          type="text"
          placeholder="Search..."
          class="w-full sm:w-48 border border-stone-200 text-stone-700 px-4 py-2 pr-10 text-sm focus:outline-none focus:border-amber-500 bg-white"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        />
        <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Sort -->
      <select
        :value="sortOption"
        class="border border-stone-200 text-stone-700 px-4 py-2 text-sm focus:outline-none focus:border-amber-500 bg-white"
        @change="$emit('update:sortOption', ($event.target as HTMLSelectElement).value)"
      >
        <option value="name-asc">Name A-Z</option>
        <option value="name-desc">Name Z-A</option>
        <option value="lowestPrice-asc">Price: Low to High</option>
        <option value="lowestPrice-desc">Price: High to Low</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean
  totalProducts: number
  searchQuery: string
  sortOption: string
}

defineProps<Props>()
defineEmits<{
  'update:searchQuery': [value: string]
  'update:sortOption': [value: string]
}>()
</script>
