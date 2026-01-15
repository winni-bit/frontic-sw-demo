<script setup lang="ts">
/**
 * FilterCategoryList - Liste von Kategorie-Checkboxen
 * ~45 Zeilen
 */

interface FilterFacet {
  option: string
  value: string
  count: number
}

interface Props {
  facets: FilterFacet[]
  selected: string[]
  categoryNames: Record<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: [categoryId: string]
}>()

const getCategoryName = (categoryId: string) => {
  if (props.categoryNames && props.categoryNames[categoryId]) {
    return props.categoryNames[categoryId]
  }
  return categoryId.slice(0, 8) + '...'
}

const isSelected = (categoryId: string) => {
  return props.selected.includes(categoryId)
}

const handleToggle = (categoryId: string) => {
  emit('toggle', categoryId)
}
</script>

<template>
  <div class="space-y-3">
    <label 
      v-for="facet in facets"
      :key="facet.value"
      class="flex items-center gap-3 cursor-pointer group"
    >
      <input 
        type="checkbox"
        :checked="isSelected(facet.value)"
        class="w-5 h-5 border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
        @change="handleToggle(facet.value)"
      />
      <span class="text-stone-700 group-hover:text-stone-900 flex-1">
        {{ getCategoryName(facet.value) }}
      </span>
      <span class="text-stone-400 text-sm">{{ facet.count }}</span>
    </label>
  </div>
</template>
