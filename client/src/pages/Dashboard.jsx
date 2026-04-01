import { Link } from 'react-router-dom'

const cards = [
  {
    title: 'PDF → Word',
    desc: 'Extract text and download an editable .docx.',
    to: '/upload?job=pdf-to-word',
    badge: 'Convert',
  },
  {
    title: 'Word → PDF',
    desc: 'Turn .docx into a print-ready PDF.',
    to: '/upload?job=word-to-pdf',
    badge: 'Convert',
  },
  {
    title: 'Images → PDF',
    desc: 'Merge JPG/PNG/WebP into one PDF.',
    to: '/upload?job=image-to-pdf',
    badge: 'Convert',
  },
  {
    title: 'Summarize',
    desc: 'Short, faithful summaries from your document text.',
    to: '/upload?job=summarize',
    badge: 'AI',
  },
  {
    title: 'Grammar fix',
    desc: 'Clean spelling and phrasing while keeping your voice.',
    to: '/upload?job=grammar',
    badge: 'AI',
  },
  {
    title: 'Translate',
    desc: 'Hindi ↔ English for pasted or uploaded text.',
    to: '/upload?job=translate',
    badge: 'AI',
  },
]

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-slate-400">
          Pick a workflow. Files are processed on the server and downloads are
          served directly to your browser.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-brand-500/40 hover:bg-slate-900"
          >
            <span className="inline-block rounded-full bg-brand-500/15 px-2 py-0.5 text-xs font-medium text-brand-300">
              {c.badge}
            </span>
            <h2 className="mt-3 text-lg font-semibold text-white group-hover:text-brand-200">
              {c.title}
            </h2>
            <p className="mt-2 text-sm text-slate-400">{c.desc}</p>
            <span className="mt-4 inline-flex text-sm font-medium text-brand-400">
              Start →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
