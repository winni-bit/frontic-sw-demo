<script setup lang="ts">
/**
 * Reusable OnePage Checkout Form Component
 * 
 * Supports both guest checkout and logged-in customer checkout:
 * - For logged-in users: Uses saved address data, skips registration, order is linked to account
 * - For guests: Full address form with guest registration
 * 
 * All checkout steps visible on one page:
 * - Address Form (pre-filled for logged-in users)
 * - Shipping Method Selection
 * - Payment Method Selection
 * - Order Summary & Place Order
 */

const props = defineProps<{
  /** Base path for the shop (e.g., '/furniture', '/industry') */
  shopBasePath?: string
  /** Products page path for "continue shopping" link */
  productsPath?: string
  /** Order confirmation page path */
  confirmationPath?: string
}>()

const router = useRouter()

// Default paths
const productsPagePath = computed(() => props.productsPath || '/products')
const confirmationPagePath = computed(() => props.confirmationPath || '/order-confirmation')

// Auth composable for logged-in user data
const {
  isLoggedIn: authIsLoggedIn,
  customer: authCustomer,
  billingAddress: customerBillingAddress,
  customerEmail,
  fetchCustomer,
} = useShopwareAuth()

const {
  cart,
  isEmpty,
  loading: cartLoading,
  error: cartError,
  subtotal,
  shippingCosts,
  totalPrice,
  selectedShippingMethod,
  selectedPaymentMethod,
  selectedShippingMethodId,
  selectedPaymentMethodId,
  shippingMethods,
  paymentMethods,
  countries,
  salutations,
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
  updateBillingAddress,
  setActiveBillingAddress,
} = useShopwareCart()

// Form state
const formData = reactive<CheckoutFormData>({
  email: '',
  salutationId: '',
  firstName: '',
  lastName: '',
  street: '',
  zipcode: '',
  city: '',
  countryId: '',
  countryStateId: '',
  phoneNumber: '',
})

// Validation errors
const errors = reactive<Record<string, string>>({})

// UI State
const isProcessing = ref(false)
const globalError = ref<string | null>(null)
const initialLoading = ref(true)
const updatingShipping = ref(false)
const updatingPayment = ref(false)
const isGuestRegistered = ref(false)
const orderStep = ref<'idle' | 'registering' | 'updating-address' | 'placing'>('idle')

// Track the actual logged-in customer from context (more reliable than auth state)
const contextCustomer = ref<ShopwareCustomer | null>(null)

// Computed: Is user logged in (based on context, not just auth state)
const isLoggedIn = computed(() => {
  // Check context customer first (most reliable)
  if (contextCustomer.value && !contextCustomer.value.guest) {
    return true
  }
  // Fall back to auth state
  return authIsLoggedIn.value
})

// Computed: Current customer (prefer context customer)
const currentCustomer = computed(() => {
  return contextCustomer.value || authCustomer.value
})

// Computed: Current customer email
const currentCustomerEmail = computed(() => {
  return currentCustomer.value?.email || customerEmail.value || ''
})

// Line items
const lineItems = computed(() => cart.value?.lineItems || [])

// Taxes
const taxes = computed(() => cart.value?.price?.calculatedTaxes || [])

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

// Get line item image
const getItemImage = (item: ShopwareLineItem) => {
  return item.cover?.url || null
}

// Pre-fill form with customer data (from context or auth)
const prefillCustomerData = (customer: ShopwareCustomer | null) => {
  if (!customer) {
    console.log('[Checkout] No customer data to pre-fill')
    return
  }

  console.log('[Checkout] Pre-filling form with customer data:', {
    email: customer.email,
    name: `${customer.firstName} ${customer.lastName}`,
    hasBillingAddress: !!customer.defaultBillingAddress,
  })

  // Basic customer info
  formData.email = customer.email || ''
  formData.firstName = customer.firstName || ''
  formData.lastName = customer.lastName || ''
  formData.salutationId = customer.salutationId || ''

  // Billing address - try different sources
  const billingAddr = customer.defaultBillingAddress || 
                      customer.activeBillingAddress || 
                      customerBillingAddress.value
  
  if (billingAddr) {
    formData.street = billingAddr.street || ''
    formData.zipcode = billingAddr.zipcode || ''
    formData.city = billingAddr.city || ''
    formData.countryId = billingAddr.countryId || ''
    formData.countryStateId = billingAddr.countryStateId || ''
    formData.phoneNumber = billingAddr.phoneNumber || ''
  }
}

// Validate form
const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => delete errors[key])

  if (!formData.email) {
    errors.email = 'E-Mail ist erforderlich'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Ungültige E-Mail-Adresse'
  }

  if (!formData.firstName?.trim()) {
    errors.firstName = 'Vorname ist erforderlich'
  }
  if (!formData.lastName?.trim()) {
    errors.lastName = 'Nachname ist erforderlich'
  }
  if (!formData.street?.trim()) {
    errors.street = 'Straße ist erforderlich'
  }
  if (!formData.zipcode?.trim()) {
    errors.zipcode = 'PLZ ist erforderlich'
  }
  if (!formData.city?.trim()) {
    errors.city = 'Stadt ist erforderlich'
  }
  if (!formData.countryId) {
    errors.countryId = 'Land ist erforderlich'
  }

  return Object.keys(errors).length === 0
}

// Check if form is complete (for enabling order button)
const isFormComplete = computed(() => {
  const hasEmail = !!formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
  const hasFirstName = !!formData.firstName?.trim()
  const hasLastName = !!formData.lastName?.trim()
  const hasStreet = !!formData.street?.trim()
  const hasZipcode = !!formData.zipcode?.trim()
  const hasCity = !!formData.city?.trim()
  const hasCountry = !!formData.countryId
  const hasShipping = !!selectedShippingMethodId.value
  const hasPayment = !!selectedPaymentMethodId.value
  
  return hasEmail && hasFirstName && hasLastName && hasStreet && hasZipcode && hasCity && hasCountry && hasShipping && hasPayment
})

// Handle shipping method change
const handleShippingChange = async (methodId: string) => {
  if (updatingShipping.value) return
  
  updatingShipping.value = true
  try {
    await setShippingMethod(methodId)
  } catch (error) {
    console.error('Error setting shipping method:', error)
  } finally {
    updatingShipping.value = false
  }
}

// Handle payment method change
const handlePaymentChange = async (methodId: string) => {
  if (updatingPayment.value) return
  
  updatingPayment.value = true
  try {
    await setPaymentMethod(methodId)
  } catch (error) {
    console.error('Error setting payment method:', error)
  } finally {
    updatingPayment.value = false
  }
}

// Get shipping price from method
const getShippingPrice = (method: ShopwareShippingMethod): number => {
  if (method.prices?.length > 0) {
    const price = method.prices[0]
    if (price.currencyPrice?.length > 0) {
      return price.currencyPrice[0].gross || 0
    }
  }
  return 0
}

// Payment method icon mapping
const getPaymentIcon = (method: ShopwarePaymentMethod) => {
  const technicalName = method.technicalName?.toLowerCase() || ''
  const name = method.name?.toLowerCase() || ''
  
  if (technicalName.includes('paypal') || name.includes('paypal')) return 'paypal'
  if (technicalName.includes('credit') || technicalName.includes('card') || name.includes('kreditkarte')) return 'card'
  if (technicalName.includes('invoice') || name.includes('rechnung')) return 'invoice'
  if (technicalName.includes('prepayment') || name.includes('vorkasse')) return 'prepayment'
  if (technicalName.includes('cash') || name.includes('nachnahme')) return 'cash'
  if (technicalName.includes('sepa') || name.includes('lastschrift')) return 'sepa'
  
  return 'default'
}

// Handle place order
const handlePlaceOrder = async () => {
  if (!validateForm()) {
    const firstErrorKey = Object.keys(errors)[0]
    const errorElement = document.getElementById(firstErrorKey)
    errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  isProcessing.value = true
  globalError.value = null

  try {
    // First, check the current context to see if we have a customer
    console.log('[Checkout] Checking current context...')
    const context = await fetchContext()
    
    console.log('[Checkout] Context check result:', {
      hasCustomer: !!context.customer,
      customerEmail: context.customer?.email,
      customerId: context.customer?.id,
      isGuest: context.customer?.guest,
      isLoggedInState: isLoggedIn.value,
      defaultBillingAddressId: context.customer?.defaultBillingAddressId,
    })

    // Determine customer type
    const isRealCustomer = context.customer && !context.customer.guest
    const isGuestCustomer = context.customer && context.customer.guest
    
    if (isRealCustomer) {
      // User is logged in with a real account
      console.log('[Checkout] User is logged in with real account')
      console.log('[Checkout] Customer:', context.customer?.email, '- ID:', context.customer?.id)
      
      // Update the billing address with form data before placing order
      const billingAddressId = context.customer?.defaultBillingAddressId || context.customer?.activeBillingAddressId
      
      if (billingAddressId) {
        console.log('[Checkout] Updating billing address:', billingAddressId)
        orderStep.value = 'updating-address'
        
        try {
          await updateBillingAddress(formData, billingAddressId)
          console.log('[Checkout] Billing address updated successfully')
          
          // Set this address as the active billing address for the order
          await setActiveBillingAddress(billingAddressId)
          console.log('[Checkout] Active billing address set')
        } catch (addrError: any) {
          console.warn('[Checkout] Could not update billing address:', addrError.message)
          // Continue anyway - the existing address should still work
        }
      }
      
      orderStep.value = 'placing'
      
    } else if (isGuestCustomer && isGuestRegistered.value) {
      // Guest already registered in this session
      console.log('[Checkout] Guest already registered, placing order')
      orderStep.value = 'placing'
      
    } else {
      // No customer or new guest - need to register as guest
      console.log('[Checkout] No customer in context, registering as guest')
      orderStep.value = 'registering'
      
      try {
        await registerGuest(formData)
        isGuestRegistered.value = true
        console.log('[Checkout] Guest registration successful')
      } catch (regError: any) {
        throw new Error(`Registrierung fehlgeschlagen: ${regError.message}`)
      }

      // Small delay to ensure context is updated
      await new Promise(resolve => setTimeout(resolve, 300))

      // Verify guest registration
      const updatedContext = await fetchContext()
      if (!updatedContext.customer) {
        throw new Error('Kundenregistrierung fehlgeschlagen. Bitte versuchen Sie es erneut.')
      }
      console.log('[Checkout] Guest verified:', updatedContext.customer.email)
      
      orderStep.value = 'placing'
    }

    // Place the order
    console.log('[Checkout] Placing order...')
    const order = await placeOrder()
    console.log('[Checkout] Order placed successfully:', order.orderNumber)

    // Save order data for confirmation page
    if (import.meta.client) {
      const orderData: OrderConfirmationData = {
        order,
        timestamp: Date.now(),
      }
      sessionStorage.setItem('lastOrder', JSON.stringify(orderData))
    }

    // Navigate to confirmation page
    router.push(confirmationPagePath.value)
  } catch (err: any) {
    console.error('[Checkout] Error:', err)
    globalError.value = err.message || 'Es ist ein Fehler aufgetreten'
    orderStep.value = 'idle'
  } finally {
    isProcessing.value = false
    orderStep.value = 'idle'
  }
}

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

// Initialize checkout
onMounted(async () => {
  try {
    console.log('[Checkout] Initializing checkout...')
    console.log('[Checkout] Auth isLoggedIn:', authIsLoggedIn.value)
    
    await ensureCartLoaded()
    
    // Load all required data in parallel
    const [, , , , context] = await Promise.all([
      fetchShippingMethods(),
      fetchPaymentMethods(),
      fetchCountries(),
      fetchSalutations(),
      fetchContext(), // Fetch context to get actual customer status
    ])

    console.log('[Checkout] Initial context from Shopware:', {
      hasCustomer: !!context.customer,
      customerEmail: context.customer?.email,
      customerId: context.customer?.id,
      isGuest: context.customer?.guest,
      defaultBillingAddressId: context.customer?.defaultBillingAddressId,
    })

    // Store context customer for UI decisions
    if (context.customer && !context.customer.guest) {
      contextCustomer.value = context.customer
      console.log('[Checkout] Real customer detected from context:', context.customer.email)
      
      // Pre-fill form with context customer data
      prefillCustomerData(context.customer)
      
      // Also update auth state if needed
      if (!authCustomer.value) {
        console.log('[Checkout] Fetching full customer data for auth state...')
        await fetchCustomer()
      }
    } else if (authIsLoggedIn.value && authCustomer.value) {
      // Fall back to auth state if context doesn't have customer
      console.log('[Checkout] Using auth customer data:', authCustomer.value.email)
      contextCustomer.value = authCustomer.value
      prefillCustomerData(authCustomer.value)
    } else {
      console.log('[Checkout] No logged-in customer, using guest checkout')
      
      // Set default salutation for guests
      if (salutations.value.length > 0) {
        const notSpecified = salutations.value.find(s => 
          s.salutationKey === 'not_specified' || 
          s.displayName?.toLowerCase().includes('keine')
        )
        formData.salutationId = notSpecified?.id || salutations.value[0].id
      }

      // Set default country for guests
      const germany = countries.value.find(c => c.iso === 'DE')
      if (germany) {
        formData.countryId = germany.id
      } else if (countries.value.length > 0) {
        formData.countryId = countries.value[0].id
      }
    }

    // Set default shipping method
    if (!selectedShippingMethodId.value) {
      const standardShipping = findShippingMethodByName('standard')
      if (standardShipping) {
        await setShippingMethod(standardShipping.id)
      } else if (shippingMethods.value.length > 0) {
        await setShippingMethod(shippingMethods.value[0].id)
      }
    }

    // Set default payment method
    if (!selectedPaymentMethodId.value) {
      const invoicePayment = findPaymentMethodByName('invoice')
      if (invoicePayment) {
        await setPaymentMethod(invoicePayment.id)
      } else if (paymentMethods.value.length > 0) {
        await setPaymentMethod(paymentMethods.value[0].id)
      }
    }
    
    // Redirect if cart is empty
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

// Watch for empty cart
watch(isEmpty, (empty) => {
  if (empty && !initialLoading.value) {
    router.push(productsPagePath.value)
  }
})

// Watch for auth login state changes and update form
watch(authIsLoggedIn, async (loggedIn) => {
  if (loggedIn && authCustomer.value) {
    console.log('[Checkout] Auth state changed to logged in, updating form')
    contextCustomer.value = authCustomer.value
    prefillCustomerData(authCustomer.value)
    // Reset guest registration state when user logs in
    isGuestRegistered.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-stone-50 pt-8 pb-16">
    <div class="container mx-auto px-4 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-serif text-stone-900 mb-2">Checkout</h1>
        <p v-if="isLoggedIn" class="text-stone-500">
          Angemeldet als <span class="font-medium text-stone-700">{{ currentCustomerEmail }}</span>
        </p>
        <p v-else class="text-stone-500">Gastbestellung - Kein Konto erforderlich</p>
      </div>

      <!-- Loading State -->
      <div v-if="initialLoading" class="max-w-4xl mx-auto py-12">
        <div class="flex items-center justify-center gap-3">
          <svg class="w-6 h-6 animate-spin text-stone-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span class="text-stone-500">Checkout wird geladen...</span>
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="isEmpty" class="max-w-md mx-auto text-center py-12">
        <svg class="w-16 h-16 mx-auto text-stone-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h2 class="text-xl font-medium text-stone-900 mb-2">Ihr Warenkorb ist leer</h2>
        <p class="text-stone-500 mb-6">Fügen Sie Produkte hinzu, um fortzufahren.</p>
        <NuxtLink
          :to="productsPagePath"
          class="inline-block px-6 py-3 bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
        >
          Produkte entdecken
        </NuxtLink>
      </div>

      <!-- Checkout Content -->
      <div v-else class="lg:grid lg:grid-cols-5 lg:gap-8">
        <!-- Left Column - Forms -->
        <div class="lg:col-span-3 space-y-6">
          <!-- Global Error -->
          <div v-if="globalError" class="p-4 bg-red-50 border border-red-200 text-red-700">
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

          <!-- Logged-in User Info Banner -->
          <div v-if="isLoggedIn" class="bg-emerald-50 border border-emerald-200 p-4">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="font-medium text-emerald-800">Sie sind angemeldet</p>
                <p class="text-sm text-emerald-600 mt-1">
                  Ihre Adressdaten wurden automatisch ausgefüllt. Die Bestellung wird Ihrem Kundenkonto zugeordnet.
                </p>
              </div>
            </div>
          </div>

          <!-- Address Section -->
          <div class="bg-white p-6 shadow-sm">
            <h2 class="text-lg font-medium text-stone-900 mb-6 flex items-center gap-3">
              <span class="w-8 h-8 bg-stone-900 text-white text-sm font-medium rounded-full flex items-center justify-center">1</span>
              Lieferadresse
            </h2>

            <div class="space-y-4">
              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-stone-700 mb-1">E-Mail-Adresse *</label>
                <input 
                  id="email" 
                  v-model="formData.email" 
                  type="email" 
                  autocomplete="email" 
                  :disabled="isProcessing || isLoggedIn" 
                  :class="[
                    'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900', 
                    errors.email ? 'border-red-500' : 'border-stone-200', 
                    (isProcessing || isLoggedIn) ? 'bg-stone-50 text-stone-500' : 'bg-white'
                  ]" 
                  placeholder="ihre@email.de" 
                />
                <p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
                <p v-if="isLoggedIn" class="mt-1 text-xs text-stone-400">E-Mail-Adresse kann nicht geändert werden</p>
              </div>

              <!-- Name -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-stone-700 mb-1">Vorname *</label>
                  <input 
                    id="firstName" 
                    v-model="formData.firstName" 
                    type="text" 
                    autocomplete="given-name" 
                    :disabled="isProcessing" 
                    :class="[
                      'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900', 
                      errors.firstName ? 'border-red-500' : 'border-stone-200', 
                      isProcessing ? 'bg-stone-50 text-stone-500' : 'bg-white'
                    ]" 
                    placeholder="Max" 
                  />
                  <p v-if="errors.firstName" class="mt-1 text-sm text-red-500">{{ errors.firstName }}</p>
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium text-stone-700 mb-1">Nachname *</label>
                  <input 
                    id="lastName" 
                    v-model="formData.lastName" 
                    type="text" 
                    autocomplete="family-name" 
                    :disabled="isProcessing" 
                    :class="[
                      'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900', 
                      errors.lastName ? 'border-red-500' : 'border-stone-200', 
                      isProcessing ? 'bg-stone-50 text-stone-500' : 'bg-white'
                    ]" 
                    placeholder="Mustermann" 
                  />
                  <p v-if="errors.lastName" class="mt-1 text-sm text-red-500">{{ errors.lastName }}</p>
                </div>
              </div>

              <!-- Street -->
              <div>
                <label for="street" class="block text-sm font-medium text-stone-700 mb-1">Straße und Hausnummer *</label>
                <input 
                  id="street" 
                  v-model="formData.street" 
                  type="text" 
                  autocomplete="street-address" 
                  :disabled="isProcessing" 
                  :class="[
                    'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900', 
                    errors.street ? 'border-red-500' : 'border-stone-200', 
                    isProcessing ? 'bg-stone-50 text-stone-500' : 'bg-white'
                  ]" 
                  placeholder="Musterstraße 123" 
                />
                <p v-if="errors.street" class="mt-1 text-sm text-red-500">{{ errors.street }}</p>
              </div>

              <!-- City & Zipcode -->
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label for="zipcode" class="block text-sm font-medium text-stone-700 mb-1">PLZ *</label>
                  <input 
                    id="zipcode" 
                    v-model="formData.zipcode" 
                    type="text" 
                    autocomplete="postal-code" 
                    :disabled="isProcessing" 
                    :class="[
                      'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900', 
                      errors.zipcode ? 'border-red-500' : 'border-stone-200', 
                      isProcessing ? 'bg-stone-50 text-stone-500' : 'bg-white'
                    ]" 
                    placeholder="12345" 
                  />
                  <p v-if="errors.zipcode" class="mt-1 text-sm text-red-500">{{ errors.zipcode }}</p>
                </div>
                <div class="col-span-2">
                  <label for="city" class="block text-sm font-medium text-stone-700 mb-1">Stadt *</label>
                  <input 
                    id="city" 
                    v-model="formData.city" 
                    type="text" 
                    autocomplete="address-level2" 
                    :disabled="isProcessing" 
                    :class="[
                      'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900', 
                      errors.city ? 'border-red-500' : 'border-stone-200', 
                      isProcessing ? 'bg-stone-50 text-stone-500' : 'bg-white'
                    ]" 
                    placeholder="Berlin" 
                  />
                  <p v-if="errors.city" class="mt-1 text-sm text-red-500">{{ errors.city }}</p>
                </div>
              </div>

              <!-- Country -->
              <div>
                <label for="country" class="block text-sm font-medium text-stone-700 mb-1">Land *</label>
                <select 
                  id="country" 
                  v-model="formData.countryId" 
                  :disabled="isProcessing" 
                  :class="[
                    'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900', 
                    errors.countryId ? 'border-red-500' : 'border-stone-200', 
                    isProcessing ? 'bg-stone-50 text-stone-500' : 'bg-white'
                  ]"
                >
                  <option value="">Land auswählen</option>
                  <option v-for="country in countries" :key="country.id" :value="country.id">
                    {{ country.translated?.name || country.name }}
                  </option>
                </select>
                <p v-if="errors.countryId" class="mt-1 text-sm text-red-500">{{ errors.countryId }}</p>
              </div>

              <!-- Phone -->
              <div>
                <label for="phone" class="block text-sm font-medium text-stone-700 mb-1">
                  Telefon <span class="text-stone-400">(optional)</span>
                </label>
                <input 
                  id="phone" 
                  v-model="formData.phoneNumber" 
                  type="tel" 
                  autocomplete="tel" 
                  :disabled="isProcessing" 
                  class="w-full px-4 py-3 border border-stone-200 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900" 
                  :class="isProcessing ? 'bg-stone-50 text-stone-500' : 'bg-white'" 
                  placeholder="+49 123 456789" 
                />
              </div>
            </div>
          </div>

          <!-- Shipping Methods Section -->
          <div class="bg-white p-6 shadow-sm">
            <h2 class="text-lg font-medium text-stone-900 mb-6 flex items-center gap-3">
              <span class="w-8 h-8 bg-stone-900 text-white text-sm font-medium rounded-full flex items-center justify-center">2</span>
              Versandart
            </h2>

            <div class="space-y-3">
              <label 
                v-for="method in shippingMethods" 
                :key="method.id" 
                :class="[
                  'block p-4 border cursor-pointer transition-all', 
                  selectedShippingMethodId === method.id ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300', 
                  (isProcessing || updatingShipping) && 'opacity-50 cursor-not-allowed'
                ]"
              >
                <div class="flex items-start gap-4">
                  <div class="pt-0.5">
                    <input 
                      type="radio" 
                      :value="method.id" 
                      :checked="selectedShippingMethodId === method.id" 
                      :disabled="isProcessing || updatingShipping" 
                      @change="handleShippingChange(method.id)" 
                      class="w-5 h-5 text-stone-900 border-stone-300 focus:ring-stone-900" 
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-stone-900">{{ method.translated?.name || method.name }}</span>
                      <svg v-if="updatingShipping && selectedShippingMethodId === method.id" class="w-4 h-4 animate-spin text-stone-400" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                    <p v-if="method.deliveryTime" class="mt-1 text-sm text-stone-500">
                      {{ method.deliveryTime.min }}-{{ method.deliveryTime.max }} {{ method.deliveryTime.unit === 'day' ? 'Tage' : method.deliveryTime.unit }}
                    </p>
                  </div>
                  <span class="font-medium text-stone-900 shrink-0">
                    {{ getShippingPrice(method) === 0 ? 'Kostenlos' : formatPrice(getShippingPrice(method)) }}
                  </span>
                </div>
              </label>
            </div>
          </div>

          <!-- Payment Methods Section -->
          <div class="bg-white p-6 shadow-sm">
            <h2 class="text-lg font-medium text-stone-900 mb-6 flex items-center gap-3">
              <span class="w-8 h-8 bg-stone-900 text-white text-sm font-medium rounded-full flex items-center justify-center">3</span>
              Zahlungsart
            </h2>

            <div class="space-y-3">
              <label 
                v-for="method in paymentMethods" 
                :key="method.id" 
                :class="[
                  'block p-4 border cursor-pointer transition-all', 
                  selectedPaymentMethodId === method.id ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300', 
                  (isProcessing || updatingPayment) && 'opacity-50 cursor-not-allowed'
                ]"
              >
                <div class="flex items-start gap-4">
                  <div class="pt-2">
                    <input 
                      type="radio" 
                      :value="method.id" 
                      :checked="selectedPaymentMethodId === method.id" 
                      :disabled="isProcessing || updatingPayment" 
                      @change="handlePaymentChange(method.id)" 
                      class="w-5 h-5 text-stone-900 border-stone-300 focus:ring-stone-900" 
                    />
                  </div>
                  <div class="w-12 h-12 flex items-center justify-center bg-stone-100 rounded shrink-0">
                    <svg v-if="getPaymentIcon(method) === 'invoice'" class="w-8 h-8 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <svg v-else class="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-stone-900">{{ method.translated?.name || method.name }}</span>
                    </div>
                    <p v-if="method.translated?.description || method.description" class="mt-1 text-sm text-stone-500 line-clamp-1">
                      {{ method.translated?.description || method.description }}
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Right Column - Order Summary -->
        <div class="lg:col-span-2 mt-6 lg:mt-0">
          <div class="lg:sticky lg:top-28">
            <div class="bg-white p-6 shadow-sm">
              <h2 class="text-lg font-medium text-stone-900 mb-6">Bestellübersicht</h2>

              <div class="divide-y divide-stone-100 mb-6 max-h-80 overflow-y-auto">
                <div v-for="item in lineItems" :key="item.id" class="py-4 flex gap-3">
                  <div class="w-16 h-16 bg-stone-100 shrink-0 overflow-hidden">
                    <img v-if="getItemImage(item)" :src="getItemImage(item)!" :alt="item.label" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-stone-900 line-clamp-2">{{ item.label }}</p>
                    <p class="text-xs text-stone-500 mt-1">Menge: {{ item.quantity }}</p>
                  </div>
                  <p class="text-sm font-medium text-stone-900 shrink-0">{{ formatPrice(item.price.totalPrice) }}</p>
                </div>
              </div>

              <div class="space-y-3 pt-4 border-t border-stone-200">
                <div class="flex justify-between text-sm">
                  <span class="text-stone-500">Zwischensumme</span>
                  <span class="text-stone-900">{{ formatPrice(subtotal) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-stone-500">Versandkosten</span>
                  <span class="text-stone-900">{{ shippingCosts === 0 ? 'Kostenlos' : formatPrice(shippingCosts) }}</span>
                </div>
                <div v-for="tax in taxes" :key="tax.taxRate" class="flex justify-between text-sm">
                  <span class="text-stone-500">inkl. {{ tax.taxRate }}% MwSt.</span>
                  <span class="text-stone-900">{{ formatPrice(tax.tax) }}</span>
                </div>
                <div class="flex justify-between pt-3 border-t border-stone-200">
                  <span class="text-lg font-medium text-stone-900">Gesamtsumme</span>
                  <span class="text-lg font-medium text-stone-900">{{ formatPrice(totalPrice) }}</span>
                </div>
              </div>

              <p class="text-xs text-stone-400 leading-relaxed mt-6">
                Mit Klick auf "Zahlungspflichtig bestellen" bestätigen Sie, dass Sie unsere 
                <a href="#" class="underline hover:text-stone-600">AGB</a> und 
                <a href="#" class="underline hover:text-stone-600">Datenschutzbestimmungen</a> 
                gelesen haben und diesen zustimmen.
              </p>

              <button 
                @click="handlePlaceOrder" 
                :disabled="isProcessing || !isFormComplete" 
                :class="[
                  'w-full mt-6 py-4 text-sm font-medium uppercase tracking-wider transition-all', 
                  isProcessing || !isFormComplete 
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                    : 'bg-stone-900 text-white hover:bg-stone-800'
                ]"
              >
                <span v-if="isProcessing" class="flex items-center justify-center gap-2">
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span v-if="orderStep === 'registering'">Gastdaten werden übermittelt...</span>
                  <span v-else-if="orderStep === 'updating-address'">Adresse wird aktualisiert...</span>
                  <span v-else-if="orderStep === 'placing'">Bestellung wird verarbeitet...</span>
                  <span v-else>Bitte warten...</span>
                </span>
                <span v-else>Zahlungspflichtig bestellen</span>
              </button>

              <p v-if="!isFormComplete && !isProcessing" class="mt-2 text-xs text-amber-600 text-center">
                Bitte füllen Sie alle Pflichtfelder aus
              </p>

              <NuxtLink 
                :to="productsPagePath" 
                class="block w-full mt-3 py-3 text-center text-sm text-stone-500 hover:text-stone-900 transition-colors"
              >
                ← Weiter einkaufen
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
