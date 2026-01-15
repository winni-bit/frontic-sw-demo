<script setup lang="ts">
/**
 * OnePage Checkout - Refactored
 * 
 * Supports both:
 * - Guest checkout (address form)
 * - Logged-in customer checkout (pre-filled address)
 * 
 * Components:
 * - ProgressSteps: Visual progress indicator
 * - AddressSection: Customer address or guest form
 * - ShippingSection: Shipping method selection
 * - PaymentSection: Payment method selection
 * - OrderSummarySidebar: Cart items and totals
 * - MobileOrderButton: Sticky bottom button for mobile
 */

// Get the current shop layout
const { getLayout } = useShopLayout()
const currentLayout = getLayout()

definePageMeta({
  layout: false,
})

useHead({
  title: 'Checkout - Store',
})

const router = useRouter()

// Get auth state first - this is critical for detecting logged-in customers
const { isLoggedIn, customer: authCustomer, isInitialized: authInitialized, initAuth, fetchCustomer } = useShopwareAuth()

// Use centralized checkout composable
const {
  formData,
  errors,
  isProcessing,
  globalError,
  initialLoading,
  isGuestRegistered,
  orderStep,
  isCustomerLoggedIn,
  customerDisplayName,
  completedSteps,
  isFormComplete,
  isEmpty,
  countries,
  salutations,
  validateForm,
  prefillFormWithCustomerData,
  resetCheckout,
  ensureCartLoaded,
  fetchShippingMethods,
  fetchPaymentMethods,
  fetchCountries,
  fetchSalutations,
  setShippingMethod,
  setPaymentMethod,
  registerGuest,
  placeOrder,
  fetchContext,
  shippingMethods,
  paymentMethods,
} = useCheckout()

// Determine the correct products page based on layout
const productsPagePath = computed(() => {
  switch (currentLayout) {
    case 'furniture':
      return '/furniture/all'
    case 'industry':
      return '/industry/all'
    default:
      return '/'
  }
})

// Find shipping method by name
const findShippingMethodByName = (name: string) => {
  return shippingMethods.value.find(m => 
    (m.translated?.name || m.name || '').toLowerCase().includes(name.toLowerCase())
  )
}

// Find payment method by name
const findPaymentMethodByName = (name: string) => {
  return paymentMethods.value.find(m => 
    (m.translated?.name || m.name || '').toLowerCase().includes(name.toLowerCase()) ||
    (m.technicalName || '').toLowerCase().includes(name.toLowerCase())
  )
}

// Handle place order
const handlePlaceOrder = async () => {
  // For logged-in customers, skip form validation
  if (!isCustomerLoggedIn.value && !validateForm()) {
    const firstErrorKey = Object.keys(errors.value)[0]
    const errorElement = document.getElementById(firstErrorKey)
    errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  isProcessing.value = true
  globalError.value = null

  try {
    // For guests, register first
    if (!isCustomerLoggedIn.value && !isGuestRegistered.value) {
      orderStep.value = 'registering'
      
      try {
        await registerGuest(formData.value)
        isGuestRegistered.value = true
      } catch (regError: any) {
        throw new Error(`Registrierung fehlgeschlagen: ${regError.message}`)
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    const context = await fetchContext()
    
    if (!context.customer) {
      throw new Error('Kundenregistrierung fehlgeschlagen. Bitte versuchen Sie es erneut.')
    }

    orderStep.value = 'placing'
    const order = await placeOrder()

    if (import.meta.client) {
      const orderData: OrderConfirmationData = {
        order,
        timestamp: Date.now(),
      }
      sessionStorage.setItem('lastOrder', JSON.stringify(orderData))
    }

    // Reset checkout state
    resetCheckout()
    
    router.push('/order-confirmation')
  } catch (err: any) {
    console.error('[Checkout] Error:', err)
    globalError.value = err.message || 'Es ist ein Fehler aufgetreten'
    isGuestRegistered.value = false
    orderStep.value = 'idle'
  } finally {
    isProcessing.value = false
    orderStep.value = 'idle'
  }
}

// Initialize checkout
onMounted(async () => {
  console.log('[Checkout] Mounting checkout page...')
  
  try {
    // IMPORTANT: Always fetch customer data fresh to ensure we have the latest auth state
    console.log('[Checkout] Fetching fresh customer data...')
    await fetchCustomer()
    
    // Wait a tick for Vue reactivity to update
    await nextTick()
    
    console.log('[Checkout] Auth state after fetch:', {
      isLoggedIn: isLoggedIn.value,
      hasCustomer: !!authCustomer.value,
      customerEmail: authCustomer.value?.email,
      isGuest: authCustomer.value?.guest,
      isCustomerLoggedIn: isCustomerLoggedIn.value
    })
    
    await ensureCartLoaded()
    
    await Promise.all([
      fetchShippingMethods(),
      fetchPaymentMethods(),
      fetchCountries(),
      fetchSalutations(),
    ])

    // Pre-fill form for logged-in customers
    if (isCustomerLoggedIn.value) {
      console.log('[Checkout] Customer is logged in, pre-filling form...')
      prefillFormWithCustomerData()
    } else {
      console.log('[Checkout] Customer is NOT logged in, setting guest defaults...')
      // Set defaults for guests
      if (salutations.value.length > 0) {
        const notSpecified = salutations.value.find(s => 
          s.salutationKey === 'not_specified' || 
          s.displayName?.toLowerCase().includes('keine')
        )
        formData.value.salutationId = notSpecified?.id || salutations.value[0].id
      }

      const germany = countries.value.find(c => c.iso === 'DE')
      if (germany) {
        formData.value.countryId = germany.id
      } else if (countries.value.length > 0) {
        formData.value.countryId = countries.value[0].id
      }
    }

    // Set default shipping method
    const { selectedShippingMethodId } = useCheckout()
    if (!selectedShippingMethodId.value) {
      const standardShipping = findShippingMethodByName('standard')
      if (standardShipping) {
        await setShippingMethod(standardShipping.id)
      } else if (shippingMethods.value.length > 0) {
        await setShippingMethod(shippingMethods.value[0].id)
      }
    }

    // Set default payment method
    const { selectedPaymentMethodId } = useCheckout()
    if (!selectedPaymentMethodId.value) {
      const invoicePayment = findPaymentMethodByName('invoice')
      if (invoicePayment) {
        await setPaymentMethod(invoicePayment.id)
      } else if (paymentMethods.value.length > 0) {
        await setPaymentMethod(paymentMethods.value[0].id)
      }
    }
    
    if (isEmpty.value) {
      router.push(productsPagePath.value)
    }
  } catch (error) {
    console.error('[Checkout] Error initializing checkout:', error)
    globalError.value = 'Fehler beim Laden des Checkouts. Bitte versuchen Sie es erneut.'
  } finally {
    initialLoading.value = false
  }
})

watch(isEmpty, (empty) => {
  if (empty && !initialLoading.value) {
    router.push(productsPagePath.value)
  }
})

// Theme detection
const isIndustryTheme = computed(() => currentLayout === 'industry')

// Theme colors
const themeColors = computed(() => {
  if (isIndustryTheme.value) {
    return {
      bg: 'bg-slate-950',
      cardBg: 'bg-slate-900',
      text: 'text-white',
      textMuted: 'text-slate-400',
      buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
    }
  }
  return {
    bg: 'bg-stone-50',
    cardBg: 'bg-white',
    text: 'text-stone-900',
    textMuted: 'text-stone-500',
    buttonPrimary: 'bg-amber-600 hover:bg-amber-700',
  }
})

// Page subtitle based on customer status
const pageSubtitle = computed(() => {
  if (isCustomerLoggedIn.value) {
    return `Willkommen zurück, ${customerDisplayName.value}`
  }
  return 'Gastbestellung - Kein Konto erforderlich'
})
</script>

<template>
  <NuxtLayout :name="currentLayout">
    <div :class="['min-h-screen pt-24 pb-24 lg:pb-16', themeColors.bg]">
      <div class="container mx-auto px-4 lg:px-8">
        <!-- Progress Steps -->
        <CheckoutProgressSteps 
          :completed-steps="completedSteps" 
          :is-industry-theme="isIndustryTheme" 
        />

        <!-- Page Header -->
        <div class="mb-8">
          <h1 :class="['text-3xl font-serif mb-2', themeColors.text]">Checkout</h1>
          <p :class="themeColors.textMuted">{{ pageSubtitle }}</p>
        </div>

        <!-- Loading State -->
        <div v-if="initialLoading" class="max-w-4xl mx-auto py-12">
          <div class="flex items-center justify-center gap-3">
            <svg :class="['w-6 h-6 animate-spin', themeColors.textMuted]" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span :class="themeColors.textMuted">Checkout wird geladen...</span>
          </div>
        </div>

        <!-- Empty Cart -->
        <div v-else-if="isEmpty" class="max-w-md mx-auto text-center py-12">
          <svg :class="['w-16 h-16 mx-auto mb-4', themeColors.textMuted]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 :class="['text-xl font-medium mb-2', themeColors.text]">Ihr Warenkorb ist leer</h2>
          <p :class="['mb-6', themeColors.textMuted]">Fügen Sie Produkte hinzu, um fortzufahren.</p>
          <NuxtLink
            :to="productsPagePath"
            :class="['inline-block px-6 py-3 text-white text-sm font-medium transition-colors', themeColors.buttonPrimary]"
          >
            Produkte entdecken
          </NuxtLink>
        </div>

        <!-- Checkout Content -->
        <div v-else class="lg:grid lg:grid-cols-5 lg:gap-8">
          <!-- Left Column - Forms -->
          <div class="lg:col-span-3 space-y-6">
            <!-- Global Error -->
            <div
              v-if="globalError"
              class="p-4 bg-red-900/30 border border-red-700 text-red-300"
            >
              <div class="flex gap-3">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="font-medium">Es ist ein Fehler aufgetreten</p>
                  <p class="text-sm mt-1">{{ globalError }}</p>
                </div>
              </div>
            </div>

            <!-- Address Section -->
            <CheckoutAddressSection 
              :is-industry-theme="isIndustryTheme"
              :disabled="isProcessing"
            />

            <!-- Shipping Section -->
            <CheckoutShippingSection 
              :is-industry-theme="isIndustryTheme"
              :disabled="isProcessing"
            />

            <!-- Payment Section -->
            <CheckoutPaymentSection 
              :is-industry-theme="isIndustryTheme"
              :disabled="isProcessing"
            />
          </div>

          <!-- Right Column - Order Summary -->
          <div class="lg:col-span-2 mt-6 lg:mt-0">
            <CheckoutOrderSummarySidebar
              :is-industry-theme="isIndustryTheme"
              :is-processing="isProcessing"
              :order-step="orderStep"
              @place-order="handlePlaceOrder"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Sticky Order Button -->
    <CheckoutMobileOrderButton
      v-if="!initialLoading && !isEmpty"
      :is-industry-theme="isIndustryTheme"
      :is-processing="isProcessing"
      :order-step="orderStep"
      @place-order="handlePlaceOrder"
    />
  </NuxtLayout>
</template>
