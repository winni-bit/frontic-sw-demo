<script setup lang="ts">
definePageMeta({
  layout: 'furniture',
  middleware: 'auth',
})

useHead({
  title: 'Mein Konto - Furniture',
})

const router = useRouter()
const { customer, customerName, customerEmail, logout, loading } = useShopwareAuth()

const isLoggingOut = ref(false)

const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    await logout()
    router.push('/')
  } catch (err) {
    console.error('Logout error:', err)
  } finally {
    isLoggingOut.value = false
  }
}

// Dashboard cards
const dashboardCards = [
  {
    title: 'Meine Bestellungen',
    description: 'Bestellverlauf und Sendungsverfolgung',
    icon: 'orders',
    link: '/account/orders',
  },
  {
    title: 'Meine Adressen',
    description: 'Liefer- und Rechnungsadressen verwalten',
    icon: 'addresses',
    link: '/account/addresses',
  },
  {
    title: 'Kontodaten',
    description: 'Persönliche Daten und Passwort ändern',
    icon: 'profile',
    link: '/account/profile',
  },
]
</script>

<template>
  <div class="min-h-screen bg-stone-50 pt-8 pb-16">
    <div class="container mx-auto px-6 lg:px-12">
      <div class="max-w-4xl mx-auto">
        <!-- Welcome Header -->
        <div class="bg-white p-8 shadow-sm mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 class="font-serif text-2xl text-stone-900 mb-1">
                Willkommen, {{ customer?.firstName || 'Kunde' }}!
              </h1>
              <p class="text-stone-500">{{ customerEmail }}</p>
            </div>
            <button
              @click="handleLogout"
              :disabled="isLoggingOut"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:text-stone-900 border border-stone-200 hover:border-stone-300 transition-colors disabled:opacity-50"
            >
              <svg v-if="isLoggingOut" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Abmelden
            </button>
          </div>
        </div>

        <!-- Dashboard Cards -->
        <div class="grid md:grid-cols-3 gap-6">
          <NuxtLink
            v-for="card in dashboardCards"
            :key="card.link"
            :to="card.link"
            class="bg-white p-6 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div class="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-stone-200 transition-colors">
              <!-- Orders Icon -->
              <svg v-if="card.icon === 'orders'" class="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <!-- Addresses Icon -->
              <svg v-else-if="card.icon === 'addresses'" class="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <!-- Profile Icon -->
              <svg v-else-if="card.icon === 'profile'" class="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 class="font-medium text-stone-900 mb-1 group-hover:text-stone-700">{{ card.title }}</h3>
            <p class="text-sm text-stone-500">{{ card.description }}</p>
            <div class="mt-4 flex items-center text-sm text-stone-400 group-hover:text-stone-600 transition-colors">
              <span>Anzeigen</span>
              <svg class="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </NuxtLink>
        </div>

        <!-- Quick Links -->
        <div class="mt-8 bg-white p-6 shadow-sm">
          <h2 class="font-medium text-stone-900 mb-4">Schnellzugriff</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NuxtLink
              to="/"
              class="flex items-center gap-3 p-3 hover:bg-stone-50 transition-colors rounded"
            >
              <svg class="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span class="text-sm text-stone-600">Weiter einkaufen</span>
            </NuxtLink>
            <NuxtLink
              to="/furniture/likes"
              class="flex items-center gap-3 p-3 hover:bg-stone-50 transition-colors rounded"
            >
              <svg class="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span class="text-sm text-stone-600">Wunschliste</span>
            </NuxtLink>
            <NuxtLink
              to="/checkout"
              class="flex items-center gap-3 p-3 hover:bg-stone-50 transition-colors rounded"
            >
              <svg class="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span class="text-sm text-stone-600">Zur Kasse</span>
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="flex items-center gap-3 p-3 hover:bg-stone-50 transition-colors rounded"
            >
              <svg class="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm text-stone-600">Hilfe & FAQ</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
