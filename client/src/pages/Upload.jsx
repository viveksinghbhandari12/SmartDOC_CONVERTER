import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import FileUpload from '../components/FileUpload.jsx'
import Loader from '../components/Loader.jsx'
import { api, parseBlobError, getApiErrorMessage } from '../services/api.js'

const JOBS = [
  { id: 'pdf-to-word', label: 'PDF → Word', multiple: false },
  { id: 'word-to-pdf', label: 'Word → PDF', multiple: false },
  { id: 'image-to-pdf', label: 'Images → PDF', multiple: true },
  { id: 'summarize', label: 'AI summarize', multiple: false },
  { id: 'grammar', label: 'AI grammar fix', multiple: false },
  { id: 'translate', label: 'AI translate (HI ↔ EN)', multiple: false },
]

async function postBlob(url, body) {
  const res = await api.post(url, body, {
    responseType: 'blob',
  })
  const ct = res.headers['content-type'] || ''
  if (ct.includes('application/json')) {
    const msg = await parseBlobError(res.data)
    throw new Error(msg)
  }
  return res.data
}

export default function Upload() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const initialJob = params.get('job') || 'pdf-to-word'

  const [job, setJob] = useState(
    JOBS.some((j) => j.id === initialJob) ? initialJob : 'pdf-to-word'
  )
  const [files, setFiles] = useState(null)
  const [text, setText] = useState('')
  const [translateDir, setTranslateDir] = useState('en-hi')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const q = params.get('job')
    if (q && JOBS.some((j) => j.id === q)) setJob(q)
  }, [params])

  const jobMeta = useMemo(() => JOBS.find((j) => j.id === job), [job])

  const accept = useMemo(() => {
    if (job === 'pdf-to-word') return '.pdf,application/pdf'
    if (job === 'word-to-pdf')
      return '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    if (job === 'image-to-pdf') return 'image/jpeg,image/png,image/webp'
    return '.pdf,.docx,image/jpeg,image/png,image/webp,application/pdf'
  }, [job])

  async function uploadToServer(file) {
    const fd = new FormData()
    fd.append('file', file)
    const { data } = await api.post('/api/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  }

  async function run() {
    setError('')
    setBusy(true)
    try {
      const aiJobs = job === 'summarize' || job === 'grammar' || job === 'translate'

      if (aiJobs) {
        let body = {}
        if (text.trim()) {
          body.text = text.trim()
        } else if (files) {
          const list = Array.isArray(files) ? files : [files]
          if (list.length !== 1) {
            throw new Error('AI jobs use one file or paste text.')
          }
          const up = await uploadToServer(list[0])
          body.storedName = up.storedName
          body.mimeType = up.mimeType
        } else {
          throw new Error('Add text or upload a file.')
        }

        if (job === 'translate') body.direction = translateDir

        const path =
          job === 'summarize'
            ? '/api/ai/summarize'
            : job === 'grammar'
              ? '/api/ai/grammar-fix'
              : '/api/ai/translate'

        const { data } = await api.post(path, body)
        const out =
          job === 'summarize' ? data.data.summary : data.data.text
        navigate('/result', {
          replace: false,
          state: {
            title:
              job === 'summarize'
                ? 'Summary'
                : job === 'grammar'
                  ? 'Grammar-fixed text'
                  : 'Translation',
            textContent: out,
          },
        })
        return
      }

      if (!files) throw new Error('Choose file(s) first.')

      if (job === 'image-to-pdf') {
        const list = Array.isArray(files) ? files : [files]
        if (!list.length) throw new Error('Select at least one image.')
        const names = []
        for (const f of list) {
          const up = await uploadToServer(f)
          names.push(up.storedName)
        }
        const blob = await postBlob(
          '/api/convert/image-to-pdf',
          { storedNames: names }
        )
        navigate('/result', {
          state: { title: 'PDF ready', blob, downloadName: 'images.pdf' },
        })
        return
      }

      const file = Array.isArray(files) ? files[0] : files
      const up = await uploadToServer(file)

      if (job === 'pdf-to-word') {
        const blob = await postBlob('/api/convert/pdf-to-word', {
          storedName: up.storedName,
        })
        const base = file.name.replace(/\.pdf$/i, '') || 'document'
        navigate('/result', {
          state: { title: 'Word document', blob, downloadName: `${base}.docx` },
        })
        return
      }

      if (job === 'word-to-pdf') {
        const blob = await postBlob('/api/convert/word-to-pdf', {
          storedName: up.storedName,
        })
        const base = file.name.replace(/\.docx$/i, '') || 'document'
        navigate('/result', {
          state: { title: 'PDF ready', blob, downloadName: `${base}.pdf` },
        })
      }
    } catch (e) {
      setError((await getApiErrorMessage(e)) || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-white">Upload & process</h1>
      <p className="mt-2 text-slate-400">
        Files are capped at 5MB. Authenticated requests only.
      </p>

      <div className="mt-8">
        <label className="text-xs font-medium text-slate-400">Workflow</label>
        <select
          value={job}
          onChange={(e) => {
            setJob(e.target.value)
            setFiles(null)
            setError('')
          }}
          className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-brand-500 focus:ring-2"
        >
          {JOBS.map((j) => (
            <option key={j.id} value={j.id}>
              {j.label}
            </option>
          ))}
        </select>
      </div>

      {job === 'translate' && (
        <div className="mt-4">
          <label className="text-xs font-medium text-slate-400">
            Direction
          </label>
          <select
            value={translateDir}
            onChange={(e) => setTranslateDir(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-brand-500 focus:ring-2"
          >
            <option value="en-hi">English → Hindi</option>
            <option value="hi-en">Hindi → English</option>
          </select>
        </div>
      )}

      {(job === 'summarize' || job === 'grammar' || job === 'translate') && (
        <div className="mt-6">
          <label className="text-xs font-medium text-slate-400">
            Optional: paste text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Paste content to process, or upload a file below…"
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-brand-500 focus:ring-2"
          />
        </div>
      )}

      <div className="mt-6">
        <label className="text-xs font-medium text-slate-400">
          {jobMeta?.multiple ? 'Images' : 'File'}
        </label>
        <div className="mt-2">
          <FileUpload
            accept={accept}
            multiple={!!jobMeta?.multiple}
            maxFiles={12}
            disabled={busy}
            onFilesChange={setFiles}
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={run}
        className="mt-8 w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {busy ? 'Processing…' : 'Run workflow'}
      </button>

      {busy && <Loader label="Processing on server…" />}
    </div>
  )
}
