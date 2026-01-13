<script setup lang="ts">
/**
 * Order Confirmation Component
 * 
 * Displays order confirmation after successful checkout:
 * - Order number and details
 * - Shipping address
 * - Order items
 * - Cross-selling recommendations
 */

interface Props {
  order?: ShopwareOrder | null
}

const props = defineProps<Props>()

// Get the current shop layout to determine correct links
const { getLayout } = useShopLayout()
const currentLayout = getLayout()

// Determine the correct "continue shopping" link based on layout
const continueShoppingLink = computed(() => {
  switch (currentLayout) {
    case 'furniture':
      return '/furniture/all'
    case 'industry':
      return '/industry/all'
    default:
      return '/'
  }
})

// Determine button color based on layout
const buttonClass = computed(() => {
  switch (currentLayout) {
    case 'furniture':
      return 'bg-amber-600 hover:bg-amber-700'
    case 'industry':
      return 'bg-blue-600 hover:bg-blue-700'
    default:
      return 'bg-stone-900 hover:bg-stone-800'
  }
})

// Format price
const formatPrice = (price: number, currency: string = 'EUR') => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(price)
}

// Format date
const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(dateString))
}

// Get billing address
const billingAddress = computed(() => {
  if (!props.order) return null
  return props.order.billingAddress || props.order.addresses?.[0]
})

// Get shipping address
const shippingAddress = computed(() => {
  if (!props.order?.deliveries?.[0]) return null
  return props.order.deliveries[0].shippingOrderAddress
})

// Get payment method
const paymentMethod = computed(() => {
  return props.order?.transactions?.[0]?.paymentMethod
})

// Get shipping method
const shippingMethod = computed(() => {
  return props.order?.deliveries?.[0]?.shippingMethod
})

// Get currency symbol
const currencySymbol = computed(() => {
  return props.order?.currency?.symbol || '€'
})
</script>

<template>
  <div v-if="order" class="max-w-3xl mx-auto">
    <!-- Success Header -->
    <div class="text-center mb-12">
      <div class="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
        <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 class="text-3xl font-serif text-stone-900 mb-3">Vielen Dank für Ihre Bestellung!</h1>
      <p class="text-stone-500">
        Ihre Bestellung wurde erfolgreich aufgegeben.
      </p>
    </div>

    <!-- Order Info Card -->
    <div class="bg-stone-50 p-6 mb-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p class="text-xs text-stone-400 uppercase tracking-wider mb-1">Bestellnummer</p>
          <p class="font-medium text-stone-900">{{ order.orderNumber }}</p>
        </div>
        <div>
          <p class="text-xs text-stone-400 uppercase tracking-wider mb-1">Datum</p>
          <p class="font-medium text-stone-900">{{ formatDate(order.orderDateTime) }}</p>
        </div>
        <div>
          <p class="text-xs text-stone-400 uppercase tracking-wider mb-1">Zahlungsart</p>
          <p class="font-medium text-stone-900">
            {{ paymentMethod?.translated?.name || paymentMethod?.name || '-' }}
          </p>
        </div>
        <div>
          <p class="text-xs text-stone-400 uppercase tracking-wider mb-1">Gesamtsumme</p>
          <p class="font-medium text-stone-900">{{ formatPrice(order.amountTotal) }}</p>
        </div>
      </div>
    </div>

    <!-- Order Details -->
    <div class="grid md:grid-cols-2 gap-8 mb-8">
      <!-- Billing Address -->
      <div v-if="billingAddress">
        <h3 class="text-sm font-medium text-stone-900 uppercase tracking-wider mb-4">
          Rechnungsadresse
        </h3>
        <div class="text-stone-600 space-y-1">
          <p>{{ billingAddress.firstName }} {{ billingAddress.lastName }}</p>
          <p v-if="billingAddress.company">{{ billingAddress.company }}</p>
          <p>{{ billingAddress.street }}</p>
          <p>{{ billingAddress.zipcode }} {{ billingAddress.city }}</p>
          <p>{{ billingAddress.country?.translated?.name || billingAddress.country?.name }}</p>
        </div>
      </div>

      <!-- Shipping Address -->
      <div v-if="shippingAddress">
        <h3 class="text-sm font-medium text-stone-900 uppercase tracking-wider mb-4">
          Lieferadresse
        </h3>
        <div class="text-stone-600 space-y-1">
          <p>{{ shippingAddress.firstName }} {{ shippingAddress.lastName }}</p>
          <p v-if="shippingAddress.company">{{ shippingAddress.company }}</p>
          <p>{{ shippingAddress.street }}</p>
          <p>{{ shippingAddress.zipcode }} {{ shippingAddress.city }}</p>
          <p>{{ shippingAddress.country?.translated?.name || shippingAddress.country?.name }}</p>
        </div>
      </div>
    </div>

    <!-- Shipping Method -->
    <div v-if="shippingMethod" class="mb-8">
      <h3 class="text-sm font-medium text-stone-900 uppercase tracking-wider mb-4">
        Versandart
      </h3>
      <p class="text-stone-600">
        {{ shippingMethod.translated?.name || shippingMethod.name }}
      </p>
    </div>

    <!-- Order Items -->
    <div class="mb-8">
      <h3 class="text-sm font-medium text-stone-900 uppercase tracking-wider mb-4">
        Bestellte Artikel
      </h3>
      <div class="divide-y divide-stone-100 border border-stone-100">
        <div
          v-for="item in order.lineItems"
          :key="item.id"
          class="p-4 flex gap-4"
        >
          <!-- Product Image -->
          <div class="w-16 h-16 bg-stone-100 shrink-0 overflow-hidden">
            <img
              v-if="item.cover?.url"
              :src="item.cover.url"
              :alt="item.label"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>

          <!-- Product Info -->
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-stone-900">{{ item.label }}</h4>
            <p class="text-sm text-stone-500">Menge: {{ item.quantity }}</p>
          </div>

          <!-- Price -->
          <div class="text-right shrink-0">
            <p class="font-medium text-stone-900">{{ formatPrice(item.totalPrice) }}</p>
            <p v-if="item.quantity > 1" class="text-sm text-stone-500">
              {{ formatPrice(item.unitPrice) }} / Stück
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Price Summary -->
    <div class="border border-stone-100 p-6 mb-8">
      <div class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-stone-500">Zwischensumme</span>
          <span class="text-stone-900">{{ formatPrice(order.amountNet) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-stone-500">Versandkosten</span>
          <span class="text-stone-900">{{ formatPrice(order.shippingTotal) }}</span>
        </div>
        <div class="flex justify-between pt-3 border-t border-stone-100">
          <span class="font-medium text-stone-900">Gesamtsumme</span>
          <span class="font-medium text-stone-900">{{ formatPrice(order.amountTotal) }}</span>
        </div>
      </div>
    </div>

    <!-- Email Notice -->
    <div class="bg-blue-50 p-6 mb-8">
      <div class="flex gap-4">
        <svg class="w-6 h-6 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <div>
          <p class="font-medium text-blue-900 mb-1">Bestätigungsmail gesendet</p>
          <p class="text-sm text-blue-700">
            Wir haben Ihnen eine Bestellbestätigung an 
            <strong>{{ order.orderCustomer?.email }}</strong> 
            gesendet.
          </p>
        </div>
      </div>
    </div>

    <!-- Continue Shopping -->
    <div class="text-center">
      <NuxtLink
        :to="continueShoppingLink"
        :class="[
          'inline-block px-8 py-4 text-white text-sm font-medium uppercase tracking-wider transition-colors',
          buttonClass
        ]"
      >
        Weiter einkaufen
      </NuxtLink>
    </div>
  </div>

  <!-- No Order Data -->
  <div v-else class="max-w-md mx-auto text-center py-12">
    <svg class="w-16 h-16 mx-auto text-stone-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <h2 class="text-xl font-medium text-stone-900 mb-2">Keine Bestelldaten gefunden</h2>
    <p class="text-stone-500 mb-6">
      Die Bestelldaten konnten nicht geladen werden.
    </p>
    <NuxtLink
      :to="continueShoppingLink"
      :class="[
        'inline-block px-6 py-3 text-white text-sm font-medium transition-colors',
        buttonClass
      ]"
    >
      Zur Startseite
    </NuxtLink>
  </div>
</template>
