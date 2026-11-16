<script setup lang="ts">
type FieldType = 'text' | 'area' | 'bool' | 'tags' | 'lines' | 'image'
type Field = [key: string, label: string, type?: FieldType]
type Key = keyof Portfolio

// One schema drives every form; add a field here and it appears in the editor.
const SCHEMA: Record<Key, { label: string, object?: true, fields: Field[] }> = {
  profile: { label: 'Profile', object: true, fields: [['name', 'Full name'], ['short', 'Short name (nav logo)'], ['role', 'Headline'], ['bio', 'Bio', 'area'], ['location', 'Location'], ['education', 'Education'], ['pec', 'PEC registration'], ['availability', 'Contact section text', 'area'], ['email', 'Email'], ['phone', 'Phone'], ['linkedin', 'LinkedIn URL']] },
  stats: { label: 'Hero stats', fields: [['value', 'Value'], ['label', 'Label']] },
  projects: { label: 'Projects', fields: [['title', 'Title'], ['image', 'Project photo', 'image'], ['status', 'Status tag'], ['done', 'Completed (grey tag)', 'bool'], ['employer', 'Employer'], ['role', 'Role'], ['scale', 'Scale / scope', 'area'], ['description', 'Description', 'area'], ['tags', 'Tags (comma separated)', 'tags']] },
  experience: { label: 'Experience', fields: [['when', 'Dates'], ['title', 'Position'], ['org', 'Company'], ['points', 'Bullet points (one per line)', 'lines']] },
  skills: { label: 'Expertise', fields: [['group', 'Group name'], ['items', 'Skills (comma separated)', 'tags']] },
  certs: { label: 'Certifications', fields: [['name', 'Name'], ['issuer', 'Issuer / type']] }
}

useHead({ title: 'Portfolio Admin', meta: [{ name: 'robots', content: 'noindex' }] })

const token = ref('')
const authed = ref(false)
const authError = ref('')
const data = ref<Portfolio>(structuredClone(DEFAULT_DATA))
const current = ref<Key>('profile')
const dirty = ref(false)
const status = ref('')
const headers = () => ({ 'x-admin-token': token.value })

async function login() {
  authError.value = ''
  try {
    await $fetch('/api/auth', { method: 'POST', headers: headers() })
    sessionStorage.setItem('admin-token', token.value)
    data.value = await $fetch<Portfolio>('/api/portfolio')
    authed.value = true
  } catch (e: any) { authError.value = e?.data?.statusMessage || 'Login failed' }
}
onMounted(() => { try { token.value = sessionStorage.getItem('admin-token') || '' } catch {} if (token.value) login() })

async function save() {
  status.value = 'Saving…'
  try {
    await $fetch('/api/portfolio', { method: 'PUT', body: data.value, headers: headers() })
    dirty.value = false; status.value = `Published ${new Date().toLocaleTimeString()}`
  } catch (e: any) { status.value = `Save failed: ${e?.data?.statusMessage || e.message}` }
}
const touch = () => { dirty.value = true; status.value = 'Unsaved changes' }
onBeforeRouteLeave(() => !dirty.value || confirm('You have unsaved changes. Leave anyway?'))

const list = computed(() => data.value[current.value] as any[])
const rows = computed(() => SCHEMA[current.value].object ? [data.value.profile] : list.value)

const uploading = ref('')
async function upload(obj: any, key: string, e: Event) {
  const input = e.target as HTMLInputElement, file = input.files?.[0]
  if (!file) return
  const fd = new FormData(); fd.append('file', file)
  uploading.value = key; status.value = 'Uploading image…'
  try {
    const { url } = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body: fd, headers: headers() })
    obj[key] = url; touch()
  } catch (err: any) { status.value = `Upload failed: ${err?.data?.statusMessage || err.message}` }
  finally { uploading.value = ''; input.value = '' }
}
const getVal = (obj: any, [k, , t]: Field) => t === 'tags' ? (obj[k] || []).join(', ') : t === 'lines' ? (obj[k] || []).join('\n') : obj[k] ?? ''
function setVal(obj: any, [k, , t]: Field, v: string) {
  obj[k] = t === 'tags' || t === 'lines' ? v.split(t === 'tags' ? ',' : '\n').map(s => s.trim()).filter(Boolean) : v
  touch()
}
function add() {
  list.value.unshift(Object.fromEntries(SCHEMA[current.value].fields.map(([k, , t]) => [k, t === 'bool' ? false : t === 'tags' || t === 'lines' ? [] : ''])))
  touch()
}
function move(i: number, d: number) { const a = list.value; [a[i], a[i + d]] = [a[i + d], a[i]]; touch() }
function remove(i: number) { if (confirm('Delete this entry?')) { list.value.splice(i, 1); touch() } }

function exportJson() {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([JSON.stringify(data.value, null, 2)], { type: 'application/json' })), download: 'portfolio-data.json' })
  a.click(); URL.revokeObjectURL(a.href)
}
function importJson() {
  const inp = Object.assign(document.createElement('input'), { type: 'file', accept: '.json,application/json' })
  inp.onchange = async () => {
    try {
      const parsed = JSON.parse(await inp.files![0]!.text())
      if (!isValidPortfolio(parsed)) throw new Error('missing sections')
      data.value = parsed; touch()
    } catch (e: any) { alert('Import failed: ' + e.message) }
  }
  inp.click()
}
function reset() { if (confirm('Replace all content with the defaults? (Not published until you press Publish.)')) { data.value = structuredClone(DEFAULT_DATA); touch() } }
function logout() { try { sessionStorage.removeItem('admin-token') } catch {} authed.value = false; token.value = '' }
</script>

<template>
  <div class="admin">
    <form v-if="!authed" class="login" @submit.prevent="login">
      <h1>Portfolio<b>.</b> admin</h1>
      <label>Admin token<input v-model="token" type="password" autocomplete="current-password" required></label>
      <button class="primary">Unlock</button>
      <p v-if="authError" class="err" role="alert">{{ authError }}</p>
    </form>

    <template v-else>
      <aside>
        <h1>Portfolio<b>.</b></h1>
        <p class="sub">Edit, then publish to the live site</p>
        <button v-for="(s, k) in SCHEMA" :key="k" :class="{ on: k === current }" @click="current = k">
          {{ s.label }}<em v-if="!s.object">{{ (data[k] as any[]).length }}</em>
        </button>
        <hr>
        <NuxtLink to="/" target="_blank">View live site ↗</NuxtLink>
        <button @click="exportJson">Export JSON</button>
        <button @click="importJson">Import JSON</button>
        <button @click="reset">Reset to defaults</button>
        <button @click="logout">Lock</button>
      </aside>

      <main>
        <header>
          <h2>{{ SCHEMA[current].label }}</h2>
          <span class="status" role="status">{{ status }}</span>
          <button class="primary" :disabled="!dirty" @click="save">Publish</button>
        </header>

        <button v-if="!SCHEMA[current].object" class="add" @click="add">+ Add {{ SCHEMA[current].label.toLowerCase() }} entry</button>
        <div v-for="(item, i) in rows" :key="i" class="item">
          <div v-if="!SCHEMA[current].object" class="item-h">
            <span>{{ String(i + 1).padStart(2, '0') }} · {{ item[SCHEMA[current].fields[0]![0]] || 'Untitled' }}</span>
            <button title="Move up" :disabled="i === 0" @click="move(i, -1)">↑</button>
            <button title="Move down" :disabled="i === list.length - 1" @click="move(i, 1)">↓</button>
            <button class="del" @click="remove(i)">Delete</button>
          </div>
          <template v-for="f in SCHEMA[current].fields" :key="f[0]">
            <label v-if="f[2] === 'bool'" class="chk"><input type="checkbox" :checked="item[f[0]]" @change="item[f[0]] = ($event.target as HTMLInputElement).checked; touch()">{{ f[1] }}</label>
            <div v-else-if="f[2] === 'image'" class="img-field">
              <span class="lbl">{{ f[1] }}</span>
              <div class="img-row">
                <img v-if="item[f[0]]" :src="item[f[0]]" alt="">
                <div v-else class="img-empty">No image</div>
                <div class="img-actions">
                  <label class="btn-file">{{ uploading === f[0] ? 'Uploading…' : item[f[0]] ? 'Replace image' : 'Upload image' }}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" :disabled="!!uploading" @change="upload(item, f[0], $event)">
                  </label>
                  <button v-if="item[f[0]]" class="del-img" @click="item[f[0]] = ''; touch()">Remove</button>
                  <input type="text" placeholder="…or paste an image URL" :value="item[f[0]] || ''" @input="setVal(item, f, ($event.target as HTMLInputElement).value)">
                  <small>JPG, PNG, WebP or GIF, max 5 MB</small>
                </div>
              </div>
            </div>
            <label v-else>{{ f[1] }}
              <textarea v-if="f[2] === 'area' || f[2] === 'lines'" :value="getVal(item, f)" @input="setVal(item, f, ($event.target as HTMLTextAreaElement).value)" />
              <input v-else type="text" :value="getVal(item, f)" @input="setVal(item, f, ($event.target as HTMLInputElement).value)">
            </label>
          </template>
        </div>
      </main>
    </template>
  </div>
</template>

<style scoped>
.admin{display:grid;grid-template-columns:250px 1fr;min-height:100vh;font-size:14px}
h1{font:800 1.3rem var(--wide);padding:0 10px 4px}h1 b{color:var(--vis)}
aside{background:#111214;border-right:1px solid var(--line);padding:22px 12px;position:sticky;top:0;height:100vh;overflow:auto}
.sub{font-size:.75rem;color:var(--mute);padding:0 10px 16px;margin-bottom:10px;border-bottom:1px solid var(--line)}
aside button,aside a{display:flex;justify-content:space-between;width:100%;padding:10px 12px;margin-bottom:2px;background:none;border:0;color:var(--mute);font:500 .85rem var(--mono);text-align:left;cursor:pointer;text-decoration:none;text-transform:uppercase;letter-spacing:.05em}
aside button:hover,aside a:hover{color:var(--ink);background:rgba(255,255,255,.04)}
aside button.on{color:#000;background:var(--vis)}
aside em{font-style:normal;font-size:.72rem}
hr{border:0;border-top:1px solid var(--line);margin:12px 0}
main{padding:24px 32px 60px;max-width:920px;width:100%}
header{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:16px;padding:12px 0 18px;background:var(--bg);flex-wrap:wrap}
header h2{font:400 2.4rem var(--display);text-transform:uppercase;margin-right:auto}
.status{font-size:.8rem;color:var(--mute)}
.primary{background:var(--vis);color:#000;border:0;padding:11px 22px;font:700 .8rem var(--mono);text-transform:uppercase;letter-spacing:.08em;cursor:pointer}
.primary:disabled{opacity:.35;cursor:default}
.item{background:#111214;border:1px solid var(--line);padding:18px;margin-bottom:14px}
.item-h{display:flex;align-items:center;gap:8px;margin-bottom:14px;font-weight:700}
.item-h span{margin-right:auto;color:var(--vis);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.item-h button,.add{background:none;border:1px solid var(--line);color:var(--mute);padding:4px 10px;cursor:pointer;font:inherit}
.item-h button:hover:not(:disabled){color:var(--ink);border-color:var(--mute)}
.item-h .del:hover{color:#ff6b6b!important;border-color:#ff6b6b!important}
.add{border-style:dashed;width:100%;padding:12px;margin-bottom:14px;color:var(--vis);border-color:var(--vis);text-transform:uppercase;letter-spacing:.06em}
label{display:block;margin-bottom:12px;font-size:.75rem;color:var(--mute);text-transform:uppercase;letter-spacing:.06em}
input[type=text],input[type=password],textarea{display:block;width:100%;margin-top:5px;padding:10px 12px;background:var(--bg);border:1px solid var(--line);color:var(--ink);font:400 .9rem var(--mono);text-transform:none;letter-spacing:0}
textarea{min-height:90px;resize:vertical}
input:focus,textarea:focus{outline:none;border-color:var(--vis)}
label.chk{display:flex;gap:8px;align-items:center}
.img-field{margin-bottom:14px}
.lbl{display:block;font-size:.75rem;color:var(--mute);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
.img-row{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap}
.img-row img,.img-empty{width:150px;aspect-ratio:4/3;object-fit:cover;border:1px solid var(--line);background:var(--bg)}
.img-empty{display:grid;place-items:center;font-size:.75rem;color:var(--mute)}
.img-actions{flex:1;min-width:220px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.img-actions input[type=text]{margin-top:0}
.img-actions small{color:var(--mute);font-size:.7rem}
.btn-file{margin:0;cursor:pointer;background:var(--vis);color:#000;padding:8px 14px;font-weight:700;font-size:.72rem}
.btn-file input{position:absolute;width:1px;height:1px;opacity:0}
.btn-file:focus-within{outline:2px solid var(--ink);outline-offset:2px}
.del-img{background:none;border:1px solid var(--line);color:var(--mute);padding:7px 12px;cursor:pointer;font:inherit;font-size:.75rem}
.del-img:hover{color:#ff6b6b;border-color:#ff6b6b}
.login{grid-column:1/-1;max-width:380px;margin:18vh auto 0;padding:0 20px;width:100%}
.login h1{padding:0 0 24px}
.err{color:#ff6b6b;margin-top:12px;font-size:.85rem}
@media(max-width:760px){.admin{grid-template-columns:1fr}aside{position:static;height:auto}main{padding:18px 16px}}
</style>
