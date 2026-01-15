<script setup lang="ts">
/**
 * NavActions - Action Buttons (Search, Account, Wishlist, Cart)
 * ~95 Zeilen
 */

interface Props {
  isLoggedIn: boolean
  customerName: string
  customerEmail: string
  likeCount: number
  cartCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  openSearch: []
  openCart: []
  logout: []
  toggleMobileMenu: []
}>()

const accountDropdownOpen = ref(false)

const handleLogout = () => {
  accountDropdownOpen.value = false
  emit('logout')
}
</script>

<template>
  <div class="flex items-center gap-4">
    <!-- B2B Link -->
    <NuxtLink to="/industry" class="hidden sm:flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
      B2B Shop
    </NuxtLink>
    
    <div class="hidden sm:block w-px h-5 bg-stone-200" />
    
    <!-- Search -->
    <button class="p-2 text-stone-500 hover:text-stone-900 transition-colors" @click="emit('openSearch')">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
    
    <!-- Account Dropdown -->
    <div class="relative" @mouseenter="accountDropdownOpen = true" @mouseleave="accountDropdownOpen = false">
      <NuxtLink :to="isLoggedIn ? '/account' : '/account/login'" class="p-2 text-stone-500 hover:text-stone-900 transition-colors relative block">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span v-if="isLoggedIn" class="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
      </NuxtLink>
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="accountDropdownOpen && isLoggedIn" class="absolute top-full right-0 mt-2 w-56 bg-white shadow-lg border border-stone-100">
          <div class="py-2">
            <div class="px-4 py-3 border-b border-stone-100">
              <p class="text-sm font-medium text-stone-900 truncate">{{ customerName }}</p>
              <p class="text-xs text-stone-500 truncate">{{ customerEmail }}</p>
            </div>
            <NuxtLink to="/account" class="block px-4 py-3 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50" @click="accountDropdownOpen = false">Mein Konto</NuxtLink>
            <NuxtLink to="/account/orders" class="block px-4 py-3 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50" @click="accountDropdownOpen = false">Meine Bestellungen</NuxtLink>
            <div class="border-t border-stone-100 my-2" />
            <button @click="handleLogout" class="w-full px-4 py-3 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-left">Abmelden</button>
          </div>
        </div>
      </Transition>
    </div>
    
    <!-- Wishlist -->
    <NuxtLink to="/furniture/likes" class="p-2 text-stone-500 hover:text-stone-900 transition-colors relative">
      <svg class="w-5 h-5" :class="likeCount > 0 ? 'text-rose-500 fill-rose-500' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span v-if="likeCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">{{ likeCount > 9 ? '9+' : likeCount }}</span>
    </NuxtLink>
    
    <!-- Cart -->
    <button @click="emit('openCart')" class="p-2 text-stone-500 hover:text-stone-900 transition-colors relative">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <span v-if="cartCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center">{{ cartCount > 9 ? '9+' : cartCount }}</span>
    </button>

    <!-- Mobile Menu Toggle -->
    <button class="md:hidden p-2 text-stone-500" @click="emit('toggleMobileMenu')">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>
</template>
