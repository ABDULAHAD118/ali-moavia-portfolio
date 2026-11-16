import fsDriver from 'unstorage/drivers/fs'
import upstashDriver from 'unstorage/drivers/upstash'

// Content + images: Upstash Redis when its env vars exist (Vercel), local files otherwise.
// Vercel's Upstash integration names them KV_REST_API_*; Upstash's own docs use UPSTASH_REDIS_REST_*.
export default defineNitroPlugin(() => {
  const env = process.env
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN
  const storage = useStorage()
  for (const [mount, dir] of [['portfolio', './.data/kv'], ['images', './.data/uploads']] as const) {
    storage.mount(mount, url && token ? upstashDriver({ url, token, base: `site:${mount}` }) : fsDriver({ base: dir }))
  }
})
