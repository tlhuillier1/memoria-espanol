/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { existsSync } from 'node:fs'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/**
 * Serves the Vercel functions of api/ during `npm run dev`, so no Vercel CLI is needed locally.
 * Same file routing as Vercel: /api/themes → api/themes.ts, /api/themes/<id> → api/themes/[id].ts.
 */
function apiFunctions(): Plugin {
  return {
    name: 'api-functions',
    configureServer(server) {
      // Server-side secrets (DATABASE_URL, TEACHER_PASSWORD…) from .env.local; never exposed to the browser.
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const [key, value] of Object.entries(env)) process.env[key] ??= value

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
        const parts = url.pathname.match(/^\/api\/([\w-]+)(?:\/([^/]+))?$/)
        const file = parts && (parts[2] ? `/api/${parts[1]}/[id].ts` : `/api/${parts[1]}.ts`)
        if (!file || !existsSync(`.${file}`)) return next()

        try {
          const module = await server.ssrLoadModule(file)
          const method = req.method ?? 'GET'
          const handler = module[method] as ((request: Request) => Response | Promise<Response>) | undefined
          if (!handler) {
            res.statusCode = 405
            return res.end()
          }
          const headers = new Headers()
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') headers.set(key, value)
          }
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const body = method === 'GET' || method === 'HEAD' ? undefined : Buffer.concat(chunks)

          const response = await handler(new Request(url, { method, headers, body }))
          res.statusCode = response.status
          response.headers.forEach((value, key) => {
            if (key !== 'set-cookie') res.setHeader(key, value)
          })
          const cookies = response.headers.getSetCookie()
          if (cookies.length > 0) res.setHeader('Set-Cookie', cookies)
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiFunctions()],
  // Relative base so the static build works from any sub-path; the API itself needs Vercel (api/).
  base: './',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
  },
})
