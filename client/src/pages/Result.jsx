import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ResultPreview from '../components/ResultPreview.jsx'

export default function Result() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state || {}

  useEffect(() => {
    if (!state.blob && state.textContent == null) {
      navigate('/upload', { replace: true })
    }
  }, [state.blob, state.textContent, navigate])

  if (!state.blob && state.textContent == null) {
    return null
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/upload"
        className="text-sm text-slate-400 hover:text-white hover:underline"
      >
        ← Back to upload
      </Link>
      <div className="mt-6">
        <ResultPreview
          title={state.title || 'Result'}
          blob={state.blob}
          downloadName={state.downloadName}
          textContent={state.textContent}
          onReset={() => navigate('/upload')}
        />
      </div>
    </div>
  )
}
