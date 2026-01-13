/**
 * Shopware 6 Store-API Proxy
 * 
 * This proxy securely handles all Shopware API calls:
 * - Protects the Sales Channel Access Key on the server side
 * - Passes sw-context-token header in both directions
 * - Supports all HTTP methods (GET, POST, PATCH, DELETE)
 */

export default defineEventHandler(async (event) => {
  const SHOPWARE_API_URL = 'https://fulltestsw-whering.eu-core-1.shopdev.de/store-api'
  const SHOPWARE_ACCESS_KEY = 'SWSCSERRTVR5EHDCQ3VWMEZNQW'

  // Get the path from the URL (everything after /api/shopware/)
  const path = event.context.params?.path || ''
  const queryString = getQuery(event)
  
  // Build query string
  const queryParams = new URLSearchParams()
  for (const [key, value] of Object.entries(queryString)) {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value))
    }
  }
  const query = queryParams.toString()
  const fullUrl = `${SHOPWARE_API_URL}/${path}${query ? `?${query}` : ''}`

  console.log(`[Shopware Proxy] ${event.method} ${fullUrl}`)

  // Get incoming headers
  const incomingHeaders = getHeaders(event)
  const contextToken = incomingHeaders['sw-context-token'] || ''

  // Prepare headers for Shopware
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'sw-access-key': SHOPWARE_ACCESS_KEY,
  }

  // Pass context token if present
  if (contextToken) {
    headers['sw-context-token'] = contextToken
    console.log('[Shopware Proxy] Using context token:', contextToken.substring(0, 20) + '...')
  }

  try {
    // Get request body for POST/PATCH methods
    let body: string | undefined
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(event.method || '')) {
      const rawBody = await readBody(event)
      if (rawBody) {
        body = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody)
        console.log('[Shopware Proxy] Request body:', body.substring(0, 500))
      }
    }

    // Make request to Shopware
    const response = await fetch(fullUrl, {
      method: event.method,
      headers,
      body,
    })

    // Get response headers
    const responseContextToken = response.headers.get('sw-context-token')
    
    // Parse response
    const responseText = await response.text()
    let data: any
    
    try {
      data = JSON.parse(responseText)
    } catch {
      data = responseText
    }

    console.log('[Shopware Proxy] Response status:', response.status)
    if (responseContextToken) {
      console.log('[Shopware Proxy] Response context token:', responseContextToken.substring(0, 20) + '...')
    }

    // Set response headers
    if (responseContextToken) {
      setHeader(event, 'sw-context-token', responseContextToken)
    }

    // Handle error responses
    if (!response.ok) {
      console.error('[Shopware Proxy] Error response status:', response.status, response.statusText)
      console.error('[Shopware Proxy] Error response body:', JSON.stringify(data, null, 2).substring(0, 2000))
      
      // Log individual errors if present
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((err: any, index: number) => {
          console.error(`[Shopware Proxy] Error ${index + 1}:`, {
            status: err.status,
            code: err.code,
            title: err.title,
            detail: err.detail,
            source: err.source,
          })
        })
      }
      
      throw createError({
        statusCode: response.status,
        statusMessage: response.statusText,
        data: data,
      })
    }

    return data
  } catch (error: any) {
    console.error('[Shopware Proxy] Error:', error)
    
    // Re-throw if already a H3 error
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Shopware API Error',
      data: { message: error.message },
    })
  }
})
