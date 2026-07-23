"use client"

import { useEffect, useRef, useState } from "react"
import { geoOrthographic, geoPath, geoGraticule } from "d3-geo"
import { timer } from "d3-timer"

export default function RotatingEarth({ width = 440, height = 440, className = "" }) {
  const canvasRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    const containerWidth = width
    const containerHeight = height
    const baseRadius = Math.min(containerWidth, containerHeight) / 2.2

    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    context.scale(dpr, dpr)

    const projection = geoOrthographic()
      .scale(baseRadius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90)

    const path = geoPath().projection(projection).context(context)

    let landFeatures

    const render = () => {
      context.clearRect(0, 0, containerWidth, containerHeight)

      const currentScale = projection.scale()
      const scaleFactor = currentScale / baseRadius
      const cx = containerWidth / 2
      const cy = containerHeight / 2

      // Clip everything to the sphere circle so zoomed features never escape to rectangle
      context.save()
      context.beginPath()
      context.arc(cx, cy, currentScale, 0, 2 * Math.PI)
      context.clip()

      // Glass ocean background
      context.beginPath()
      context.arc(cx, cy, currentScale, 0, 2 * Math.PI)
      const grad = context.createRadialGradient(
        cx - currentScale * 0.3,
        cy - currentScale * 0.3,
        currentScale * 0.1,
        cx,
        cy,
        currentScale
      )
      grad.addColorStop(0, "rgba(20, 30, 65, 0.75)")
      grad.addColorStop(0.7, "rgba(8, 12, 30, 0.6)")
      grad.addColorStop(1, "rgba(5, 8, 20, 0.85)")
      context.fillStyle = grad
      context.fill()

      // Graticule grid
      const graticules = geoGraticule().step([12, 12])
      context.beginPath()
      path(graticules())
      context.strokeStyle = "rgba(255, 255, 255, 0.16)"
      context.lineWidth = 0.6 * scaleFactor
      context.stroke()

      if (landFeatures) {
        // Land shaded fills & glowing borders
        context.beginPath()
        landFeatures.features.forEach((feature) => {
          path(feature)
        })
        context.fillStyle = "rgba(255, 122, 89, 0.18)"
        context.fill()
        context.strokeStyle = "rgba(255, 122, 89, 0.65)"
        context.lineWidth = 1.3 * scaleFactor
        context.stroke()
      }

      context.restore()

      // Atmosphere ring drawn OUTSIDE clip so it always shows at sphere edge
      context.beginPath()
      context.arc(cx, cy, currentScale, 0, 2 * Math.PI)
      context.strokeStyle = "rgba(53, 215, 255, 0.55)"
      context.lineWidth = 1.5 * scaleFactor
      context.stroke()
    }


    const loadWorldData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json"
        )
        if (!response.ok) throw new Error("Failed to load land data")
        landFeatures = await response.json()
        render()
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load land map data")
        setIsLoading(false)
      }
    }

    const rotation = [0, 0]
    let autoRotate = true
    const rotationSpeed = 0.35

    const rotate = () => {
      if (autoRotate) {
        rotation[0] += rotationSpeed
        projection.rotate(rotation)
        render()
      }
    }

    const rotationTimer = timer(rotate)

    // Interactive Dragging
    const handleDragStart = (clientX, clientY) => {
      autoRotate = false
      const startX = clientX
      const startY = clientY
      const startRotation = [...rotation]

      const handleDragMove = (moveEvent) => {
        const currentX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX
        const currentY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY
        const sensitivity = 0.35

        const dx = currentX - startX
        const dy = currentY - startY

        rotation[0] = startRotation[0] + dx * sensitivity
        rotation[1] = startRotation[1] - dy * sensitivity
        rotation[1] = Math.max(-90, Math.min(90, rotation[1]))

        projection.rotate(rotation)
        render()
      }

      const handleDragEnd = () => {
        document.removeEventListener("mousemove", handleDragMove)
        document.removeEventListener("mouseup", handleDragEnd)
        document.removeEventListener("touchmove", handleDragMove)
        document.removeEventListener("touchend", handleDragEnd)
        setTimeout(() => {
          autoRotate = true
        }, 500)
      }

      document.addEventListener("mousemove", handleDragMove)
      document.addEventListener("mouseup", handleDragEnd)
      document.addEventListener("touchmove", handleDragMove, { passive: true })
      document.addEventListener("touchend", handleDragEnd)
    }

    const handleMouseDown = (e) => handleDragStart(e.clientX, e.clientY)
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    // Interactive Zooming with non-passive wheel listener
    const handleWheel = (event) => {
      event.preventDefault()
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.11
      const currentScale = projection.scale()
      const minScale = baseRadius * 0.4
      const maxScale = baseRadius * 3.5

      const newScale = Math.max(minScale, Math.min(maxScale, currentScale * zoomFactor))
      projection.scale(newScale)
      render()
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true })
    canvas.addEventListener("wheel", handleWheel, { passive: false })

    loadWorldData()

    return () => {
      rotationTimer.stop()
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("wheel", handleWheel)
    }
  }, [width, height])

  if (error) {
    return (
      <div className="flex items-center justify-center bg-[#090d22] rounded-2xl p-8 border border-white/10 min-h-[300px]">
        <div className="text-center">
          <p className="text-[#ff7a59] font-semibold mb-2">Error loading Earth visualization</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative flex flex-col items-center justify-center pointer-events-auto ${className}`} style={{ zIndex: 2 }}>
      <canvas
        ref={canvasRef}
        className="w-auto h-auto cursor-grab active:cursor-grabbing pointer-events-auto touch-none"
        style={{ display: 'block' }}
      />
      <div className="mt-2 text-[10px] text-amber-200/75 tracking-widest uppercase px-3 py-1 rounded-full bg-[#090d22]/80 border border-white/10 backdrop-blur-md select-none pointer-events-none">
        Drag to rotate • Scroll / Pinch to zoom
      </div>
    </div>
  )
}
