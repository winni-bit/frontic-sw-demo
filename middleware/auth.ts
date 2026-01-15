/**
 * Auth Middleware
 * 
 * Protects routes that require authentication.
 * Redirects to login page if user is not logged in.
 * 
 * Note: This middleware runs on both server and client.
 * On server-side, it checks the customer state.
 * The actual customer data is fetched client-side to ensure
 * the latest auth state is used (avoiding cookie sync issues).
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { isLoggedIn, customer, fetchCustomer, isInitialized } = useShopwareAuth()

  // On client-side, always fetch fresh customer data
  if (import.meta.client) {
    if (!isInitialized.value) {
      try {
        console.log('[Auth Middleware] Client: Fetching customer data...')
        await fetchCustomer()
      } catch (err) {
        console.log('[Auth Middleware] Client: No logged in customer')
      }
    }
  } else {
    // On server-side, try to initialize auth
    if (!isInitialized.value) {
      try {
        console.log('[Auth Middleware] Server: Attempting to fetch customer...')
        await fetchCustomer()
      } catch (err) {
        console.log('[Auth Middleware] Server: No logged in customer')
      }
    }
  }

  // If not logged in, redirect to login
  if (!isLoggedIn.value) {
    console.log('[Auth Middleware] User not logged in, redirecting to login')
    return navigateTo({
      path: '/account/login',
      query: {
        redirect: to.fullPath,
      },
    })
  }

  console.log('[Auth Middleware] User is logged in:', customer.value?.email)
})
