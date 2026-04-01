import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-400">
          Document intelligence
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Convert, extract, and refine documents with{' '}
          <span className="text-brand-400">SmartDoc AI</span>
        </h1>
        <p className="mt-6 text-lg text-slate-400">
          PDF ↔ Word, images to PDF, plus AI summarization, grammar fixes, and
          Hindi–English translation — built for teams that ship fast.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700"
              >
                Create free account
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="mt-20 grid gap-6 sm:grid-cols-3">
        {[
          {
            title: 'Reliable conversions',
            body: 'PDF to Word, Word to PDF, and multi-image PDFs using sharp, pdf-lib, and mammoth.',
          },
          {
            title: 'AI-assisted workflows',
            body: 'Summaries, grammar cleanup, and translation powered by the OpenAI API.',
          },
          {
            title: 'Ready to monetize',
            body: 'JWT auth, rate limiting hooks, and a structure that welcomes Stripe or Razorpay later.',
          },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-left"
          >
            <h3 className="text-base font-semibold text-white">{c.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
