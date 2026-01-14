/**
 * CORS Proxy for 3D Models (GLB/GLTF)
 * 
 * This proxy handles CORS restrictions for external 3D model files.
 * It validates URLs, handles special characters, and returns proper headers.
 */

import { defineEventHandler, getQuery, createError, setResponseHeaders, sendStream } from 'h3'

// Allowed domains for security
const ALLOWED_DOMAINS = [
  'shopdev.de',
  'shopware.com',
  'cloudfront.net',
  'amazonaws.com',
  'googleusercontent.com',
  'cdn.shopify.com',
  'localhost'
]

function isAllowedDomain(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ALLOWED_DOMAINS.some(domain => urlObj.hostname.endsWith(domain))
  } catch {
    return false
  }
}

function encodeUrlPath(url: string): string {
  try {
    // First decode to handle already encoded URLs
    const decoded = decodeURIComponent(url)
    const urlObj = new URL(decoded)
    
    // Re-encode the pathname segments individually
    const pathSegments = urlObj.pathname.split('/').map(segment => {
      // Decode first to avoid double encoding, then encode
      try {
        return encodeURIComponent(decodeURIComponent(segment))
      } catch {
        return encodeURIComponent(segment)
      }
    })
    
    urlObj.pathname = pathSegments.join('/')
    return urlObj.toString()
  } catch {
    // If parsing fails, try basic encoding
    return url.replace(/ /g, '%20')
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string
  
  if (!url) {
    throw createError({
      statusCode: 400,
      message: 'Missing url parameter'
    })
  }
  
  // Validate domain
  if (!isAllowedDomain(url)) {
    throw createError({
      statusCode: 403,
      message: 'Domain not allowed'
    })
  }
  
  try {
    // Encode URL properly for special characters (spaces, umlauts, etc.)
    const encodedUrl = encodeUrlPath(url)
    
    console.log('[Proxy] Fetching 3D model:', encodedUrl)
    
    const response = await fetch(encodedUrl, {
      headers: {
        'Accept': 'model/gltf-binary, application/octet-stream, */*',
        'User-Agent': 'Frontstack-3D-Proxy/1.0'
      }
    })
    
    if (!response.ok) {
      console.error('[Proxy] Failed to fetch model:', response.status, response.statusText)
      throw createError({
        statusCode: response.status,
        message: `Failed to fetch model: ${response.statusText}`
      })
    }
    
    // Set response headers
    setResponseHeaders(event, {
      'Content-Type': 'model/gltf-binary',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    
    // Get the response as an ArrayBuffer and return it
    const arrayBuffer = await response.arrayBuffer()
    return new Uint8Array(arrayBuffer)
    
  } catch (error: any) {
    console.error('[Proxy] Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: `Proxy error: ${error.message}`
    })
  }
})
