"use client"

import { useState, useEffect } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

interface BannerCarouselProps {
  banners: string[]
  appName?: string
}

export default function BannerCarousel({ banners, appName = "Barberon" }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0)

  // Auto-rotate if multiple banners
  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [banners.length])

  if (banners.length === 0) {
    // Fallback to static banner
    return (
      <div className="relative mt-6 h-[150px] w-full overflow-hidden rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-400">
        <div className="flex h-full items-center px-6">
          <div>
            <p className="text-lg font-bold text-black">Agende nos melhores</p>
            <p className="text-sm text-black/80">com o {appName}!</p>
          </div>
        </div>
      </div>
    )
  }

  if (banners.length === 1) {
    return (
      <div className="relative mt-6 h-[150px] w-full overflow-hidden rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={banners[0]} alt="Banner" className="h-full w-full object-cover" />
      </div>
    )
  }

  return (
    <div className="relative mt-6 h-[150px] w-full overflow-hidden rounded-xl">
      {/* Slides */}
      {banners.map((src, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={idx}
          src={src}
          alt={`Banner ${idx + 1}`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            idx === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Prev/Next */}
      <button
        onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white hover:bg-black/60"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setCurrent((c) => (c + 1) % banners.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white hover:bg-black/60"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === current ? "w-4 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
