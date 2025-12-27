'use client'

import Image from 'next/image'
import React, { useState } from 'react'

type MediaThumbProps = {
  src?: string | null
  alt: string
  className?: string
  style?: React.CSSProperties
  sizes?: string
  quality?: number
  priority?: boolean
  unoptimized?: boolean
  fill?: boolean
  width?: number
  height?: number
  fallback?: React.ReactNode
}

export function MediaThumb({
  src,
  alt,
  className,
  style,
  sizes,
  quality = 75,
  priority = false,
  unoptimized = false,
  fill = false,
  width,
  height,
  fallback,
}: MediaThumbProps) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) return <>{fallback ?? null}</>

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        unoptimized={unoptimized}
        className={className}
        style={style}
        onError={() => setErrored(true)}
      />
    )
  }

  // 非 fill 模式需要固定尺寸，避免 CLS
  if (!width || !height) return <>{fallback ?? null}</>

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      quality={quality}
      priority={priority}
      unoptimized={unoptimized}
      className={className}
      style={style}
      onError={() => setErrored(true)}
    />
  )
}


