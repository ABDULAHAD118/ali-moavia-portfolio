# Civil Engineer Portfolio (Nuxt 4 + Three.js)

```bash
npm install
cp .env.example .env   # then set NUXT_ADMIN_TOKEN (your admin password)
npm run dev            # http://localhost:3000, admin at /admin
npm run build && node .output/server/index.mjs           # production
```

- Content and uploaded images: local files in `.data/` during development, Upstash Redis when deployed (see `server/plugins/storage.ts`). Defaults are in `shared/utils/portfolio.ts`.
- `/admin` edits every section; **Publish** writes to the server so all visitors see it.
- Without `NUXT_ADMIN_TOKEN` editing is disabled.

## Admin

Open `/admin` and enter the value of `NUXT_ADMIN_TOKEN`. Edit any section, upload project photos, then press **Publish**.

## Deploy to Vercel (free)

1. On vercel.com, **Add New → Project**, import this GitHub repo. Vercel detects Nuxt; keep the defaults.
2. Under **Environment Variables**, add `NUXT_ADMIN_TOKEN` = your admin password. Deploy.
3. In the project, open **Storage → Create → Upstash (Redis)**, pick the free plan and connect it to the project.
   This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
4. **Deployments → ⋯ → Redeploy** so the new variables are picked up.

Every push to `main` redeploys. Without step 3 the site still shows the default content, but Publish and uploads fail.
