<template>
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
</template>

<script setup lang="ts">
interface Pagination {
  current: number
  last: number
  next: number | null
  prev: number | null
}

interface Props {
  pagination: Pagination | null
}

defineProps<Props>()
const emit = defineEmits<{ goToPage: [page: number] }>()

const goToPage = (page: number | null) => {
  if (page) {
    emit('goToPage', page)
  }
}
</script>
