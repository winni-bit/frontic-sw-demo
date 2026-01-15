<script setup lang="ts">
/**
 * MobileMenu - Mobile Navigation Menu
 * ~80 Zeilen
 */

interface Category {
  key: string
  title: string
}

interface Props {
  open: boolean
  categories: Category[]
  isLoggedIn: boolean
  customerName: string
  likeCount: number
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  openSearch: []
  openCart: []
  logout: []
}>()

const handleLogout = () => {
  emit('logout')
  emit('close')
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-200"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-150"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div v-if="open" class="md:hidden bg-white border-t border-stone-100">
      <div class="px-6 py-4 space-y-3">
        <!-- Account Section -->
        <div class="pb-3 border-b border-stone-100">
          <template v-if="isLoggedIn">
            <p class="text-xs text-stone-400 uppercase tracking-wider mb-2">Angemeldet als</p>
            <p class="text-sm font-medium text-stone-900 mb-3">{{ customerName }}</p>
            <NuxtLink to="/account" class="block text-stone-600 text-sm py-2" @click="emit('close')">Mein Konto</NuxtLink>
            <NuxtLink to="/account/orders" class="block text-stone-600 text-sm py-2" @click="emit('close')">Meine Bestellungen</NuxtLink>
            <button @click="handleLogout" class="block text-stone-600 text-sm py-2 w-full text-left">Abmelden</button>
          </template>
          <template v-else>
            <NuxtLink to="/account/login" class="block text-stone-900 text-sm font-medium py-2" @click="emit('close')">Anmelden</NuxtLink>
            <NuxtLink to="/account/register" class="block text-stone-600 text-sm py-2" @click="emit('close')">Konto erstellen</NuxtLink>
          </template>
        </div>

        <!-- Search -->
        <button class="flex items-center gap-2 text-stone-700 py-2 w-full" @click="emit('close'); emit('openSearch')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Produkte suchen
        </button>

        <div class="border-t border-stone-100 pt-3" />

        <!-- Categories -->
        <NuxtLink v-for="category in categories" :key="category.key" :to="`/furniture/category/${category.key}`" class="block text-stone-700 py-2" @click="emit('close')">
          {{ category.title }}
        </NuxtLink>

        <!-- Wishlist -->
        <NuxtLink to="/furniture/likes" class="flex items-center gap-2 text-stone-700 py-2" @click="emit('close')">
          <svg class="w-5 h-5" :class="likeCount > 0 ? 'text-rose-500 fill-rose-500' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Wunschliste
        </NuxtLink>

        <!-- Cart -->
        <button @click="emit('close'); emit('openCart')" class="flex items-center gap-2 text-stone-700 py-2 w-full">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Warenkorb
        </button>

        <!-- B2B Link -->
        <div class="border-t border-stone-100 pt-3 mt-3">
          <NuxtLink to="/industry" class="flex items-center gap-2 text-stone-400 py-2" @click="emit('close')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Zum B2B Shop wechseln
          </NuxtLink>
        </div>
      </div>
    </div>
  </Transition>
</template>
