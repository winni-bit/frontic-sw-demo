<template>
  <nav class="mb-6" aria-label="Breadcrumb">
    <ol class="flex items-center gap-2 text-sm text-stone-500 flex-wrap">
      <!-- Home -->
      <li>
        <NuxtLink 
          to="/" 
          class="hover:text-stone-900 transition-colors flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="sr-only md:not-sr-only">Home</span>
        </NuxtLink>
      </li>

      <!-- Dynamic Breadcrumbs -->
      <template v-for="(crumb, index) in breadcrumbs" :key="index">
        <li class="flex items-center gap-2">
          <!-- Separator -->
          <svg class="w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
          </svg>
          
          <!-- Last item (current page) -->
          <span 
            v-if="index === breadcrumbs.length - 1"
            class="text-stone-900 font-medium truncate max-w-[200px]"
            :title="crumb.label"
          >
            {{ crumb.label }}
          </span>
          
          <!-- Clickable crumb with dropdown -->
          <div 
            v-else
            class="relative"
            @mouseenter="openDropdown(index)"
            @mouseleave="closeDropdown(index)"
          >
            <NuxtLink 
              :to="crumb.href"
              class="hover:text-stone-900 transition-colors flex items-center gap-1 group"
            >
              <span class="truncate max-w-[150px]" :title="crumb.label">{{ crumb.label }}</span>
              <!-- Dropdown indicator if has siblings -->
              <svg 
                v-if="crumb.siblings && crumb.siblings.length > 0"
                class="w-3 h-3 text-stone-400 group-hover:text-stone-600 transition-transform"
                :class="{ 'rotate-180': activeDropdown === index }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </NuxtLink>

            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div 
                v-if="activeDropdown === index && crumb.siblings && crumb.siblings.length > 0"
                class="absolute top-full left-0 mt-1 w-56 bg-white shadow-lg border border-stone-100 z-50 max-h-64 overflow-y-auto"
              >
                <div class="py-1">
                  <!-- Current Category Indicator -->
                  <div class="px-3 py-2 text-xs text-stone-400 uppercase tracking-wider border-b border-stone-100">
                    Also in this category
                  </div>
                  
                  <!-- Sibling Links -->
                  <NuxtLink
                    v-for="sibling in crumb.siblings"
                    :key="sibling.href"
                    :to="sibling.href"
                    class="block px-4 py-2 text-sm transition-colors"
                    :class="[
                      sibling.href === crumb.href 
                        ? 'bg-amber-50 text-amber-700 font-medium' 
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    ]"
                    @click="closeDropdown(index)"
                  >
                    <div class="flex items-center justify-between">
                      <span class="truncate">{{ sibling.label }}</span>
                      <svg 
                        v-if="sibling.href === crumb.href"
                        class="w-4 h-4 text-amber-600 flex-shrink-0"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </NuxtLink>
                </div>
              </div>
            </Transition>
          </div>
        </li>
      </template>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  href: string
  siblings?: { label: string; href: string }[]
}

defineProps<{
  breadcrumbs: BreadcrumbItem[]
}>()

// Dropdown state
const activeDropdown = ref<number | null>(null)
let closeTimeout: ReturnType<typeof setTimeout> | null = null

const openDropdown = (index: number) => {
  if (closeTimeout) {
    clearTimeout(closeTimeout)
    closeTimeout = null
  }
  activeDropdown.value = index
}

const closeDropdown = (index: number) => {
  closeTimeout = setTimeout(() => {
    if (activeDropdown.value === index) {
      activeDropdown.value = null
    }
  }, 150)
}

onUnmounted(() => {
  if (closeTimeout) {
    clearTimeout(closeTimeout)
  }
})
</script>
