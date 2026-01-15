/**
 * Shopware 6 Cart Composable
 * 
 * Handles all cart operations with the Shopware Store-API:
 * - Context token management (cookie-based session persistence)
 * - Cart CRUD operations
 * - Shipping & Payment method selection
 * - Guest checkout flow
 * - Order placement
 */

// Cookie name for context token
const CONTEXT_TOKEN_COOKIE = 'sw-context-token'

export const useShopwareCart = () => {
  // Get storefront URL from runtime config
  const runtimeConfig = useRuntimeConfig()
  const STOREFRONT_URL = runtimeConfig.public.shopwareStorefrontUrl

  // Use Nuxt's useState for global state sharing across components
  const cart = useState<ShopwareCart | null>('shopware-cart', () => null)
  const loading = useState<boolean>('shopware-cart-loading', () => false)
  const error = useState<string | null>('shopware-cart-error', () => null)
  const contextToken = useState<string | null>('shopware-context-token', () => null)
  const shippingMethods = useState<ShopwareShippingMethod[]>('shopware-shipping-methods', () => [])
  const paymentMethods = useState<ShopwarePaymentMethod[]>('shopware-payment-methods', () => [])
  const countries = useState<ShopwareCountry[]>('shopware-countries', () => [])
  const salutations = useState<ShopwareSalutation[]>('shopware-salutations', () => [])
  
  // Track selected methods separately (not just from cart)
  const selectedShippingMethodId = useState<string | null>('shopware-selected-shipping', () => null)
  const selectedPaymentMethodId = useState<string | null>('shopware-selected-payment', () => null)
  
  // Track if cart has been initialized this session
  const cartInitialized = useState<boolean>('shopware-cart-initialized', () => false)
  
  // Track if we're currently fetching to prevent duplicate requests
  const isFetching = useState<boolean>('shopware-cart-fetching', () => false)
  
  // Track current customer/guest status
  const currentCustomer = useState<ShopwareCustomer | null>('shopware-customer', () => null)

  // Cookie for context token persistence
  const contextTokenCookie = useCookie(CONTEXT_TOKEN_COOKIE, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
  })

  /**
   * Get current context token (from state or cookie)
   */
  const getContextToken = (): string | null => {
    if (contextToken.value) {
      return contextToken.value
    }
    if (contextTokenCookie.value) {
      contextToken.value = contextTokenCookie.value
      return contextTokenCookie.value
    }
    return null
  }

  /**
   * Save context token to state and cookie
   */
  const saveContextToken = (token: string | null) => {
    if (token) {
      contextToken.value = token
      contextTokenCookie.value = token
      console.log('[useShopwareCart] Context token saved:', token.substring(0, 20) + '...')
    }
  }

  /**
   * Make API call to Shopware proxy
   */
  const apiCall = async <T>(
    path: string,
    options: {
      method?: string
      body?: any
      query?: Record<string, any>
    } = {}
  ): Promise<{ data: T; contextToken: string | null }> => {
    const { method = 'GET', body, query } = options
    const token = getContextToken()

    console.log(`[useShopwareCart] API Call: ${method} /api/shopware/${path}`)
    if (token) {
      console.log('[useShopwareCart] Using context token:', token.substring(0, 20) + '...')
    } else {
      console.log('[useShopwareCart] No context token available')
    }
    if (body) {
      console.log('[useShopwareCart] Request body:', JSON.stringify(body).substring(0, 500))
    }

    const headers: Record<string, string> = {}
    if (token) {
      headers['sw-context-token'] = token
    }

    try {
      const response = await $fetch<T>(`/api/shopware/${path}`, {
        method: method as any,
        body,
        query,
        headers,
        onResponse({ response }) {
          // Capture context token from response header
          const responseToken = response.headers.get('sw-context-token')
          if (responseToken) {
            saveContextToken(responseToken)
          }
        },
      })

      return { data: response, contextToken: getContextToken() }
    } catch (err: any) {
      console.error('[useShopwareCart] API Error:', err)
      
      // Extract detailed error information from Shopware
      let errorMessage = 'Unknown error'
      let errorDetails = ''
      
      if (err.data?.errors && Array.isArray(err.data.errors)) {
        // Shopware returns errors as an array
        const shopwareErrors = err.data.errors
        errorMessage = shopwareErrors.map((e: any) => e.detail || e.title || e.code).join(', ')
        errorDetails = JSON.stringify(shopwareErrors, null, 2)
        console.error('[useShopwareCart] Shopware errors:', errorDetails)
      } else if (err.data?.message) {
        errorMessage = err.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      console.error('[useShopwareCart] Full error data:', JSON.stringify(err.data || {}).substring(0, 2000))
      throw new Error(errorMessage)
    }
  }

  /**
   * Initialize cart - fetch or create new cart
   * This is safe to call multiple times - it will only fetch if needed
   */
  const initCart = async () => {
    console.log('[useShopwareCart] initCart called. State:', {
      cartInitialized: cartInitialized.value,
      hasCart: !!cart.value,
      hasLineItems: !!cart.value?.lineItems,
      lineItemsCount: cart.value?.lineItems?.length,
      isFetching: isFetching.value
    })

    // If cart is already initialized and has data, skip
    if (cartInitialized.value && cart.value && Array.isArray(cart.value.lineItems)) {
      console.log('[useShopwareCart] Cart already initialized with', cart.value.lineItems.length, 'items')
      return
    }

    // If we're already fetching, wait for it
    if (isFetching.value) {
      console.log('[useShopwareCart] Already fetching cart, skipping...')
      return
    }

    console.log('[useShopwareCart] Initializing cart...')
    loading.value = true
    error.value = null
    isFetching.value = true

    try {
      await fetchCart()
      cartInitialized.value = true
    } catch (err: any) {
      console.error('[useShopwareCart] Init cart error:', err)
      error.value = err.message
    } finally {
      loading.value = false
      isFetching.value = false
    }
  }

  /**
   * Fetch current cart - always fetches from API
   */
  const fetchCart = async () => {
    console.log('[useShopwareCart] Fetching cart from API...')
    
    try {
      const { data } = await apiCall<ShopwareCart>('checkout/cart', {
        method: 'GET',
      })
      
      cart.value = data
      cartInitialized.value = true
      
      // Update selected method IDs from cart
      if (data.deliveries?.[0]?.shippingMethod?.id) {
        selectedShippingMethodId.value = data.deliveries[0].shippingMethod.id
      }
      if (data.transactions?.[0]?.paymentMethod?.id) {
        selectedPaymentMethodId.value = data.transactions[0].paymentMethod.id
      }
      
      console.log('[useShopwareCart] Cart loaded:', {
        items: data.lineItems?.length || 0,
        total: data.price?.totalPrice,
        shippingMethodId: selectedShippingMethodId.value,
        paymentMethodId: selectedPaymentMethodId.value,
      })
      
      return data
    } catch (err: any) {
      console.error('[useShopwareCart] Fetch cart error:', err)
      error.value = err.message
      throw err
    }
  }

  /**
   * Add product to cart
   */
  const addToCart = async (productId: string, quantity: number = 1) => {
    console.log('[useShopwareCart] Adding to cart:', { productId, quantity })
    loading.value = true
    error.value = null

    try {
      const { data } = await apiCall<ShopwareCart>('checkout/cart/line-item', {
        method: 'POST',
        body: {
          items: [
            {
              id: productId,
              referencedId: productId,
              type: 'product',
              quantity,
            },
          ],
        },
      })

      cart.value = data
      cartInitialized.value = true
      console.log('[useShopwareCart] Product added, cart items:', data.lineItems?.length)
      
      return data
    } catch (err: any) {
      console.error('[useShopwareCart] Add to cart error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update line item quantity
   */
  const updateQuantity = async (lineItemId: string, quantity: number) => {
    console.log('[useShopwareCart] Updating quantity:', { lineItemId, quantity })
    loading.value = true
    error.value = null

    try {
      const { data } = await apiCall<ShopwareCart>('checkout/cart/line-item', {
        method: 'PATCH',
        body: {
          items: [
            {
              id: lineItemId,
              quantity,
            },
          ],
        },
      })

      cart.value = data
      return data
    } catch (err: any) {
      console.error('[useShopwareCart] Update quantity error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove line item from cart
   */
  const removeFromCart = async (lineItemId: string) => {
    console.log('[useShopwareCart] Removing from cart:', lineItemId)
    loading.value = true
    error.value = null

    try {
      const { data } = await apiCall<ShopwareCart>(`checkout/cart/line-item`, {
        method: 'DELETE',
        body: {
          ids: [lineItemId],
        },
      })

      cart.value = data
      return data
    } catch (err: any) {
      console.error('[useShopwareCart] Remove from cart error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch available shipping methods
   */
  const fetchShippingMethods = async () => {
    console.log('[useShopwareCart] Fetching shipping methods...')

    try {
      const { data } = await apiCall<ShopwareListResponse<ShopwareShippingMethod>>('shipping-method', {
        method: 'POST',
        query: { onlyAvailable: 1 },
        body: {},
      })

      shippingMethods.value = data.elements || []
      console.log('[useShopwareCart] Shipping methods loaded:', shippingMethods.value.length)
      
      return shippingMethods.value
    } catch (err: any) {
      console.error('[useShopwareCart] Fetch shipping methods error:', err)
      throw err
    }
  }

  /**
   * Fetch available payment methods
   */
  const fetchPaymentMethods = async () => {
    console.log('[useShopwareCart] Fetching payment methods...')

    try {
      const { data } = await apiCall<ShopwareListResponse<ShopwarePaymentMethod>>('payment-method', {
        method: 'POST',
        query: { onlyAvailable: 1 },
        body: {},
      })

      paymentMethods.value = data.elements || []
      console.log('[useShopwareCart] Payment methods loaded:', paymentMethods.value.length)
      
      return paymentMethods.value
    } catch (err: any) {
      console.error('[useShopwareCart] Fetch payment methods error:', err)
      throw err
    }
  }

  /**
   * Set shipping method
   */
  const setShippingMethod = async (shippingMethodId: string) => {
    console.log('[useShopwareCart] Setting shipping method:', shippingMethodId)

    try {
      await apiCall<ShopwareContext>('context', {
        method: 'PATCH',
        body: {
          shippingMethodId,
        },
      })

      // Update local state immediately
      selectedShippingMethodId.value = shippingMethodId

      // Refresh cart to get updated shipping costs
      await fetchCart()
      
      console.log('[useShopwareCart] Shipping method set successfully')
    } catch (err: any) {
      console.error('[useShopwareCart] Set shipping method error:', err)
      throw err
    }
  }

  /**
   * Set payment method
   */
  const setPaymentMethod = async (paymentMethodId: string) => {
    console.log('[useShopwareCart] Setting payment method:', paymentMethodId)

    try {
      await apiCall<ShopwareContext>('context', {
        method: 'PATCH',
        body: {
          paymentMethodId,
        },
      })

      // Update local state immediately
      selectedPaymentMethodId.value = paymentMethodId

      // Refresh cart to reflect changes
      await fetchCart()
      
      console.log('[useShopwareCart] Payment method set successfully')
    } catch (err: any) {
      console.error('[useShopwareCart] Set payment method error:', err)
      throw err
    }
  }

  /**
   * Fetch available countries
   */
  const fetchCountries = async () => {
    console.log('[useShopwareCart] Fetching countries...')

    try {
      const { data } = await apiCall<ShopwareListResponse<ShopwareCountry>>('country', {
        method: 'POST',
        body: {
          associations: {
            states: {},
          },
        },
      })

      // Sort by position and filter active countries
      countries.value = (data.elements || [])
        .filter(c => c.active && c.shippingAvailable)
        .sort((a, b) => a.position - b.position)
      
      console.log('[useShopwareCart] Countries loaded:', countries.value.length)
      
      return countries.value
    } catch (err: any) {
      console.error('[useShopwareCart] Fetch countries error:', err)
      throw err
    }
  }

  /**
   * Fetch available salutations
   */
  const fetchSalutations = async () => {
    console.log('[useShopwareCart] Fetching salutations...')

    try {
      const { data } = await apiCall<ShopwareListResponse<ShopwareSalutation>>('salutation', {
        method: 'POST',
        body: {},
      })

      salutations.value = data.elements || []
      console.log('[useShopwareCart] Salutations loaded:', salutations.value.length)
      
      return salutations.value
    } catch (err: any) {
      console.error('[useShopwareCart] Fetch salutations error:', err)
      throw err
    }
  }

  /**
   * Register guest customer
   * This creates a guest account with billing address in Shopware
   */
  const registerGuest = async (formData: CheckoutFormData) => {
    console.log('[useShopwareCart] Registering guest customer...')

    // Validate storefront URL
    if (!STOREFRONT_URL) {
      throw new Error('Shopware Storefront URL not configured. Please check environment variables.')
    }

    // Get default salutation if not provided
    let salutationId = formData.salutationId
    if (!salutationId && salutations.value.length > 0) {
      // Try to find "mr" or "not_specified" salutation
      const notSpecified = salutations.value.find(s => 
        s.salutationKey === 'not_specified' || 
        s.displayName?.toLowerCase().includes('keine')
      )
      salutationId = notSpecified?.id || salutations.value[0].id
    }

    const registrationData: ShopwareGuestRegistration = {
      guest: true,
      email: formData.email,
      salutationId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      storefrontUrl: STOREFRONT_URL,
      acceptedDataProtection: true,
      billingAddress: {
        countryId: formData.countryId,
        countryStateId: formData.countryStateId || undefined,
        salutationId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        street: formData.street,
        zipcode: formData.zipcode,
        city: formData.city,
        phoneNumber: formData.phoneNumber || undefined,
      },
    }

    console.log('[useShopwareCart] Registration data:', JSON.stringify(registrationData, null, 2))

    try {
      const { data } = await apiCall<ShopwareCustomer>('account/register', {
        method: 'POST',
        body: registrationData,
      })

      console.log('[useShopwareCart] Guest registered successfully:', {
        customerId: data.id,
        email: data.email,
        guest: data.guest
      })
      
      // Save customer data
      currentCustomer.value = data
      
      // Refresh cart with new context
      await fetchCart()
      
      return data
    } catch (err: any) {
      console.error('[useShopwareCart] Guest registration error:', err)
      throw err
    }
  }

  /**
   * Fetch current context to check customer status
   * Returns basic context info - use fetchCustomerWithAddresses for full customer data
   */
  const fetchContext = async () => {
    console.log('[useShopwareCart] Fetching context...')

    try {
      const { data } = await apiCall<ShopwareContext>('context', {
        method: 'GET',
      })

      console.log('[useShopwareCart] Context loaded:', {
        hasCustomer: !!data.customer,
        customerEmail: data.customer?.email,
        customerGuest: data.customer?.guest,
        customerId: data.customer?.id,
        currency: data.currency?.isoCode,
        paymentMethod: data.paymentMethod?.name,
        shippingMethod: data.shippingMethod?.name,
      })
      
      if (data.customer) {
        currentCustomer.value = data.customer
      }
      
      return data
    } catch (err: any) {
      console.error('[useShopwareCart] Fetch context error:', err)
      throw err
    }
  }

  /**
   * Fetch customer with full address data
   * This uses the account/customer endpoint with associations
   */
  const fetchCustomerWithAddresses = async (): Promise<ShopwareCustomer | null> => {
    console.log('[useShopwareCart] Fetching customer with addresses...')

    try {
      const { data } = await apiCall<ShopwareCustomer>('account/customer', {
        method: 'POST',
        body: {
          associations: {
            defaultBillingAddress: {
              associations: {
                country: {},
                countryState: {},
              },
            },
            defaultShippingAddress: {
              associations: {
                country: {},
                countryState: {},
              },
            },
            activeBillingAddress: {
              associations: {
                country: {},
                countryState: {},
              },
            },
            activeShippingAddress: {
              associations: {
                country: {},
                countryState: {},
              },
            },
            addresses: {
              associations: {
                country: {},
                countryState: {},
              },
            },
            salutation: {},
          },
        },
      })

      console.log('[useShopwareCart] Customer with addresses loaded:', {
        customerId: data.id,
        email: data.email,
        isGuest: data.guest,
        defaultBillingAddressId: data.defaultBillingAddressId,
        hasBillingAddress: !!data.defaultBillingAddress,
      })

      currentCustomer.value = data
      return data
    } catch (err: any) {
      console.error('[useShopwareCart] Fetch customer with addresses error:', err)
      // Return null if customer fetch fails (likely not logged in)
      return null
    }
  }

  /**
   * Update customer billing address before placing order
   * This is needed for logged-in customers who might have updated their address in the form
   */
  const updateBillingAddress = async (formData: CheckoutFormData, addressId: string) => {
    console.log('[useShopwareCart] Updating billing address:', addressId)

    // Get default salutation if not provided
    let salutationId = formData.salutationId
    if (!salutationId && salutations.value.length > 0) {
      const notSpecified = salutations.value.find(s => 
        s.salutationKey === 'not_specified' || 
        s.displayName?.toLowerCase().includes('keine')
      )
      salutationId = notSpecified?.id || salutations.value[0].id
    }

    const addressData = {
      salutationId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      street: formData.street,
      zipcode: formData.zipcode,
      city: formData.city,
      countryId: formData.countryId,
      countryStateId: formData.countryStateId || undefined,
      phoneNumber: formData.phoneNumber || undefined,
    }

    console.log('[useShopwareCart] Address data:', JSON.stringify(addressData, null, 2))

    try {
      const { data } = await apiCall<any>(`account/address/${addressId}`, {
        method: 'PATCH',
        body: addressData,
      })

      console.log('[useShopwareCart] Billing address updated successfully')
      return data
    } catch (err: any) {
      console.error('[useShopwareCart] Update billing address error:', err)
      throw err
    }
  }

  /**
   * Set the active billing address for the order
   */
  const setActiveBillingAddress = async (addressId: string) => {
    console.log('[useShopwareCart] Setting active billing address:', addressId)

    try {
      await apiCall<any>('context', {
        method: 'PATCH',
        body: {
          billingAddressId: addressId,
        },
      })

      console.log('[useShopwareCart] Active billing address set successfully')
    } catch (err: any) {
      console.error('[useShopwareCart] Set active billing address error:', err)
      throw err
    }
  }

  /**
   * Place order
   * Requires a registered customer (guest or regular) with valid billing address
   */
  const placeOrder = async (): Promise<ShopwareOrder> => {
    console.log('[useShopwareCart] Placing order...')
    loading.value = true
    error.value = null

    try {
      // First, verify we have a customer in context
      const context = await fetchContext()
      
      console.log('[useShopwareCart] Context check for order:', {
        hasCustomer: !!context.customer,
        customerEmail: context.customer?.email,
        customerGuest: context.customer?.guest,
        customerId: context.customer?.id,
        hasBillingAddress: !!context.customer?.defaultBillingAddressId,
        billingAddressId: context.customer?.defaultBillingAddressId,
      })

      if (!context.customer) {
        throw new Error('Kein Kunde registriert. Bitte füllen Sie das Formular aus.')
      }

      console.log('[useShopwareCart] Customer verified:', {
        id: context.customer.id,
        email: context.customer.email,
        guest: context.customer.guest,
        hasBillingAddress: !!context.customer.defaultBillingAddressId
      })

      // Check if cart has items
      if (!cart.value?.lineItems?.length) {
        throw new Error('Der Warenkorb ist leer.')
      }

      console.log('[useShopwareCart] Cart has', cart.value.lineItems.length, 'items')

      // Place the order
      const { data } = await apiCall<ShopwareOrder>('checkout/order', {
        method: 'POST',
        body: {},
      })

      console.log('[useShopwareCart] Order placed successfully:', data.orderNumber)
      
      // Clear cart state after successful order
      cart.value = null
      cartInitialized.value = false
      selectedShippingMethodId.value = null
      selectedPaymentMethodId.value = null
      currentCustomer.value = null
      
      return data
    } catch (err: any) {
      console.error('[useShopwareCart] Place order error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear cart (remove all items)
   */
  const clearCart = async () => {
    console.log('[useShopwareCart] Clearing cart...')
    
    if (!cart.value?.lineItems?.length) {
      return
    }

    const lineItemIds = cart.value.lineItems.map(item => item.id)
    
    try {
      const { data } = await apiCall<ShopwareCart>('checkout/cart/line-item', {
        method: 'DELETE',
        body: {
          ids: lineItemIds,
        },
      })

      cart.value = data
      return data
    } catch (err: any) {
      console.error('[useShopwareCart] Clear cart error:', err)
      throw err
    }
  }

  /**
   * Ensure cart is loaded - use this on pages that need cart data
   * This will always fetch if cart is not loaded, regardless of initialization state
   */
  const ensureCartLoaded = async () => {
    console.log('[useShopwareCart] ensureCartLoaded called. State:', {
      hasCart: !!cart.value,
      hasLineItems: Array.isArray(cart.value?.lineItems),
      lineItemsCount: cart.value?.lineItems?.length
    })

    // If we don't have a cart with lineItems array, fetch it
    if (!cart.value || !Array.isArray(cart.value.lineItems)) {
      console.log('[useShopwareCart] Cart not loaded, fetching...')
      await fetchCart()
    } else {
      console.log('[useShopwareCart] Cart already loaded with', cart.value.lineItems.length, 'items')
    }
    
    return cart.value
  }

  // Computed values
  const itemCount = computed(() => {
    return cart.value?.lineItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
  })

  const totalPrice = computed(() => {
    return cart.value?.price?.totalPrice || 0
  })

  const shippingCosts = computed(() => {
    return cart.value?.deliveries?.[0]?.shippingCosts?.totalPrice || 0
  })

  const subtotal = computed(() => {
    return cart.value?.price?.positionPrice || 0
  })

  const isEmpty = computed(() => {
    return !cart.value?.lineItems?.length
  })

  // Get selected shipping method object from the list
  const selectedShippingMethod = computed(() => {
    if (!selectedShippingMethodId.value) return null
    return shippingMethods.value.find(m => m.id === selectedShippingMethodId.value) || 
           cart.value?.deliveries?.[0]?.shippingMethod || 
           null
  })

  // Get selected payment method object from the list
  const selectedPaymentMethod = computed(() => {
    if (!selectedPaymentMethodId.value) return null
    return paymentMethods.value.find(m => m.id === selectedPaymentMethodId.value) || 
           cart.value?.transactions?.[0]?.paymentMethod || 
           null
  })
  
  // Check if customer is registered (for order placement)
  const isCustomerRegistered = computed(() => {
    return !!currentCustomer.value
  })

  return {
    // State (as refs for reactivity)
    cart: computed(() => cart.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    contextToken: computed(() => contextToken.value),
    shippingMethods: computed(() => shippingMethods.value),
    paymentMethods: computed(() => paymentMethods.value),
    countries: computed(() => countries.value),
    salutations: computed(() => salutations.value),
    currentCustomer: computed(() => currentCustomer.value),

    // Computed
    itemCount,
    totalPrice,
    shippingCosts,
    subtotal,
    isEmpty,
    selectedShippingMethod,
    selectedPaymentMethod,
    selectedShippingMethodId: computed(() => selectedShippingMethodId.value),
    selectedPaymentMethodId: computed(() => selectedPaymentMethodId.value),
    isCustomerRegistered,

    // Methods
    initCart,
    fetchCart,
    ensureCartLoaded,
    addToCart,
    updateQuantity,
    removeFromCart,
    fetchShippingMethods,
    fetchPaymentMethods,
    setShippingMethod,
    setPaymentMethod,
    fetchCountries,
    fetchSalutations,
    registerGuest,
    placeOrder,
    fetchContext,
    fetchCustomerWithAddresses,
    clearCart,
    getContextToken,
    saveContextToken,
    updateBillingAddress,
    setActiveBillingAddress,
  }
}
