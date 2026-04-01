import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_URL?.trim() || ''

export const api = axios.create({
  baseURL,
  timeout: 120_000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartdoc_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Parse error body when responseType is blob.
 */
export async function parseBlobError(blob) {
  try {
    const text = await blob.text()
    const j = JSON.parse(text)
    return j.error || j.message || 'Request failed'
  } catch {
    return 'Request failed'
  }
}

/**
 * Axios errors with responseType 'blob' still receive JSON error bodies as Blobs.
 */
export async function getApiErrorMessage(err) {
  if (!err?.response) {
    const net = err?.message?.trim()
    if (net === 'Network Error') {
      return 'Cannot reach the API. Start the server (server folder: npm run dev) and use the Vite dev server so /api is proxied, or set VITE_API_URL to your API base URL.'
    }
    return net || 'Network error'
  }
  const { data, status, headers } = err.response

  if (status === 502 || status === 503 || status === 504) {
    return 'Backend not reachable (bad gateway). Open another terminal, run: cd server → npm run dev, and wait until you see "listening on port 5000". Keep that terminal open. Use the React app via npm run dev in client (the dev server proxies /api to port 5000). If you use vite preview or a static host, set VITE_API_URL=http://localhost:5000 in client/.env.'
  }

  const ct = (headers?.['content-type'] || '').toLowerCase()
  if (data instanceof Blob) {
    if (ct.includes('application/json')) {
      const parsed = await parseBlobError(data)
      return parsed?.trim() || err.message || `Request failed (${status})`
    }
    return err.message?.trim() || `Request failed (${status})`
  }
  if (data && typeof data === 'object') {
    const fromApi = data.error ?? data.message
    if (fromApi != null && String(fromApi).trim()) {
      return String(fromApi).trim()
    }
  }
  if (typeof data === 'string' && data.trim()) {
    return data.trim()
  }
  const fallback = err.message?.trim() || `Request failed (${status})`
  return fallback || 'Request failed'
}
