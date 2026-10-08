(function(){
const { useState, useEffect, useRef } = React;
const html = htm.bind(React.createElement);

/* ---------- Fechas ---------- */
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const fromIso = (s) => { const p = String(s || '').split('-').map(Number); return new Date(p[0] || 2000, (p[1] || 1) - 1, p[2] || 1); };
const addD = (s, n) => { const d = fromIso(s); d.setDate(d.getDate() + n); return iso(d); };
const TODAY = iso(new Date());
const diff = (a, b) => Math.round((fromIso(a) - fromIso(b)) / 864e5);
const fmt = (s) => { if (!s) return '—'; const d = fromIso(s); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1); };
const fmtY = (s) => s ? fmt(s) + '/' + fromIso(s).getFullYear() : '—';
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_C = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
const capit = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const longDate = (s) => { const d = fromIso(s); return capit(DIAS[d.getDay()]) + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()]; };
const monIdx = (s) => (fromIso(s).getDay() + 6) % 7;
const rel = (at) => {
  const m = Math.round((Date.now() - at) / 60000);
  if (m < 1) return 'Recién';
  if (m < 60) return 'Hace ' + m + ' min';
  const d = new Date(at), hh = pad(d.getHours()) + ':' + pad(d.getMinutes()), di = diff(TODAY, iso(d));
  if (di === 0) return 'Hoy ' + hh;
  if (di === 1) return 'Ayer ' + hh;
  return fmt(iso(d)) + ' ' + hh;
};

/* ---------- Catálogos ---------- */
const ST = {
  sin: { l: 'Sin comenzar', bg: 'var(--s-sin-bg)', fg: 'var(--s-sin-fg)', dot: 'var(--s-sin-dot)', d: 'Está asignada y todavía no empezó.' },
  curso: { l: 'En curso', bg: 'var(--s-curso-bg)', fg: 'var(--s-curso-fg)', dot: 'var(--s-curso-dot)', d: 'Se está trabajando ahora.' },
  rev: { l: 'En revisión', bg: 'var(--s-rev-bg)', fg: 'var(--s-rev-fg)', dot: 'var(--s-rev-dot)', d: 'El trabajo está hecho y un administrador lo revisa.' },
  fin: { l: 'Terminado', bg: 'var(--s-fin-bg)', fg: 'var(--s-fin-fg)', dot: 'var(--s-fin-dot)', d: 'Está completa. Sale del calendario, pero queda guardada.' }
};
const SK = ['sin', 'curso', 'rev', 'fin'];
const PR = { baja: { l: 'Baja', c: 'var(--p-baja)', r: 1 }, media: { l: 'Media', c: 'var(--p-media)', r: 2 }, alta: { l: 'Alta', c: 'var(--p-alta)', r: 3 }, urg: { l: 'Urgente', c: 'var(--p-urg)', r: 4 } };
const PK = ['baja', 'media', 'alta', 'urg'];
const CST = { 'Activo': ['var(--s-fin-bg)', 'var(--s-fin-fg)'], 'En alta': ['var(--s-curso-bg)', 'var(--s-curso-fg)'], 'En clausura': ['var(--s-rev-bg)', 'var(--s-rev-fg)'], 'Inactivo': ['var(--s-sin-bg)', 'var(--s-sin-fg)'] };
const CSTATES = ['Activo', 'En alta', 'En clausura', 'Inactivo'];
const ROLE = { admin: 'Administrador/a', emp: 'Empleado/a' };
const ICON = {
  dash: 'M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z',
  cal: 'M5 6h14v14H5zM5 10h14M9 3v4M15 3v4',
  clientes: 'M5 20V5h9v15M14 9h5v11M8 8h3M8 12h3M8 16h3M3 20h18',
  proyectos: 'M3 7h6l2 2h10v10H3z',
  tareas: 'M10 6h10M10 12h10M10 18h10M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2',
  esp: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1-4 4-6 8-6s7 2 8 6',
  ayuda: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01',
  cfg: 'M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5',
  bell: 'M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9zM10 20a2 2 0 0 0 4 0',
  plus: 'M12 5v14M5 12h14',
  lock: 'M5 11h14v9H5zM8 11V8a4 4 0 0 1 8 0v3',
  x: 'M6 6l12 12M18 6L6 18',
  file: 'M7 3h7l5 5v13H7zM14 3v5h5',
  check: 'M5 12l5 5 9-10',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8v.01',
  left: 'M15 6l-6 6 6 6', right: 'M9 6l6 6-6 6',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c.8-3.5 3.5-5.5 7-5.5s6.2 2 7 5.5M16 3.5a4 4 0 0 1 0 7.5M18 15.5c2 .7 3.4 2.6 4 5.5'
};
const NAV = {
  admin: [['dash', 'Dashboard'], ['cal', 'Calendario'], ['clientes', 'Clientes'], ['proyectos', 'Proyectos'], ['tareas', 'Tareas'], ['ayuda', 'Ayuda'], ['cfg', 'Configuración']],
  emp: [['esp', 'Mi espacio'], ['tareas', 'Mis tareas'], ['cal', 'Mi calendario'], ['proyectos', 'Mis proyectos'], ['clientes', 'Clientes'], ['ayuda', 'Ayuda'], ['cfg', 'Configuración']]
};
const TOUR = {
  admin: [
    { screen: 'dash', target: 'stats', title: 'Tu panel de control', body: 'Acá ves cuántas tareas hay pendientes, cuáles vencen hoy y cuáles están atrasadas en todo el estudio. Tocá un número para ver esas tareas.' },
    { screen: 'clientes', target: 'cli', title: 'Clientes', body: 'Cargá a tus clientes y abrí la ficha de cada uno: datos de contacto, proyectos, tareas e historial.' },
    { screen: 'proyectos', target: 'projects', title: 'Proyectos', body: 'Un proyecto agrupa las tareas de un mismo trabajo para un cliente, como la liquidación mensual. Le asignás un responsable y la barra muestra el avance.' },
    { screen: 'tareas', target: 'newtask', title: 'Crear y asignar tareas', body: 'Con “Nueva tarea” definís qué hay que hacer, quién se encarga, para cuándo y con qué prioridad. Así avanza cada tarea:', flow: ['Crear', 'Asignar', 'Trabajar', 'Revisar', 'Terminar'] },
    { screen: 'cal', target: 'calTools', title: 'Calendario del estudio', body: 'Cambiá entre día, semana y mes, y filtrá por persona, cliente, proyecto o estado. Las tareas terminadas se ocultan, pero quedan guardadas.' },
    { screen: 'dash', target: 'overdue', title: 'Seguimiento', body: 'Las tareas atrasadas aparecen primero. Más abajo ves cuánto trabajo tiene cada persona y la actividad reciente.' },
    { screen: 'cfg', target: 'users', title: 'Equipo y permisos', body: 'Acá sumás a las personas del estudio y elegís su rol. También aprobás las solicitudes de acceso y cambiás el nombre del estudio.' }
  ],
  emp: [
    { screen: 'esp', target: 'stats', title: 'Este es tu espacio de trabajo', body: 'Acá ves tu avance y, debajo, tus tareas de hoy, las próximas y las atrasadas.' },
    { screen: 'tareas', target: 'table', title: 'Tus tareas', body: 'Acá aparecen solo las tareas que te asignaron. Abrí una para cambiar su estado, comentar o adjuntar archivos.' },
    { screen: 'tareas', target: 'center', title: 'Los estados de una tarea', body: 'Cada tarea pasa por cuatro etapas. Actualizala a medida que avanzás.', states: true },
    { screen: 'cal', target: 'calTools', title: 'Tu calendario', body: 'Muestra tus tareas pendientes según su vencimiento, por día, semana o mes. Las terminadas dejan de verse, pero quedan guardadas.' },
    { screen: 'esp', target: 'bell', title: 'Notificaciones', body: 'Te avisamos cuando te asignan una tarea, cuando algo está por vencer o cuando te devuelven una tarea con observaciones.' },
    { screen: 'esp', target: 'center', title: 'Cómo terminar una tarea', body: 'Así se cierra el ciclo de cada tarea:', flow: ['Abrís la tarea y la pasás a “En curso”', 'Hacés el trabajo y dejás comentarios o archivos', 'La pasás a “En revisión” para que la apruebe un administrador', 'Si no necesita revisión, la marcás como “Terminado”'] }
  ]
};
const FAQ = {
  admin: [
    ['¿Cómo sumo a alguien del equipo?', 'Primero compartí la app con su cuenta de Claude desde el botón Compartir, con permiso para editar. Cuando la abra, va a poder enviarte una solicitud de acceso que aprobás en Configuración › Equipo. Si trabajan en la misma organización de Claude, también podés buscarla con “Agregar integrante”.'],
    ['¿Cómo reasigno una tarea?', 'Abrí la tarea y elegí otra persona en “Responsable”, o usá “Editar”. El cambio queda en el historial y la persona recibe una notificación.'],
    ['¿Dónde veo las tareas terminadas?', 'En Tareas, filtrando por estado “Terminado”. No aparecen en el calendario, pero nunca se borran.'],
    ['¿Un empleado puede crear tareas?', 'No. Solo puede trabajar sobre las que tiene asignadas: cambiar el estado, editar la descripción, comentar y adjuntar archivos.'],
    ['¿Qué hago con una tarea “En revisión”?', 'Abrila y elegí “Aprobar” para cerrarla o “Devolver con observaciones” para que vuelva a “En curso”.'],
    ['¿Cómo cambio el nombre del estudio?', 'En Configuración › Estudio. El cambio se ve al instante para todo el equipo.']
  ],
  emp: [
    ['No veo una tarea que me pidieron.', 'Si todavía no está cargada a tu nombre, pedile a un administrador que la cree y te la asigne.'],
    ['¿Puedo cambiar el responsable o el cliente?', 'No. Esos datos los define un administrador. Vos podés cambiar el estado, editar la descripción, comentar y adjuntar archivos.'],
    ['Terminé una tarea, ¿por qué desapareció del calendario?', 'El calendario muestra solo lo pendiente. La tarea sigue guardada y la encontrás en Mis tareas, filtrando por “Terminado”.'],
    ['Me devolvieron una tarea, ¿qué hago?', 'Leé los comentarios, hacé los ajustes y volvé a pasarla a “En revisión”.']
  ]
};

/* ---------- Piezas ---------- */
const Icon = ({ d, s = 18, w = 1.8, style }) => html`<svg width=${s} height=${s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth=${w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style=${style}><path d=${d} /></svg>`;
const SB = ({ k }) => html`<span className="sb" style=${{ background: ST[k].bg, color: ST[k].fg }}>${ST[k].l}</span>`;
const PD = ({ k }) => html`<span className="pr"><span className="dot" style=${{ background: (PR[k] || PR.media).c }}></span>${(PR[k] || PR.media).l}</span>`;
const Tip = ({ label, text, right }) => html`<span className=${'tip' + (right ? ' r' : '')} tabIndex="0">${label} <${Icon} d=${ICON.info} s=${13} w=${2} /><span className="tb" role="tooltip">${text}</span></span>`;
const LockTip = ({ text }) => html`<span className="tip" tabIndex="0" aria-label="Campo bloqueado"><${Icon} d=${ICON.lock} s=${12} w=${2} /><span className="tb" role="tooltip">${text}</span></span>`;
const isLate = (t) => t.s !== 'fin' && t.due && diff(t.due, TODAY) < 0;
const dueInfo = (t) => {
  if (!t.due) return { text: 'Sin fecha', cls: 'due' };
  const dd = diff(t.due, TODAY);
  if (t.s === 'fin') return { text: fmt(t.due), cls: 'due' };
  if (dd === 0) return { text: 'Hoy', cls: 'due today' };
  if (dd === 1) return { text: 'Mañana', cls: 'due' };
  if (dd < 0) return { text: 'Venció ' + fmt(t.due), cls: 'due late' };
  return { text: fmt(t.due), cls: 'due' };
};
const byDue = (a, b) => String(a.due || '9').localeCompare(String(b.due || '9')) || (PR[b.pr] || PR.media).r - (PR[a.pr] || PR.media).r;
const byPr = (a, b) => (PR[b.pr] || PR.media).r - (PR[a.pr] || PR.media).r;
const hash = (s) => { let h = 0; const str = String(s || ''); for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return Math.abs(h); };
const AVS = ['var(--av1)', 'var(--av2)', 'var(--av3)', 'var(--av4)'];
const initials = (n) => (String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')) || '?';
const errMsg = (e) => {
  const c = e && e.code;
  if (c === 'quota_exceeded') return 'No hay más espacio para datos en esta app. Eliminá elementos que ya no uses y volvé a intentar.';
  if (c === 'revoked') return 'Se quitó tu acceso a esta app.';
  if (c === 'resource_exhausted') return 'Demasiados cambios seguidos. Esperá unos segundos y volvé a intentar.';
  return 'No se pudo guardar el cambio. Puede que tu cuenta no tenga permiso para editar o que haya un problema de conexión.';
};
const getCap = (n) => {
  try { if (window.claude && typeof window.claude.use === 'function') return window.claude.use(n).catch(() => null); } catch (e) {}
  return Promise.resolve(null);
};
const Logo = ({ name, size }) => html`<div className="logo" style=${size ? { width: size, height: size, borderRadius: size / 3.6, fontSize: size * 0.42 } : null}>${initials(name).slice(0, 1)}</div>`;
const Screen1 = ({ children }) => html`<div className="setup"><div className="box">${children}</div></div>`;

/* ---------- App ---------- */
function App() {
  const [cap, setCap] = useState(null);
  const [d, setD] = useState({});
  const [ui, setUi] = useState({
    screen: null, sel: null, modal: null, form: null, confirmDel: false,
    q: '', tSt: 'all', tOwn: 'all', group: 'none', sort: 'due', scope: null,
    calView: 'mes', calRef: TODAY, hideDone: true, fEmp: 'all', fCli: 'all', fPro: 'all', fSt: 'all',
    gq: '', notif: false, draft: '', faq: -1, sheet: false, cli: null, pro: null,
    phase: undefined, step: 0, busy: false, studioDraft: null
  });
  const [toast, setToast] = useState('');
  const [rect, setRect] = useState(null);
  const [comments, setComments] = useState([]);
  const [hits, setHits] = useState([]);
  const [fatal, setFatal] = useState('');
  const tRef = useRef(null);
  const ensured = useRef(false);
  const set = (p) => setUi((u) => Object.assign({}, u, typeof p === 'function' ? p(u) : p));
  const flash = (m) => { setToast(m); clearTimeout(tRef.current); tRef.current = setTimeout(() => setToast(''), 4500); };
  const run = async (fn, ok) => { try { await fn(); if (ok) flash(ok); return true; } catch (e) { flash(errMsg(e)); return false; } };

  /* arranque */
  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await Promise.all([getCap('db'), getCap('user'), getCap('assets')]);
      let me = null;
      if (r[1]) { try { me = await r[1].me(); } catch (e) { me = null; } }
      if (alive) setCap({ db: r[0], user: r[1], assets: r[2], me, myId: me && me.id, owner: !!(me && me.isOwner) });
    })();
    return () => { alive = false; };
  }, []);

  const db = cap && cap.db;
  const myId = cap && cap.myId;

  /* suscripciones */
  useEffect(() => {
    if (!db || !myId) return;
    const subs = [];
    const onErr = (e) => { if (e && e.code === 'revoked') setFatal('revoked'); };
    const put = (k, v) => setD((x) => Object.assign({}, x, { [k]: v, [k + 'L']: true }));
    const col = (key, q) => subs.push(q.onSnapshot((s) => put(key, s.docs.map((x) => Object.assign({ id: x.id }, x.data()))), onErr));
    try {
      subs.push(db.doc('config/estudio').onSnapshot((s) => put('config', s.exists ? s.data() : null), onErr));
      col('members', db.collection('members'));
      col('clients', db.collection('clients'));
      col('projects', db.collection('projects'));
      col('tasks', db.collection('tasks'));
      col('requests', db.collection('requests'));
      col('activity', db.collection('activity').orderBy('at', 'desc').limit(200));
      col('notifs', db.collection('notifs').where('to', '==', myId));
      subs.push(db.doc('data/users/' + myId + '/prefs').onSnapshot((s) => put('prefs', s.exists ? s.data() : {}), () => put('prefs', {})));
    } catch (e) { setFatal('error'); }
    return () => subs.forEach((u) => { try { u(); } catch (e) {} });
  }, [db, myId]);

  /* comentarios de la tarea abierta */
  useEffect(() => {
    setComments([]);
    if (!db || !ui.sel) return;
    let un = null;
    try { un = db.doc('tasks/' + ui.sel).collection('comments').onSnapshot((s) => setComments(s.docs.map((x) => Object.assign({ id: x.id }, x.data())).sort((a, b) => a.at - b.at)), () => {}); } catch (e) {}
    return () => { if (un) un(); };
  }, [db, ui.sel]);

  /* Escape */
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') set((u) => (u.phase ? {} : { sel: null, modal: null, notif: false, gq: '', sheet: false, confirmDel: false })); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);

  const members = d.members || [];
  const member = members.find((m) => m.id === myId) || null;
  const isA = !!cap && (cap.owner || (member && member.role === 'admin'));
  const role = isA ? 'admin' : 'emp';
  const steps = TOUR[role];
  const cur = steps[Math.min(ui.step, steps.length - 1)];

  /* el dueño siempre conserva su acceso de administrador */
  useEffect(() => {
    if (!db || !cap || !cap.owner || !d.config || !d.membersL || ensured.current) return;
    if (member && member.active !== false && member.role === 'admin') return;
    ensured.current = true;
    db.doc('members/' + myId).set({ name: (member && member.name) || (cap.me && cap.me.name) || 'Administrador/a', role: 'admin', active: true, addedAt: Date.now() }).catch(() => {});
  }, [db, cap, d.config, d.membersL, member]);

  /* primera visita: bienvenida */
  useEffect(() => {
    if (ui.phase !== undefined || !d.prefsL || !d.config || !(member || (cap && cap.owner))) return;
    set({ phase: d.prefs && d.prefs.seen ? null : 'welcome', screen: ui.screen || (isA ? 'dash' : 'esp') });
  }, [d.prefsL, d.config, member, cap]);

  /* tutorial: medir el elemento destacado */
  useEffect(() => {
    if (ui.phase !== 'steps' || cur.target === 'center') { setRect(null); return; }
    let first = true;
    const m = () => {
      const el = document.getElementById('tour-' + cur.target);
      if (!el) { setRect(null); return; }
      if (first) {
        first = false;
        const r0 = el.getBoundingClientRect();
        if (r0.top < 80 || r0.bottom > window.innerHeight - 40) el.scrollIntoView({ block: r0.height > window.innerHeight * 0.6 ? 'start' : 'center' });
      }
      const r = el.getBoundingClientRect();
      setRect({ x: r.left, y: r.top, w: r.width, h: r.height, vw: window.innerWidth, vh: window.innerHeight });
    };
    const raf = requestAnimationFrame(() => requestAnimationFrame(m));
    window.addEventListener('resize', m); window.addEventListener('scroll', m, true);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', m); window.removeEventListener('scroll', m, true); };
  }, [ui.phase, ui.step, ui.screen]);

  /* ---------- pantallas previas ---------- */
  const toastEl = toast && html`<div className="toast" role="status">${toast}</div>`;
  if (!cap) return html`<${Screen1}><div style=${{ textAlign: 'center', paddingTop: 40 }}><div className="spin"></div><p className="muted">Cargando el espacio de trabajo…</p></div><//>`;
  if (!db || !myId) return html`<${Screen1}>
    <${Logo} name="E" size=${52} />
    <h1>Abrí la app desde Claude</h1>
    <p className="muted" style=${{ lineHeight: 1.55 }}>Para entrar necesitás estar con tu sesión de Claude iniciada y abrir el enlace que te compartieron. Si ya lo hiciste, pedile al administrador del estudio que te comparta la app con permiso para editar.</p>
  <//>`;
  if (fatal) return html`<${Screen1}><h1>No se pudo cargar el estudio</h1><p className="muted">${fatal === 'revoked' ? 'Se quitó tu acceso a esta app. Si es un error, hablá con el administrador del estudio.' : 'Recargá la página para volver a intentar.'}</p><//>`;
  const loaded = d.configL && d.membersL && d.tasksL && d.clientsL && d.projectsL && d.prefsL;
  if (!loaded) return html`<${Screen1}><div style=${{ textAlign: 'center', paddingTop: 40 }}><div className="spin"></div><p className="muted">Cargando el espacio de trabajo…</p></div><//>`;

  const meName = (cap.me && cap.me.name) || '';

  /* configuración inicial */
  if (!d.config) {
    if (!cap.owner) return html`<${Screen1}><${Logo} name="E" size=${52} /><h1>El estudio todavía no está configurado</h1><p className="muted" style=${{ lineHeight: 1.55 }}>Quien creó esta app tiene que abrirla primero para ponerle nombre al estudio y crear su usuario de administrador. Después vas a poder pedir acceso desde acá.</p><//>`;
    const sd = ui.form || { studio: '', name: meName };
    const setF = (k, v) => set((u) => ({ form: Object.assign({}, u.form || { studio: '', name: meName }, { [k]: v }) }));
    const ok = sd.studio.trim() && sd.name.trim();
    const create = () => run(async () => {
      set({ busy: true });
      await db.doc('config/estudio').set({ name: sd.studio.trim(), createdAt: Date.now() });
      await db.doc('members/' + myId).set({ name: sd.name.trim(), role: 'admin', active: true, addedAt: Date.now() });
      ensured.current = true;
      set({ busy: false, form: null, screen: 'dash' });
    }, 'Espacio de trabajo creado.').then((r) => { if (!r) set({ busy: false }); });
    return html`<${Screen1}>
      <${Logo} name=${sd.studio || 'E'} size=${52} />
      <h1>Configurá tu estudio</h1>
      <p className="muted" style=${{ lineHeight: 1.55, marginBottom: 20 }}>Vas a ser el primer administrador. Después vas a poder sumar al resto del equipo y cambiar el nombre del estudio cuando quieras.</p>
      <div style=${{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label className="fld">Nombre del estudio<input className="inp" value=${sd.studio} onChange=${(e) => setF('studio', e.target.value)} placeholder="Ej.: Estudio Contable Rodríguez & Asociados" autoFocus /></label>
        <label className="fld">Tu nombre, como lo va a ver el equipo<input className="inp" value=${sd.name} onChange=${(e) => setF('name', e.target.value)} placeholder="Nombre y apellido" /></label>
        <button className="btn pri" style=${{ height: 46, marginTop: 6 }} disabled=${!ok || ui.busy} onClick=${create}>${ui.busy ? 'Creando…' : 'Crear espacio de trabajo'}</button>
      </div>
    <//>${toastEl}`;
  }
  const studio = d.config.name || 'Estudio';

  /* sin acceso: solicitud */
  if (!cap.owner && (!member || member.active === false)) {
    const myReq = (d.requests || []).find((r) => r.id === myId);
    const rd = ui.form || { name: meName };
    if (member && member.active === false) return html`<${Screen1}><${Logo} name=${studio} size=${52} /><h1>Tu acceso está desactivado</h1><p className="muted" style=${{ lineHeight: 1.55 }}>Un administrador de ${studio} desactivó tu usuario. Si creés que es un error, hablá con el estudio.</p><//>`;
    return html`<${Screen1}>
      <${Logo} name=${studio} size=${52} />
      <h1>${myReq ? 'Solicitud enviada' : 'Pedí acceso a ' + studio}</h1>
      ${myReq ? html`<p className="muted" style=${{ lineHeight: 1.55 }}>Cuando un administrador apruebe tu solicitud, esta pantalla se va a actualizar sola y vas a poder empezar a trabajar.</p>
          <button className="btn" style=${{ marginTop: 18 }} onClick=${() => run(() => db.doc('requests/' + myId).delete(), 'Solicitud cancelada.')}>Cancelar solicitud</button>`
        : html`<p className="muted" style=${{ lineHeight: 1.55, marginBottom: 18 }}>Todavía no formás parte del equipo en esta app. Enviá una solicitud y un administrador la va a aprobar.</p>
          <label className="fld">Tu nombre, como lo va a ver el equipo<input className="inp" value=${rd.name} onChange=${(e) => set({ form: { name: e.target.value } })} placeholder="Nombre y apellido" /></label>
          <button className="btn pri" style=${{ height: 46, marginTop: 14, width: '100%' }} disabled=${!rd.name.trim()} onClick=${() => run(() => db.doc('requests/' + myId).set({ name: rd.name.trim(), at: Date.now() }), 'Solicitud enviada.')}>Solicitar acceso</button>`}
    <//>${toastEl}`;
  }

  /* ---------- derivados ---------- */
  const me = member || { id: myId, name: meName || 'Administrador/a', role: 'admin' };
  const myName = me.name;
  const firstName = String(myName).split(' ')[0];
  const team = members.filter((m) => m.active !== false).sort((a, b) => String(a.name).localeCompare(String(b.name)));
  const mname = (id) => { const m = members.find((x) => x.id === id); return m ? m.name : 'Ex integrante'; };
  const av = (id, s) => { s = s || 28; const n = mname(id); return html`<span className="av" title=${n} style=${{ width: s, height: s, background: AVS[hash(id) % 4], fontSize: Math.round(s * 0.38) }}>${initials(n)}</span>`; };
  const clients = (d.clients || []).slice().sort((a, b) => String(a.n).localeCompare(String(b.n)));
  const projects = d.projects || [];
  const tasks = d.tasks || [];
  const cById = {}; clients.forEach((c) => { cById[c.id] = c; });
  const pById = {}; projects.forEach((p) => { pById[p.id] = p; });
  const cn = (t) => (cById[t.cId] || {}).n || 'Sin cliente';
  const pn = (t) => (pById[t.pId] || {}).p || 'Sin proyecto';

  const mine = tasks.filter((t) => isA || t.o === myId);
  const open = mine.filter((t) => t.s !== 'fin');
  const cnt = (k) => mine.filter((t) => t.s === k).length;
  const lateL = open.filter(isLate).sort(byDue);
  const todayL = open.filter((t) => t.due === TODAY).sort(byDue);
  const myClients = isA ? clients : clients.filter((c) => mine.some((t) => t.cId === c.id));
  const projTasks = (p) => tasks.filter((t) => t.pId === p.id);
  const myProjects = projects.filter((p) => isA || mine.some((t) => t.pId === p.id)).sort((a, b) => String(a.p).localeCompare(String(b.p)));
  const projStatus = (p) => {
    const ts = projTasks(p);
    if (!ts.length) return { l: 'Sin tareas', bg: 'var(--s-sin-bg)', fg: 'var(--s-sin-fg)' };
    if (ts.every((t) => t.s === 'fin')) return { l: 'Terminado', bg: ST.fin.bg, fg: ST.fin.fg };
    if (ts.some(isLate)) return { l: 'Con atrasos', bg: 'var(--s-late-bg)', fg: 'var(--s-late-fg)' };
    return { l: 'En curso', bg: ST.curso.bg, fg: ST.curso.fg };
  };
  const myNotifs = (d.notifs || []).slice().sort((a, b) => b.at - a.at);
  const unread = myNotifs.filter((n) => !n.read).length;
  const reminders = open.filter((t) => t.o === myId && t.due && diff(t.due, TODAY) <= 1).sort(byDue);
  const requests = isA ? (d.requests || []).filter((r) => !members.some((m) => m.id === r.id && m.active !== false)) : [];

  /* ---------- acciones ---------- */
  const go = (screen, extra) => { set(Object.assign({ screen, sel: null, notif: false, gq: '', modal: null, sheet: false }, extra || {})); window.scrollTo(0, 0); };
  const openTask = (id) => set({ sel: id, notif: false, gq: '', draft: '', confirmDel: false });
  const scopeTo = (cId, pId) => go('tareas', { scope: { cId, pId }, q: '', tSt: 'all', tOwn: 'all' });
  const logAct = (x, cId, k) => db.collection('activity').add({ at: Date.now(), x, cId: cId || '', k: k || '' }).catch(() => {});
  const notify = (to, x, task) => { if (to && to !== myId) db.collection('notifs').add({ to, x, task: task || null, at: Date.now(), read: false }).catch(() => {}); };
  const notifyAdmins = (x, task) => team.filter((m) => m.role === 'admin').forEach((m) => notify(m.id, x, task));
  const updTask = (t, patch, histX) => db.doc('tasks/' + t.id).update(Object.assign({}, patch, { mod: TODAY }, histX ? { hist: [{ d: TODAY, x: histX }].concat(t.hist || []).slice(0, 60) } : {}));
  const setStatus = (t, k, opt) => {
    if (t.s === k) return;
    opt = opt || {};
    run(async () => {
      await updTask(t, { s: k }, opt.hist || (myName + ' cambió el estado a “' + ST[k].l + '”.'));
      logAct(opt.act || (myName + ' pasó “' + t.n + '” a ' + ST[k].l), t.cId, k);
      if (!isA && k === 'rev') notifyAdmins(myName + ' envió “' + t.n + '” a revisión.', t.id);
      if (!isA && k === 'fin') notifyAdmins(myName + ' terminó “' + t.n + '”.', t.id);
      if (isA) notify(t.o, opt.note || (myName + ' cambió el estado de “' + t.n + '” a ' + ST[k].l + '.'), t.id);
    }, opt.msg || (k === 'fin' ? 'Tarea terminada. Ya no aparece en el calendario, pero queda guardada.' : 'Estado actualizado: ' + ST[k].l + '.'));
  };
  const markSeen = () => db.doc('data/users/' + myId + '/prefs').set(Object.assign({}, d.prefs || {}, { seen: true })).catch(() => {});
  const startTour = () => set({ phase: 'steps', step: 0, screen: steps[0].screen, sel: null, notif: false, modal: null, gq: '', sheet: false });
  const stepTo = (i) => { if (i < 0) return; if (i >= steps.length) { set({ phase: 'done' }); return; } set({ step: i, screen: steps[i].screen }); };
  const endTour = (skipped) => {
    markSeen();
    set({ phase: null, screen: isA ? 'dash' : 'esp' }); window.scrollTo(0, 0);
    if (skipped) flash('Tutorial omitido. Podés repetirlo cuando quieras desde Ayuda.');
  };

  /* ---------- filas ---------- */
  const TRow = (t, owner) => {
    const di = dueInfo(t);
    return html`<button key=${t.id} className="trow" onClick=${() => openTask(t.id)}>
      <span className="t ell"><b className="ell">${t.n}</b><span className="ell">${cn(t)} · ${pn(t)}</span></span>
      <span style=${{ display: 'flex', alignItems: 'center', gap: 10 }}>${owner !== false && av(t.o)}<${PD} k=${t.pr} /></span>
      <span className="r"><span className=${di.cls}>${di.text}</span><${SB} k=${t.s} /></span>
    </button>`;
  };
  const TaskList = (items, empty, owner) => html`${items.map((t) => TRow(t, owner))}${!items.length && empty && html`<p className="empty">${empty}</p>`}`;
  const Stats = (items) => html`<section id="tour-stats" className="stats" aria-label="Resumen">
    ${items.map((k) => html`<button key=${k.l} className="stat" onClick=${k.go}><span className="l"><span className="dot" style=${{ background: k.c }}></span>${k.l}</span><span className="v" style=${{ color: k.vc || 'var(--ink)' }}>${k.v}</span></button>`)}
  </section>`;
  const toT = (extra) => () => go('tareas', Object.assign({ scope: null, q: '', group: 'none', tOwn: 'all' }, extra));
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';

  /* ---------- formularios en blanco ---------- */
  const blankTask = (cId, pId) => {
    const c = cId || (clients[0] || {}).id || '';
    const p = pId || (projects.find((x) => x.cId === c) || {}).id || '';
    const o = (team.find((m) => m.role === 'emp') || team[0] || {}).id || myId;
    return { kind: 'task', id: null, n: '', cId: c, pId: p, o, start: TODAY, due: addD(TODAY, 7), pr: 'media', desc: '' };
  };
  const blankProj = (cId) => ({ kind: 'proj', id: null, p: '', cId: cId || (clients[0] || {}).id || '', o: (team[0] || {}).id || myId, start: TODAY, due: addD(TODAY, 30), pr: 'media', desc: '' });
  const blankClient = () => ({ kind: 'client', id: null, n: '', rut: '', contacto: '', tel: '', mail: '', dir: '', resp: (team[0] || {}).id || myId, st: 'Activo' });

  /* ---------- pantallas ---------- */
  const Dash = () => {
    const stats = [
      { l: 'Sin comenzar', v: cnt('sin'), c: ST.sin.dot, go: toT({ tSt: 'sin' }) },
      { l: 'Vencidas', v: lateL.length, c: 'var(--danger)', vc: lateL.length ? 'var(--danger)' : null, go: toT({ tSt: 'late' }) },
      { l: 'Para hoy', v: todayL.length, c: ST.rev.dot, go: () => go('cal', { calView: 'dia', calRef: TODAY }) },
      { l: 'En curso', v: cnt('curso'), c: ST.curso.dot, go: toT({ tSt: 'curso' }) },
      { l: 'En revisión', v: cnt('rev'), c: ST.rev.dot, go: toT({ tSt: 'rev' }) },
      { l: 'Terminadas', v: cnt('fin'), c: ST.fin.dot, go: toT({ tSt: 'fin' }) }
    ];
    const next = open.filter((t) => t.due && diff(t.due, TODAY) >= 0).sort(byDue).slice(0, 6);
    const first = [
      { l: 'Sumá a tu equipo', done: team.length > 1, go: () => go('cfg'), b: 'Ir a Equipo' },
      { l: 'Cargá tus clientes', done: clients.length > 0, go: () => set({ modal: 'form', form: blankClient() }), b: 'Nuevo cliente' },
      { l: 'Creá un proyecto', done: projects.length > 0, go: () => (clients.length ? set({ modal: 'form', form: blankProj() }) : flash('Primero cargá un cliente.')), b: 'Nuevo proyecto' },
      { l: 'Creá y asigná la primera tarea', done: tasks.length > 0, go: () => (projects.length ? set({ modal: 'form', form: blankTask() }) : flash('Primero creá un proyecto.')), b: 'Nueva tarea' }
    ];
    const pending = first.filter((x) => !x.done).length;
    return html`<div className="page">
      <div className="ph"><div><h1>${hello}, ${firstName}</h1><p>${longDate(TODAY)}. Así está ${studio} hoy.</p></div></div>
      ${requests.length > 0 && html`<section className="card" style=${{ overflow: 'hidden' }}><div className="card-h"><h2>Solicitudes de acceso</h2><button className="link" onClick=${() => go('cfg')}>Revisar en Equipo</button></div>
        ${requests.map((r) => html`<div key=${r.id} className="req"><b style=${{ flex: '1 1 200px' }}>${r.name || 'Alguien'} quiere sumarse al equipo</b><button className="btn sm" onClick=${() => go('cfg')}>Revisar</button></div>`)}</section>`}
      ${pending > 0 && html`<section className="card pad steps-card">
        <h2 style=${{ fontSize: 16 }}>Primeros pasos</h2><p className="muted" style=${{ margin: '4px 0 8px' }}>Te faltan ${pending} de 4 para dejar el estudio listo.</p>
        <ul>${first.map((x, i) => html`<li key=${i}><span className=${'ck' + (x.done ? ' done' : '')}>${x.done ? html`<${Icon} d=${ICON.check} s=${14} w=${2.6} />` : i + 1}</span><span style=${{ flex: 1, fontWeight: 600, color: x.done ? 'var(--muted)' : 'var(--ink)', textDecoration: x.done ? 'line-through' : 'none' }}>${x.l}</span>${!x.done && html`<button className="btn sm" onClick=${x.go}>${x.b}</button>`}</li>`)}</ul>
      </section>`}
      ${Stats(stats)}
      <div className="split">
        <div className="wide">
          <section id="tour-overdue" className="card" style=${{ overflow: 'hidden' }}>
            <div className="card-h late"><h2 style=${{ display: 'flex', alignItems: 'center', gap: 8 }}><${Icon} d=${ICON.clock} style=${{ color: 'var(--danger)' }} />Tareas atrasadas</h2><span className="pill">${lateL.length}</span></div>
            ${TaskList(lateL, 'No hay tareas atrasadas. Todo al día.')}
          </section>
          <section className="card" style=${{ overflow: 'hidden' }}>
            <div className="card-h"><h2>Próximos vencimientos</h2><button className="link" onClick=${toT({ tSt: 'all' })}>Ver todas</button></div>
            ${TaskList(next, 'No hay vencimientos próximos.')}
          </section>
        </div>
        <section className="narrow card pad">
          <h2 style=${{ fontSize: 16, marginBottom: 6 }}>Actividad reciente</h2>
          ${(d.activity || []).slice(0, 8).map((a) => html`<div key=${a.id} className="act"><span className="dot" style=${{ background: a.k && ST[a.k] ? ST[a.k].dot : 'var(--s-sin-dot)' }}></span><div><div>${a.x}</div><small>${rel(a.at)}${a.cId && cById[a.cId] ? ' · ' + cById[a.cId].n : ''}</small></div></div>`)}
          ${!(d.activity || []).length && html`<p className="muted">Acá vas a ver lo que va haciendo el equipo.</p>`}
        </section>
      </div>
      <section className="card pad">
        <div style=${{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <h2 style=${{ fontSize: 16 }}>Carga por persona</h2>
          <div className="legend">${SK.map((k) => html`<span key=${k}><i style=${{ background: ST[k].dot }}></i>${ST[k].l}</span>`)}</div>
        </div>
        ${team.map((p) => {
          const ts = tasks.filter((t) => t.o === p.id); const tot = ts.length || 1;
          const c = {}; SK.forEach((k) => { c[k] = ts.filter((t) => t.s === k).length; });
          const late = ts.filter(isLate).length;
          return html`<button key=${p.id} className="trow" style=${{ gridTemplateColumns: 'minmax(160px,220px) minmax(0,1fr) auto', padding: '12px 0', background: 'transparent' }} onClick=${() => go('tareas', { scope: null, q: '', tSt: 'all', tOwn: p.id, group: 'status' })}>
            <span style=${{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, minWidth: 0 }}>${av(p.id, 30)}<span className="ell">${p.name}</span></span>
            <span className="stack">${SK.map((k) => html`<span key=${k} style=${{ width: (c[k] / tot * 100) + '%', background: ST[k].dot }}></span>`)}</span>
            <span style=${{ fontSize: 13, color: 'var(--ink2)', whiteSpace: 'nowrap' }}>${c.sin + c.curso + c.rev} abiertas, ${c.fin} terminadas${late ? html`, <b style=${{ color: 'var(--danger)' }}>${late} atrasada${late > 1 ? 's' : ''}</b>` : ''}</span>
          </button>`;
        })}
      </section>
    </div>`;
  };

  const Esp = () => {
    const stats = [
      { l: 'Pendientes', v: cnt('sin'), c: ST.sin.dot, go: toT({ tSt: 'sin' }) },
      { l: 'En curso', v: cnt('curso'), c: ST.curso.dot, go: toT({ tSt: 'curso' }) },
      { l: 'En revisión', v: cnt('rev'), c: ST.rev.dot, go: toT({ tSt: 'rev' }) },
      { l: 'Terminadas', v: cnt('fin'), c: ST.fin.dot, go: toT({ tSt: 'fin' }) }
    ];
    const next = open.filter((t) => t.due && diff(t.due, TODAY) > 0).sort(byDue).slice(0, 5);
    return html`<div className="page">
      <div className="ph"><div><h1>Mi espacio · ${firstName}</h1><p>${longDate(TODAY)}. Esto es lo que tenés por delante.</p></div></div>
      ${Stats(stats)}
      <div className="split">
        <div className="wide">
          ${lateL.length > 0 && html`<section className="card" style=${{ overflow: 'hidden' }}>
            <div className="card-h late"><h2>Atrasadas</h2><span className="pill">${lateL.length}</span></div>${TaskList(lateL, '', false)}</section>`}
          <section className="card" style=${{ overflow: 'hidden' }}><div className="card-h"><h2>Hoy</h2></div>${TaskList(todayL, 'No tenés vencimientos hoy.', false)}</section>
          <section className="card" style=${{ overflow: 'hidden' }}><div className="card-h"><h2>Próximamente</h2><button className="link" onClick=${toT({ tSt: 'all' })}>Ver todas</button></div>${TaskList(next, mine.length ? 'No tenés tareas próximas.' : 'Todavía no tenés tareas asignadas. Cuando un administrador te asigne una, te va a llegar una notificación.', false)}</section>
        </div>
        <div className="narrow">
          <section className="card pad">
            <h2 style=${{ fontSize: 16, marginBottom: 12 }}>Acceso rápido</h2>
            <div className="quick">${[['tareas', 'Mis tareas'], ['cal', 'Mi calendario'], ['proyectos', 'Mis proyectos'], ['ayuda', 'Ayuda']].map((x) => html`<button key=${x[0]} onClick=${() => go(x[0])}><${Icon} d=${ICON[x[0]]} />${x[1]}</button>`)}</div>
          </section>
          <section className="card pad">
            <h2 style=${{ fontSize: 16, marginBottom: 4 }}>Mis proyectos</h2>
            ${myProjects.map((p) => { const ts = projTasks(p); const done = ts.filter((t) => t.s === 'fin').length; const pct = ts.length ? Math.round(done / ts.length * 100) : 0;
              return html`<button key=${p.id} className="trow" style=${{ display: 'block', padding: '10px 0', background: 'transparent' }} onClick=${() => go('proyecto', { pro: p.id })}>
                <b style=${{ display: 'block' }}>${p.p}</b><span style=${{ display: 'block', fontSize: 12, color: 'var(--muted)', margin: '2px 0 6px' }}>${(cById[p.cId] || {}).n || 'Sin cliente'} · ${done} de ${ts.length} completadas</span>
                <span className="bar" style=${{ height: 6 }}><span style=${{ width: pct + '%' }}></span></span></button>`; })}
            ${!myProjects.length && html`<p className="muted">Todavía no participás en ningún proyecto.</p>`}
          </section>
        </div>
      </div>
    </div>`;
  };

  const Tareas = () => {
    const q = ui.q.trim().toLowerCase();
    const list = mine.filter((t) =>
      (!q || (t.n + ' ' + cn(t) + ' ' + pn(t) + ' ' + mname(t.o)).toLowerCase().includes(q)) &&
      (!ui.scope || (t.cId === ui.scope.cId && (!ui.scope.pId || t.pId === ui.scope.pId))) &&
      (ui.tOwn === 'all' || t.o === ui.tOwn) &&
      (ui.tSt === 'all' || (ui.tSt === 'late' ? isLate(t) : t.s === ui.tSt))
    ).sort(ui.sort === 'prio' ? (a, b) => byPr(a, b) || byDue(a, b) : byDue);
    const keyOf = { owner: (t) => mname(t.o), status: (t) => t.s, client: cn, project: (t) => pn(t) + ' · ' + cn(t) }[ui.group];
    let groups;
    if (!keyOf) groups = [{ label: '', items: list }];
    else {
      const m = {}, order = [];
      list.forEach((t) => { const k = keyOf(t); if (!m[k]) { m[k] = []; order.push(k); } m[k].push(t); });
      if (ui.group === 'status') order.sort((a, b) => SK.indexOf(a) - SK.indexOf(b));
      groups = order.map((k) => ({ label: ui.group === 'status' ? ST[k].l : k, items: m[k] }));
    }
    const scopeLabel = ui.scope ? (ui.scope.pId ? ((pById[ui.scope.pId] || {}).p || 'Proyecto') + ' · ' : '') + ((cById[ui.scope.cId] || {}).n || 'Cliente') : '';
    return html`<div className="page">
      <div className="ph">
        <div><h1>${isA ? 'Tareas' : 'Mis tareas'}</h1><p>${isA ? 'Todas las tareas del estudio.' : 'Solo las tareas en las que figurás como responsable.'}</p></div>
        ${isA ? html`<div id="tour-newtask" style=${{ borderRadius: 12 }}><button className="btn pri" onClick=${() => (projects.length ? set({ modal: 'form', form: blankTask(ui.scope && ui.scope.cId, ui.scope && ui.scope.pId), confirmDel: false }) : flash('Para crear tareas, primero cargá un cliente y un proyecto.'))}><${Icon} d=${ICON.plus} s=${16} w=${2.2} />Nueva tarea</button></div>`
          : html`<div className="note"><${Icon} d=${ICON.lock} s=${16} style=${{ flex: 'none' }} />Las tareas nuevas las crea un administrador. Vos podés editar y avanzar las que te asignaron.</div>`}
      </div>
      <div className="tools">
        <div className="search"><label htmlFor="tq" className="sr">Buscar tareas</label><${Icon} d=${ICON.search} s=${15} w=${2} /><input id="tq" value=${ui.q} onChange=${(e) => set({ q: e.target.value })} placeholder="Buscar por tarea, cliente o proyecto" /></div>
        <label className="sel">Estado <select value=${ui.tSt} onChange=${(e) => set({ tSt: e.target.value })}><option value="all">Todos</option><option value="late">Atrasadas</option>${SK.map((k) => html`<option key=${k} value=${k}>${ST[k].l}</option>`)}</select></label>
        ${isA && html`<label className="sel">Responsable <select value=${ui.tOwn} onChange=${(e) => set({ tOwn: e.target.value })}><option value="all">Todo el equipo</option>${team.map((p) => html`<option key=${p.id} value=${p.id}>${p.id === myId ? p.name + ' (vos)' : p.name}</option>`)}</select></label>`}
        <label className="sel">Agrupar <select value=${ui.group} onChange=${(e) => set({ group: e.target.value })}><option value="none">Sin agrupar</option>${isA && html`<option value="owner">Responsable</option>`}<option value="status">Estado</option><option value="project">Proyecto</option><option value="client">Cliente</option></select></label>
        <label className="sel">Ordenar <select value=${ui.sort} onChange=${(e) => set({ sort: e.target.value })}><option value="due">Vencimiento</option><option value="prio">Prioridad</option></select></label>
        ${ui.scope && html`<span className="chipf">${scopeLabel}<button aria-label="Quitar filtro" onClick=${() => set({ scope: null })}>×</button></span>`}
      </div>
      <section id="tour-table" className="card" style=${{ overflow: 'hidden' }}>
        <div className="scroll"><div className="tbl">
          <div className="th"><span>Tarea</span><span>Cliente</span><span>Proyecto</span><${Tip} label="Responsable" text="Persona encargada de realizar la tarea." /><span>Vence</span><${Tip} label="Prioridad" text="Define qué tan urgente es completar esta tarea." /><${Tip} label="Estado" text="Indica en qué etapa se encuentra la tarea." right=${true} /></div>
          ${groups.map((g, gi) => html`<div key=${gi}>
            ${g.label && html`<div className="gh">${g.label} <span>· ${g.items.length}</span></div>`}
            ${g.items.map((t) => { const di = dueInfo(t); return html`<button key=${t.id} className="tr" onClick=${() => openTask(t.id)}>
              <b className="ell">${t.n}</b><span className="ell" style=${{ color: 'var(--ink2)' }}>${cn(t)}</span><span className="ell" style=${{ color: 'var(--ink2)' }}>${pn(t)}</span>
              <span style=${{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>${av(t.o, 26)}<span className="ell">${mname(t.o)}</span></span>
              <span className=${di.cls}>${di.text === 'Hoy' || di.text === 'Mañana' ? di.text : fmt(t.due)}</span><${PD} k=${t.pr} /><span><${SB} k=${t.s} /></span>
            </button>`; })}
          </div>`)}
        </div></div>
        ${!list.length && html`<div style=${{ padding: '44px 24px', textAlign: 'center' }}>
          ${mine.length ? html`<div style=${{ fontWeight: 700, fontSize: 16 }}>No hay tareas que coincidan</div><p className="muted" style=${{ margin: '6px 0 16px' }}>Probá con otra búsqueda o quitá los filtros.</p><button className="btn" onClick=${() => set({ scope: null, q: '', tSt: 'all', tOwn: 'all' })}>Limpiar filtros</button>`
            : html`<div style=${{ fontWeight: 700, fontSize: 16 }}>${isA ? 'Todavía no hay tareas' : 'Todavía no tenés tareas asignadas'}</div><p className="muted" style=${{ margin: '6px 0 0' }}>${isA ? 'Creá la primera con “Nueva tarea”. Antes necesitás al menos un cliente y un proyecto.' : 'Cuando un administrador te asigne una, va a aparecer acá y te va a llegar una notificación.'}</p>`}
        </div>`}
      </section>
    </div>`;
  };

  const Cal = () => {
    const base = mine.filter((t) => t.due && (!ui.hideDone || t.s !== 'fin') && (!isA || ui.fEmp === 'all' || t.o === ui.fEmp) && (ui.fCli === 'all' || t.cId === ui.fCli) && (ui.fPro === 'all' || t.pId === ui.fPro) && (ui.fSt === 'all' || t.s === ui.fSt));
    const on = (x) => base.filter((t) => t.due === x).sort(byPr);
    const ref = fromIso(ui.calRef);
    const shift = (n) => {
      if (ui.calView === 'mes') set({ calRef: iso(new Date(ref.getFullYear(), ref.getMonth() + n, 1)) });
      else set({ calRef: addD(ui.calRef, ui.calView === 'semana' ? 7 * n : n) });
    };
    const weekStart = addD(ui.calRef, -monIdx(ui.calRef));
    let label;
    if (ui.calView === 'mes') label = capit(MESES[ref.getMonth()]) + ' ' + ref.getFullYear();
    else if (ui.calView === 'semana') { const e = addD(weekStart, 6); label = 'Semana del ' + fromIso(weekStart).getDate() + ' de ' + MESES[fromIso(weekStart).getMonth()] + ' al ' + fromIso(e).getDate() + ' de ' + MESES[fromIso(e).getMonth()]; }
    else label = longDate(ui.calRef) + (ui.calRef === TODAY ? ' · Hoy' : '');
    const hidden = ui.hideDone ? mine.filter((t) => t.s === 'fin').length : 0;
    let body;
    if (ui.calView === 'mes') {
      const first = new Date(ref.getFullYear(), ref.getMonth(), 1);
      const off = (first.getDay() + 6) % 7;
      const dim = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
      const total = Math.ceil((off + dim) / 7) * 7;
      const cells = [];
      for (let i = 0; i < total; i++) { const x = new Date(ref.getFullYear(), ref.getMonth(), i - off + 1); cells.push({ d: iso(x), n: x.getDate(), out: x.getMonth() !== ref.getMonth() }); }
      body = html`<section className="card scroll"><div className="month">
        <div className="grid7">${DIAS_C.map((x) => html`<div key=${x} className="dh">${x}</div>`)}</div>
        <div className="grid7">${cells.map((c) => { const ts = on(c.d); return html`<div key=${c.d} className=${'cell' + (c.out ? ' out' : '')}>
          <button className=${'num' + (c.d === TODAY ? ' today' : '')} aria-label=${'Ver ' + longDate(c.d)} onClick=${() => set({ calView: 'dia', calRef: c.d })}>${c.n}</button>
          ${ts.slice(0, 3).map((t) => html`<button key=${t.id} className="cchip" title=${t.n + ' · ' + mname(t.o) + ' · ' + cn(t) + ' · ' + ST[t.s].l} style=${{ background: ST[t.s].bg, color: ST[t.s].fg }} onClick=${() => openTask(t.id)}><b>${initials(mname(t.o))}</b> ${t.n}</button>`)}
          ${ts.length > 3 && html`<button className="more" onClick=${() => set({ calView: 'dia', calRef: c.d })}>+${ts.length - 3} más</button>`}
        </div>`; })}</div>
      </div></section>`;
    } else if (ui.calView === 'semana') {
      body = html`<section className="card scroll"><div className="week">${[0, 1, 2, 3, 4, 5, 6].map((i) => { const x = addD(weekStart, i); return html`<div key=${x} className="wcol">
        <div className=${'whead' + (x === TODAY ? ' today' : '')}><small>${DIAS_C[i]}</small><b>${fromIso(x).getDate()}</b></div>
        <div style=${{ padding: 10 }}>${on(x).map((t) => html`<button key=${t.id} className="wcard" onClick=${() => openTask(t.id)}>
          <b style=${{ display: 'block', fontSize: 13, lineHeight: 1.3 }}>${t.n}</b><span style=${{ display: 'block', fontSize: 12, color: 'var(--muted)', margin: '3px 0 8px' }}>${cn(t)}</span>
          <span style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>${av(t.o, 24)}<${SB} k=${t.s} /></span></button>`)}</div>
      </div>`; })}</div></section>`;
    } else body = html`<section className="card" style=${{ overflow: 'hidden' }}>${TaskList(on(ui.calRef), 'No hay tareas para este día con los filtros actuales.')}</section>`;
    return html`<div className="page">
      <div className="ph"><div><h1>${isA ? 'Calendario del estudio' : 'Mi calendario'}</h1><p>${isA ? 'Cada tarea aparece el día en que vence.' : 'Tus tareas pendientes, según su vencimiento.'}</p></div></div>
      <section id="tour-calTools" className="card" style=${{ padding: 12, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <div className="seg" role="group" aria-label="Vista">${[['dia', 'Día'], ['semana', 'Semana'], ['mes', 'Mes']].map((v) => html`<button key=${v[0]} aria-pressed=${ui.calView === v[0] ? 'true' : 'false'} onClick=${() => set({ calView: v[0] })}>${v[1]}</button>`)}</div>
        <div style=${{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="iconbtn ghost" aria-label="Anterior" onClick=${() => shift(-1)}><${Icon} d=${ICON.left} /></button>
          <button className="btn sm" onClick=${() => set({ calRef: TODAY })}>Hoy</button>
          <button className="iconbtn ghost" aria-label="Siguiente" onClick=${() => shift(1)}><${Icon} d=${ICON.right} /></button>
          <b style=${{ fontSize: 15, marginLeft: 6 }}>${label}</b>
        </div>
        <div style=${{ flex: 1 }}></div>
        ${isA && html`<label className="sel">Persona <select value=${ui.fEmp} onChange=${(e) => set({ fEmp: e.target.value })}><option value="all">Todo el equipo</option>${team.map((p) => html`<option key=${p.id} value=${p.id}>${p.name}</option>`)}</select></label>`}
        <label className="sel">Cliente <select value=${ui.fCli} onChange=${(e) => set({ fCli: e.target.value })} style=${{ maxWidth: 190 }}><option value="all">Todos</option>${myClients.map((c) => html`<option key=${c.id} value=${c.id}>${c.n}</option>`)}</select></label>
        <label className="sel">Proyecto <select value=${ui.fPro} onChange=${(e) => set({ fPro: e.target.value })} style=${{ maxWidth: 190 }}><option value="all">Todos</option>${myProjects.map((p) => html`<option key=${p.id} value=${p.id}>${p.p} · ${(cById[p.cId] || {}).n || ''}</option>`)}</select></label>
        <label className="sel">Estado <select value=${ui.fSt} onChange=${(e) => set({ fSt: e.target.value })}><option value="all">Todos</option>${SK.filter((k) => !ui.hideDone || k !== 'fin').map((k) => html`<option key=${k} value=${k}>${ST[k].l}</option>`)}</select></label>
        <label style=${{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked=${ui.hideDone} onChange=${() => set({ hideDone: !ui.hideDone, fSt: 'all' })} style=${{ width: 18, height: 18, accentColor: 'var(--accent)' }} />Ocultar tareas terminadas</label>
      </section>
      ${body}
      <div className="legend">${SK.map((k) => html`<span key=${k}><i style=${{ background: ST[k].bg, border: '1px solid ' + ST[k].dot }}></i>${ST[k].l}</span>`)}
        ${hidden > 0 && html`<span className="muted">${hidden} ${hidden === 1 ? 'tarea terminada oculta' : 'tareas terminadas ocultas'} (siguen guardadas en Tareas)</span>`}</div>
    </div>`;
  };

  const cliCols = { gridTemplateColumns: 'minmax(220px,2fr) 150px minmax(160px,1.3fr) 120px 120px 120px' };
  const Clientes = () => html`<div className="page">
    <div className="ph"><div><h1>Clientes</h1><p>${isA ? 'Todos los clientes del estudio.' : 'Solo los clientes vinculados a tus tareas.'}</p></div>
      ${isA && html`<button className="btn pri" onClick=${() => set({ modal: 'form', form: blankClient(), confirmDel: false })}><${Icon} d=${ICON.plus} s=${16} w=${2.2} />Nuevo cliente</button>`}</div>
    <section id="tour-cli" className="card" style=${{ overflow: 'hidden' }}>
      <div className="scroll"><div style=${{ minWidth: 860 }}>
        <div className="th" style=${cliCols}><span>Cliente</span><span>RUT</span><span>Responsable</span><span>Proy. activos</span><span>Pendientes</span><span>Estado</span></div>
        ${myClients.map((c) => {
          const act = projects.filter((p) => p.cId === c.id && projTasks(p).some((t) => t.s !== 'fin')).length;
          const pend = tasks.filter((t) => t.cId === c.id && t.s !== 'fin' && (isA || t.o === myId)).length;
          const cs = CST[c.st] || CST.Activo;
          return html`<button key=${c.id} className="tr" style=${cliCols} onClick=${() => go('cliente', { cli: c.id })}>
            <span style=${{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, minWidth: 0 }}><span className="av" style=${{ width: 32, height: 32, borderRadius: 8, background: 'var(--chip)', fontSize: 12 }}>${initials(c.n)}</span><span className="ell">${c.n}</span></span>
            <span style=${{ color: 'var(--ink2)', fontVariantNumeric: 'tabular-nums' }}>${c.rut || '—'}</span><span className="ell" style=${{ color: 'var(--ink2)' }}>${c.resp ? mname(c.resp) : '—'}</span>
            <b>${act}</b><b>${pend}</b><span><span className="sb" style=${{ background: cs[0], color: cs[1] }}>${c.st || 'Activo'}</span></span>
          </button>`; })}
      </div></div>
      ${!myClients.length && html`<div style=${{ padding: '40px 24px', textAlign: 'center' }}><div style=${{ fontWeight: 700, fontSize: 16 }}>${isA ? 'Todavía no cargaste clientes' : 'Todavía no tenés clientes asignados'}</div><p className="muted" style=${{ marginTop: 6 }}>${isA ? 'Empezá con “Nuevo cliente”: nombre, RUT y datos de contacto.' : 'Vas a ver acá los clientes de las tareas que te asignen.'}</p></div>`}
    </section>
  </div>`;

  const Denied = () => html`<div className="page"><section className="card pad" style=${{ textAlign: 'center', padding: '48px 24px' }}>
    <div style=${{ display: 'inline-flex', width: 52, height: 52, borderRadius: 26, background: 'var(--chip)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><${Icon} d=${ICON.lock} s=${22} /></div>
    <h1 style=${{ fontSize: 20 }}>No tenés acceso a esta sección</h1>
    <p className="muted" style=${{ margin: '8px auto 18px', maxWidth: 420 }}>Solo ves la información vinculada a tus tareas, o el elemento ya no existe. Si necesitás acceso, pedíselo a un administrador.</p>
    <button className="btn pri" onClick=${() => go(isA ? 'dash' : 'esp')}>Volver al inicio</button></section></div>`;

  const PCard = (p) => {
    const ts = projTasks(p); const done = ts.filter((t) => t.s === 'fin').length; const pct = ts.length ? Math.round(done / ts.length * 100) : 0; const st = projStatus(p);
    return html`<button key=${p.id} className="pcard" onClick=${() => go('proyecto', { pro: p.id })}>
      <span style=${{ display: 'flex', justifyContent: 'space-between', gap: 8, width: '100%' }}><span style=${{ minWidth: 0 }}><b style=${{ display: 'block', fontSize: 15 }}>${p.p}</b><span className="muted" style=${{ fontSize: 13 }}>${(cById[p.cId] || {}).n || 'Sin cliente'}</span></span><span className="sb" style=${{ background: st.bg, color: st.fg, alignSelf: 'flex-start' }}>${st.l}</span></span>
      <span style=${{ width: '100%' }}><span style=${{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink2)', marginBottom: 6 }}><span>${done} de ${ts.length} tareas completadas</span><b>${pct}%</b></span><span className="bar"><span style=${{ width: pct + '%' }}></span></span></span>
      <span style=${{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 13, color: 'var(--ink2)', gap: 8 }}><span style=${{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>${av(p.o, 24)}<span className="ell">${mname(p.o)}</span></span><span style=${{ whiteSpace: 'nowrap' }}>Vence ${fmt(p.due)}</span></span>
    </button>`;
  };

  const Cliente = () => {
    const c = cById[ui.cli];
    if (!c || !myClients.includes(c)) return Denied();
    const ts = mine.filter((t) => t.cId === c.id).sort(byDue);
    const pjs = myProjects.filter((p) => p.cId === c.id);
    const acts = (d.activity || []).filter((a) => a.cId === c.id).slice(0, 10);
    const cs = CST[c.st] || CST.Activo;
    return html`<div className="page">
      <div><div className="crumbs"><button onClick=${() => go('clientes')}>Clientes</button>›<span>${c.n}</span></div>
        <div className="ph"><div><h1>${c.n}</h1><p>${c.rut ? 'RUT ' + c.rut : 'Sin RUT cargado'}</p></div>
          <div style=${{ display: 'flex', gap: 8, alignItems: 'center' }}><span className="sb" style=${{ background: cs[0], color: cs[1] }}>${c.st || 'Activo'}</span>${isA && html`<button className="btn" onClick=${() => set({ modal: 'form', form: Object.assign({ kind: 'client' }, c), confirmDel: false })}>Editar</button>`}</div></div></div>
      <section className="card pad"><div className="kv">
        ${[['Contacto', c.contacto], ['Teléfono', c.tel], ['Email', c.mail], ['Dirección', c.dir], ['Responsable', c.resp ? mname(c.resp) : '']].map((x) => html`<div key=${x[0]}><small>${x[0]}</small><span style=${{ wordBreak: 'break-word' }}>${x[1] || '—'}</span></div>`)}
      </div></section>
      <div className="split">
        <div className="wide">
          <section className="card pad">
            <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><h2 style=${{ fontSize: 16 }}>Proyectos</h2>${isA && html`<button className="btn sm" onClick=${() => set({ modal: 'form', form: blankProj(c.id), confirmDel: false })}><${Icon} d=${ICON.plus} s=${15} w=${2.2} />Nuevo proyecto</button>`}</div>
            <div className="pgrid">${pjs.map((p) => PCard(p))}</div>
            ${!pjs.length && html`<p className="muted">Este cliente todavía no tiene proyectos.</p>`}
          </section>
          <section className="card" style=${{ overflow: 'hidden' }}>
            <div className="card-h"><h2>${isA ? 'Tareas' : 'Mis tareas de este cliente'}</h2>${ts.length > 0 && html`<button className="link" onClick=${() => scopeTo(c.id, null)}>Ver en Tareas</button>`}</div>
            ${TaskList(ts, 'No hay tareas para este cliente.')}
          </section>
        </div>
        <section className="narrow card pad"><h2 style=${{ fontSize: 16, marginBottom: 6 }}>Historial</h2>
          ${acts.map((a) => html`<div key=${a.id} className="act"><span className="dot" style=${{ background: a.k && ST[a.k] ? ST[a.k].dot : 'var(--s-sin-dot)' }}></span><div><div>${a.x}</div><small>${rel(a.at)}</small></div></div>`)}
          ${!acts.length && html`<p className="muted">Todavía no hay actividad registrada.</p>`}
        </section>
      </div>
    </div>`;
  };

  const Proyectos = () => html`<div className="page">
    <div className="ph"><div><h1>${isA ? 'Proyectos' : 'Mis proyectos'}</h1><p>Cada proyecto agrupa las tareas de un trabajo para un cliente.</p></div>
      ${isA && html`<button className="btn pri" onClick=${() => (clients.length ? set({ modal: 'form', form: blankProj(), confirmDel: false }) : flash('Primero cargá un cliente.'))}><${Icon} d=${ICON.plus} s=${16} w=${2.2} />Nuevo proyecto</button>`}</div>
    <section id="tour-projects" className="pgrid" style=${{ minHeight: 60 }}>${myProjects.map((p) => PCard(p))}</section>
    ${!myProjects.length && html`<section className="card pad" style=${{ textAlign: 'center', padding: '40px 24px' }}><div style=${{ fontWeight: 700, fontSize: 16 }}>${isA ? 'Todavía no hay proyectos' : 'Todavía no participás en proyectos'}</div><p className="muted" style=${{ marginTop: 6 }}>${isA ? 'Por ejemplo: “Liquidación mensual” o “Declaración anual” para cada cliente.' : 'Vas a verlos acá cuando te asignen tareas.'}</p></section>`}
  </div>`;

  const Proyecto = () => {
    const p = pById[ui.pro];
    if (!p || !myProjects.includes(p)) return Denied();
    const all = projTasks(p); const ts = (isA ? all : all.filter((t) => t.o === myId)).sort(byDue);
    const done = all.filter((t) => t.s === 'fin').length; const pct = all.length ? Math.round(done / all.length * 100) : 0; const st = projStatus(p);
    const hist = [];
    all.forEach((t) => (t.hist || []).forEach((h) => hist.push({ d: h.d, x: h.x, n: t.n })));
    hist.sort((a, b) => String(b.d).localeCompare(String(a.d)));
    return html`<div className="page">
      <div><div className="crumbs"><button onClick=${() => go('proyectos')}>${isA ? 'Proyectos' : 'Mis proyectos'}</button>›<span>${p.p}</span></div>
        <div className="ph"><div><h1>${p.p}</h1><p>${p.desc || 'Sin descripción.'}</p></div>
          ${isA && html`<div style=${{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className="btn" onClick=${() => set({ modal: 'form', form: Object.assign({ kind: 'proj' }, p), confirmDel: false })}>Editar</button><button className="btn pri" onClick=${() => set({ modal: 'form', form: blankTask(p.cId, p.id), confirmDel: false })}><${Icon} d=${ICON.plus} s=${16} w=${2.2} />Nueva tarea</button></div>`}</div></div>
      <section className="card pad"><div className="kv">
        <div><small>Cliente</small>${cById[p.cId] ? html`<button className="link" style=${{ padding: 0, textAlign: 'left' }} onClick=${() => go('cliente', { cli: p.cId })}>${cById[p.cId].n}</button>` : html`<span>Sin cliente</span>`}</div>
        <div><small>Responsable</small><span style=${{ display: 'flex', alignItems: 'center', gap: 6 }}>${av(p.o, 22)}${mname(p.o)}</span></div>
        <div><small>Inicio</small><span>${fmtY(p.start)}</span></div>
        <div><small>Vencimiento</small><span>${fmtY(p.due)}</span></div>
        <div><small>Estado</small><span className="sb" style=${{ background: st.bg, color: st.fg }}>${st.l}</span></div>
        <div><small>Prioridad</small><${PD} k=${p.pr} /></div>
      </div>
      <div style=${{ marginTop: 18 }}><div style=${{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><b>${done} de ${all.length} tareas completadas</b><b>${pct}%</b></div><span className="bar" style=${{ height: 10 }}><span style=${{ width: pct + '%' }}></span></span></div>
      </section>
      <div className="split">
        <section className="wide card" style=${{ overflow: 'hidden' }}><div className="card-h"><h2>${isA ? 'Tareas del proyecto' : 'Mis tareas en este proyecto'}</h2></div>${TaskList(ts, 'Todavía no hay tareas en este proyecto.')}</section>
        <section className="narrow card pad"><h2 style=${{ fontSize: 16, marginBottom: 6 }}>Actividad</h2>
          ${hist.slice(0, 12).map((h, i) => html`<div key=${i} className="hist"><span>${fmt(h.d)}</span><span>${h.x} <span className="muted">(${h.n})</span></span></div>`)}
          ${!hist.length && html`<p className="muted">Sin actividad todavía.</p>`}
        </section>
      </div>
    </div>`;
  };

  const Cfg = () => {
    const draft = ui.studioDraft === null ? studio : ui.studioDraft;
    const approve = (r, roleK) => run(async () => {
      await db.doc('members/' + r.id).set({ name: r.name || 'Sin nombre', role: roleK, active: true, addedAt: Date.now() });
      await db.doc('requests/' + r.id).delete();
      notify(r.id, 'Bienvenido/a a ' + studio + '. Ya podés empezar a trabajar.', null);
      logAct(myName + ' sumó a ' + (r.name || 'una persona') + ' como ' + ROLE[roleK].toLowerCase(), '', '');
    }, (r.name || 'La persona') + ' ya forma parte del equipo.');
    return html`<div className="page">
      <div className="ph"><div><h1>Configuración</h1><p>${isA ? 'Estudio, equipo y permisos.' : 'Tu perfil y tus permisos.'}</p></div></div>
      ${isA ? html`
        <section className="card pad">
          <h2 style=${{ fontSize: 16 }}>Estudio</h2>
          <div style=${{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end', marginTop: 12 }}>
            <label className="fld" style=${{ flex: '1 1 300px' }}>Nombre del estudio<input className="inp" value=${draft} onChange=${(e) => set({ studioDraft: e.target.value })} /></label>
            <button className="btn pri" disabled=${!draft.trim() || draft.trim() === studio} onClick=${() => run(() => db.doc('config/estudio').update({ name: draft.trim() }), 'Nombre del estudio actualizado.').then((ok) => ok && set({ studioDraft: null }))}>Guardar nombre</button>
          </div>
          <p className="muted" style=${{ marginTop: 8, fontSize: 13 }}>Se muestra en el menú, en la bienvenida y en las pantallas de acceso.</p>
        </section>
        <section id="tour-users" className="card" style=${{ overflow: 'hidden' }}>
          <div className="card-h"><h2>Equipo</h2><button className="btn sm pri" onClick=${() => { setHits([]); set({ modal: 'member', form: { kind: 'member', q: '', pick: null, name: '', role: 'emp' } }); }}><${Icon} d=${ICON.plus} s=${15} w=${2.2} />Agregar integrante</button></div>
          ${requests.map((r) => html`<div key=${r.id} className="req">
            <span style=${{ flex: '1 1 220px' }}><b>${r.name || 'Alguien'}</b> pidió acceso <span style=${{ opacity: 0.8 }}>· ${rel(r.at)}</span></span>
            <button className="btn sm" onClick=${() => run(() => db.doc('requests/' + r.id).delete(), 'Solicitud rechazada.')}>Rechazar</button>
            <button className="btn sm" onClick=${() => approve(r, 'admin')}>Aprobar como administrador/a</button>
            <button className="btn sm pri" onClick=${() => approve(r, 'emp')}>Aprobar como empleado/a</button>
          </div>`)}
          <div className="scroll"><div style=${{ minWidth: 640 }}>
            ${members.slice().sort((a, b) => String(a.name).localeCompare(String(b.name))).map((m) => html`<div key=${m.id} style=${{ display: 'grid', gridTemplateColumns: 'minmax(220px,1.6fr) 150px 120px 110px', gap: 12, alignItems: 'center', padding: '12px 18px', borderTop: '1px solid var(--line2)', opacity: m.active === false ? 0.55 : 1 }}>
              <span style=${{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, minWidth: 0 }}>${av(m.id, 32)}<span className="ell">${m.name}${m.id === myId ? ' (vos)' : ''}</span></span>
              <span><span className="sb" style=${{ background: m.role === 'admin' ? 'var(--accent-soft)' : 'var(--chip)', color: m.role === 'admin' ? 'var(--accent-soft-ink)' : 'var(--ink2)' }}>${m.active === false ? 'Desactivado/a' : ROLE[m.role] || ROLE.emp}</span></span>
              <span style=${{ color: 'var(--ink2)' }}>${tasks.filter((t) => t.o === m.id && t.s !== 'fin').length} abiertas</span>
              <button className="btn sm" onClick=${() => set({ modal: 'member', form: { kind: 'memberEdit', id: m.id, name: m.name, role: m.role, active: m.active !== false } })}>Editar</button>
            </div>`)}
          </div></div>
          <div style=${{ padding: '14px 18px', borderTop: '1px solid var(--line2)', background: 'var(--sunk)', fontSize: 13, color: 'var(--ink2)', lineHeight: 1.55 }}>
            <b>Cómo sumar a alguien:</b> compartí esta app con su cuenta de Claude desde el botón Compartir, con permiso para editar. Cuando la abra, te va a llegar su solicitud de acceso y la aprobás desde acá.
          </div>
        </section>
        <section className="card pad">
          <h2 style=${{ fontSize: 16, marginBottom: 10 }}>Qué puede hacer cada rol</h2>
          <div className="scroll"><div style=${{ minWidth: 520 }}>
            <div style=${{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 140px 130px', gap: 8, padding: '8px 0', fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}><span>Permiso</span><span>Administrador/a</span><span>Empleado/a</span></div>
            ${[['Ver todas las tareas del estudio', 1, 0], ['Crear y eliminar clientes, proyectos y tareas', 1, 0], ['Asignar o cambiar responsable', 1, 0], ['Editar las tareas asignadas', 1, 1], ['Cambiar estado, comentar y adjuntar', 1, 1], ['Ver el calendario de todo el equipo', 1, 0], ['Gestionar el equipo y el nombre del estudio', 1, 0]].map((r) => html`<div key=${r[0]} style=${{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 140px 130px', gap: 8, padding: '9px 0', borderTop: '1px solid var(--line2)' }}>
              <span>${r[0]}</span><b style=${{ color: r[1] ? 'var(--s-fin-fg)' : 'var(--muted)' }}>${r[1] ? '✓ Sí' : '— No'}</b><b style=${{ color: r[2] ? 'var(--s-fin-fg)' : 'var(--muted)' }}>${r[2] ? '✓ Sí' : '— No'}</b></div>`)}
          </div></div>
        </section>` : html`
        <section className="card pad" style=${{ display: 'flex', alignItems: 'center', gap: 14 }}>${av(myId, 52)}<div><b style=${{ fontSize: 16 }}>${myName}</b><div className="muted">${ROLE[me.role] || ROLE.emp} en ${studio}</div></div></section>
        <div className="lock"><${Icon} d=${ICON.lock} s=${20} style=${{ flex: 'none', marginTop: 2, color: 'var(--muted)' }} /><div><b>Equipo y permisos</b><p style=${{ marginTop: 4, color: 'var(--ink2)', lineHeight: 1.5 }}>Solo los administradores pueden gestionar el equipo, los roles y el nombre del estudio. Si querés cambiar cómo figura tu nombre, pedíselo a un administrador.</p></div></div>`}
    </div>`;
  };

  const Ayuda = () => html`<div className="page">
    <div className="ph"><div><h1>Ayuda</h1><p>Todo lo que necesitás para usar el sistema, cuando lo necesites.</p></div></div>
    <section className="card pad" style=${{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18, padding: 22 }}>
      <div style=${{ flex: '1 1 320px' }}><h2 style=${{ fontSize: 18 }}>Recorrido guiado</h2><p style=${{ marginTop: 6, color: 'var(--ink2)', lineHeight: 1.5 }}>${isA ? 'Volvé a ver los 7 pasos para administradores: panel, clientes, proyectos, tareas, calendario, seguimiento y equipo.' : 'Volvé a ver los 6 pasos: tu espacio, tus tareas, los estados, el calendario, las notificaciones y cómo terminar una tarea.'}</p></div>
      <button className="btn pri" onClick=${startTour}>Repetir tutorial</button>
    </section>
    <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
      <section className="card pad"><h2 style=${{ fontSize: 16, marginBottom: 10 }}>Guía rápida: estados de una tarea</h2>
        ${SK.map((k) => html`<div key=${k} style=${{ display: 'flex', gap: 12, padding: '8px 0', alignItems: 'flex-start' }}><span style=${{ width: 110, flex: 'none' }}><${SB} k=${k} /></span><span style=${{ color: 'var(--ink2)' }}>${ST[k].d}</span></div>`)}
      </section>
      <section className="card pad">
        <h2 style=${{ fontSize: 16, marginBottom: 8 }}>El calendario</h2>
        <p style=${{ color: 'var(--ink2)', lineHeight: 1.55 }}>Cada tarea aparece el día en que vence. Podés verlo por día, semana o mes. Las tareas terminadas se ocultan para que veas solo lo pendiente, pero siguen guardadas: las encontrás en Tareas filtrando por “Terminado”.</p>
        <h2 style=${{ fontSize: 16, margin: '18px 0 8px' }}>Tus permisos</h2>
        ${(isA ? [[1, 'Ves y gestionás todas las tareas, clientes y proyectos.'], [1, 'Creás tareas y proyectos y elegís quién los hace.'], [1, 'Aprobás o devolvés las tareas en revisión.'], [1, 'Gestionás el equipo y el nombre del estudio.']]
          : [[1, 'Ves tus tareas, tus proyectos y tu calendario.'], [1, 'Cambiás el estado, editás la descripción, comentás y adjuntás archivos.'], [0, 'No podés crear tareas ni cambiar el responsable, el cliente o el proyecto.'], [0, 'No ves las tareas de otras personas.']])
          .map((r, i) => html`<div key=${i} style=${{ display: 'flex', gap: 8, padding: '4px 0', color: 'var(--ink2)' }}><b style=${{ width: 16, color: r[0] ? 'var(--s-fin-fg)' : 'var(--muted)' }}>${r[0] ? '✓' : '—'}</b>${r[1]}</div>`)}
      </section>
    </div>
    <section className="card faq" style=${{ overflow: 'hidden' }}>
      <div className="card-h"><h2>Preguntas frecuentes</h2></div>
      ${FAQ[role].map((f, i) => html`<div key=${i}><button aria-expanded=${ui.faq === i ? 'true' : 'false'} onClick=${() => set({ faq: ui.faq === i ? -1 : i })}>${f[0]}<span aria-hidden="true" className="muted" style=${{ fontSize: 18 }}>${ui.faq === i ? '−' : '+'}</span></button>${ui.faq === i && html`<p>${f[1]}</p>`}</div>`)}
    </section>
  </div>`;

  /* ---------- detalle de tarea ---------- */
  const Drawer = () => {
    const t = tasks.find((x) => x.id === ui.sel);
    if (!t || (!isA && t.o !== myId)) return null;
    const di = dueInfo(t);
    const lockF = (label, text) => html`<small>${label}${!isA && html` <${LockTip} text=${text} />`}</small>`;
    const upload = async (f) => {
      if (!cap.assets) { flash('Adjuntar archivos no está disponible en esta vista.'); return; }
      set({ busy: true });
      await run(async () => {
        const r = await cap.assets.upload(f);
        await updTask(t, { files: (t.files || []).concat([{ id: r.id, url: r.url, name: f.name, at: Date.now(), by: myId }]) }, myName + ' adjuntó ' + f.name + '.');
        logAct(myName + ' adjuntó ' + f.name + ' en “' + t.n + '”', t.cId, '');
        if (isA) notify(t.o, myName + ' adjuntó un archivo en “' + t.n + '”.', t.id); else notifyAdmins(myName + ' adjuntó un archivo en “' + t.n + '”.', t.id);
      }, 'Archivo adjuntado: ' + f.name + '.');
      set({ busy: false });
    };
    return html`<button className="scrim" aria-label="Cerrar detalle" onClick=${() => set({ sel: null })}></button>
    <aside className="drawer" role="dialog" aria-label=${'Tarea: ' + t.n}>
      <div className="dhd"><span className="ell">${isA ? 'Tareas' : 'Mis tareas'} › ${cn(t)}</span>
        <span style=${{ display: 'flex', gap: 6 }}>${isA && html`<button className="btn sm" onClick=${() => set({ modal: 'form', form: Object.assign({ kind: 'task' }, t), confirmDel: false })}>Editar</button>`}<button className="iconbtn" aria-label="Cerrar" onClick=${() => set({ sel: null })}><${Icon} d=${ICON.x} /></button></span></div>
      <div className="body">
        <div><h2 style=${{ fontSize: 22 }}>${t.n}</h2>${isLate(t) && html`<span style=${{ display: 'inline-block', marginTop: 8, fontSize: 12, fontWeight: 700, color: 'var(--danger)', background: 'var(--danger-soft)', borderRadius: 6, padding: '3px 8px' }}>Atrasada · venció el ${fmt(t.due)}</span>`}</div>
        <div className="kv" style=${{ gridTemplateColumns: 'repeat(2,minmax(0,1fr))' }}>
          <div>${lockF('Cliente', 'Solo un administrador puede cambiar el cliente.')}${cById[t.cId] ? html`<button className="link" style=${{ padding: 0, textAlign: 'left' }} onClick=${() => go('cliente', { cli: t.cId })}>${cn(t)}</button>` : html`<span>Sin cliente</span>`}</div>
          <div>${lockF('Proyecto', 'Solo un administrador puede cambiar el proyecto.')}${pById[t.pId] ? html`<button className="link" style=${{ padding: 0, textAlign: 'left' }} onClick=${() => go('proyecto', { pro: t.pId })}>${pn(t)}</button>` : html`<span>Sin proyecto</span>`}</div>
          <div>${lockF('Responsable', 'Solo un administrador puede reasignar la tarea.')}
            ${isA ? html`<label className="sr" htmlFor="dOwner">Responsable</label><select id="dOwner" value=${t.o} style=${{ width: '100%', fontWeight: 600 }} onChange=${(e) => { const v = e.target.value; run(async () => { await updTask(t, { o: v }, myName + ' reasignó la tarea a ' + mname(v) + '.'); logAct(myName + ' reasignó “' + t.n + '” a ' + mname(v), t.cId, ''); notify(v, 'Se te asignó una tarea: ' + t.n + ' · ' + cn(t) + '.', t.id); }, 'Tarea reasignada a ' + mname(v) + '. Le llegará una notificación.'); }}>${team.map((p) => html`<option key=${p.id} value=${p.id}>${p.name}</option>`)}${!team.some((p) => p.id === t.o) && html`<option value=${t.o}>${mname(t.o)}</option>`}</select>`
              : html`<span style=${{ display: 'flex', alignItems: 'center', gap: 6 }}>${av(t.o, 22)}${mname(t.o)}</span>`}
          </div>
          <div><small>Prioridad</small><${PD} k=${t.pr} /></div>
          <div><small>Inicio</small><span>${fmtY(t.start)}</span></div>
          <div><small>Vencimiento</small><span className=${di.cls} style=${{ fontSize: 14 }}>${fmtY(t.due)}</span></div>
          <div><small>Creada</small><span style=${{ fontWeight: 400 }}>${fmtY(t.created)}</span></div>
          <div><small>Última modificación</small><span style=${{ fontWeight: 400 }}>${fmtY(t.mod)}</span></div>
        </div>
        <div>
          <div style=${{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}><${Tip} label="Estado" text="Indica en qué etapa se encuentra la tarea." /></div>
          <div className="stbtns" role="group" aria-label="Cambiar estado">${SK.map((k) => { const onK = t.s === k; return html`<button key=${k} aria-pressed=${onK ? 'true' : 'false'} style=${onK ? { background: ST[k].bg, color: ST[k].fg, borderColor: ST[k].dot } : null} onClick=${() => setStatus(t, k)}>${ST[k].l}</button>`; })}</div>
          ${isA && t.s === 'rev' && html`<div className="review"><b style=${{ flex: '1 1 200px' }}>Esta tarea espera tu revisión.</b>
            <button className="btn sm" onClick=${() => setStatus(t, 'curso', { hist: myName + ' devolvió la tarea con observaciones.', act: myName + ' devolvió “' + t.n + '” a ' + mname(t.o), note: myName + ' te devolvió “' + t.n + '” con observaciones.', msg: 'Tarea devuelta. ' + mname(t.o) + ' recibirá una notificación.' })}>Devolver con observaciones</button>
            <button className="btn sm pri" onClick=${() => setStatus(t, 'fin', { hist: myName + ' aprobó la tarea.', act: myName + ' aprobó “' + t.n + '”', note: 'Tu tarea “' + t.n + '” fue aprobada.', msg: 'Tarea aprobada. Ya no aparece en el calendario, pero queda guardada.' })}>Aprobar</button></div>`}
        </div>
        <div><label htmlFor="dDesc" style=${{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Descripción</label>
          <textarea id="dDesc" className="inp" rows="3" defaultValue=${t.desc || ''} key=${'d' + t.id + (t.mod || '')} onBlur=${(e) => { const v = e.target.value; if (v !== (t.desc || '')) run(() => updTask(t, { desc: v }, myName + ' editó la descripción.'), 'Descripción guardada.'); }}></textarea>
          <small className="muted">Se guarda al salir del campo.</small></div>
        <div>
          <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}><h3 style=${{ fontSize: 15 }}>Archivos</h3>
            ${cap.assets ? html`<label className="btn sm" style=${{ cursor: 'pointer', opacity: ui.busy ? 0.5 : 1 }}>${ui.busy ? 'Subiendo…' : 'Adjuntar archivo'}<input type="file" className="sr" disabled=${ui.busy} onChange=${(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return; if (f.size > 20 * 1024 * 1024) { flash('El archivo pesa más de 20 MB.'); return; } upload(f); }} /></label>` : null}</div>
          ${(t.files || []).map((f, i) => typeof f === 'string' ? html`<div key=${i} className="file"><${Icon} d=${ICON.file} s=${16} /><span className="ell">${f}</span></div>`
            : html`<a key=${f.id || i} className="file" href=${f.url || ('/_blob/' + f.id)} target="_blank" rel="noopener"><${Icon} d=${ICON.file} s=${16} style=${{ color: 'var(--muted)' }} /><span className="ell" style=${{ flex: 1 }}>${f.name}</span><small className="muted">${f.by ? mname(f.by) + ' · ' : ''}${rel(f.at)}</small></a>`)}
          ${!(t.files || []).length && html`<p className="muted">Todavía no hay archivos.</p>`}
          ${!cap.assets && html`<small className="muted">Adjuntar archivos no está disponible para tu cuenta en esta vista.</small>`}
        </div>
        <div>
          <h3 style=${{ fontSize: 15, marginBottom: 10 }}>Comentarios</h3>
          ${comments.map((c) => html`<div key=${c.id} className="cmt">${av(c.a, 30)}<div><div style=${{ fontSize: 13 }}><b>${mname(c.a)}</b> <span className="muted">· ${rel(c.at)}</span></div><div style=${{ marginTop: 4, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>${c.x}</div></div></div>`)}
          <label htmlFor="dCmt" className="sr">Nuevo comentario</label>
          <textarea id="dCmt" className="inp" rows="2" placeholder="Escribí un comentario…" value=${ui.draft} onChange=${(e) => set({ draft: e.target.value })}></textarea>
          <div style=${{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}><button className="btn sm pri" disabled=${!ui.draft.trim()} onClick=${() => {
            const x = ui.draft.trim(); if (!x) return;
            set({ draft: '' });
            run(async () => {
              await db.doc('tasks/' + t.id).collection('comments').add({ a: myId, at: Date.now(), x });
              if (isA) notify(t.o, myName + ' comentó en “' + t.n + '”.', t.id); else notifyAdmins(myName + ' comentó en “' + t.n + '”.', t.id);
              logAct(myName + ' comentó en “' + t.n + '”', t.cId, '');
            });
          }}>Comentar</button></div>
        </div>
        <div><h3 style=${{ fontSize: 15, marginBottom: 8 }}>Historial</h3>${(t.hist || []).map((h, i) => html`<div key=${i} className="hist"><span>${fmt(h.d)}</span><span>${h.x}</span></div>`)}</div>
      </div>
    </aside>`;
  };

  /* ---------- formularios ---------- */
  const FormModal = () => {
    const f = ui.form; const isNew = !f.id;
    const setF = (k, v) => set((u) => ({ form: Object.assign({}, u.form, { [k]: v }) }));
    const close = () => set({ modal: null, confirmDel: false });
    let title, fields, ok, save, del, delBlock = '';
    const ownerSel = (k, label) => html`<label className="fld">${label}<select value=${f[k]} onChange=${(e) => setF(k, e.target.value)}>${team.map((p) => html`<option key=${p.id} value=${p.id}>${p.name}</option>`)}</select></label>`;
    const prio = html`<div className="full"><div style=${{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Prioridad</div><div className="prio4" role="group" aria-label="Prioridad">${PK.map((k) => html`<button key=${k} aria-pressed=${f.pr === k ? 'true' : 'false'} onClick=${() => setF('pr', k)}><span className="dot" style=${{ background: PR[k].c }}></span>${PR[k].l}</button>`)}</div></div>`;
    const dates = html`<label className="fld">Inicio<input type="date" className="inp" value=${f.start || ''} onChange=${(e) => setF('start', e.target.value)} /></label><label className="fld">Vencimiento<input type="date" className="inp" value=${f.due || ''} onChange=${(e) => setF('due', e.target.value)} /></label>`;
    if (f.kind === 'task') {
      const pOpts = projects.filter((p) => p.cId === f.cId);
      title = isNew ? 'Nueva tarea' : 'Editar tarea';
      ok = f.n.trim() && f.pId && f.due && f.o;
      fields = html`
        <label className="fld full">Nombre de la tarea<input className="inp" value=${f.n} onChange=${(e) => setF('n', e.target.value)} placeholder="Ej.: Presentar IVA del mes" autoFocus /></label>
        <label className="fld">Cliente<select value=${f.cId} onChange=${(e) => { const c = e.target.value; set((u) => ({ form: Object.assign({}, u.form, { cId: c, pId: (projects.find((x) => x.cId === c) || {}).id || '' }) })); }}>${clients.map((c) => html`<option key=${c.id} value=${c.id}>${c.n}</option>`)}</select></label>
        <label className="fld">Proyecto<select value=${f.pId} onChange=${(e) => setF('pId', e.target.value)} disabled=${!pOpts.length}>${pOpts.length ? pOpts.map((p) => html`<option key=${p.id} value=${p.id}>${p.p}</option>`) : html`<option value="">Sin proyectos</option>`}</select>
          ${!pOpts.length && html`<span style=${{ fontWeight: 400, color: 'var(--danger)', fontSize: 12 }}>Este cliente no tiene proyectos. Creá uno primero.</span>`}</label>
        ${ownerSel('o', 'Responsable')}${dates}${prio}
        <label className="fld full">Descripción<textarea className="inp" rows="3" value=${f.desc} onChange=${(e) => setF('desc', e.target.value)} placeholder="Qué hay que hacer y qué se necesita"></textarea></label>`;
      save = () => run(async () => {
        if (isNew) {
          const ref = await db.collection('tasks').add({ n: f.n.trim(), cId: f.cId, pId: f.pId, o: f.o, s: 'sin', pr: f.pr, start: f.start, due: f.due, desc: f.desc, created: TODAY, mod: TODAY, files: [], hist: [{ d: TODAY, x: myName + ' creó la tarea y se la asignó a ' + mname(f.o) + '.' }] });
          logAct(myName + ' creó “' + f.n.trim() + '” y se la asignó a ' + mname(f.o), f.cId, '');
          notify(f.o, 'Se te asignó una nueva tarea: ' + f.n.trim() + ' · ' + ((cById[f.cId] || {}).n || '') + '.', ref.id);
        } else {
          const old = tasks.find((x) => x.id === f.id) || {};
          await updTask(old, { n: f.n.trim(), cId: f.cId, pId: f.pId, o: f.o, start: f.start, due: f.due, pr: f.pr, desc: f.desc }, myName + ' editó la tarea' + (old.o !== f.o ? ' y la reasignó a ' + mname(f.o) : '') + '.');
          if (old.o !== f.o) notify(f.o, 'Se te asignó una tarea: ' + f.n.trim() + '.', f.id);
          else if (old.due !== f.due) notify(f.o, myName + ' cambió el vencimiento de “' + f.n.trim() + '” al ' + fmt(f.due) + '.', f.id);
          logAct(myName + ' editó “' + f.n.trim() + '”', f.cId, '');
        }
        close();
      }, isNew ? 'Tarea creada y asignada a ' + mname(f.o) + '.' : 'Cambios guardados.');
      del = () => run(async () => { await db.doc('tasks/' + f.id).delete(); logAct(myName + ' eliminó la tarea “' + f.n + '”', f.cId, ''); set({ modal: null, sel: null, confirmDel: false }); }, 'Tarea eliminada.');
    } else if (f.kind === 'proj') {
      title = isNew ? 'Nuevo proyecto' : 'Editar proyecto';
      ok = f.p.trim() && f.cId && f.due;
      fields = html`
        <label className="fld full">Nombre del proyecto<input className="inp" value=${f.p} onChange=${(e) => setF('p', e.target.value)} placeholder="Ej.: Liquidación mensual" autoFocus /></label>
        <label className="fld">Cliente<select value=${f.cId} onChange=${(e) => setF('cId', e.target.value)}>${clients.map((c) => html`<option key=${c.id} value=${c.id}>${c.n}</option>`)}</select></label>
        ${ownerSel('o', 'Responsable')}${dates}${prio}
        <label className="fld full">Descripción<textarea className="inp" rows="3" value=${f.desc} onChange=${(e) => setF('desc', e.target.value)}></textarea></label>`;
      save = () => run(async () => {
        const body = { p: f.p.trim(), cId: f.cId, o: f.o, start: f.start, due: f.due, pr: f.pr, desc: f.desc };
        if (isNew) {
          const ref = await db.collection('projects').add(Object.assign(body, { createdAt: Date.now() }));
          logAct(myName + ' creó el proyecto “' + body.p + '”', f.cId, '');
          notify(f.o, 'Sos responsable del nuevo proyecto ' + body.p + '.', null);
          go('proyecto', { pro: ref.id });
        } else { await db.doc('projects/' + f.id).update(body); close(); }
      }, isNew ? 'Proyecto creado.' : 'Cambios guardados.');
      if (!isNew && tasks.some((t) => t.pId === f.id)) delBlock = 'Para eliminarlo, primero eliminá o mové sus tareas.';
      del = () => run(async () => { await db.doc('projects/' + f.id).delete(); logAct(myName + ' eliminó el proyecto “' + f.p + '”', f.cId, ''); go('proyectos'); }, 'Proyecto eliminado.');
    } else {
      title = isNew ? 'Nuevo cliente' : 'Editar cliente';
      ok = f.n.trim();
      const tx = (k, label, ph, full, type) => html`<label className=${'fld' + (full ? ' full' : '')}>${label}<input className="inp" type=${type || 'text'} value=${f[k] || ''} onChange=${(e) => setF(k, e.target.value)} placeholder=${ph || ''} /></label>`;
      fields = html`
        <label className="fld full">Nombre o razón social<input className="inp" value=${f.n} onChange=${(e) => setF('n', e.target.value)} placeholder="Ej.: Comercial Rivera SRL" autoFocus /></label>
        ${tx('rut', 'RUT', '21 456 789 0012')}${tx('contacto', 'Persona de contacto', 'Nombre y apellido')}
        ${tx('tel', 'Teléfono', '099 123 456', false, 'tel')}${tx('mail', 'Email', 'administracion@empresa.com.uy', false, 'email')}
        ${tx('dir', 'Dirección', 'Calle, número, ciudad', true)}
        ${ownerSel('resp', 'Responsable')}
        <label className="fld">Estado<select value=${f.st} onChange=${(e) => setF('st', e.target.value)}>${CSTATES.map((x) => html`<option key=${x} value=${x}>${x}</option>`)}</select></label>`;
      save = () => run(async () => {
        const body = { n: f.n.trim(), rut: f.rut || '', contacto: f.contacto || '', tel: f.tel || '', mail: f.mail || '', dir: f.dir || '', resp: f.resp, st: f.st };
        if (isNew) { const ref = await db.collection('clients').add(Object.assign(body, { createdAt: Date.now() })); logAct(myName + ' cargó al cliente ' + body.n, ref.id, ''); go('cliente', { cli: ref.id }); }
        else { await db.doc('clients/' + f.id).update(body); close(); }
      }, isNew ? 'Cliente creado.' : 'Cambios guardados.');
      if (!isNew && (projects.some((p) => p.cId === f.id) || tasks.some((t) => t.cId === f.id))) delBlock = 'Para eliminarlo, primero eliminá sus proyectos y tareas. También podés marcarlo como “Inactivo”.';
      del = () => run(async () => { await db.doc('clients/' + f.id).delete(); go('clientes'); }, 'Cliente eliminado.');
    }
    return html`<button className="scrim" style=${{ zIndex: 74 }} aria-label="Cerrar" onClick=${close}></button>
    <div className="modal" role="dialog" aria-label=${title}>
      <div className="mh"><h2 style=${{ fontSize: 18 }}>${title}</h2><button className="iconbtn" aria-label="Cerrar" onClick=${close}><${Icon} d=${ICON.x} /></button></div>
      <div className="mb">${fields}</div>
      <div className="mf">
        ${!isNew && (delBlock ? html`<span className="muted" style=${{ marginRight: 'auto', fontSize: 13, maxWidth: 300 }}>${delBlock}</span>`
          : ui.confirmDel ? html`<span style=${{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><b>¿Eliminar definitivamente?</b><button className="btn sm" onClick=${() => set({ confirmDel: false })}>No</button><button className="btn sm danger" onClick=${del}>Sí, eliminar</button></span>`
          : html`<button className="btn danger" style=${{ marginRight: 'auto' }} onClick=${() => set({ confirmDel: true })}>Eliminar</button>`)}
        <button className="btn" onClick=${close}>Cancelar</button>
        <button className="btn pri" disabled=${!ok} onClick=${save}>${isNew ? (f.kind === 'task' ? 'Crear y asignar' : 'Crear') : 'Guardar cambios'}</button>
      </div>
    </div>`;
  };

  const MemberModal = () => {
    const f = ui.form;
    const setF = (k, v) => set((u) => ({ form: Object.assign({}, u.form, { [k]: v }) }));
    const close = () => set({ modal: null });
    const admins = team.filter((m) => m.role === 'admin');
    if (f.kind === 'memberEdit') {
      const isLastAdmin = f.role === 'admin' && admins.length <= 1 && admins[0] && admins[0].id === f.id;
      const isSelf = f.id === myId;
      const lockRole = isLastAdmin || (isSelf && cap.owner);
      const save = () => run(async () => { await db.doc('members/' + f.id).update({ name: f.name.trim(), role: f.role, active: f.active }); close(); }, 'Cambios guardados.');
      return html`<button className="scrim" style=${{ zIndex: 74 }} aria-label="Cerrar" onClick=${close}></button>
      <div className="modal" role="dialog" aria-label="Editar integrante" style=${{ width: 480 }}>
        <div className="mh"><h2 style=${{ fontSize: 18 }}>Editar integrante</h2><button className="iconbtn" aria-label="Cerrar" onClick=${close}><${Icon} d=${ICON.x} /></button></div>
        <div className="mb" style=${{ gridTemplateColumns: '1fr' }}>
          <label className="fld">Nombre, como lo ve el equipo<input className="inp" value=${f.name} onChange=${(e) => setF('name', e.target.value)} /></label>
          <label className="fld">Rol<select value=${f.role} disabled=${lockRole} onChange=${(e) => setF('role', e.target.value)}><option value="emp">Empleado/a</option><option value="admin">Administrador/a</option></select>
            ${lockRole && html`<span className="muted" style=${{ fontWeight: 400, fontSize: 12 }}>${isSelf && cap.owner ? 'Como creador de la app, siempre sos administrador.' : 'Tiene que haber al menos un administrador.'}</span>`}</label>
          ${!isSelf && !isLastAdmin && html`<label style=${{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13 }}><input type="checkbox" checked=${f.active} onChange=${() => setF('active', !f.active)} style=${{ width: 18, height: 18, accentColor: 'var(--accent)' }} />Acceso activo</label>
            <p className="muted" style=${{ fontSize: 12, marginTop: -6 }}>Si lo desactivás, no va a poder entrar. Sus tareas y su historial se conservan.</p>`}
        </div>
        <div className="mf"><button className="btn" onClick=${close}>Cancelar</button><button className="btn pri" disabled=${!f.name.trim()} onClick=${save}>Guardar cambios</button></div>
      </div>`;
    }
    const search = async (q) => { setF('q', q); if (!cap.user || typeof cap.user.search !== 'function') return; const r = await cap.user.search(q); setHits((r || []).filter((h) => !members.some((m) => m.id === h.id))); };
    const add = () => run(async () => {
      await db.doc('members/' + f.pick.id).set({ name: f.name.trim(), role: f.role, active: true, addedAt: Date.now() });
      notify(f.pick.id, 'Te sumaron a ' + studio + '. Ya podés empezar a trabajar.', null);
      logAct(myName + ' sumó a ' + f.name.trim() + ' como ' + ROLE[f.role].toLowerCase(), '', '');
      close();
    }, f.name.trim() + ' ya forma parte del equipo.');
    return html`<button className="scrim" style=${{ zIndex: 74 }} aria-label="Cerrar" onClick=${close}></button>
    <div className="modal" role="dialog" aria-label="Agregar integrante" style=${{ width: 520 }}>
      <div className="mh"><h2 style=${{ fontSize: 18 }}>Agregar integrante</h2><button className="iconbtn" aria-label="Cerrar" onClick=${close}><${Icon} d=${ICON.x} /></button></div>
      <div className="mb" style=${{ gridTemplateColumns: '1fr' }}>
        ${!f.pick ? html`<label className="fld">Buscá a la persona por nombre o email
            <input className="inp" value=${f.q} onFocus=${(e) => search(e.target.value)} onChange=${(e) => search(e.target.value)} placeholder="Nombre o email de su cuenta de Claude" autoFocus /></label>
          ${hits.length > 0 && html`<div className="hits">${hits.map((h) => html`<button key=${h.id} onClick=${() => set((u) => ({ form: Object.assign({}, u.form, { pick: { id: h.id, name: h.name }, name: h.name }) }))}><img src=${h.avatarUrl} alt="" width="28" height="28" style=${{ borderRadius: 14 }} /><span><b style=${{ display: 'block' }}>${h.name}</b>${h.email && html`<span className="muted" style=${{ fontSize: 12 }}>${h.email}</span>`}</span></button>`)}</div>`}
          <div className="lock" style=${{ padding: 14 }}><${Icon} d=${ICON.info} s=${18} style=${{ flex: 'none', marginTop: 1, color: 'var(--muted)' }} /><p style=${{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.5 }}>La búsqueda solo encuentra personas de tu misma organización de Claude. Si no aparece, compartile la app desde el botón Compartir con permiso para editar: cuando la abra, va a poder enviarte una solicitud de acceso.</p></div>`
        : html`<div style=${{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, border: '1px solid var(--line)', borderRadius: 10 }}><b style=${{ flex: 1 }}>${f.pick.name}</b><button className="link" onClick=${() => setF('pick', null)}>Cambiar</button></div>
          <label className="fld">Nombre, como lo va a ver el equipo<input className="inp" value=${f.name} onChange=${(e) => setF('name', e.target.value)} /></label>
          <label className="fld">Rol<select value=${f.role} onChange=${(e) => setF('role', e.target.value)}><option value="emp">Empleado/a</option><option value="admin">Administrador/a</option></select></label>
          <p className="muted" style=${{ fontSize: 13, lineHeight: 1.5 }}>Para que pueda entrar, la app tiene que estar compartida con su cuenta con permiso para editar.</p>`}
      </div>
      <div className="mf"><button className="btn" onClick=${close}>Cancelar</button>${f.pick && html`<button className="btn pri" disabled=${!f.name.trim()} onClick=${add}>Agregar al equipo</button>`}</div>
    </div>`;
  };

  /* ---------- tutorial ---------- */
  const Tour = () => {
    if (!ui.phase) return null;
    const inSteps = ui.phase === 'steps';
    const center = ui.phase !== 'steps' || cur.target === 'center';
    const dots = html`<div className="dots" aria-hidden="true">${steps.map((x, i) => html`<span key=${i} style=${{ width: i === ui.step ? 18 : 6, background: i <= ui.step ? 'var(--accent)' : 'var(--line)' }}></span>`)}</div>`;
    const nav = html`<div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>${dots}
      <div style=${{ display: 'flex', gap: 6 }}>
        <button className="link" style=${{ color: 'var(--muted)' }} onClick=${() => endTour(true)}>Saltar tutorial</button>
        <button className="btn sm" disabled=${ui.step === 0} onClick=${() => stepTo(ui.step - 1)}>Anterior</button>
        <button className="btn sm pri" onClick=${() => stepTo(ui.step + 1)}>${ui.step === steps.length - 1 ? 'Finalizar' : 'Siguiente'}</button>
      </div></div>`;
    const flowChips = cur.flow && !center ? html`<div className="flow">${cur.flow.map((l, i) => html`<span key=${i} style=${{ display: 'contents' }}><span className="c">${l}</span>${i < cur.flow.length - 1 && html`<span aria-hidden="true" className="muted">→</span>`}</span>`)}</div>` : null;
    let tip = null, spot = null;
    if (inSteps && !center && rect) {
      const TW = Math.min(340, rect.vw - 32);
      const st = { left: Math.max(16, Math.min(rect.x, rect.vw - TW - 16)) };
      let arrow = null;
      if (rect.h > rect.vh * 0.55) { st.top = Math.max(rect.y, 16) + 18; st.left = Math.max(16, Math.min(rect.x + rect.w - TW - 18, rect.vw - TW - 16)); }
      else if (rect.y + rect.h + 260 < rect.vh) { st.top = rect.y + rect.h + 16; arrow = 'top'; }
      else if (rect.y > 260) { st.bottom = rect.vh - rect.y + 16; arrow = 'bottom'; }
      else st.top = Math.max(16, rect.vh - 300);
      const ax = Math.max(18, Math.min(rect.x + Math.min(rect.w / 2, 40) - st.left - 6, TW - 30));
      spot = html`<div className="spot" style=${{ top: rect.y - 6, left: rect.x - 6, width: rect.w + 12, height: rect.h + 12 }}></div>`;
      tip = html`<div className="tipcard" role="dialog" aria-label="Tutorial" style=${st}>
        ${arrow && html`<span className="arrow" style=${arrow === 'top' ? { top: -6, left: ax } : { bottom: -6, left: ax }}></span>`}
        <div className="step-k">Paso ${ui.step + 1} de ${steps.length}</div>
        <div style=${{ fontSize: 17, fontWeight: 700, marginTop: 6 }}>${cur.title}</div>
        <p style=${{ marginTop: 6, lineHeight: 1.5, color: 'var(--ink2)' }}>${cur.body}</p>${flowChips}${nav}</div>`;
    }
    let card = null;
    if (ui.phase === 'welcome') {
      card = html`<div className="center" role="dialog" aria-label="Bienvenida">
        <${Logo} name=${studio} size=${52} />
        <h2 style=${{ fontSize: 23, marginTop: 18 }}>${isA ? 'Hola, ' + firstName + '. Te damos la bienvenida al espacio de trabajo de ' + studio + '.' : '¡Hola, ' + firstName + '! Te damos la bienvenida a tu espacio de trabajo en ' + studio + '.'}</h2>
        <p style=${{ marginTop: 10, color: 'var(--ink2)', lineHeight: 1.55 }}>${isA ? 'Desde acá vas a poder organizar clientes, proyectos, tareas y el trabajo de todo el equipo.' : 'Acá vas a encontrar tus tareas, proyectos y calendario.'}</p>
        <div style=${{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>${(isA ? ['Organizar clientes y proyectos', 'Crear y asignar tareas', 'Seguir el avance de cada persona'] : ['Ver lo que tenés para hoy', 'Actualizar el estado de cada tarea', 'Consultar tu calendario']).map((b) => html`<div key=${b} style=${{ display: 'flex', alignItems: 'center', gap: 10 }}><${Icon} d=${ICON.check} w=${2.2} style=${{ color: 'var(--accent)' }} />${b}</div>`)}</div>
        <p className="muted" style=${{ marginTop: 18, fontSize: 13 }}>${steps.length} pasos, ${isA ? 'menos de 2 minutos' : 'alrededor de 1 minuto'}.</p>
        <div style=${{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
          <button className="btn" onClick=${() => endTour(true)}>Ahora no</button>
          <button className="btn pri" onClick=${startTour}>${isA ? 'Comenzar recorrido' : 'Aprender cómo funciona'}</button></div></div>`;
    } else if (ui.phase === 'done') {
      card = html`<div className="center" role="dialog" aria-label="Tutorial completado" style=${{ textAlign: 'center' }}>
        <div style=${{ width: 56, height: 56, borderRadius: 28, background: ST.fin.bg, color: ST.fin.fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><${Icon} d=${ICON.check} s=${28} w=${2.4} /></div>
        <h2 style=${{ fontSize: 22 }}>¡Listo! Ya conocés lo básico para comenzar a trabajar.</h2>
        <p style=${{ marginTop: 10, color: 'var(--ink2)' }}>Si querés volver a verlo, lo encontrás en Ayuda › Repetir tutorial.</p>
        <button className="btn pri" style=${{ marginTop: 22, height: 46, padding: '0 24px' }} onClick=${() => endTour(false)}>Comenzar a trabajar</button></div>`;
    } else if (center) {
      card = html`<div className="center" role="dialog" aria-label="Tutorial">
        <div className="step-k">Paso ${ui.step + 1} de ${steps.length}</div>
        <h2 style=${{ fontSize: 21, marginTop: 6 }}>${cur.title}</h2>
        <p style=${{ marginTop: 8, color: 'var(--ink2)', lineHeight: 1.5 }}>${cur.body}</p>
        ${cur.states && html`<div style=${{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16 }}>${SK.map((k, i) => html`<div key=${k}>
          <div style=${{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10, background: 'var(--sunk)' }}><span style=${{ width: 108, flex: 'none' }}><${SB} k=${k} /></span><span style=${{ fontSize: 13, color: 'var(--ink2)' }}>${ST[k].d}</span></div>
          ${i < 3 && html`<div aria-hidden="true" className="muted" style=${{ textAlign: 'center', lineHeight: 1.2 }}>↓</div>`}</div>`)}</div>`}
        ${cur.flow && html`<div style=${{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>${cur.flow.map((l, i) => html`<div key=${i} style=${{ display: 'flex', alignItems: 'center', gap: 12 }}><span className="num-c">${i + 1}</span><span style=${{ fontWeight: 600 }}>${l}</span></div>`)}</div>`}
        ${nav}</div>`;
    }
    return html`<div className="tour-layer" style=${{ background: center || !rect ? 'var(--overlay)' : 'transparent' }}></div>${spot}${tip}${card}`;
  };

  /* ---------- búsqueda y notificaciones ---------- */
  const g = ui.gq.trim().toLowerCase();
  let gres = [];
  if (g.length >= 2) {
    const cl = myClients.filter((c) => (c.n + ' ' + (c.rut || '')).toLowerCase().includes(g)).slice(0, 3).map((c) => ({ k: c.id, l: c.n, sub: 'Cliente' + (c.rut ? ' · RUT ' + c.rut : ''), go: () => go('cliente', { cli: c.id }) }));
    const pj = myProjects.filter((p) => (p.p + ' ' + ((cById[p.cId] || {}).n || '')).toLowerCase().includes(g)).slice(0, 3).map((p) => ({ k: p.id, l: p.p, sub: 'Proyecto · ' + ((cById[p.cId] || {}).n || ''), go: () => go('proyecto', { pro: p.id }) }));
    const tk = mine.filter((t) => (t.n + ' ' + cn(t)).toLowerCase().includes(g)).slice(0, 4).map((t) => ({ k: 't' + t.id, l: t.n, sub: cn(t) + ' · ' + ST[t.s].l, go: () => openTask(t.id) }));
    const pp = isA ? team.filter((p) => String(p.name).toLowerCase().includes(g)).map((p) => ({ k: p.id, l: p.name, sub: ROLE[p.role] || '', go: () => go('tareas', { scope: null, q: '', tSt: 'all', tOwn: p.id, group: 'status' }) })) : [];
    gres = [['Clientes', cl], ['Proyectos', pj], ['Tareas', tk], ['Equipo', pp]].filter((x) => x[1].length);
  }
  const markRead = () => run(async () => { for (const n of myNotifs.filter((x) => !x.read)) await db.doc('notifs/' + n.id).update({ read: true }); });
  const openNotif = (n) => {
    if (!n.read) db.doc('notifs/' + n.id).update({ read: true }).catch(() => {});
    if (n.task && tasks.some((t) => t.id === n.task && (isA || t.o === myId))) openTask(n.task); else set({ notif: false });
  };

  const navItems = NAV[role];
  const activeKey = ui.screen === 'cliente' ? 'clientes' : ui.screen === 'proyecto' ? 'proyectos' : ui.screen;
  const screens = { dash: Dash, esp: Esp, tareas: Tareas, cal: Cal, clientes: Clientes, cliente: Cliente, proyectos: Proyectos, proyecto: Proyecto, cfg: Cfg, ayuda: Ayuda };
  const scr = ui.screen || (isA ? 'dash' : 'esp');
  const Screen = (scr === 'dash' && !isA) ? Esp : (scr === 'esp' && isA) ? Dash : (screens[scr] || Denied);

  return html`<div className="app">
    <nav className="side" aria-label="Principal">
      <div className="brand"><${Logo} name=${studio} /><div style=${{ minWidth: 0 }}><b className="ell">${studio}</b><span>Gestión interna</span></div></div>
      ${navItems.map((it) => html`<button key=${it[0]} className="navb" aria-current=${activeKey === it[0] ? 'page' : null} onClick=${() => go(it[0])}><${Icon} d=${ICON[it[0]]} />${it[1]}${it[0] === 'tareas' && open.length > 0 && html`<span className="count">${open.length}</span>`}${it[0] === 'cfg' && requests.length > 0 && html`<span className="count" style=${{ background: 'var(--danger)', color: '#fff' }}>${requests.length}</span>`}</button>`)}
      <div className="me">${av(myId, 36)}<div className="who"><b className="ell">${myName}</b><span>${isA ? 'Administrador/a' : 'Empleado/a'}</span></div></div>
    </nav>
    <div className="main">
      <header className="top">
        <div className="search">
          <label htmlFor="gq" className="sr">Buscar en el estudio</label><${Icon} d=${ICON.search} s=${16} w=${2} />
          <input id="gq" value=${ui.gq} autoComplete="off" placeholder="Buscar clientes, proyectos, tareas…" onChange=${(e) => set({ gq: e.target.value, notif: false })} />
          ${g.length >= 2 && html`<div className="drop">${gres.map((grp) => html`<div key=${grp[0]}><h4>${grp[0]}</h4>${grp[1].map((r) => html`<button key=${r.k} onClick=${r.go}><b>${r.l}</b><span>${r.sub}</span></button>`)}</div>`)}
            ${!gres.length && html`<p className="muted" style=${{ padding: '12px 10px' }}>Sin resultados para “${ui.gq}”.</p>`}</div>`}
        </div>
        <div style=${{ flex: 1 }}></div>
        <div id="tour-bell" style=${{ position: 'relative', borderRadius: 12 }}>
          <button className="iconbtn" aria-label=${'Notificaciones' + (unread ? ', ' + unread + ' sin leer' : '')} onClick=${() => set({ notif: !ui.notif, gq: '' })}><${Icon} d=${ICON.bell} s=${19} />${unread > 0 && html`<span className="badge-dot">${unread > 9 ? '9+' : unread}</span>`}</button>
          ${ui.notif && html`<div className="notif">
            <header><b style=${{ fontSize: 15 }}>Notificaciones</b>${unread > 0 && html`<button className="link" onClick=${markRead}>Marcar todo como leído</button>`}</header>
            <div style=${{ maxHeight: 420, overflowY: 'auto' }}>
              ${reminders.length > 0 && html`<div className="sec">Vencimientos</div>${reminders.map((t) => { const dd = diff(t.due, TODAY); return html`<button key=${'r' + t.id} className="n" onClick=${() => openTask(t.id)}><span className="dot" style=${{ background: dd < 0 ? 'var(--danger)' : ST.rev.dot }}></span><span>${dd < 0 ? 'Tenés una tarea atrasada: ' : dd === 0 ? 'Tenés una tarea que vence hoy: ' : 'Tenés una tarea que vence mañana: '}<b>${t.n}</b> · ${cn(t)}.</span></button>`; })}<div className="sec">Novedades</div>`}
              ${myNotifs.slice(0, 20).map((n) => html`<button key=${n.id} className=${'n' + (n.read ? '' : ' unread')} onClick=${() => openNotif(n)}><span className="dot" style=${{ background: n.read ? 'transparent' : 'var(--accent)' }}></span><span><span style=${{ display: 'block', lineHeight: 1.45 }}>${n.x}</span><small className="muted">${rel(n.at)}</small></span></button>`)}
              ${!myNotifs.length && html`<p className="muted" style=${{ padding: 16 }}>No tenés notificaciones.</p>`}
            </div></div>`}
        </div>
      </header>
      <main className="content">${Screen()}</main>
    </div>
    <nav className="bnav" aria-label="Principal (móvil)">
      ${navItems.slice(0, 4).map((it) => html`<button key=${it[0]} aria-current=${activeKey === it[0] ? 'page' : null} onClick=${() => go(it[0])}><${Icon} d=${ICON[it[0]]} s=${20} />${it[1].replace('Mi ', '').replace('Mis ', '')}</button>`)}
      <button aria-current=${navItems.slice(4).some((it) => it[0] === activeKey) ? 'page' : null} onClick=${() => set({ sheet: true })}><${Icon} d=${ICON.more} s=${20} w=${3} />Más</button>
    </nav>
    ${ui.sheet && html`<button className="scrim" style=${{ zIndex: 75 }} aria-label="Cerrar menú" onClick=${() => set({ sheet: false })}></button><div className="sheet" role="dialog" aria-label="Más opciones">
      ${navItems.slice(4).map((it) => html`<button key=${it[0]} className="navb" style=${{ height: 48 }} aria-current=${activeKey === it[0] ? 'page' : null} onClick=${() => go(it[0])}><${Icon} d=${ICON[it[0]]} />${it[1]}</button>`)}</div>`}
    ${ui.sel != null && Drawer()}
    ${ui.modal === 'form' && ui.form && FormModal()}
    ${ui.modal === 'member' && ui.form && MemberModal()}
    ${Tour()}
    ${toastEl}
  </div>`;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
})();

