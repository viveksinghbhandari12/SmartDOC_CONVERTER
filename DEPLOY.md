# Deploying SmartDoc AI

Stack: **Node (Express)** + **MySQL** + **React (Vite build)**.

---

## Option A — One server (simplest)

Build the UI, run the API; Express serves `client/dist` when `NODE_ENV=production` and the folder exists.

### 1. On the machine (VPS, EC2, etc.)

- Install **Node.js 20+** and **MySQL** (or use a **managed MySQL** host and allow that host’s IP).

### 2. Upload / clone the project

```bash
git clone <your-repo> smartdoc && cd smartdoc
```

### 3. Configure the API

```bash
cd server
cp .env.example .env
# Edit .env — required: JWT_SECRET, DB_* , CLIENT_ORIGIN
```

| Variable | Production |
|----------|------------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` (or your reverse proxy upstream port) |
| `JWT_SECRET` | Long random string (never commit) |
| `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Your MySQL |
| `OPENAI_API_KEY` | If you use AI routes |
| `CLIENT_ORIGIN` | **Public site URL**, e.g. `https://app.example.com` (scheme + host + port if any). Must match what users type in the browser. |
| `TRUST_PROXY` | `1` if Nginx/Cloudflare sits in front (recommended for correct IPs / rate limits) |

Run SQL from `server/database/init.sql` once if the DB is empty.

### 4. Build the client and install server deps

From the **repo root**:

```bash
npm run build
cd server && npm ci --omit=dev
```

### 5. Start

```bash
cd server
set NODE_ENV=production
npm start
```

On Linux/macOS:

```bash
cd server
NODE_ENV=production npm start
```

You should see: `SmartDoc AI (API + static client) listening on port 5000`.

Open `http://YOUR_SERVER_IP:5000` (or your domain via HTTPS below).

### 6. Process manager (recommended)

Use **PM2** so the API restarts if it crashes:

```bash
npm i -g pm2
cd server
NODE_ENV=production pm2 start server.js --name smartdoc
pm2 save && pm2 startup
```

### 7. HTTPS + Nginx (recommended)

- Terminate TLS in Nginx; proxy to `http://127.0.0.1:5000`.
- In `server/.env`: `TRUST_PROXY=1`, `CLIENT_ORIGIN=https://your-domain.com`.

Example Nginx server block:

```nginx
server {
  listen 443 ssl http2;
  server_name app.example.com;
  # ssl_certificate ... ssl_certificate_key ...

  location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 6m;
  }
}
```

`client_max_body_size` should be **above** your 5MB upload limit.

---

## Option B — Docker

From the **repo root** (create `server/.env` or pass env at run time):

```bash
docker build -t smartdoc-ai .
docker run --env-file server/.env -p 5000:5000 smartdoc-ai
```

Use a real MySQL instance (another container or managed DB); point `DB_HOST` at that host (not `localhost` from inside the container unless you use Docker networking).

---

## Option C — Split frontend and API

1. **Frontend:** Deploy `client/dist` to **Netlify / Vercel / Cloudflare Pages** (static).
2. **Build** with `VITE_API_URL=https://api.yourdomain.com` in `client/.env.production` (or host env in CI).
3. **Backend:** Run the **server** on a host with Node + MySQL; set `CLIENT_ORIGIN` to the **static site origin** (e.g. `https://app.yourdomain.com`).

---

## Checklist

- [ ] MySQL reachable from the API; `users` table exists.
- [ ] Strong `JWT_SECRET`; never commit `server/.env`.
- [ ] `CLIENT_ORIGIN` matches the browser URL (including `https` and `www` if used).
- [ ] HTTPS in production; `TRUST_PROXY=1` behind a reverse proxy.
- [ ] OpenAI key only on the server, not in the built frontend.

---

## Troubleshooting

| Issue | Hint |
|-------|------|
| Blank page / 404 on refresh | SPA fallback only runs when `client/dist` exists and `NODE_ENV=production` (or `SERVE_STATIC=1`). Re-run `npm run build` from repo root. |
| CORS errors | Fix `CLIENT_ORIGIN` to the exact frontend origin. |
| 502 behind Nginx | API not running or wrong `proxy_pass` port. |
| Upload fails | Increase Nginx `client_max_body_size`. |
