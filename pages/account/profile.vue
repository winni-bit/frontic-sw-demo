<script setup lang="ts">
definePageMeta({
  layout: 'furniture',
  middleware: 'auth',
})

useHead({
  title: 'Kontodaten - Furniture',
})

const { customer, customerEmail, fetchCustomer, loading } = useShopwareAuth()

const initialLoading = ref(true)

// Refresh customer data on mount
onMounted(async () => {
  try {
    await fetchCustomer()
  } catch (err) {
    console.error('Error refreshing customer data:', err)
  } finally {
    initialLoading.value = false
  }
})

// Format date
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

// Get salutation display
const salutationDisplay = computed(() => {
  const salutation = customer.value?.salutation
  if (!salutation) return '-'
  return salutation.translated?.displayName || salutation.displayName || '-'
})

// Get customer number
const customerNumber = computed(() => {
  return customer.value?.customerNumber || '-'
})

// Get registration date
const registrationDate = computed(() => {
  return formatDate(customer.value?.createdAt)
})

// Get last login
const lastLogin = computed(() => {
  return formatDate(customer.value?.lastLogin)
})
</script>

<template>
  <div class="min-h-screen bg-stone-50 pt-8 pb-16">
    <div class="container mx-auto px-6 lg:px-12">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <NuxtLink 
            to="/account" 
            class="inline-flex items-center text-sm text-stone-500 hover:text-stone-900 mb-2"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zum Konto
          </NuxtLink>
          <h1 class="font-serif text-2xl text-stone-900">Kontodaten</h1>
        </div>

        <!-- Loading State -->
        <div v-if="initialLoading" class="space-y-6">
          <div class="bg-white p-6 shadow-sm animate-pulse">
            <div class="h-5 w-40 bg-stone-200 rounded mb-4" />
            <div class="space-y-3">
              <div class="h-4 w-32 bg-stone-100 rounded" />
              <div class="h-4 w-48 bg-stone-100 rounded" />
              <div class="h-4 w-36 bg-stone-100 rounded" />
            </div>
          </div>
        </div>

        <template v-else>
          <!-- Profile Info -->
          <div class="bg-white p-6 shadow-sm mb-6">
            <h2 class="font-medium text-stone-900 mb-4">Persönliche Daten</h2>
            
            <div class="space-y-4">
              <!-- Customer Number -->
              <div>
                <label class="block text-xs text-stone-400 uppercase tracking-wider mb-1">Kundennummer</label>
                <p class="text-stone-900 font-mono">{{ customerNumber }}</p>
              </div>

              <!-- Salutation -->
              <div>
                <label class="block text-xs text-stone-400 uppercase tracking-wider mb-1">Anrede</label>
                <p class="text-stone-900">{{ salutationDisplay }}</p>
              </div>

              <!-- Name -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-stone-400 uppercase tracking-wider mb-1">Vorname</label>
                  <p class="text-stone-900">{{ customer?.firstName || '-' }}</p>
                </div>
                <div>
                  <label class="block text-xs text-stone-400 uppercase tracking-wider mb-1">Nachname</label>
                  <p class="text-stone-900">{{ customer?.lastName || '-' }}</p>
                </div>
              </div>

              <!-- Company (if business customer) -->
              <div v-if="customer?.company">
                <label class="block text-xs text-stone-400 uppercase tracking-wider mb-1">Firma</label>
                <p class="text-stone-900">{{ customer.company }}</p>
              </div>
              
              <!-- Email -->
              <div>
                <label class="block text-xs text-stone-400 uppercase tracking-wider mb-1">E-Mail-Adresse</label>
                <p class="text-stone-900">{{ customerEmail || '-' }}</p>
              </div>

              <!-- Birthday -->
              <div v-if="customer?.birthday">
                <label class="block text-xs text-stone-400 uppercase tracking-wider mb-1">Geburtsdatum</label>
                <p class="text-stone-900">{{ formatDate(customer.birthday) }}</p>
              </div>
            </div>

            <button
              class="mt-6 text-sm text-stone-600 hover:text-stone-900 transition-colors"
              @click="alert('Profilbearbeitung wird in einer zukünftigen Version verfügbar sein.')"
            >
              Daten bearbeiten →
            </button>
          </div>

          <!-- Account Info -->
          <div class="bg-white p-6 shadow-sm mb-6">
            <h2 class="font-medium text-stone-900 mb-4">Kontoinformationen</h2>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-stone-400 uppercase tracking-wider mb-1">Registriert seit</label>
                <p class="text-stone-900">{{ registrationDate }}</p>
              </div>
              <div>
                <label class="block text-xs text-stone-400 uppercase tracking-wider mb-1">Letzte Anmeldung</label>
                <p class="text-stone-900">{{ lastLogin }}</p>
              </div>
            </div>
          </div>

          <!-- Password Section -->
          <div class="bg-white p-6 shadow-sm mb-6">
            <h2 class="font-medium text-stone-900 mb-4">Passwort ändern</h2>
            
            <p class="text-sm text-stone-500 mb-4">
              Aus Sicherheitsgründen empfehlen wir, Ihr Passwort regelmäßig zu ändern.
            </p>

            <button
              class="text-sm text-stone-600 hover:text-stone-900 transition-colors"
              @click="alert('Passwortänderung wird in einer zukünftigen Version verfügbar sein.')"
            >
              Passwort ändern →
            </button>
          </div>

          <!-- Delete Account -->
          <div class="p-6 border border-red-200 bg-red-50">
            <h2 class="font-medium text-red-900 mb-2">Konto löschen</h2>
            <p class="text-sm text-red-700 mb-4">
              Wenn Sie Ihr Konto löschen, werden alle Ihre Daten unwiderruflich entfernt.
            </p>
            <button
              class="text-sm text-red-600 hover:text-red-800 transition-colors"
              @click="alert('Kontolöschung wird in einer zukünftigen Version verfügbar sein.')"
            >
              Konto löschen →
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
