/**
 * Wishlist/Like List Composable
 * 
 * Handles wishlist operations with hybrid storage:
 * - For logged-in users: Uses Shopware Wishlist API (synced with backend)
 * - For guests: Uses localStorage (local only)
 * - On login: Guest wishlist is merged with Shopware wishlist
 * - On logout: Shopware wishlist is preserved, local state is cleared
 * 
 * Shopware Wishlist API Endpoints:
 * - GET /customer/wishlist - Get wishlist products
 * - POST /customer/wishlist/add/{productId} - Add product to wishlist
 * - DELETE /customer/wishlist/delete/{productId} - Remove product from wishlist
 * - POST /customer/wishlist/merge - Merge guest wishlist with customer wishlist
 */

interface LikedProduct {
  key: string
  name?: string
  price?: {
    amount?: number
    currency?: string
    precision?: number
  }
  lowestPrice?: {
    amount?: number
    currency?: string
    precision?: number
  }
  cover?: {
    src?: string
    thumbnailSrc?: string
    altText?: string
  }
  addedAt: number
}

interface ShopwareWishlistResponse {
  wishlist?: {
    products?: {
      elements?: Array<{
        id: string
        productId: string
        product?: {
          id: string
          name: string
          cover?: {
            media?: {
              url: string
            }
          }
          calculatedPrice?: {
            unitPrice: number
            totalPrice: number
          }
        }
      }>
    }
  }
  products?: {
    elements?: Array<{
      id: string
      name: string
      cover?: {
        media?: {
          url: string
        }
      }
      calculatedPrice?: {
        unitPrice: number
        totalPrice: number
      }
    }>
  }
}

const STORAGE_KEY_PREFIX = 'furniture-likes'
const GUEST_KEY = 'guest'

// Global state - shared across all components
const likedProducts = ref<LikedProduct[]>([])
const isInitialized = ref(false)
const isLoading = ref(false)
const isSyncing = ref(false)

export const useLikeList = () => {
  // Get context token for API calls
  const getContextToken = (): string | null => {
    const token = useState<string | null>('shopware-context-token')
    return token.value
  }

  // Get current user ID from auth state
  const getCurrentUserId = (): string => {
    const customer = useState<any>('shopware-auth-customer')
    if (customer.value && !customer.value.guest && customer.value.id) {
      return customer.value.id
    }
    return GUEST_KEY
  }

  // Check if user is logged in (non-guest)
  const isUserLoggedIn = (): boolean => {
    const customer = useState<any>('shopware-auth-customer')
    return !!customer.value && !customer.value.guest
  }

  // Get storage key for current user (used for guest storage)
  const getStorageKey = (userId?: string): string => {
    const id = userId || getCurrentUserId()
    return `${STORAGE_KEY_PREFIX}-${id}`
  }

  /**
   * Make API call to Shopware proxy
   */
  const apiCall = async <T>(
    path: string,
    options: {
      method?: string
      body?: any
    } = {}
  ): Promise<T> => {
    const { method = 'GET', body } = options
    const token = getContextToken()

    if (!token) {
      throw new Error('No context token available')
    }

    console.log(`[useLikeList] API Call: ${method} /api/shopware/${path}`)

    const headers: Record<string, string> = {
      'sw-context-token': token
    }

    try {
      const response = await $fetch<T>(`/api/shopware/${path}`, {
        method: method as any,
        body,
        headers,
      })
      return response
    } catch (err: any) {
      console.error('[useLikeList] API Error:', err)
      throw err
    }
  }

  // ============================================
  // LocalStorage Operations (for guests)
  // ============================================

  const loadFromStorage = (userId?: string): LikedProduct[] => {
    if (!import.meta.client) return []
    
    try {
      const key = getStorageKey(userId)
      const stored = localStorage.getItem(key)
      if (stored) {
        const products = JSON.parse(stored)
        console.log(`[useLikeList] Loaded from storage (${userId || getCurrentUserId()}):`, products.length, 'items')
        return products
      }
    } catch (e) {
      console.error('[useLikeList] Error loading from localStorage:', e)
    }
    return []
  }

  const saveToStorage = () => {
    if (!import.meta.client) return
    
    try {
      const key = getStorageKey()
      localStorage.setItem(key, JSON.stringify(likedProducts.value))
      console.log(`[useLikeList] Saved to storage (${getCurrentUserId()}):`, likedProducts.value.length, 'items')
    } catch (e) {
      console.error('[useLikeList] Error saving to localStorage:', e)
    }
  }

  const clearGuestStorage = () => {
    if (!import.meta.client) return
    
    try {
      const guestKey = getStorageKey(GUEST_KEY)
      localStorage.removeItem(guestKey)
      console.log('[useLikeList] Cleared guest storage')
    } catch (e) {
      console.error('[useLikeList] Error clearing guest storage:', e)
    }
  }

  // ============================================
  // Shopware API Operations (for logged-in users)
  // ============================================

  /**
   * Fetch wishlist from Shopware API
   */
  const fetchShopwareWishlist = async (): Promise<LikedProduct[]> => {
    try {
      console.log('[useLikeList] Fetching wishlist from Shopware API...')
      
      const response = await apiCall<ShopwareWishlistResponse>('customer/wishlist', {
        method: 'POST',
        body: {
          associations: {
            product: {
              associations: {
                cover: {
                  associations: {
                    media: {}
                  }
                }
              }
            }
          }
        }
      })

      console.log('[useLikeList] Shopware wishlist response:', response)

      // Parse response - handle different response formats
      const products: LikedProduct[] = []
      
      // Format 1: { wishlist: { products: { elements: [...] } } }
      if (response.wishlist?.products?.elements) {
        for (const item of response.wishlist.products.elements) {
          const product = item.product
          if (product) {
            products.push({
              key: product.id,
              name: product.name,
              cover: product.cover?.media ? {
                src: product.cover.media.url
              } : undefined,
              price: product.calculatedPrice ? {
                amount: product.calculatedPrice.unitPrice * 100, // Convert to cents
                currency: 'EUR',
                precision: 2
              } : undefined,
              addedAt: Date.now()
            })
          }
        }
      }
      
      // Format 2: { products: { elements: [...] } }
      if (response.products?.elements) {
        for (const product of response.products.elements) {
          products.push({
            key: product.id,
            name: product.name,
            cover: product.cover?.media ? {
              src: product.cover.media.url
            } : undefined,
            price: product.calculatedPrice ? {
              amount: product.calculatedPrice.unitPrice * 100,
              currency: 'EUR',
              precision: 2
            } : undefined,
            addedAt: Date.now()
          })
        }
      }

      console.log('[useLikeList] Parsed Shopware wishlist:', products.length, 'items')
      return products
    } catch (err: any) {
      // 404 means wishlist feature might not be enabled or empty
      if (err.statusCode === 404 || err.status === 404) {
        console.log('[useLikeList] Wishlist not found (feature may not be enabled)')
        return []
      }
      console.error('[useLikeList] Error fetching Shopware wishlist:', err)
      return []
    }
  }

  /**
   * Add product to Shopware wishlist
   */
  const addToShopwareWishlist = async (productId: string): Promise<boolean> => {
    try {
      console.log('[useLikeList] Adding to Shopware wishlist:', productId)
      
      await apiCall(`customer/wishlist/add/${productId}`, {
        method: 'POST'
      })
      
      console.log('[useLikeList] Successfully added to Shopware wishlist')
      return true
    } catch (err: any) {
      // 400 might mean product already in wishlist
      if (err.statusCode === 400 || err.status === 400) {
        console.log('[useLikeList] Product may already be in wishlist')
        return true
      }
      console.error('[useLikeList] Error adding to Shopware wishlist:', err)
      return false
    }
  }

  /**
   * Remove product from Shopware wishlist
   */
  const removeFromShopwareWishlist = async (productId: string): Promise<boolean> => {
    try {
      console.log('[useLikeList] Removing from Shopware wishlist:', productId)
      
      await apiCall(`customer/wishlist/delete/${productId}`, {
        method: 'DELETE'
      })
      
      console.log('[useLikeList] Successfully removed from Shopware wishlist')
      return true
    } catch (err: any) {
      console.error('[useLikeList] Error removing from Shopware wishlist:', err)
      return false
    }
  }

  /**
   * Merge guest wishlist with Shopware wishlist
   */
  const mergeWishlistWithShopware = async (productIds: string[]): Promise<boolean> => {
    if (productIds.length === 0) return true
    
    try {
      console.log('[useLikeList] Merging wishlist with Shopware:', productIds.length, 'items')
      
      await apiCall('customer/wishlist/merge', {
        method: 'POST',
        body: {
          productIds
        }
      })
      
      console.log('[useLikeList] Successfully merged wishlist with Shopware')
      return true
    } catch (err: any) {
      console.error('[useLikeList] Error merging wishlist with Shopware:', err)
      // Fall back to adding items individually
      console.log('[useLikeList] Falling back to individual adds...')
      for (const productId of productIds) {
        await addToShopwareWishlist(productId)
      }
      return true
    }
  }

  // ============================================
  // Main Operations
  // ============================================

  /**
   * Sync wishlist on login
   * - Fetches Shopware wishlist
   * - Merges with any guest wishlist items
   * - Clears guest wishlist
   */
  const syncWithShopware = async (): Promise<void> => {
    if (!isUserLoggedIn()) {
      console.log('[useLikeList] Not logged in, loading guest wishlist')
      likedProducts.value = loadFromStorage(GUEST_KEY)
      return
    }

    isSyncing.value = true
    console.log('[useLikeList] Syncing wishlist for logged-in user...')

    try {
      // Load guest wishlist (items added before login)
      const guestProducts = loadFromStorage(GUEST_KEY)
      console.log('[useLikeList] Guest wishlist:', guestProducts.length, 'items')

      // If there are guest products, merge them with Shopware wishlist first
      if (guestProducts.length > 0) {
        const guestProductIds = guestProducts.map(p => p.key)
        await mergeWishlistWithShopware(guestProductIds)
      }

      // Fetch the complete wishlist from Shopware
      const shopwareProducts = await fetchShopwareWishlist()
      console.log('[useLikeList] Shopware wishlist:', shopwareProducts.length, 'items')

      // Use Shopware wishlist as source of truth
      // But preserve local product details (name, cover, price) from guest products
      const mergedProducts: LikedProduct[] = [...shopwareProducts]
      
      // Enrich with guest product details if available
      for (const mergedProduct of mergedProducts) {
        const guestProduct = guestProducts.find(g => g.key === mergedProduct.key)
        if (guestProduct) {
          // Use guest product details if Shopware didn't return them
          if (!mergedProduct.name && guestProduct.name) {
            mergedProduct.name = guestProduct.name
          }
          if (!mergedProduct.cover && guestProduct.cover) {
            mergedProduct.cover = guestProduct.cover
          }
          if (!mergedProduct.price && guestProduct.price) {
            mergedProduct.price = guestProduct.price
          }
        }
      }

      likedProducts.value = mergedProducts

      // Clear guest wishlist after merge
      clearGuestStorage()

      console.log('[useLikeList] Sync complete, total items:', likedProducts.value.length)
    } catch (err) {
      console.error('[useLikeList] Error syncing wishlist:', err)
      // Fall back to local storage
      likedProducts.value = loadFromStorage()
    } finally {
      isSyncing.value = false
    }
  }

  /**
   * Clear local state on logout
   * Shopware wishlist remains on server for next login
   */
  const clearOnLogout = (): void => {
    console.log('[useLikeList] Clearing wishlist state on logout')
    likedProducts.value = []
    clearGuestStorage()
  }

  // Initialize wishlist
  const initializeLikes = () => {
    if (isInitialized.value) return

    if (isUserLoggedIn()) {
      // For logged-in users, sync with Shopware
      syncWithShopware()
    } else {
      // For guests, load from localStorage
      likedProducts.value = loadFromStorage(GUEST_KEY)
    }
    
    isInitialized.value = true
    console.log('[useLikeList] Initialized with', likedProducts.value.length, 'items')
  }

  // Check if a product is liked
  const isLiked = (productKey: string): boolean => {
    return likedProducts.value.some(p => p.key === productKey)
  }

  // Add a product to likes
  const addLike = async (product: Omit<LikedProduct, 'addedAt'>) => {
    if (isLiked(product.key)) return

    isLoading.value = true
    
    try {
      // For logged-in users, add to Shopware first
      if (isUserLoggedIn()) {
        const success = await addToShopwareWishlist(product.key)
        if (!success) {
          console.error('[useLikeList] Failed to add to Shopware wishlist')
          // Continue anyway to update local state for better UX
        }
      }

      // Update local state
      likedProducts.value.push({
        ...product,
        addedAt: Date.now()
      })

      // For guests, save to localStorage
      if (!isUserLoggedIn()) {
        saveToStorage()
      }
      
      console.log('[useLikeList] Added:', product.name || product.key)
    } finally {
      isLoading.value = false
    }
  }

  // Remove a product from likes
  const removeLike = async (productKey: string) => {
    const index = likedProducts.value.findIndex(p => p.key === productKey)
    if (index === -1) return

    isLoading.value = true
    
    try {
      // For logged-in users, remove from Shopware first
      if (isUserLoggedIn()) {
        const success = await removeFromShopwareWishlist(productKey)
        if (!success) {
          console.error('[useLikeList] Failed to remove from Shopware wishlist')
          // Continue anyway to update local state for better UX
        }
      }

      // Update local state
      const removed = likedProducts.value.splice(index, 1)

      // For guests, save to localStorage
      if (!isUserLoggedIn()) {
        saveToStorage()
      }
      
      console.log('[useLikeList] Removed:', removed[0]?.name || productKey)
    } finally {
      isLoading.value = false
    }
  }

  // Toggle like status
  const toggleLike = async (product: Omit<LikedProduct, 'addedAt'>) => {
    if (isLiked(product.key)) {
      await removeLike(product.key)
    } else {
      await addLike(product)
    }
  }

  // Clear all likes
  const clearAllLikes = async () => {
    isLoading.value = true
    
    try {
      // For logged-in users, remove each item from Shopware
      if (isUserLoggedIn()) {
        for (const product of likedProducts.value) {
          await removeFromShopwareWishlist(product.key)
        }
      }

      likedProducts.value = []

      // For guests, clear localStorage
      if (!isUserLoggedIn()) {
        saveToStorage()
      }
      
      console.log('[useLikeList] Cleared all likes')
    } finally {
      isLoading.value = false
    }
  }

  // Get count of liked products
  const likeCount = computed(() => likedProducts.value.length)

  // Get all liked products sorted by most recently added
  const sortedLikes = computed(() => {
    return [...likedProducts.value].sort((a, b) => b.addedAt - a.addedAt)
  })

  // Initialize on first use
  initializeLikes()

  return {
    likedProducts: readonly(likedProducts),
    sortedLikes,
    likeCount,
    isLiked,
    addLike,
    removeLike,
    toggleLike,
    clearAllLikes,
    syncWithShopware,
    clearOnLogout,
    isLoading: computed(() => isLoading.value),
    isSyncing: computed(() => isSyncing.value),
  }
}
