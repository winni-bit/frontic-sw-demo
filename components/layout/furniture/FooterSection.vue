<script setup lang="ts">
/**
 * FooterSection - Footer für Furniture Layout
 * ~55 Zeilen
 */

interface Category {
  key: string
  title: string
}

interface Props {
  categories: Category[]
}

defineProps<Props>()
</script>

<template>
  <footer class="bg-stone-900 text-white mt-20">
    <div class="max-w-7xl mx-auto px-6 py-16">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
        <!-- Brand -->
        <div>
          <h3 class="font-serif text-2xl mb-4">Furniture</h3>
          <p class="text-stone-400 text-sm">Wir schaffen schöne Räume mit durchdacht gestalteten Möbeln.</p>
        </div>

        <!-- Shop Links -->
        <div>
          <h4 class="font-medium text-sm uppercase tracking-wider text-stone-400 mb-4">Shop</h4>
          <ul class="space-y-3 text-sm text-stone-400">
            <li v-for="category in categories" :key="category.key">
              <NuxtLink :to="`/furniture/category/${category.key}`" class="hover:text-white">
                {{ category.title }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Account Links -->
        <div>
          <h4 class="font-medium text-sm uppercase tracking-wider text-stone-400 mb-4">Konto</h4>
          <ul class="space-y-3 text-sm text-stone-400">
            <li><NuxtLink to="/account/login" class="hover:text-white">Anmelden</NuxtLink></li>
            <li><NuxtLink to="/account/orders" class="hover:text-white">Bestellungen</NuxtLink></li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <h4 class="font-medium text-sm uppercase tracking-wider text-stone-400 mb-4">Newsletter</h4>
          <div class="flex">
            <input type="email" placeholder="Ihre E-Mail" class="flex-1 bg-stone-800 px-4 py-2 text-sm text-white placeholder-stone-500" />
            <button class="bg-amber-600 px-4 py-2 text-sm font-medium hover:bg-amber-700">Anmelden</button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
