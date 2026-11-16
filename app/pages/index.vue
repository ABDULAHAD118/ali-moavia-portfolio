<script setup lang="ts">
const { data } = await useFetch<Portfolio>('/api/portfolio', { default: () => DEFAULT_DATA })
const p = computed(() => data.value.profile)
const nameLines = computed(() => { const [first, ...rest] = p.value.name.split(' '); return [first, rest.join(' ')] })
const year = new Date().getFullYear()
const pad = (i: number) => String(i + 1).padStart(2, '0')
const safeUrl = (u: string) => /^https?:\/\//i.test(u) ? u : 'https://' + u.replace(/^\/+/, '')
const ticker = computed(() => data.value.skills.flatMap(s => s.items))

useHead({ title: () => `${p.value.name} | Civil Engineer` })
useSeoMeta({ description: () => p.value.bio })

// 3D tilt for cards (pointer position -> CSS custom properties)
function tilt(e: PointerEvent) {
  const c = e.currentTarget as HTMLElement, r = c.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
  c.style.setProperty('--ry', `${(x - 0.5) * 10}deg`); c.style.setProperty('--rx', `${(0.5 - y) * 10}deg`)
  c.style.setProperty('--mx', `${x * 100}%`); c.style.setProperty('--my', `${y * 100}%`)
}
function untilt(e: PointerEvent) { const c = e.currentTarget as HTMLElement; c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg') }

const reticle = ref<HTMLElement>()
onMounted(() => {
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { threshold: 0.12 })
  document.querySelectorAll('.reveal').forEach(el => io.observe(el))
  // Surveyor's crosshair cursor, mouse users only.
  if (matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
    document.documentElement.classList.add('has-reticle')
    addEventListener('pointermove', (e) => {
      document.documentElement.classList.add('reticle-on') // hidden until the mouse first moves
      reticle.value?.style.setProperty('transform', `translate(${e.clientX}px, ${e.clientY}px)`)
    })
    document.addEventListener('pointerleave', () => document.documentElement.classList.remove('reticle-on'))
  }
})
</script>

<template>
  <div>
    <SiteScene />
    <div ref="reticle" class="reticle" aria-hidden="true"><i /></div>
    <div class="sheet" aria-hidden="true">
      <div v-for="side in ['t', 'b']" :key="side" class="row" :class="side"><span v-for="c in 'ABCDEFGH'" :key="c">{{ c }}</span></div>
      <div v-for="side in ['l', 'r']" :key="side" class="col" :class="side"><span v-for="n in 6" :key="n">{{ n }}</span></div>
    </div>

    <nav aria-label="Main">
      <a href="#top" class="logo">{{ p.short || p.name }}<b>.</b></a>
      <a href="#projects">Projects</a><a href="#expertise">Expertise</a><a href="#experience">Experience</a><a href="#contact">Contact</a>
      <span class="status"><i />site_status: active</span>
    </nav>

    <header id="top" class="hero">
      <div class="hero-head wrap">
        <p class="brace">{ civil engineer · {{ p.location }} }</p>
        <h1><span>{{ nameLines[0] }}</span><span>{{ nameLines[1] }}</span></h1>
      </div>

      <div class="hero-foot wrap">
        <div class="intro">
          <p class="role">{{ p.role }}</p>
          <p class="lede">{{ p.bio }}</p>
          <div class="btns"><a class="btn vis" href="#projects">See my projects</a><a class="btn" href="#contact">Get in touch</a></div>
        </div>
        <p class="scroll">Scroll to walk the site ↓</p>
      </div>
    </header>

    <div class="ticker" aria-hidden="true"><div><span v-for="(t, i) in [...ticker, ...ticker]" :key="i">{{ t }} <b>◆</b></span></div></div>

    <section class="wrap stats reveal">
      <div v-for="s in data.stats" :key="s.label"><b>{{ s.value }}</b><span>{{ s.label }}</span></div>
    </section>

    <section id="projects" class="wrap">
      <h2 class="wide">Featured projects</h2>
      <div class="proj">
        <article v-for="(x, i) in data.projects" :key="x.title" class="card reveal" @pointermove="tilt" @pointerleave="untilt">
          <img v-if="x.image" class="shot" :src="x.image" :alt="x.title" loading="lazy">
          <div class="card-top"><span class="num">{{ pad(i) }}</span><span class="tag" :class="{ done: x.done }">{{ x.status }}</span></div>
          <h3>{{ x.title }}</h3>
          <dl>
            <template v-if="x.employer"><dt>Employer</dt><dd>{{ x.employer }}</dd></template>
            <template v-if="x.role"><dt>Role</dt><dd>{{ x.role }}</dd></template>
            <template v-if="x.scale"><dt>Scale</dt><dd>{{ x.scale }}</dd></template>
          </dl>
          <p>{{ x.description }}</p>
          <div v-if="x.tags?.length" class="chips"><span v-for="t in x.tags" :key="t">{{ t }}</span></div>
        </article>
      </div>
    </section>

    <section id="expertise" class="band vis-band">
      <div class="wrap">
        <h2 class="wide">Core expertise</h2>
        <div class="expertise">
          <div v-for="(s, i) in data.skills" :key="s.group" class="reveal">
            <span class="num">{{ pad(i) }}</span>
            <h3>{{ s.group }}</h3>
            <ul><li v-for="t in s.items" :key="t">{{ t }}</li></ul>
          </div>
        </div>
      </div>
    </section>

    <section id="experience" class="band concrete">
      <div class="wrap">
        <h2 class="chant">Built to spec.<br>Built to last.</h2>
        <details v-for="(e, i) in data.experience" :key="e.when + e.title" :open="i === 0" class="acc">
          <summary><span class="num">{{ pad(data.experience.length - 1 - i) }}</span><span class="t"><b>{{ e.title }}</b><small>{{ e.org }}</small></span><span class="when">{{ e.when }}</span></summary>
          <ul v-if="e.points?.length"><li v-for="t in e.points" :key="t">{{ t }}</li></ul>
          <p v-else class="none">Site engineering internship.</p>
        </details>
        <p class="edu">Education: {{ p.education }}<template v-if="p.pec"> · PEC registration {{ p.pec }}</template></p>
      </div>
    </section>

    <section id="certs" class="wrap">
      <h2 class="wide">Certifications</h2>
      <ul class="certs">
        <li v-for="(c, i) in data.certs" :key="c.name" class="reveal"><span class="num">{{ pad(i) }}</span>{{ c.name }}<small>{{ c.issuer }}</small></li>
      </ul>
    </section>

    <section id="contact" class="wrap contact reveal">
      <h2 class="chant">Let's build.</h2>
      <p class="brace">{ {{ p.availability }} }</p>
      <ul>
        <li v-if="p.email"><a :href="`mailto:${p.email}`">{{ p.email }}</a></li>
        <li v-if="p.phone"><a :href="`tel:${p.phone.replace(/[^\d+]/g, '')}`">{{ p.phone }}</a></li>
        <li v-if="p.linkedin"><a :href="safeUrl(p.linkedin)" rel="noopener">{{ p.linkedin.replace(/^https?:\/\//, '') }}</a></li>
        <li v-if="p.location">{{ p.location }}</li>
      </ul>
    </section>
    <footer class="wrap">
      <div class="titleblock">
        <div class="tb-wide"><small>Project</small>{{ p.name }} · Portfolio</div>
        <div><small>Discipline</small>Civil / Site Eng.</div>
        <div><small>Drawn by</small>{{ p.short || p.name }}</div>
        <div><small>Scale</small>NTS</div>
        <div><small>Drg no.</small>PF-{{ year }}-001</div>
        <div><small>Rev</small>{{ String.fromCharCode(64 + data.projects.length) }}</div>
      </div>
      <p>© {{ year }} {{ p.name }} · Drawn in Three.js · Not to scale</p>
    </footer>
  </div>
</template>

<style scoped>
.wrap{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:0 24px}
section{position:relative;z-index:1;padding:110px 24px 20px}
section.wrap{padding-left:24px;padding-right:24px}
.num{font:500 .8rem var(--mono);color:var(--vis);letter-spacing:.1em}
.wide{position:relative;font:700 clamp(2.4rem,6vw,4.6rem)/1 var(--wide);text-transform:uppercase;letter-spacing:.02em;margin-bottom:44px;padding-bottom:16px}
/* dimension line under section titles: |<------->| */
.wide::after{content:"";position:absolute;left:0;bottom:0;width:min(100%,520px);height:9px;
  background:linear-gradient(var(--vis),var(--vis)) 0 50%/100% 1px no-repeat,linear-gradient(var(--vis),var(--vis)) 0 0/1px 100% no-repeat,linear-gradient(var(--vis),var(--vis)) 100% 0/1px 100% no-repeat}
.vis-band .wide::after{--vis:#000}
.chant{font:400 clamp(3.2rem,11vw,9rem)/.9 var(--display);text-transform:uppercase;margin-bottom:48px}
.brace{color:var(--mute);letter-spacing:.06em}

/* nav */
nav{position:sticky;top:0;z-index:10;display:flex;gap:22px;align-items:center;flex-wrap:wrap;padding:16px 24px;font-size:.95rem;text-transform:uppercase;letter-spacing:.08em;
  background:linear-gradient(var(--bg) 40%,transparent);}
nav a{text-decoration:none;color:var(--mute)}nav a:hover{color:var(--vis)}
.logo{font:700 1.4rem var(--wide);color:var(--ink)!important;margin-right:auto;text-transform:uppercase;letter-spacing:.04em}
.logo b{color:var(--vis)}
.status{display:flex;align-items:center;gap:8px;color:var(--vis);font-size:.82rem}
.status i{width:7px;height:7px;background:var(--vis);border-radius:50%;animation:blink 1.4s infinite}
@keyframes blink{50%{opacity:.2}}
@media(max-width:700px){.status{display:none}}

/* hero: giant full-width name, intro bottom-left */
.hero{position:relative;z-index:1;min-height:100vh;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:10px 0 40px}
.hero-head{position:relative;z-index:2;width:100%;padding-top:3vh}
.hero .brace{font-size:clamp(1rem,1.2vw,1.2rem)}
.hero .wrap{max-width:none;padding:0 clamp(16px,2.5vw,40px)}
.hero h1{font:400 min(12vw,17rem)/.86 var(--display);white-space:nowrap;text-transform:uppercase;margin:14px 0 0}
.hero h1 span{display:block}
.hero h1 span:last-child{color:transparent;-webkit-text-stroke:2px var(--ink)}
.hero-foot{position:relative;z-index:4;width:100%;display:flex;justify-content:space-between;align-items:flex-end;gap:24px;pointer-events:none}
.hero-foot>*{pointer-events:auto}
.intro{max-width:720px;padding:16px 0;}
.role{font:600 clamp(1rem,1.25vw,1.25rem)/1.4 var(--mono);color:var(--vis);text-transform:uppercase;letter-spacing:.08em}
.lede{color:#c4c8cd;font-size:clamp(1rem,1.15vw,1.18rem);line-height:1.7;margin:14px 0 28px;text-shadow:0 2px 14px #000}
.btns{display:flex;gap:12px;flex-wrap:wrap}
.btn{display:inline-block;padding:18px 34px;border:1px solid var(--ink);text-decoration:none;font-weight:700;font-size:.95rem;text-transform:uppercase;letter-spacing:.1em;background:rgba(10,10,10,.6);transition:background .2s,color .2s}
.btn:hover{background:var(--ink);color:#000}
.btn.vis{background:var(--vis);border-color:var(--vis);color:#000}
.btn.vis:hover{background:var(--ink);border-color:var(--ink)}
.scroll{font-size:.85rem;letter-spacing:.2em;text-transform:uppercase;color:var(--mute);writing-mode:vertical-rl;padding-bottom:6px}

@media(max-width:900px){
  .hero{overflow:visible;min-height:auto;padding-bottom:20px}
  .hero h1{font-size:min(17vw,7rem);white-space:normal}
  .hero-foot{flex-direction:column;align-items:stretch}
  .intro{max-width:none}
  .scroll{writing-mode:horizontal-tb}
}

/* ticker */
.ticker{position:relative;z-index:1;overflow:hidden;background:var(--vis);color:#000;padding:20px 0;transform:rotate(-1.5deg) scale(1.03);font:700 .9rem var(--mono);text-transform:uppercase;letter-spacing:.08em}
.ticker div{display:flex;gap:28px;width:max-content;animation:marquee 40s linear infinite}
.ticker span{white-space:nowrap;display:flex;gap:28px}
@keyframes marquee{to{transform:translateX(-50%)}}

/* stats */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0;padding-top:90px}
.stats div{padding:18px 20px;border-left:1px solid var(--line)}
.stats b{display:block;font:400 clamp(2.8rem,5vw,4rem)/1 var(--display);color:var(--vis)}
.stats span{font-size:.8rem;color:var(--mute)}

/* projects: 3D tilt cards */
.proj{display:grid;gap:20px;perspective:1400px}
@media(min-width:800px){.proj{grid-template-columns:1fr 1fr}.proj .card:first-child{grid-column:1/-1}}
.card{position:relative;padding:28px;background:rgba(18,19,20,.78);backdrop-filter:blur(10px);border:1px solid var(--line);transform-style:preserve-3d;
  transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .15s ease-out,border-color .2s}
.card:hover{border-color:var(--vis)}
.card::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(245,228,0,.1),transparent 55%);opacity:0;transition:opacity .2s}
.card:hover::after{opacity:1}
.card>*{transform:translateZ(26px)}
.card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.tag{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:3px 10px;background:var(--vis);color:#000}
.tag.done{background:none;border:1px solid var(--line);color:var(--mute)}
.card h3{font:700 1.6rem/1.1 var(--wide);text-transform:uppercase;letter-spacing:.01em}
.card p{color:var(--mute);font-size:.88rem;margin-top:10px}
dl{display:grid;grid-template-columns:auto 1fr;gap:4px 16px;margin:16px 0;font-size:.85rem}
dt{color:var(--mute);text-transform:uppercase;font-size:.72rem;letter-spacing:.08em;padding-top:2px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:16px}
.chips span{font-size:.72rem;padding:3px 10px;border:1px solid var(--line);text-transform:uppercase;letter-spacing:.06em}

/* bands */
.band{padding:110px 0 90px;margin-top:110px}
.vis-band{background:var(--vis);color:#000}
.vis-band .num{color:#000}
.expertise{display:grid;gap:0;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));border-top:2px solid #000}
.expertise>div{padding:24px 24px 30px 0;border-bottom:2px solid #000}
.expertise h3{font:700 1.9rem/1.05 var(--wide);text-transform:uppercase;margin:10px 0 14px}
.expertise ul{padding:0;list-style:none;font-size:.88rem}
.expertise li::before{content:"→ "}
.concrete{background:var(--concrete);color:var(--dark);margin-top:0}
.concrete .num,.concrete .when{color:#8a6d00}
.acc{border-top:1px solid #b9b2a8}
.acc:last-of-type{border-bottom:1px solid #b9b2a8}
.acc summary{display:grid;grid-template-columns:48px 1fr auto;gap:16px;align-items:baseline;padding:22px 0;cursor:pointer;list-style:none}
.acc summary::-webkit-details-marker{display:none}
.acc summary .t b{display:block;font:700 1.5rem/1.15 var(--wide);text-transform:uppercase}
.acc summary small{color:#5b554d;font-size:.85rem}
.when{font-size:.8rem;font-weight:700;text-transform:uppercase;white-space:nowrap}
.acc ul,.acc .none{margin:0 0 24px 64px;color:#3d3832;font-size:.9rem}
@media(max-width:640px){.acc summary{grid-template-columns:36px 1fr}.acc summary .when{grid-column:2}.acc ul,.acc .none{margin-left:52px}}
.edu{margin-top:30px;font-size:.85rem;color:#5b554d}

/* certs */
.certs{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));border-top:1px solid var(--line)}
.certs li{padding:18px 18px 18px 0;border-bottom:1px solid var(--line);font-size:.92rem;background:rgba(10,10,10,.6)}
.certs .num{display:block;margin-bottom:4px}
.certs small{display:block;color:var(--mute);font-size:.78rem}

/* contact */
.contact{padding-top:130px}
.contact .chant{color:var(--vis);margin-bottom:24px}
.contact .brace{max-width:60ch;margin-bottom:30px}
.contact ul{list-style:none;padding:0;display:grid;gap:10px;font-size:clamp(1rem,2.4vw,1.4rem)}
.contact a{text-decoration-color:var(--vis);text-underline-offset:6px}
.contact a:hover{color:var(--vis)}
footer{padding-top:80px;padding-bottom:40px;font-size:.72rem;color:var(--mute);text-transform:uppercase;letter-spacing:.08em}
/* drawing-sheet title block */
.titleblock{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));border:2px solid var(--ink);margin-bottom:16px;background:rgba(10,10,10,.85)}
.titleblock div{padding:10px 12px;border:1px solid var(--line);color:var(--ink);font-size:.82rem}
.titleblock .tb-wide{grid-column:span 2;font:700 1.2rem var(--wide)}
.titleblock small{display:block;color:var(--mute);font:500 .62rem var(--mono);letter-spacing:.12em}
/* hazard tape edges */
.ticker::before,.ticker::after,.vis-band::before{content:"";position:absolute;left:0;right:0;height:7px;background:var(--hazard)}
.ticker::before{top:0}.ticker::after{bottom:0}
.vis-band{position:relative}.vis-band::before{top:0;height:12px;--vis:#f5e400}
/* images */
.shot{display:block;width:calc(100% + 56px);margin:-28px -28px 20px;aspect-ratio:16/8;object-fit:cover;filter:grayscale(.85);transition:filter .4s;border-bottom:1px solid var(--line)}
.card:hover .shot{filter:none}

/* reveal + cursor */
.reveal{opacity:0;transform:perspective(900px) translateY(40px) rotateX(10deg);transition:opacity .7s,transform .7s}
.reveal.in{opacity:1;transform:none}
.card.reveal.in{transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))}
@media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none}.card{transform:none}}
</style>
