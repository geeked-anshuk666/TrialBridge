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
    const radius = Math.min(containerWidth, containerHeight) / 2.2

    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    context.scale(dpr, dpr)

    const projection = geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90)

    const path = geoPath().projection(projection).context(context)

    let landFeatures

    const render = () => {
      context.clearRect(0, 0, containerWidth, containerHeight)

      const currentScale = projection.scale()
      const scaleFactor = currentScale / radius

      // Glass ocean background
      context.beginPath()
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
      const grad = context.createRadialGradient(
        containerWidth / 2 - currentScale * 0.3,
        containerHeight / 2 - currentScale * 0.3,
        currentScale * 0.1,
        containerWidth / 2,
        containerHeight / 2,
        currentScale
      )
      grad.addColorStop(0, "rgba(20, 30, 65, 0.65)")
      grad.addColorStop(0.7, "rgba(8, 12, 30, 0.5)")
      grad.addColorStop(1, "rgba(5, 8, 20, 0.75)")
      context.fillStyle = grad
      context.fill()

      // Atmosphere ring
      context.strokeStyle = "rgba(53, 215, 255, 0.45)"
      context.lineWidth = 1.5 * scaleFactor
      context.stroke()

      // Graticule grid
      const graticules = geoGraticule().step([12, 12])
      context.beginPath()
      path(graticules())
      context.strokeStyle = "rgba(255, 255, 255, 0.14)"
      context.lineWidth = 0.6 * scaleFactor
      context.stroke()

      if (landFeatures) {
        // Land shaded fills & glowing borders
        context.beginPath()
        landFeatures.features.forEach((feature) => {
          path(feature)
        })
        context.fillStyle = "rgba(255, 122, 89, 0.15)"
        context.fill()
        context.strokeStyle = "rgba(255, 122, 89, 0.55)"
        context.lineWidth = 1.2 * scaleFactor
        context.stroke()
      }
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

    const handleMouseDown = (event) => {
      autoRotate = false
      const startX = event.clientX
      const startY = event.clientY
      const startRotation = [...rotation]

      const handleMouseMove = (moveEvent) => {
        const sensitivity = 0.3
        const dx = moveEvent.clientX - startX
        const dy = moveEvent.clientY - startY

        rotation[0] = startRotation[0] + dx * sensitivity
        rotation[1] = startRotation[1] - dy * sensitivity
        rotation[1] = Math.max(-90, Math.min(90, rotation[1]))

        projection.rotate(rotation)
        render()
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        setTimeout(() => {
          autoRotate = true
        }, 10)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    const handleWheel = (event) => {
      event.preventDefault()
      const scaleFactor = event.deltaY > 0 ? 0.92 : 1.08
      const newRadius = Math.max(radius * 0.6, Math.min(radius * 2.2, projection.scale() * scaleFactor))
      projection.scale(newRadius)
      render()
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("wheel", handleWheel)

    loadWorldData()

    return () => {
      rotationTimer.stop()
      canvas.removeEventListener("mousedown", handleMouseDown)
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
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-auto h-auto cursor-grab active:cursor-grabbing pointer-events-auto"
      />
      <div className="mt-2 text-[10px] text-amber-200/70 tracking-widest uppercase px-3 py-1 rounded-full bg-[#090d22]/80 border border-white/10 backdrop-blur-md">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  )
}
