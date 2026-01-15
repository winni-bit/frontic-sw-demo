/**
 * Auth Middleware
 * 
 * Protects routes that require authentication.
 * Redirects to login page if user is not logged in.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { isLoggedIn, fetchCustomer, isInitialized } = useShopwareAuth()

  // Initialize auth if not already done
  if (!isInitialized.value) {
    try {
      await fetchCustomer()
    } catch (err) {
      console.log('[Auth Middleware] No logged in customer')
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

  console.log('[Auth Middleware] User is logged in, allowing access')
})
