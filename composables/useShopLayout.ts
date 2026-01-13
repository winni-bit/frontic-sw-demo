/**
 * Composable to track and persist the current shop layout
 * This ensures checkout and other shared pages use the correct layout
 */

export const useShopLayout = () => {
  // Use useState for SSR-safe global state
  const currentLayout = useState<string>('shop-layout', () => 'default')
  
  // Cookie for persistence across page loads
  const layoutCookie = useCookie('shop-layout', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  })

  /**
   * Set the current shop layout
   */
  const setLayout = (layout: string) => {
    console.log('[useShopLayout] Setting layout to:', layout)
    currentLayout.value = layout
    layoutCookie.value = layout
  }

  /**
   * Get the current shop layout
   */
  const getLayout = (): string => {
    // Priority: state > cookie > default
    if (currentLayout.value && currentLayout.value !== 'default') {
      return currentLayout.value
    }
    if (layoutCookie.value) {
      currentLayout.value = layoutCookie.value
      return layoutCookie.value
    }
    return 'default'
  }

  /**
   * Initialize layout from cookie (call on app mount)
   */
  const initLayout = () => {
    if (layoutCookie.value) {
      currentLayout.value = layoutCookie.value
    }
  }

  return {
    currentLayout: computed(() => currentLayout.value),
    setLayout,
    getLayout,
    initLayout,
  }
}
