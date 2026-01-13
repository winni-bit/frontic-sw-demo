<script setup lang="ts">
/**
 * OnePage Guest Checkout
 * 
 * All checkout steps visible on one page:
 * - Address Form
 * - Shipping Method Selection
 * - Payment Method Selection
 * - Order Summary & Place Order
 * 
 * Uses the same layout as the shop the user came from
 */

// Get the current shop layout
const { getLayout } = useShopLayout()
const currentLayout = getLayout()

definePageMeta({
  layout: false, // We'll set layout dynamically
})

useHead({
  title: 'Checkout - Store',
})

const router = useRouter()

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
  isCustomerRegistered,
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
const orderStep = ref<'idle' | 'registering' | 'placing'>('idle')

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
  
  const complete = hasEmail && hasFirstName && hasLastName && hasStreet && hasZipcode && hasCity && hasCountry && hasShipping && hasPayment
  
  return complete
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
    // Scroll to first error
    const firstErrorKey = Object.keys(errors)[0]
    const errorElement = document.getElementById(firstErrorKey)
    errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  isProcessing.value = true
  globalError.value = null

  try {
    // Step 1: Register as guest if not already registered
    if (!isGuestRegistered.value) {
      orderStep.value = 'registering'
      console.log('[Checkout] Registering guest with data:', {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        street: formData.street,
        zipcode: formData.zipcode,
        city: formData.city,
        countryId: formData.countryId,
      })
      
      try {
        await registerGuest(formData)
        isGuestRegistered.value = true
        console.log('[Checkout] Guest registration successful')
      } catch (regError: any) {
        console.error('[Checkout] Guest registration failed:', regError)
        throw new Error(`Registrierung fehlgeschlagen: ${regError.message}`)
      }
    }

    // Small delay to ensure Shopware has processed the registration
    await new Promise(resolve => setTimeout(resolve, 500))

    // Step 2: Verify context has customer
    console.log('[Checkout] Verifying customer context...')
    const context = await fetchContext()
    
    if (!context.customer) {
      console.error('[Checkout] No customer in context after registration')
      throw new Error('Kundenregistrierung fehlgeschlagen. Bitte versuchen Sie es erneut.')
    }
    
    console.log('[Checkout] Customer verified:', {
      id: context.customer.id,
      email: context.customer.email,
      guest: context.customer.guest,
      billingAddressId: context.customer.defaultBillingAddressId
    })

    // Step 3: Place order
    orderStep.value = 'placing'
    console.log('[Checkout] Placing order...')
    const order = await placeOrder()

    // Save order data to sessionStorage BEFORE redirect
    if (import.meta.client) {
      const orderData: OrderConfirmationData = {
        order,
        timestamp: Date.now(),
      }
      sessionStorage.setItem('lastOrder', JSON.stringify(orderData))
    }

    // Redirect to confirmation page
    router.push('/order-confirmation')
  } catch (err: any) {
    console.error('[Checkout] Error:', err)
    globalError.value = err.message || 'Es ist ein Fehler aufgetreten'
    // Reset registration state on error so user can retry
    isGuestRegistered.value = false
    orderStep.value = 'idle'
  } finally {
    isProcessing.value = false
    orderStep.value = 'idle'
  }
}

// Find shipping method by name (case-insensitive partial match)
const findShippingMethodByName = (name: string) => {
  return shippingMethods.value.find(m => 
    (m.translated?.name || m.name || '').toLowerCase().includes(name.toLowerCase())
  )
}

// Find payment method by name (case-insensitive partial match)
const findPaymentMethodByName = (name: string) => {
  return paymentMethods.value.find(m => 
    (m.translated?.name || m.name || '').toLowerCase().includes(name.toLowerCase()) ||
    (m.technicalName || '').toLowerCase().includes(name.toLowerCase())
  )
}

// Initialize checkout
onMounted(async () => {
  console.log('[Checkout] Checkout page mounted')
  
  try {
    // ALWAYS ensure cart is loaded when checkout page mounts
    await ensureCartLoaded()
    
    // Load checkout data in parallel
    await Promise.all([
      fetchShippingMethods(),
      fetchPaymentMethods(),
      fetchCountries(),
      fetchSalutations(),
    ])

    console.log('[Checkout] Shipping methods:', shippingMethods.value.map(m => m.translated?.name || m.name))
    console.log('[Checkout] Payment methods:', paymentMethods.value.map(m => m.translated?.name || m.name))

    // Set default salutation
    if (salutations.value.length > 0) {
      // Prefer "not_specified" salutation
      const notSpecified = salutations.value.find(s => 
        s.salutationKey === 'not_specified' || 
        s.displayName?.toLowerCase().includes('keine')
      )
      formData.salutationId = notSpecified?.id || salutations.value[0].id
    }

    // Set default country (Germany if available)
    const germany = countries.value.find(c => c.iso === 'DE')
    if (germany) {
      formData.countryId = germany.id
    } else if (countries.value.length > 0) {
      formData.countryId = countries.value[0].id
    }

    // Set default shipping method: prefer "Standard"
    if (!selectedShippingMethodId.value) {
      const standardShipping = findShippingMethodByName('standard')
      if (standardShipping) {
        console.log('[Checkout] Setting default shipping to "Standard"')
        await setShippingMethod(standardShipping.id)
      } else if (shippingMethods.value.length > 0) {
        await setShippingMethod(shippingMethods.value[0].id)
      }
    }

    // Set default payment method: prefer "Invoice"
    if (!selectedPaymentMethodId.value) {
      const invoicePayment = findPaymentMethodByName('invoice')
      if (invoicePayment) {
        console.log('[Checkout] Setting default payment to "Invoice"')
        await setPaymentMethod(invoicePayment.id)
      } else if (paymentMethods.value.length > 0) {
        await setPaymentMethod(paymentMethods.value[0].id)
      }
    }

    console.log('[Checkout] Checkout initialized. Shipping:', selectedShippingMethodId.value, 'Payment:', selectedPaymentMethodId.value)
    
    // Redirect if empty
    if (isEmpty.value) {
      router.push('/products')
    }
  } catch (error) {
    console.error('[Checkout] Error initializing checkout:', error)
    globalError.value = 'Fehler beim Laden des Checkouts. Bitte versuchen Sie es erneut.'
  } finally {
    initialLoading.value = false
  }
})

// Watch for empty cart (but not during initial load)
watch(isEmpty, (empty) => {
  if (empty && !initialLoading.value) {
    router.push('/products')
  }
})

// Determine theme colors based on layout
const isIndustryTheme = computed(() => currentLayout === 'industry')
const themeColors = computed(() => {
  if (isIndustryTheme.value) {
    return {
      bg: 'bg-slate-950',
      cardBg: 'bg-slate-900',
      text: 'text-white',
      textMuted: 'text-slate-400',
      textSecondary: 'text-slate-500',
      border: 'border-slate-700',
      inputBg: 'bg-slate-800',
      inputBorder: 'border-slate-700',
      inputFocus: 'focus:ring-blue-500 focus:border-blue-500',
      buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
      buttonDisabled: 'bg-slate-700 text-slate-500',
      accent: 'text-blue-400',
      selectedBorder: 'border-blue-500',
      selectedBg: 'bg-slate-800',
    }
  }
  return {
    bg: 'bg-stone-50',
    cardBg: 'bg-white',
    text: 'text-stone-900',
    textMuted: 'text-stone-500',
    textSecondary: 'text-stone-400',
    border: 'border-stone-200',
    inputBg: 'bg-white',
    inputBorder: 'border-stone-200',
    inputFocus: 'focus:ring-stone-900 focus:border-stone-900',
    buttonPrimary: 'bg-stone-900 hover:bg-stone-800',
    buttonDisabled: 'bg-stone-200 text-stone-400',
    accent: 'text-stone-900',
    selectedBorder: 'border-stone-900',
    selectedBg: 'bg-stone-50',
  }
})
</script>

<template>
  <NuxtLayout :name="currentLayout">
    <div :class="['min-h-screen pt-24 pb-16', themeColors.bg]">
      <div class="container mx-auto px-4 lg:px-8">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 :class="['text-3xl font-serif mb-2', themeColors.text]">Checkout</h1>
          <p :class="themeColors.textMuted">Gastbestellung - Kein Konto erforderlich</p>
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
          <svg :class="['w-16 h-16 mx-auto mb-4', themeColors.textSecondary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 :class="['text-xl font-medium mb-2', themeColors.text]">Ihr Warenkorb ist leer</h2>
          <p :class="['mb-6', themeColors.textMuted]">Fügen Sie Produkte hinzu, um fortzufahren.</p>
          <NuxtLink
            to="/products"
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
            <div :class="['p-6 shadow-sm', themeColors.cardBg]">
              <h2 :class="['text-lg font-medium mb-6 flex items-center gap-3', themeColors.text]">
                <span :class="['w-8 h-8 text-white text-sm font-medium rounded-full flex items-center justify-center', isIndustryTheme ? 'bg-blue-600' : 'bg-stone-900']">1</span>
                Lieferadresse
              </h2>

              <div class="space-y-4">
                <!-- Email -->
                <div>
                  <label for="email" :class="['block text-sm font-medium mb-1', themeColors.text]">
                    E-Mail-Adresse *
                  </label>
                  <input
                    id="email"
                    v-model="formData.email"
                    type="email"
                    autocomplete="email"
                    :disabled="isProcessing"
                    :class="[
                      'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
                      themeColors.inputBg,
                      errors.email ? 'border-red-500' : themeColors.inputBorder,
                      themeColors.inputFocus,
                      themeColors.text,
                      isProcessing ? 'opacity-50' : ''
                    ]"
                    placeholder="ihre@email.de"
                  />
                  <p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
                </div>

                <!-- Name -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="firstName" :class="['block text-sm font-medium mb-1', themeColors.text]">
                      Vorname *
                    </label>
                    <input
                      id="firstName"
                      v-model="formData.firstName"
                      type="text"
                      autocomplete="given-name"
                      :disabled="isProcessing"
                      :class="[
                        'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
                        themeColors.inputBg,
                        errors.firstName ? 'border-red-500' : themeColors.inputBorder,
                        themeColors.inputFocus,
                        themeColors.text,
                        isProcessing ? 'opacity-50' : ''
                      ]"
                      placeholder="Max"
                    />
                    <p v-if="errors.firstName" class="mt-1 text-sm text-red-500">{{ errors.firstName }}</p>
                  </div>
                  <div>
                    <label for="lastName" :class="['block text-sm font-medium mb-1', themeColors.text]">
                      Nachname *
                    </label>
                    <input
                      id="lastName"
                      v-model="formData.lastName"
                      type="text"
                      autocomplete="family-name"
                      :disabled="isProcessing"
                      :class="[
                        'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
                        themeColors.inputBg,
                        errors.lastName ? 'border-red-500' : themeColors.inputBorder,
                        themeColors.inputFocus,
                        themeColors.text,
                        isProcessing ? 'opacity-50' : ''
                      ]"
                      placeholder="Mustermann"
                    />
                    <p v-if="errors.lastName" class="mt-1 text-sm text-red-500">{{ errors.lastName }}</p>
                  </div>
                </div>

                <!-- Street -->
                <div>
                  <label for="street" :class="['block text-sm font-medium mb-1', themeColors.text]">
                    Straße und Hausnummer *
                  </label>
                  <input
                    id="street"
                    v-model="formData.street"
                    type="text"
                    autocomplete="street-address"
                    :disabled="isProcessing"
                    :class="[
                      'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
                      themeColors.inputBg,
                      errors.street ? 'border-red-500' : themeColors.inputBorder,
                      themeColors.inputFocus,
                      themeColors.text,
                      isProcessing ? 'opacity-50' : ''
                    ]"
                    placeholder="Musterstraße 123"
                  />
                  <p v-if="errors.street" class="mt-1 text-sm text-red-500">{{ errors.street }}</p>
                </div>

                <!-- City & Zipcode -->
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label for="zipcode" :class="['block text-sm font-medium mb-1', themeColors.text]">
                      PLZ *
                    </label>
                    <input
                      id="zipcode"
                      v-model="formData.zipcode"
                      type="text"
                      autocomplete="postal-code"
                      :disabled="isProcessing"
                      :class="[
                        'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
                        themeColors.inputBg,
                        errors.zipcode ? 'border-red-500' : themeColors.inputBorder,
                        themeColors.inputFocus,
                        themeColors.text,
                        isProcessing ? 'opacity-50' : ''
                      ]"
                      placeholder="12345"
                    />
                    <p v-if="errors.zipcode" class="mt-1 text-sm text-red-500">{{ errors.zipcode }}</p>
                  </div>
                  <div class="col-span-2">
                    <label for="city" :class="['block text-sm font-medium mb-1', themeColors.text]">
                      Stadt *
                    </label>
                    <input
                      id="city"
                      v-model="formData.city"
                      type="text"
                      autocomplete="address-level2"
                      :disabled="isProcessing"
                      :class="[
                        'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
                        themeColors.inputBg,
                        errors.city ? 'border-red-500' : themeColors.inputBorder,
                        themeColors.inputFocus,
                        themeColors.text,
                        isProcessing ? 'opacity-50' : ''
                      ]"
                      placeholder="Berlin"
                    />
                    <p v-if="errors.city" class="mt-1 text-sm text-red-500">{{ errors.city }}</p>
                  </div>
                </div>

                <!-- Country -->
                <div>
                  <label for="country" :class="['block text-sm font-medium mb-1', themeColors.text]">
                    Land *
                  </label>
                  <select
                    id="country"
                    v-model="formData.countryId"
                    :disabled="isProcessing"
                    :class="[
                      'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
                      themeColors.inputBg,
                      errors.countryId ? 'border-red-500' : themeColors.inputBorder,
                      themeColors.inputFocus,
                      themeColors.text,
                      isProcessing ? 'opacity-50' : ''
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
                  <label for="phone" :class="['block text-sm font-medium mb-1', themeColors.text]">
                    Telefon <span :class="themeColors.textSecondary">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    v-model="formData.phoneNumber"
                    type="tel"
                    autocomplete="tel"
                    :disabled="isProcessing"
                    :class="[
                      'w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-2',
                      themeColors.inputBg,
                      themeColors.inputBorder,
                      themeColors.inputFocus,
                      themeColors.text,
                      isProcessing ? 'opacity-50' : ''
                    ]"
                    placeholder="+49 123 456789"
                  />
                </div>
              </div>
            </div>

            <!-- Shipping Methods Section -->
            <div :class="['p-6 shadow-sm', themeColors.cardBg]">
              <h2 :class="['text-lg font-medium mb-6 flex items-center gap-3', themeColors.text]">
                <span :class="['w-8 h-8 text-white text-sm font-medium rounded-full flex items-center justify-center', isIndustryTheme ? 'bg-blue-600' : 'bg-stone-900']">2</span>
                Versandart
              </h2>

              <div class="space-y-3">
                <label
                  v-for="method in shippingMethods"
                  :key="method.id"
                  :class="[
                    'block p-4 border cursor-pointer transition-all',
                    selectedShippingMethodId === method.id
                      ? [themeColors.selectedBorder, themeColors.selectedBg]
                      : [themeColors.border, 'hover:opacity-80'],
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
                        :class="['w-5 h-5', isIndustryTheme ? 'text-blue-600' : 'text-stone-900']"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span :class="['font-medium', themeColors.text]">
                          {{ method.translated?.name || method.name }}
                        </span>
                        <svg v-if="updatingShipping && selectedShippingMethodId === method.id" :class="['w-4 h-4 animate-spin', themeColors.textMuted]" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                      <p v-if="method.deliveryTime" :class="['mt-1 text-sm', themeColors.textMuted]">
                        {{ method.deliveryTime.min }}-{{ method.deliveryTime.max }} {{ method.deliveryTime.unit === 'day' ? 'Tage' : method.deliveryTime.unit }}
                      </p>
                    </div>
                    <span :class="['font-medium shrink-0', themeColors.text]">
                      {{ getShippingPrice(method) === 0 ? 'Kostenlos' : formatPrice(getShippingPrice(method)) }}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Payment Methods Section -->
            <div :class="['p-6 shadow-sm', themeColors.cardBg]">
              <h2 :class="['text-lg font-medium mb-6 flex items-center gap-3', themeColors.text]">
                <span :class="['w-8 h-8 text-white text-sm font-medium rounded-full flex items-center justify-center', isIndustryTheme ? 'bg-blue-600' : 'bg-stone-900']">3</span>
                Zahlungsart
              </h2>

              <div class="space-y-3">
                <label
                  v-for="method in paymentMethods"
                  :key="method.id"
                  :class="[
                    'block p-4 border cursor-pointer transition-all',
                    selectedPaymentMethodId === method.id
                      ? [themeColors.selectedBorder, themeColors.selectedBg]
                      : [themeColors.border, 'hover:opacity-80'],
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
                        :class="['w-5 h-5', isIndustryTheme ? 'text-blue-600' : 'text-stone-900']"
                      />
                    </div>
                    
                    <!-- Payment Icon -->
                    <div :class="['w-12 h-12 flex items-center justify-center rounded shrink-0', isIndustryTheme ? 'bg-slate-800' : 'bg-stone-100']">
                      <svg v-if="getPaymentIcon(method) === 'paypal'" class="w-8 h-8 text-[#003087]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.23c-.412 0-.764.312-.832.74l-1.322 8.266z"/>
                      </svg>
                      <svg v-else-if="getPaymentIcon(method) === 'card'" :class="['w-8 h-8', themeColors.textMuted]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <svg v-else-if="getPaymentIcon(method) === 'invoice'" :class="['w-8 h-8', themeColors.textMuted]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <svg v-else-if="getPaymentIcon(method) === 'prepayment'" :class="['w-8 h-8', themeColors.textMuted]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <svg v-else :class="['w-8 h-8', themeColors.textSecondary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>

                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span :class="['font-medium', themeColors.text]">
                          {{ method.translated?.name || method.name }}
                        </span>
                        <svg v-if="updatingPayment && selectedPaymentMethodId === method.id" :class="['w-4 h-4 animate-spin', themeColors.textMuted]" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                      <p v-if="method.translated?.description || method.description" :class="['mt-1 text-sm line-clamp-1', themeColors.textMuted]">
                        {{ method.translated?.description || method.description }}
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Right Column - Order Summary (Sticky) -->
          <div class="lg:col-span-2 mt-6 lg:mt-0">
            <div class="lg:sticky lg:top-28">
              <div :class="['p-6 shadow-sm', themeColors.cardBg]">
                <h2 :class="['text-lg font-medium mb-6', themeColors.text]">Bestellübersicht</h2>

                <!-- Cart Items -->
                <div :class="['divide-y mb-6 max-h-80 overflow-y-auto', isIndustryTheme ? 'divide-slate-700' : 'divide-stone-100']">
                  <div
                    v-for="item in lineItems"
                    :key="item.id"
                    class="py-4 flex gap-3"
                  >
                    <div :class="['w-16 h-16 shrink-0 overflow-hidden', isIndustryTheme ? 'bg-slate-800' : 'bg-stone-100']">
                      <img
                        v-if="getItemImage(item)"
                        :src="getItemImage(item)!"
                        :alt="item.label"
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <svg :class="['w-6 h-6', themeColors.textSecondary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p :class="['text-sm line-clamp-2', themeColors.text]">{{ item.label }}</p>
                      <p :class="['text-xs mt-1', themeColors.textMuted]">Menge: {{ item.quantity }}</p>
                    </div>
                    <p :class="['text-sm font-medium shrink-0', themeColors.text]">
                      {{ formatPrice(item.price.totalPrice) }}
                    </p>
                  </div>
                </div>

                <!-- Price Summary -->
                <div :class="['space-y-3 pt-4 border-t', themeColors.border]">
                  <div class="flex justify-between text-sm">
                    <span :class="themeColors.textMuted">Zwischensumme</span>
                    <span :class="themeColors.text">{{ formatPrice(subtotal) }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span :class="themeColors.textMuted">Versandkosten</span>
                    <span :class="themeColors.text">
                      {{ shippingCosts === 0 ? 'Kostenlos' : formatPrice(shippingCosts) }}
                    </span>
                  </div>
                  <div v-for="tax in taxes" :key="tax.taxRate" class="flex justify-between text-sm">
                    <span :class="themeColors.textMuted">inkl. {{ tax.taxRate }}% MwSt.</span>
                    <span :class="themeColors.text">{{ formatPrice(tax.tax) }}</span>
                  </div>
                  <div :class="['flex justify-between pt-3 border-t', themeColors.border]">
                    <span :class="['text-lg font-medium', themeColors.text]">Gesamtsumme</span>
                    <span :class="['text-lg font-medium', themeColors.text]">{{ formatPrice(totalPrice) }}</span>
                  </div>
                </div>

                <!-- Legal Notice -->
                <p :class="['text-xs leading-relaxed mt-6', themeColors.textSecondary]">
                  Mit Klick auf "Zahlungspflichtig bestellen" bestätigen Sie, dass Sie unsere 
                  <a href="#" :class="['underline', isIndustryTheme ? 'hover:text-white' : 'hover:text-stone-600']">AGB</a> und 
                  <a href="#" :class="['underline', isIndustryTheme ? 'hover:text-white' : 'hover:text-stone-600']">Datenschutzbestimmungen</a> 
                  gelesen haben und diesen zustimmen.
                </p>

                <!-- Place Order Button -->
                <button
                  @click="handlePlaceOrder"
                  :disabled="isProcessing || !isFormComplete"
                  :class="[
                    'w-full mt-6 py-4 text-sm font-medium uppercase tracking-wider transition-all text-white',
                    isProcessing || !isFormComplete
                      ? themeColors.buttonDisabled + ' cursor-not-allowed'
                      : themeColors.buttonPrimary
                  ]"
                >
                  <span v-if="isProcessing" class="flex items-center justify-center gap-2">
                    <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span v-if="orderStep === 'registering'">Daten werden übermittelt...</span>
                    <span v-else-if="orderStep === 'placing'">Bestellung wird verarbeitet...</span>
                    <span v-else>Bitte warten...</span>
                  </span>
                  <span v-else>Zahlungspflichtig bestellen</span>
                </button>

                <!-- Form Status Hint -->
                <p v-if="!isFormComplete && !isProcessing" :class="['mt-2 text-xs text-center', isIndustryTheme ? 'text-amber-400' : 'text-amber-600']">
                  Bitte füllen Sie alle Pflichtfelder aus
                </p>

                <!-- Back Link -->
                <NuxtLink
                  to="/products"
                  :class="['block w-full mt-3 py-3 text-center text-sm transition-colors', themeColors.textMuted, isIndustryTheme ? 'hover:text-white' : 'hover:text-stone-900']"
                >
                  ← Weiter einkaufen
                </NuxtLink>
              </div>

              <!-- Trust Badges -->
              <div :class="['mt-4 p-4 shadow-sm', themeColors.cardBg]">
                <div :class="['flex items-center justify-center gap-6', themeColors.textSecondary]">
                  <div class="flex items-center gap-2 text-xs">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    SSL-verschlüsselt
                  </div>
                  <div class="flex items-center gap-2 text-xs">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Käuferschutz
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
