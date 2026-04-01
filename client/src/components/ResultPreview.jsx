import { triggerDownload } from '../utils/download.js'

export default function ResultPreview({
  title = 'Result',
  blob,
  downloadName,
  textContent,
  onReset,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>

      {textContent != null && (
        <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm text-slate-300">
          {textContent}
        </pre>
      )}

      {blob && downloadName && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => triggerDownload(blob, downloadName)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Download {downloadName}
          </button>
        </div>
      )}

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 text-sm text-slate-400 underline-offset-2 hover:text-white hover:underline"
        >
          Start over
        </button>
      )}
    </div>
  )
}
