<script setup lang="ts">
/**
 * NavCategories - Desktop Kategorie-Navigation
 * ~35 Zeilen
 */

interface Category {
  key: string
  title: string
}

interface Props {
  categories: Category[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false
})
</script>

<template>
  <div class="hidden md:flex items-center gap-10">
    <!-- Loading Skeleton -->
    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="h-4 w-20 bg-stone-200 rounded animate-pulse" />
    </template>
    
    <!-- Categories -->
    <template v-else>
      <NuxtLink 
        v-for="category in categories"
        :key="category.key"
        :to="`/furniture/category/${category.key}`"
        class="text-sm text-stone-600 hover:text-stone-900 transition-colors"
      >
        {{ category.title }}
      </NuxtLink>
    </template>
  </div>
</template>
