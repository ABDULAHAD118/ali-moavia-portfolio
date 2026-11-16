# Civil Engineer Portfolio (Nuxt 4 + Three.js)

```bash
npm install
cp .env.example .env   # then set NUXT_ADMIN_TOKEN (your admin password)
npm run dev            # http://localhost:3000, admin at /admin
npm run build && node .output/server/index.mjs           # production
```

- Content lives in `.data/kv/portfolio.json` (Nitro storage), defaults in `shared/utils/portfolio.ts`.
- `/admin` edits every section; **Publish** writes to the server so all visitors see it.
- Without `NUXT_ADMIN_TOKEN` editing is disabled.
- Serverless hosts (Vercel/Netlify) have no persistent disk: point Nitro's `data` storage at a KV/Redis driver in `nuxt.config.ts` first.

## Admin

Open `/admin` and enter the value of `NUXT_ADMIN_TOKEN`. Edit any section, upload project photos, then press **Publish**.
