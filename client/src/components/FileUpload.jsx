import { useCallback, useRef, useState } from 'react'

const defaultAccept = '.pdf,.doc,.docx,image/jpeg,image/png,image/webp'

export default function FileUpload({
  accept = defaultAccept,
  multiple = false,
  maxFiles = 12,
  onFilesChange,
  disabled,
}) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [names, setNames] = useState([])

  const emit = useCallback(
    (fileList) => {
      const arr = multiple
        ? Array.from(fileList || []).slice(0, maxFiles)
        : fileList?.[0]
          ? [fileList[0]]
          : []
      setNames(arr.map((f) => f.name))
      onFilesChange?.(multiple ? arr : arr[0] || null)
    },
    [multiple, maxFiles, onFilesChange]
  )

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    emit(e.dataTransfer.files)
  }

  const onInput = (e) => {
    emit(e.target.files)
    e.target.value = ''
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragEnter={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
        disabled
          ? 'cursor-not-allowed border-slate-800 opacity-50'
          : dragOver
            ? 'border-brand-500 bg-brand-500/10'
            : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={onInput}
      />
      <p className="text-sm font-medium text-white">
        Drag & drop {multiple ? 'files' : 'a file'} here
      </p>
      <p className="mt-2 text-xs text-slate-500">
        or click to browse · max 5MB per file
      </p>
      {names.length > 0 && (
        <ul className="mt-4 list-inside list-disc text-left text-xs text-slate-400">
          {names.map((n) => (
            <li key={n} className="truncate">
              {n}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
