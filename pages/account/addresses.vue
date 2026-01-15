<script setup lang="ts">
definePageMeta({
  layout: 'furniture',
  middleware: 'auth',
})

useHead({
  title: 'Meine Adressen - Furniture',
})

const { customer, billingAddress, shippingAddress, addresses, fetchCustomer, loading } = useShopwareAuth()

const initialLoading = ref(true)

// Refresh customer data on mount to ensure we have latest addresses
onMounted(async () => {
  try {
    await fetchCustomer()
  } catch (err) {
    console.error('Error refreshing customer data:', err)
  } finally {
    initialLoading.value = false
  }
})

// Check if billing and shipping are the same address
const isSameAddress = computed(() => {
  if (!billingAddress.value || !shippingAddress.value) return false
  return billingAddress.value.id === shippingAddress.value.id
})
</script>

<template>
  <div class="min-h-screen bg-stone-50 pt-8 pb-16">
    <div class="container mx-auto px-6 lg:px-12">
      <div class="max-w-4xl mx-auto">
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
          <h1 class="font-serif text-2xl text-stone-900">Meine Adressen</h1>
        </div>

        <!-- Loading State -->
        <div v-if="initialLoading" class="grid md:grid-cols-2 gap-6">
          <div v-for="i in 2" :key="i" class="bg-white p-6 shadow-sm animate-pulse">
            <div class="h-5 w-32 bg-stone-200 rounded mb-4" />
            <div class="space-y-2">
              <div class="h-4 w-40 bg-stone-100 rounded" />
              <div class="h-4 w-36 bg-stone-100 rounded" />
              <div class="h-4 w-28 bg-stone-100 rounded" />
              <div class="h-4 w-32 bg-stone-100 rounded" />
            </div>
          </div>
        </div>

        <!-- Addresses Grid -->
        <div v-else class="grid md:grid-cols-2 gap-6">
          <!-- Billing Address -->
          <div class="bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-medium text-stone-900">Rechnungsadresse</h2>
              <span class="text-xs text-stone-400 uppercase tracking-wider">Standard</span>
            </div>
            <address v-if="billingAddress" class="text-sm text-stone-600 not-italic mb-4">
              <span v-if="billingAddress.company" class="block font-medium">{{ billingAddress.company }}</span>
              {{ billingAddress.firstName }} {{ billingAddress.lastName }}<br />
              {{ billingAddress.street }}<br />
              <span v-if="billingAddress.additionalAddressLine1">
                {{ billingAddress.additionalAddressLine1 }}<br />
              </span>
              {{ billingAddress.zipcode }} {{ billingAddress.city }}<br />
              <span v-if="billingAddress.countryState">
                {{ billingAddress.countryState.translated?.name || billingAddress.countryState.name }}<br />
              </span>
              {{ billingAddress.country?.translated?.name || billingAddress.country?.name || '' }}
              <template v-if="billingAddress.phoneNumber">
                <br />Tel: {{ billingAddress.phoneNumber }}
              </template>
            </address>
            <p v-else class="text-sm text-stone-400 mb-4">Keine Adresse hinterlegt</p>
            <button
              class="text-sm text-stone-600 hover:text-stone-900 transition-colors"
              @click="alert('Adressbearbeitung wird in einer zukünftigen Version verfügbar sein.')"
            >
              Bearbeiten →
            </button>
          </div>

          <!-- Shipping Address -->
          <div class="bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-medium text-stone-900">Lieferadresse</h2>
              <span v-if="isSameAddress" class="text-xs text-green-600 uppercase tracking-wider">
                = Rechnungsadresse
              </span>
              <span v-else class="text-xs text-stone-400 uppercase tracking-wider">Standard</span>
            </div>
            <address v-if="shippingAddress" class="text-sm text-stone-600 not-italic mb-4">
              <span v-if="shippingAddress.company" class="block font-medium">{{ shippingAddress.company }}</span>
              {{ shippingAddress.firstName }} {{ shippingAddress.lastName }}<br />
              {{ shippingAddress.street }}<br />
              <span v-if="shippingAddress.additionalAddressLine1">
                {{ shippingAddress.additionalAddressLine1 }}<br />
              </span>
              {{ shippingAddress.zipcode }} {{ shippingAddress.city }}<br />
              <span v-if="shippingAddress.countryState">
                {{ shippingAddress.countryState.translated?.name || shippingAddress.countryState.name }}<br />
              </span>
              {{ shippingAddress.country?.translated?.name || shippingAddress.country?.name || '' }}
              <template v-if="shippingAddress.phoneNumber">
                <br />Tel: {{ shippingAddress.phoneNumber }}
              </template>
            </address>
            <p v-else class="text-sm text-stone-400 mb-4">Keine Adresse hinterlegt</p>
            <button
              class="text-sm text-stone-600 hover:text-stone-900 transition-colors"
              @click="alert('Adressbearbeitung wird in einer zukünftigen Version verfügbar sein.')"
            >
              Bearbeiten →
            </button>
          </div>
        </div>

        <!-- Additional Addresses -->
        <div v-if="addresses.length > 2" class="mt-8">
          <h2 class="font-medium text-stone-900 mb-4">Weitere Adressen</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="address in addresses.filter(a => a.id !== billingAddress?.id && a.id !== shippingAddress?.id)" 
              :key="address.id"
              class="bg-white p-4 shadow-sm"
            >
              <address class="text-sm text-stone-600 not-italic mb-3">
                {{ address.firstName }} {{ address.lastName }}<br />
                {{ address.street }}<br />
                {{ address.zipcode }} {{ address.city }}
              </address>
              <button
                class="text-xs text-stone-500 hover:text-stone-900 transition-colors"
                @click="alert('Adressbearbeitung wird in einer zukünftigen Version verfügbar sein.')"
              >
                Bearbeiten
              </button>
            </div>
          </div>
        </div>

        <!-- Add Address Button -->
        <div class="mt-6">
          <button
            class="w-full md:w-auto px-6 py-3 border border-stone-200 text-stone-600 text-sm font-medium hover:border-stone-300 hover:text-stone-900 transition-colors"
            @click="alert('Neue Adresse hinzufügen wird in einer zukünftigen Version verfügbar sein.')"
          >
            + Neue Adresse hinzufügen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
