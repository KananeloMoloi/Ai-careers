# AI Career Navigator — Netlify deployment

## Deploy through GitHub

1. Upload the **contents** of this folder to your repository root (not the ZIP itself).
2. Import the repository in Netlify.
3. Use branch `main`, blank base directory, build command `npm run build`, publish directory `client/dist`, functions directory `netlify/functions`.
4. Add `GROQ_API_KEY` in Netlify project environment variables (scope: Functions). Optionally add `GROQ_MODEL` (default `llama-3.3-70b-versatile`). Do not commit any `.env` file.
5. Deploy, then check `/api/health` on your Netlify URL. It should return `{ "status": "ok" }`.
6. Upload a PDF and test the search and CV features. This requires a working Groq key, Groq availability, and any external job API availability.

The frontend is a Vite React app. Netlify builds its `index.html` into `client/dist/index.html`; **do not set publish directory to `public`**.

## Limitations

Netlify Functions have execution and request-size limits. Long AI calls or large PDF uploads may exceed those limits. The job search uses the Remotive API, which may return limited remote listings. This deployment does not guarantee comprehensive listings or successful AI calls under every load.

## Local development

Install dependencies with `npm install`, `npm install --prefix client`, and `npm install --prefix server`. Put your Groq key in `server/.env` (never commit it). Run `npm run dev`.

## Build troubleshooting
Netlify build command: `npm ci --prefix client && npm run build --prefix client`. This installs Vite and React in the client folder before running Vite. Set publish to `client/dist`.
