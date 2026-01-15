<template>
  <div class="bg-white shadow-sm">
    <!-- Order Header (Always Visible) -->
    <button
      @click="expanded = !expanded"
      class="w-full p-6 text-left hover:bg-stone-50 transition-colors"
    >
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <!-- Order Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="font-medium text-stone-900">
              Bestellung #{{ order.orderNumber }}
            </h3>
            <AccountOrderStatusBadge :status="orderStatus" />
          </div>
          <p class="text-sm text-stone-500">
            {{ formatDate(order.orderDateTime) }}
          </p>
        </div>

        <!-- Order Summary -->
        <div class="flex items-center gap-6">
          <div class="text-right">
            <p class="text-sm text-stone-500">{{ itemCount }} Artikel</p>
            <p class="font-medium text-stone-900">{{ formatPrice(order.amountTotal) }}</p>
          </div>

          <!-- Expand Icon -->
          <svg
            class="w-5 h-5 text-stone-400 transition-transform duration-200"
            :class="{ 'rotate-180': expanded }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </button>

    <!-- Order Details (Expandable) -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[2000px]"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-[2000px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="expanded" class="overflow-hidden">
        <div class="px-6 pb-6 border-t border-stone-100">
          <!-- Line Items -->
          <div class="py-4">
            <h4 class="text-sm font-medium text-stone-900 mb-4">Bestellte Artikel</h4>
            <div class="space-y-3">
              <div
                v-for="item in order.lineItems"
                :key="item.id"
                class="flex items-center gap-4"
              >
                <!-- Product Image -->
                <div class="w-16 h-16 bg-stone-100 shrink-0 overflow-hidden">
                  <img
                    v-if="getItemImage(item)"
                    :src="getItemImage(item)!"
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
                  <p class="text-sm text-stone-900 line-clamp-1">{{ item.label }}</p>
                  <p class="text-sm text-stone-500">Menge: {{ item.quantity }}</p>
                </div>

                <!-- Price -->
                <p class="text-sm font-medium text-stone-900 shrink-0">
                  {{ formatPrice(item.totalPrice) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Delivery & Payment Info -->
          <div class="grid md:grid-cols-2 gap-6 py-4 border-t border-stone-100">
            <!-- Delivery Address -->
            <div v-if="shippingAddress">
              <h4 class="text-sm font-medium text-stone-900 mb-2">Lieferadresse</h4>
              <address class="text-sm text-stone-600 not-italic">
                {{ shippingAddress.firstName }} {{ shippingAddress.lastName }}<br />
                {{ shippingAddress.street }}<br />
                {{ shippingAddress.zipcode }} {{ shippingAddress.city }}<br />
                {{ shippingAddress.country?.translated?.name || shippingAddress.country?.name || '' }}
              </address>
            </div>

            <!-- Billing Address -->
            <div v-if="order.billingAddress">
              <h4 class="text-sm font-medium text-stone-900 mb-2">Rechnungsadresse</h4>
              <address class="text-sm text-stone-600 not-italic">
                {{ order.billingAddress.firstName }} {{ order.billingAddress.lastName }}<br />
                {{ order.billingAddress.street }}<br />
                {{ order.billingAddress.zipcode }} {{ order.billingAddress.city }}<br />
                {{ order.billingAddress.country?.translated?.name || order.billingAddress.country?.name || '' }}
              </address>
            </div>
          </div>

          <!-- Delivery Status -->
          <div v-if="order.deliveries?.[0]" class="py-4 border-t border-stone-100">
            <h4 class="text-sm font-medium text-stone-900 mb-2">Versandstatus</h4>
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-sm text-stone-600">
                {{ order.deliveries[0].shippingMethod?.translated?.name || order.deliveries[0].shippingMethod?.name || 'Standardversand' }}
              </span>
              <AccountOrderStatusBadge 
                v-if="order.deliveries[0].stateMachineState?.technicalName"
                :status="order.deliveries[0].stateMachineState.technicalName" 
              />
            </div>
            <div v-if="order.deliveries[0].trackingCodes?.length > 0" class="mt-3">
              <p class="text-xs text-stone-500 mb-1">Sendungsverfolgung:</p>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="code in order.deliveries[0].trackingCodes" 
                  :key="code" 
                  class="text-sm text-stone-900 font-mono bg-stone-100 px-2 py-1"
                >
                  {{ code }}
                </span>
              </div>
            </div>
          </div>

          <!-- Price Summary -->
          <div class="py-4 border-t border-stone-100">
            <h4 class="text-sm font-medium text-stone-900 mb-3">Zusammenfassung</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-stone-500">Zwischensumme</span>
                <span class="text-stone-900">{{ formatPrice(order.amountNet) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-stone-500">Versandkosten</span>
                <span class="text-stone-900">{{ formatPrice(order.shippingTotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-stone-500">inkl. MwSt.</span>
                <span class="text-stone-900">{{ formatPrice(order.amountTotal - order.amountNet) }}</span>
              </div>
              <div class="flex justify-between pt-2 border-t border-stone-100 font-medium">
                <span class="text-stone-900">Gesamtsumme</span>
                <span class="text-stone-900">{{ formatPrice(order.amountTotal) }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Info -->
          <div v-if="order.transactions?.[0]" class="py-4 border-t border-stone-100">
            <h4 class="text-sm font-medium text-stone-900 mb-2">Zahlungsinformationen</h4>
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-sm text-stone-600">
                {{ order.transactions[0].paymentMethod?.translated?.name || order.transactions[0].paymentMethod?.name || 'Zahlung' }}
              </span>
              <AccountOrderStatusBadge 
                v-if="order.transactions[0].stateMachineState?.technicalName"
                :status="order.transactions[0].stateMachineState.technicalName" 
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  order: ShopwareOrder
}>()

const expanded = ref(false)

// Get order status from state machine
const orderStatus = computed(() => {
  return props.order.stateMachineState?.technicalName || 'open'
})

// Get item count
const itemCount = computed(() => {
  return props.order.lineItems?.length || 0
})

// Get shipping address from first delivery
const shippingAddress = computed(() => {
  return props.order.deliveries?.[0]?.shippingOrderAddress || props.order.billingAddress
})

// Get item image (check multiple sources)
const getItemImage = (item: any): string | null => {
  // Try direct cover
  if (item.cover?.url) return item.cover.url
  // Try product cover
  if (item.product?.cover?.url) return item.product.cover.url
  return null
}

// Format price as EUR
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

// Format date as German date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>
