/**
 * Checkout Composable
 * 
 * Centralized checkout state and logic:
 * - Form data management
 * - Validation
 * - Customer detection (guest vs logged-in)
 * - Order placement
 */

export const useCheckout = () => {
  // Get auth state - use computed values directly for reactivity
  const { customer: authCustomer, isLoggedIn, billingAddress } = useShopwareAuth()
  
  // Get cart functions
  const {
    cart,
    isEmpty,
    subtotal,
    shippingCosts,
    totalPrice,
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
    updateQuantity,
    removeFromCart,
  } = useShopwareCart()

  // Form state - shared across components
  const formData = useState<CheckoutFormData>('checkout-form-data', () => ({
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
  }))

  // Validation errors
  const errors = useState<Record<string, string>>('checkout-errors', () => ({}))

  // UI State
  const isProcessing = useState<boolean>('checkout-processing', () => false)
  const globalError = useState<string | null>('checkout-global-error', () => null)
  const initialLoading = useState<boolean>('checkout-initial-loading', () => true)
  const isGuestRegistered = useState<boolean>('checkout-guest-registered', () => false)
  const orderStep = useState<'idle' | 'registering' | 'placing'>('checkout-order-step', () => 'idle')

  // Check if customer is logged in (not guest) - use computed for reactivity
  const isCustomerLoggedIn = computed(() => {
    const loggedIn = isLoggedIn.value
    const customer = authCustomer.value
    const isGuest = customer?.guest
    
    const result = loggedIn && customer && !isGuest
    
    console.log('[useCheckout] isCustomerLoggedIn computed:', {
      isLoggedIn: loggedIn,
      hasCustomer: !!customer,
      customerEmail: customer?.email,
      isGuest: isGuest,
      result: result
    })
    
    return result
  })

  // Get customer display name
  const customerDisplayName = computed(() => {
    if (!authCustomer.value) return ''
    return `${authCustomer.value.firstName} ${authCustomer.value.lastName}`
  })

  // Get customer email
  const customerEmail = computed(() => {
    return authCustomer.value?.email || ''
  })

  // Line items
  const lineItems = computed(() => cart.value?.lineItems || [])

  // Taxes
  const taxes = computed(() => cart.value?.price?.calculatedTaxes || [])

  // Free shipping threshold
  const FREE_SHIPPING_THRESHOLD = 50
  const amountToFreeShipping = computed(() => {
    const remaining = FREE_SHIPPING_THRESHOLD - subtotal.value
    return remaining > 0 ? remaining : 0
  })

  // Free shipping progress
  const freeShippingProgress = computed(() => {
    return Math.min((subtotal.value / FREE_SHIPPING_THRESHOLD) * 100, 100)
  })

  // Progress calculation based on completed steps
  const completedSteps = computed(() => {
    let steps = 0
    
    // For logged-in customers, address is always complete
    if (isCustomerLoggedIn.value) {
      steps = 1
    } else {
      // Step 1: Address complete for guests?
      const hasEmail = !!formData.value.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)
      const hasFirstName = !!formData.value.firstName?.trim()
      const hasLastName = !!formData.value.lastName?.trim()
      const hasStreet = !!formData.value.street?.trim()
      const hasZipcode = !!formData.value.zipcode?.trim()
      const hasCity = !!formData.value.city?.trim()
      const hasCountry = !!formData.value.countryId
      
      if (hasEmail && hasFirstName && hasLastName && hasStreet && hasZipcode && hasCity && hasCountry) {
        steps = 1
      }
    }
    
    // Step 2: Shipping selected?
    if (steps >= 1 && selectedShippingMethodId.value) {
      steps = 2
    }
    
    // Step 3: Payment selected?
    if (steps >= 2 && selectedPaymentMethodId.value) {
      steps = 3
    }
    
    return steps
  })

  // Check if form is complete (for enabling order button)
  const isFormComplete = computed(() => {
    const hasShipping = !!selectedShippingMethodId.value
    const hasPayment = !!selectedPaymentMethodId.value
    
    // For logged-in customers, we only need shipping and payment
    if (isCustomerLoggedIn.value) {
      return hasShipping && hasPayment
    }
    
    // For guests, we need all form fields
    const hasEmail = !!formData.value.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)
    const hasFirstName = !!formData.value.firstName?.trim()
    const hasLastName = !!formData.value.lastName?.trim()
    const hasStreet = !!formData.value.street?.trim()
    const hasZipcode = !!formData.value.zipcode?.trim()
    const hasCity = !!formData.value.city?.trim()
    const hasCountry = !!formData.value.countryId
    
    return hasEmail && hasFirstName && hasLastName && hasStreet && hasZipcode && hasCity && hasCountry && hasShipping && hasPayment
  })

  // Inline validation for email
  const validateEmail = () => {
    if (!formData.value.email) {
      errors.value.email = 'E-Mail ist erforderlich'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
      errors.value.email = 'Ungültige E-Mail-Adresse'
    } else {
      delete errors.value.email
    }
  }

  // Inline validation for required fields
  const validateField = (fieldName: string) => {
    const value = formData.value[fieldName as keyof CheckoutFormData]
    if (!value || (typeof value === 'string' && !value.trim())) {
      const fieldLabels: Record<string, string> = {
        firstName: 'Vorname',
        lastName: 'Nachname',
        street: 'Straße',
        zipcode: 'PLZ',
        city: 'Stadt',
        countryId: 'Land',
      }
      errors.value[fieldName] = `${fieldLabels[fieldName] || fieldName} ist erforderlich`
    } else {
      delete errors.value[fieldName]
    }
  }

  // Full form validation
  const validateForm = (): boolean => {
    // Clear all errors
    Object.keys(errors.value).forEach(key => delete errors.value[key])

    // For logged-in customers, no form validation needed
    if (isCustomerLoggedIn.value) {
      return true
    }

    validateEmail()
    validateField('firstName')
    validateField('lastName')
    validateField('street')
    validateField('zipcode')
    validateField('city')
    validateField('countryId')

    return Object.keys(errors.value).length === 0
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  // Pre-fill form with customer data
  const prefillFormWithCustomerData = () => {
    if (!isCustomerLoggedIn.value || !authCustomer.value) return

    formData.value.email = authCustomer.value.email || ''
    formData.value.firstName = authCustomer.value.firstName || ''
    formData.value.lastName = authCustomer.value.lastName || ''
    formData.value.salutationId = authCustomer.value.salutationId || ''

    // Use billing address if available
    const address = billingAddress.value
    if (address) {
      formData.value.street = address.street || ''
      formData.value.zipcode = address.zipcode || ''
      formData.value.city = address.city || ''
      formData.value.countryId = address.countryId || ''
      formData.value.countryStateId = address.countryStateId || ''
      formData.value.phoneNumber = address.phoneNumber || ''
    }
  }

  // Reset checkout state
  const resetCheckout = () => {
    formData.value = {
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
    }
    Object.keys(errors.value).forEach(key => delete errors.value[key])
    isGuestRegistered.value = false
    globalError.value = null
    orderStep.value = 'idle'
  }

  return {
    // State
    formData,
    errors,
    isProcessing,
    globalError,
    initialLoading,
    isGuestRegistered,
    orderStep,
    
    // Computed
    isCustomerLoggedIn,
    customerDisplayName,
    customerEmail,
    lineItems,
    taxes,
    amountToFreeShipping,
    freeShippingProgress,
    completedSteps,
    isFormComplete,
    
    // From cart
    cart,
    isEmpty,
    subtotal,
    shippingCosts,
    totalPrice,
    selectedShippingMethodId,
    selectedPaymentMethodId,
    shippingMethods,
    paymentMethods,
    countries,
    salutations,
    
    // Methods
    validateEmail,
    validateField,
    validateForm,
    formatPrice,
    prefillFormWithCustomerData,
    resetCheckout,
    
    // Cart methods
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
    updateQuantity,
    removeFromCart,
  }
}
