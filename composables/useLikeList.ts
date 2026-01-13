// Composable for managing the Like/Wishlist functionality
// Persists to localStorage and provides reactive state across components

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

const STORAGE_KEY = 'furniture-likes'

// Global state - shared across all components
const likedProducts = ref<LikedProduct[]>([])
const isInitialized = ref(false)

export const useLikeList = () => {
  // Initialize from localStorage (only on client)
  const initializeLikes = () => {
    if (isInitialized.value) return
    
    if (import.meta.client) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          likedProducts.value = JSON.parse(stored)
        }
      } catch (e) {
        console.error('Error loading likes from localStorage:', e)
        likedProducts.value = []
      }
      isInitialized.value = true
    }
  }

  // Save to localStorage
  const saveLikes = () => {
    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(likedProducts.value))
      } catch (e) {
        console.error('Error saving likes to localStorage:', e)
      }
    }
  }

  // Check if a product is liked
  const isLiked = (productKey: string): boolean => {
    return likedProducts.value.some(p => p.key === productKey)
  }

  // Add a product to likes
  const addLike = (product: Omit<LikedProduct, 'addedAt'>) => {
    if (!isLiked(product.key)) {
      likedProducts.value.push({
        ...product,
        addedAt: Date.now()
      })
      saveLikes()
    }
  }

  // Remove a product from likes
  const removeLike = (productKey: string) => {
    const index = likedProducts.value.findIndex(p => p.key === productKey)
    if (index > -1) {
      likedProducts.value.splice(index, 1)
      saveLikes()
    }
  }

  // Toggle like status
  const toggleLike = (product: Omit<LikedProduct, 'addedAt'>) => {
    if (isLiked(product.key)) {
      removeLike(product.key)
    } else {
      addLike(product)
    }
  }

  // Clear all likes
  const clearAllLikes = () => {
    likedProducts.value = []
    saveLikes()
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
    clearAllLikes
  }
}
