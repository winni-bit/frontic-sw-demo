/**
 * Wishlist/Like List Composable
 * 
 * Handles wishlist operations with user-based localStorage persistence:
 * - For logged-in users: Wishlist is stored per user ID
 * - For guests: Wishlist is stored with a guest key
 * - On login: Guest wishlist is merged with user wishlist
 * - On logout: User wishlist is preserved, guest wishlist is cleared
 * 
 * This approach ensures wishlist persists across sessions for logged-in users
 * without requiring Shopware Wishlist API (which may not be enabled)
 */

interface LikedProduct {
  key: string
  name: string
  price?: {
    amount: number
    currency: string
    precision: number
  }
  lowestPrice?: {
    amount: number
    currency: string
    precision: number
  }
  cover?: {
    src?: string
    thumbnailSrc?: string
    altText?: string
  }
  addedAt: number
}

const STORAGE_KEY_PREFIX = 'furniture-likes'
const GUEST_KEY = 'guest'

// Global state - shared across all components
const likedProducts = ref<LikedProduct[]>([])
const isInitialized = ref(false)
const isLoading = ref(false)
const isSyncing = ref(false)

export const useLikeList = () => {
  // Get current user ID from auth state
  const getCurrentUserId = (): string => {
    const customer = useState<any>('shopware-auth-customer')
    if (customer.value && !customer.value.guest && customer.value.id) {
      return customer.value.id
    }
    return GUEST_KEY
  }

  // Check if user is logged in
  const isUserLoggedIn = (): boolean => {
    const customer = useState<any>('shopware-auth-customer')
    return !!customer.value && !customer.value.guest
  }

  // Get storage key for current user
  const getStorageKey = (userId?: string): string => {
    const id = userId || getCurrentUserId()
    return `${STORAGE_KEY_PREFIX}-${id}`
  }

  // Load wishlist from localStorage for a specific user
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

  // Save wishlist to localStorage for current user
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

  // Clear guest wishlist from storage
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

  /**
   * Sync wishlist on login
   * - Loads user's saved wishlist
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
      const userId = getCurrentUserId()
      
      // Load user's saved wishlist
      const userProducts = loadFromStorage(userId)
      const userProductIds = userProducts.map(p => p.key)
      console.log('[useLikeList] User wishlist:', userProducts.length, 'items')

      // Load guest wishlist (items added before login)
      const guestProducts = loadFromStorage(GUEST_KEY)
      console.log('[useLikeList] Guest wishlist:', guestProducts.length, 'items')

      // Merge: Start with user products, add guest products that aren't duplicates
      const mergedProducts = [...userProducts]
      
      for (const guestProduct of guestProducts) {
        if (!userProductIds.includes(guestProduct.key)) {
          console.log('[useLikeList] Merging guest product:', guestProduct.name)
          mergedProducts.push(guestProduct)
        }
      }

      // Update state and save
      likedProducts.value = mergedProducts
      saveToStorage()

      // Clear guest wishlist after merge
      clearGuestStorage()

      console.log('[useLikeList] Sync complete, total items:', likedProducts.value.length)
    } catch (err) {
      console.error('[useLikeList] Error syncing wishlist:', err)
    } finally {
      isSyncing.value = false
    }
  }

  /**
   * Clear local state on logout
   * User's wishlist remains in storage for next login
   */
  const clearOnLogout = (): void => {
    console.log('[useLikeList] Clearing wishlist state on logout')
    likedProducts.value = []
    // Don't clear user storage - it will be loaded on next login
    // Clear guest storage to start fresh
    clearGuestStorage()
  }

  // Initialize wishlist
  const initializeLikes = () => {
    if (isInitialized.value) return

    const userId = getCurrentUserId()
    likedProducts.value = loadFromStorage(userId)
    isInitialized.value = true
    
    console.log('[useLikeList] Initialized for', userId, 'with', likedProducts.value.length, 'items')
  }

  // Check if a product is liked
  const isLiked = (productKey: string): boolean => {
    return likedProducts.value.some(p => p.key === productKey)
  }

  // Add a product to likes
  const addLike = async (product: Omit<LikedProduct, 'addedAt'>) => {
    if (isLiked(product.key)) return

    likedProducts.value.push({
      ...product,
      addedAt: Date.now()
    })
    saveToStorage()
    
    console.log('[useLikeList] Added:', product.name)
  }

  // Remove a product from likes
  const removeLike = async (productKey: string) => {
    const index = likedProducts.value.findIndex(p => p.key === productKey)
    if (index === -1) return

    const removed = likedProducts.value.splice(index, 1)
    saveToStorage()
    
    console.log('[useLikeList] Removed:', removed[0]?.name)
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
    likedProducts.value = []
    saveToStorage()
    console.log('[useLikeList] Cleared all likes')
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
