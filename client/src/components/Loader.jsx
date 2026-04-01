export default function Loader({ label = 'Working…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-slate-600 border-t-brand-500"
        aria-hidden
      />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}
