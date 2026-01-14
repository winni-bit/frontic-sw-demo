<template>
  <div ref="containerRef" class="relative w-full h-full bg-stone-50 overflow-hidden">
    <!-- Loading State -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-300"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isLoading" 
        class="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 z-10"
      >
        <div class="relative">
          <!-- Animated 3D cube icon -->
          <svg class="w-16 h-16 text-amber-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <!-- Rotating ring -->
          <div class="absolute inset-0 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
        </div>
        <p class="mt-4 text-sm text-stone-500">Loading 3D model...</p>
        <p v-if="loadProgress > 0" class="text-xs text-stone-400 mt-1">{{ loadProgress }}%</p>
      </div>
    </Transition>

    <!-- Error State -->
    <div 
      v-if="error" 
      class="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 z-10"
    >
      <svg class="w-12 h-12 text-stone-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p class="text-sm text-stone-500">Could not load 3D model</p>
      <button 
        @click="loadModel" 
        class="mt-3 text-xs text-amber-600 hover:text-amber-700 underline"
      >
        Try again
      </button>
    </div>

    <!-- Canvas Container -->
    <canvas ref="canvasRef" class="w-full h-full" />

    <!-- Controls Overlay -->
    <div 
      v-if="!isLoading && !error" 
      class="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none"
    >
      <!-- Interaction Hint -->
      <div class="bg-white/80 backdrop-blur-sm px-3 py-2 text-xs text-stone-600 flex items-center gap-2 pointer-events-auto">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <span>Drag to rotate • Scroll to zoom</span>
      </div>

      <!-- Control Buttons -->
      <div class="flex items-center gap-2 pointer-events-auto">
        <!-- Reset View Button -->
        <button 
          @click="resetView"
          class="p-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          title="Reset view"
        >
          <svg class="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <!-- Fullscreen Button -->
        <button 
          @click="toggleFullscreen"
          class="p-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          title="Toggle fullscreen"
        >
          <svg v-if="!isFullscreen" class="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <svg v-else class="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
          </svg>
        </button>

        <!-- AR Button (Mobile Only) -->
        <a 
          v-if="arSupported && modelUrl"
          :href="arViewerUrl"
          rel="ar"
          class="p-2 bg-amber-500 hover:bg-amber-600 transition-colors"
          title="View in AR"
        >
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </a>
      </div>
    </div>

    <!-- 3D Badge -->
    <div class="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 text-xs font-medium tracking-wide">
      3D
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

const props = defineProps<{
  modelUrl: string
  autoRotate?: boolean
}>()

const emit = defineEmits<{
  (e: 'loaded'): void
  (e: 'error', error: Error): void
}>()

// Refs
const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

// State
const isLoading = ref(true)
const loadProgress = ref(0)
const error = ref(false)
const isFullscreen = ref(false)

// Three.js instances (will be set dynamically)
let scene: any = null
let camera: any = null
let renderer: any = null
let controls: any = null
let model: any = null
let animationId: number | null = null

// Initial camera state for reset
let initialCameraPosition = { x: 0, y: 0, z: 3 }
let initialControlsTarget = { x: 0, y: 0, z: 0 }

// Check AR support (basic check for mobile)
const arSupported = computed(() => {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
})

// Generate AR viewer URL (for model-viewer or native AR)
const arViewerUrl = computed(() => {
  if (!props.modelUrl) return ''
  const proxyUrl = `/api/proxy-model?url=${encodeURIComponent(props.modelUrl)}`
  return proxyUrl
})

// Proxy URL for the model
const proxyModelUrl = computed(() => {
  if (!props.modelUrl) return ''
  return `/api/proxy-model?url=${encodeURIComponent(props.modelUrl)}`
})

const loadModel = async () => {
  if (!canvasRef.value || !containerRef.value) return
  
  isLoading.value = true
  error.value = false
  loadProgress.value = 0
  
  try {
    // Dynamic import of Three.js modules
    const [
      THREE,
      { OrbitControls },
      { GLTFLoader },
      { DRACOLoader },
      { RoomEnvironment }
    ] = await Promise.all([
      import('three'),
      import('three/examples/jsm/controls/OrbitControls.js'),
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/loaders/DRACOLoader.js'),
      import('three/examples/jsm/environments/RoomEnvironment.js')
    ])
    
    const container = containerRef.value
    const canvas = canvasRef.value
    
    // Scene setup
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xfafaf9) // stone-50
    
    // Camera setup
    const aspect = container.clientWidth / container.clientHeight
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
    camera.position.set(0, 0.5, 3)
    
    // Renderer setup with anti-banding
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    
    // Environment map for realistic lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    const environment = pmremGenerator.fromScene(new RoomEnvironment()).texture
    scene.environment = environment
    
    // Controls
    controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enablePan = false
    controls.minDistance = 0.5
    controls.maxDistance = 10
    controls.autoRotate = props.autoRotate ?? true
    controls.autoRotateSpeed = 1.0
    
    // DRACO Loader setup (CRITICAL for compressed models)
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
    dracoLoader.setDecoderConfig({ type: 'js' })
    
    // GLTF Loader with DRACO support
    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)
    
    console.log('[3D Viewer] Loading model from proxy:', proxyModelUrl.value)
    
    // Load the model
    const gltf = await new Promise<any>((resolve, reject) => {
      loader.load(
        proxyModelUrl.value,
        (gltf: any) => resolve(gltf),
        (progress: any) => {
          if (progress.total > 0) {
            loadProgress.value = Math.round((progress.loaded / progress.total) * 100)
          }
        },
        (err: any) => reject(err)
      )
    })
    
    model = gltf.scene
    
    // Calculate bounding box for VISIBLE meshes only (skip shadow planes)
    const box = new THREE.Box3()
    let hasVisibleMeshes = false
    
    model.traverse((child: any) => {
      if (child.isMesh && child.geometry) {
        // Skip shadow catchers, ground planes, and invisible geometry
        const isShadowCatcher = 
          (child.material?.opacity !== undefined && child.material.opacity < 1) ||
          child.material?.transparent === true ||
          child.name?.toLowerCase().includes('shadow') ||
          child.name?.toLowerCase().includes('ground') ||
          child.name?.toLowerCase().includes('plane') ||
          child.name?.toLowerCase().includes('floor') ||
          child.name?.toLowerCase().includes('backdrop')
        
        if (!isShadowCatcher && child.visible) {
          const childBox = new THREE.Box3().setFromObject(child)
          if (!childBox.isEmpty()) {
            box.union(childBox)
            hasVisibleMeshes = true
          }
        }
      }
    })
    
    // Fallback if no visible meshes found
    if (!hasVisibleMeshes || box.isEmpty()) {
      console.log('[3D Viewer] No visible meshes found, using full model bounds')
      box.setFromObject(model)
    }
    
    // Center and scale the model
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 1.2 / maxDim
    
    model.scale.setScalar(scale)
    
    const scaledCenter = center.clone().multiplyScalar(scale)
    model.position.set(-scaledCenter.x, -scaledCenter.y, -scaledCenter.z)
    
    // Align to center
    controls.target.set(0, 0, 0)
    
    // Store initial state for reset
    initialCameraPosition = { x: camera.position.x, y: camera.position.y, z: camera.position.z }
    initialControlsTarget = { x: 0, y: 0, z: 0 }
    
    scene.add(model)
    
    console.log('[3D Viewer] Model loaded successfully')
    console.log('[3D Viewer] Model size:', size)
    console.log('[3D Viewer] Applied scale:', scale)
    
    isLoading.value = false
    emit('loaded')
    
    // Start animation loop
    animate()
    
  } catch (err: any) {
    console.error('[3D Viewer] Error loading model:', err)
    isLoading.value = false
    error.value = true
    emit('error', err)
  }
}

const animate = () => {
  if (!renderer || !scene || !camera || !controls) return
  
  animationId = requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

const handleResize = () => {
  if (!containerRef.value || !camera || !renderer) return
  
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

const resetView = () => {
  if (!camera || !controls) return
  
  camera.position.set(initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z)
  controls.target.set(initialControlsTarget.x, initialControlsTarget.y, initialControlsTarget.z)
  controls.update()
}

const toggleFullscreen = async () => {
  if (!containerRef.value) return
  
  try {
    if (!document.fullscreenElement) {
      await containerRef.value.requestFullscreen()
      isFullscreen.value = true
    } else {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  } catch (err) {
    console.error('[3D Viewer] Fullscreen error:', err)
  }
}

// Cleanup
const cleanup = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  
  if (renderer) {
    renderer.dispose()
    renderer = null
  }
  
  if (controls) {
    controls.dispose()
    controls = null
  }
  
  if (scene) {
    scene.traverse((object: any) => {
      if (object.geometry) {
        object.geometry.dispose()
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((mat: any) => mat.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
    scene = null
  }
  
  model = null
  camera = null
}

// Lifecycle
onMounted(() => {
  loadModel()
  window.addEventListener('resize', handleResize)
  
  // Listen for fullscreen changes
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
    // Trigger resize after fullscreen change
    setTimeout(handleResize, 100)
  })
})

onUnmounted(() => {
  cleanup()
  window.removeEventListener('resize', handleResize)
})

// Watch for model URL changes
watch(() => props.modelUrl, () => {
  cleanup()
  loadModel()
})
</script>
