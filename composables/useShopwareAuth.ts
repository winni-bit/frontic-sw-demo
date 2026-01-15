/**
 * Shopware 6 Authentication Composable
 * 
 * Handles all authentication operations with the Shopware Store-API:
 * - Login/Logout
 * - Customer Registration (full account, not guest)
 * - Customer profile fetching with addresses
 * - Context token management (shared with cart)
 * - Cart synchronization on login/logout
 * - Wishlist synchronization on login/logout
 */

// Cookie name for context token (same as cart)
const CONTEXT_TOKEN_COOKIE = 'sw-context-token'

// Shopware storefront URL
const STOREFRONT_URL = 'https://fulltestsw-whering.eu-core-1.shopdev.de'

export const useShopwareAuth = () => {
  // Use Nuxt's useState for global state sharing
  const customer = useState<ShopwareCustomer | null>('shopware-auth-customer', () => null)
  const loading = useState<boolean>('shopware-auth-loading', () => false)
  const error = useState<string | null>('shopware-auth-error', () => null)
  const contextToken = useState<string | null>('shopware-context-token', () => null)
  const isInitialized = useState<boolean>('shopware-auth-initialized', () => false)

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
      console.log('[useShopwareAuth] Context token saved:', token.substring(0, 20) + '...')
    }
  }

  /**
   * Clear context token (on logout)
   * Note: We keep the token but Shopware will dissociate it from the customer
   */
  const clearContextToken = () => {
    contextToken.value = null
    contextTokenCookie.value = null
    console.log('[useShopwareAuth] Context token cleared')
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

    console.log(`[useShopwareAuth] API Call: ${method} /api/shopware/${path}`)
    if (token) {
      console.log('[useShopwareAuth] Using context token:', token.substring(0, 20) + '...')
    } else {
      console.log('[useShopwareAuth] No context token available')
    }
    if (body) {
      console.log('[useShopwareAuth] Request body:', JSON.stringify(body).substring(0, 500))
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
      console.error('[useShopwareAuth] API Error:', err)
      
      // Extract detailed error information from Shopware
      let errorMessage = 'Unbekannter Fehler'
      
      if (err.data?.errors && Array.isArray(err.data.errors)) {
        const shopwareErrors = err.data.errors
        errorMessage = shopwareErrors.map((e: any) => e.detail || e.title || e.code).join(', ')
        console.error('[useShopwareAuth] Shopware errors:', JSON.stringify(shopwareErrors, null, 2))
      } else if (err.data?.message) {
        errorMessage = err.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      throw new Error(errorMessage)
    }
  }

  /**
   * Sync cart after login/logout
   * This reloads the cart to get the customer's cart or a fresh guest cart
   */
  const syncCart = async () => {
    console.log('[useShopwareAuth] Syncing cart after auth change...')
    
    // Reset cart state to force reload
    const cartState = useState<any>('shopware-cart', () => null)
    const cartInitialized = useState<boolean>('shopware-cart-initialized', () => false)
    
    cartState.value = null
    cartInitialized.value = false
    
    // Fetch fresh cart from API
    try {
      const token = getContextToken()
      console.log('[useShopwareAuth] Syncing cart with token:', token ? token.substring(0, 20) + '...' : 'none')
      
      const headers: Record<string, string> = {}
      if (token) {
        headers['sw-context-token'] = token
      }
      
      const cartData = await $fetch<any>('/api/shopware/checkout/cart', {
        method: 'GET',
        headers,
        onResponse({ response }) {
          const responseToken = response.headers.get('sw-context-token')
          if (responseToken) {
            saveContextToken(responseToken)
          }
        },
      })
      
      cartState.value = cartData
      cartInitialized.value = true
      
      console.log('[useShopwareAuth] Cart synced:', {
        items: cartData?.lineItems?.length || 0,
        total: cartData?.price?.totalPrice,
      })
    } catch (err) {
      console.error('[useShopwareAuth] Error syncing cart:', err)
    }
  }

  /**
   * Sync wishlist after login
   * Merges local wishlist with Shopware wishlist
   */
  const syncWishlist = async () => {
    console.log('[useShopwareAuth] Syncing wishlist after login...')
    
    try {
      // Import dynamically to avoid circular dependency
      const { syncWithShopware } = useLikeList()
      await syncWithShopware()
      console.log('[useShopwareAuth] Wishlist synced')
    } catch (err) {
      console.error('[useShopwareAuth] Error syncing wishlist:', err)
    }
  }

  /**
   * Clear wishlist on logout
   */
  const clearWishlist = () => {
    console.log('[useShopwareAuth] Clearing wishlist on logout...')
    
    try {
      const { clearOnLogout } = useLikeList()
      clearOnLogout()
      console.log('[useShopwareAuth] Wishlist cleared')
    } catch (err) {
      console.error('[useShopwareAuth] Error clearing wishlist:', err)
    }
  }

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string): Promise<ShopwareCustomer> => {
    console.log('[useShopwareAuth] Logging in:', email)
    loading.value = true
    error.value = null

    try {
      // First, perform login
      const loginResponse = await apiCall<any>('account/login', {
        method: 'POST',
        body: {
          email,
          password,
        },
      })
      
      console.log('[useShopwareAuth] Login API response received, context token:', getContextToken()?.substring(0, 20) + '...')

      // Then fetch full customer data with addresses
      const fullCustomer = await fetchCustomer()
      
      if (!fullCustomer) {
        throw new Error('Kundendaten konnten nicht geladen werden')
      }

      // Sync cart to get customer's cart
      await syncCart()

      // Sync wishlist to merge with customer's wishlist
      await syncWishlist()

      console.log('[useShopwareAuth] Login successful:', {
        customerId: fullCustomer.id,
        email: fullCustomer.email,
        name: `${fullCustomer.firstName} ${fullCustomer.lastName}`,
        hasDefaultBillingAddress: !!fullCustomer.defaultBillingAddress,
        hasDefaultShippingAddress: !!fullCustomer.defaultShippingAddress,
        contextToken: getContextToken()?.substring(0, 20) + '...',
      })

      return fullCustomer
    } catch (err: any) {
      console.error('[useShopwareAuth] Login error:', err)
      error.value = err.message || 'Anmeldung fehlgeschlagen'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Register a new customer account
   */
  const register = async (formData: RegistrationFormData): Promise<ShopwareCustomer> => {
    console.log('[useShopwareAuth] Registering new customer:', formData.email)
    loading.value = true
    error.value = null

    const registrationData: ShopwareRegisterRequest = {
      email: formData.email,
      password: formData.password,
      salutationId: formData.salutationId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      storefrontUrl: STOREFRONT_URL,
      acceptedDataProtection: true,
      billingAddress: {
        countryId: formData.countryId,
        countryStateId: formData.countryStateId || undefined,
        salutationId: formData.salutationId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        street: formData.street,
        zipcode: formData.zipcode,
        city: formData.city,
        phoneNumber: formData.phoneNumber || undefined,
      },
    }

    console.log('[useShopwareAuth] Registration data:', JSON.stringify(registrationData, null, 2))

    try {
      await apiCall<any>('account/register', {
        method: 'POST',
        body: registrationData,
      })

      // Fetch full customer data with addresses after registration
      const fullCustomer = await fetchCustomer()
      
      if (!fullCustomer) {
        throw new Error('Kundendaten konnten nicht geladen werden')
      }

      // Sync cart to associate with new customer
      await syncCart()

      // Sync wishlist to associate with new customer
      await syncWishlist()

      console.log('[useShopwareAuth] Registration successful:', {
        customerId: fullCustomer.id,
        email: fullCustomer.email,
        name: `${fullCustomer.firstName} ${fullCustomer.lastName}`,
      })

      return fullCustomer
    } catch (err: any) {
      console.error('[useShopwareAuth] Registration error:', err)
      error.value = err.message || 'Registrierung fehlgeschlagen'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout current customer
   * Note: We don't clear the context token - Shopware handles the logout server-side
   * and will return a new token for the guest session
   */
  const logout = async (): Promise<void> => {
    console.log('[useShopwareAuth] Logging out...')
    loading.value = true
    error.value = null

    try {
      // Call logout endpoint - Shopware will dissociate the customer from the token
      // and may return a new token for the guest session
      await apiCall('account/logout', {
        method: 'POST',
      })

      // Clear local customer state
      customer.value = null
      
      // Clear wishlist (local storage only, no Shopware sync needed)
      clearWishlist()
      
      // Sync cart to get a fresh guest cart
      // The token will be updated by Shopware's response
      await syncCart()
      
      console.log('[useShopwareAuth] Logout successful, new context token:', getContextToken()?.substring(0, 20) + '...')
    } catch (err: any) {
      console.error('[useShopwareAuth] Logout error:', err)
      // Even if logout fails on server, clear local state
      customer.value = null
      
      // Still clear wishlist
      clearWishlist()
      
      // Still try to sync cart
      await syncCart()
      
      error.value = err.message || 'Abmeldung fehlgeschlagen'
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch current customer profile with all addresses
   */
  const fetchCustomer = async (): Promise<ShopwareCustomer | null> => {
    console.log('[useShopwareAuth] Fetching customer profile with addresses...')
    
    // Don't fetch if no context token
    if (!getContextToken()) {
      console.log('[useShopwareAuth] No context token, skipping customer fetch')
      customer.value = null
      isInitialized.value = true
      return null
    }

    loading.value = true
    error.value = null

    try {
      // Use POST with associations to get full customer data including addresses
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

      // Check if this is a guest customer (we don't want to show guests as logged in)
      if (data.guest) {
        console.log('[useShopwareAuth] Customer is a guest, not setting as logged in')
        customer.value = null
        isInitialized.value = true
        return null
      }

      customer.value = data
      isInitialized.value = true
      
      console.log('[useShopwareAuth] Customer fetched with addresses:', {
        customerId: data.id,
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        defaultBillingAddressId: data.defaultBillingAddressId,
        defaultBillingAddress: data.defaultBillingAddress ? {
          street: data.defaultBillingAddress.street,
          city: data.defaultBillingAddress.city,
          country: data.defaultBillingAddress.country?.name,
        } : null,
        defaultShippingAddress: data.defaultShippingAddress ? {
          street: data.defaultShippingAddress.street,
          city: data.defaultShippingAddress.city,
          country: data.defaultShippingAddress.country?.name,
        } : null,
        totalAddresses: data.addresses?.length || 0,
      })

      return data
    } catch (err: any) {
      console.error('[useShopwareAuth] Fetch customer error:', err)
      customer.value = null
      isInitialized.value = true
      // Don't set error for 401/403 - just means not logged in
      if (!err.message?.includes('401') && !err.message?.includes('403')) {
        error.value = err.message
      }
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch customer orders
   */
  const fetchOrders = async (page: number = 1, limit: number = 10): Promise<ShopwareOrderResponse> => {
    console.log('[useShopwareAuth] Fetching orders...', { page, limit })
    loading.value = true
    error.value = null

    try {
      const { data } = await apiCall<ShopwareOrderResponse>('order', {
        method: 'POST',
        body: {
          page,
          limit,
          associations: {
            lineItems: {
              associations: {
                cover: {},
                product: {
                  associations: {
                    cover: {},
                  },
                },
              },
            },
            deliveries: {
              associations: {
                shippingOrderAddress: {
                  associations: {
                    country: {},
                    countryState: {},
                  },
                },
                shippingMethod: {},
                stateMachineState: {},
              },
            },
            transactions: {
              associations: {
                paymentMethod: {},
                stateMachineState: {},
              },
            },
            stateMachineState: {},
            billingAddress: {
              associations: {
                country: {},
                countryState: {},
              },
            },
            currency: {},
          },
        },
      })

      console.log('[useShopwareAuth] Orders fetched:', {
        total: data.total,
        ordersReturned: data.elements?.length || 0,
        firstOrder: data.elements?.[0] ? {
          orderNumber: data.elements[0].orderNumber,
          orderDate: data.elements[0].orderDateTime,
          total: data.elements[0].amountTotal,
          state: data.elements[0].stateMachineState?.name,
        } : null,
      })
      
      return data
    } catch (err: any) {
      console.error('[useShopwareAuth] Fetch orders error:', err)
      error.value = err.message || 'Bestellungen konnten nicht geladen werden'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Initialize auth state (check if user is logged in)
   */
  const initAuth = async () => {
    if (isInitialized.value) {
      console.log('[useShopwareAuth] Already initialized')
      return
    }

    console.log('[useShopwareAuth] Initializing auth...')
    
    try {
      await fetchCustomer()
    } catch (err) {
      console.log('[useShopwareAuth] No logged in customer')
    }
    
    isInitialized.value = true
  }

  // Computed values
  const isLoggedIn = computed(() => {
    return !!customer.value && !customer.value.guest
  })

  const customerName = computed(() => {
    if (!customer.value) return ''
    return `${customer.value.firstName} ${customer.value.lastName}`
  })

  const customerEmail = computed(() => {
    return customer.value?.email || ''
  })

  // Get default or active billing address
  const billingAddress = computed(() => {
    return customer.value?.defaultBillingAddress || customer.value?.activeBillingAddress || null
  })

  // Get default or active shipping address
  const shippingAddress = computed(() => {
    return customer.value?.defaultShippingAddress || customer.value?.activeShippingAddress || null
  })

  // Get all addresses
  const addresses = computed(() => {
    return customer.value?.addresses || []
  })

  return {
    // State
    customer: computed(() => customer.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    isInitialized: computed(() => isInitialized.value),

    // Computed
    isLoggedIn,
    customerName,
    customerEmail,
    billingAddress,
    shippingAddress,
    addresses,

    // Methods
    login,
    register,
    logout,
    fetchCustomer,
    fetchOrders,
    initAuth,
    getContextToken,
    syncCart,
    syncWishlist,
  }
}
