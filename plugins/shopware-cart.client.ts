/**
 * Shopware Cart Plugin
 * 
 * Initializes the Shopware cart on app startup (client-side only).
 * This ensures the cart is loaded before any component tries to access it.
 */
export default defineNuxtPlugin(async () => {
  const { initCart } = useShopwareCart()
  
  console.log('[ShopwareCartPlugin] Initializing cart on app startup...')
  
  try {
    await initCart()
    console.log('[ShopwareCartPlugin] Cart initialized successfully')
  } catch (error) {
    console.error('[ShopwareCartPlugin] Failed to initialize cart:', error)
  }
})
