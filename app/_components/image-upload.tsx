"use client"

import { useState, useRef } from "react"
import { UploadIcon, XIcon, Loader2Icon, ImageIcon } from "lucide-react"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  className?: string
}

export default function ImageUpload({ value, onChange, label = "Imagem", className = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError("")
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao fazer upload")
      onChange(data.url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao fazer upload")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-gray-400">{label}</label>

      {value ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="h-36 w-full rounded-lg object-cover border border-gray-700"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 text-center transition-colors hover:border-yellow-500/50 hover:bg-gray-800"
        >
          {uploading ? (
            <>
              <Loader2Icon className="h-8 w-8 animate-spin text-yellow-400" />
              <p className="text-xs text-gray-400">Enviando...</p>
            </>
          ) : (
            <>
              <div className="rounded-lg bg-gray-700 p-2">
                <UploadIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-300">Clique ou arraste uma imagem</p>
                <p className="text-xs text-gray-500">JPG, PNG, WEBP — máx. 10MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}

// Multi-image upload for banners
interface MultiImageUploadProps {
  values: string[]
  onChange: (urls: string[]) => void
  label?: string
  maxImages?: number
}

export function MultiImageUpload({ values, onChange, label = "Imagens", maxImages = 5 }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (values.length >= maxImages) {
      setError(`Máximo de ${maxImages} imagens`)
      return
    }
    setError("")
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao fazer upload")
      onChange([...values, data.url])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao fazer upload")
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-400">{label}</label>
      <p className="mb-2 text-xs text-gray-500">
        {values.length > 1 ? "Múltiplas imagens → carrossel automático na tela principal" : "Adicione mais de 1 imagem para criar um carrossel"}
      </p>

      <div className="grid grid-cols-3 gap-2 mb-2">
        {values.map((url, idx) => (
          <div key={idx} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Banner ${idx + 1}`} className="h-20 w-full rounded-lg object-cover border border-gray-700" />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </div>
        ))}

        {values.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 text-center transition-colors hover:border-yellow-500/50 hover:bg-gray-800 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2Icon className="h-5 w-5 animate-spin text-yellow-400" />
            ) : (
              <>
                <ImageIcon className="h-5 w-5 text-gray-500" />
                <span className="text-xs text-gray-500">Adicionar</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
