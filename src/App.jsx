import { useState, useContext, createContext, useEffect } from 'react'
import './App.css'
import { vendor, services, slots, bookings } from './data.js'

/* ── Theme context ── */
const ThemeCtx = createContext({ dark: true, toggle: () => {} })

const statusLabel = { requested: 'Pending', accepted: 'Accepted', inProgress: 'In Progress', done: 'Completed', rejected: 'Rejected' }

function Badge({ status }) {
  return <span className={`badge badge-${status}`}>{statusLabel[status] || status}</span>
}

function Avatar({ name }) {
  return <div className="avatar">{name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
}

const NAV = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard' },
  { key: 'bookings',  icon: '📅', label: 'Bookings', badge: 2 },
  { key: 'calendar',  icon: '🗓️',  label: 'Availability' },
  { key: 'services',  icon: '🔧', label: 'Services' },
  { key: 'tracker',   icon: '📍', label: 'Job Tracker' },
  { key: 'profile',   icon: '🏪', label: 'Profile' },
]

function Sidebar({ page, setPage, open, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay${open ? ' visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="brand">⚙️ MechFind</div>
          <span className="role-badge">VENDOR PORTAL</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <div key={n.key} className={`nav-item${page === n.key ? ' active' : ''}`}
              onClick={() => { setPage(n.key); onClose() }}>
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
              {n.badge && <span className="nav-badge">{n.badge}</span>}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="vendor-name">{vendor.businessName}</div>
          <div className="vendor-status">● Live &amp; Verified</div>
        </div>
      </aside>
    </>
  )
}

function BottomNav({ page, setPage }) {
  const items = NAV.slice(0, 5)
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-items">
        {items.map(n => (
          <div key={n.key} className={`bottom-nav-item${page === n.key ? ' active' : ''}`} onClick={() => setPage(n.key)}>
            {n.badge && <span className="bn-badge">{n.badge}</span>}
            <span className="bn-icon">{n.icon}</span>
            <span>{n.label.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </nav>
  )
}

function ThemeToggle() {
  const { dark, toggle } = useContext(ThemeCtx)
  return (
    <button onClick={toggle} className="btn btn-ghost btn-sm theme-toggle" title={dark ? 'Switch to light mode' : 'Switch to dark mode'} style={{ fontSize: 16, padding: '6px 9px', lineHeight: 1 }}>
      {dark ? '☀️' : '🌙'}
    </button>
  )
}

function Topbar({ title, subtitle, onMenu, children }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="hamburger" onClick={onMenu}>☰</button>
        <div>
          <div className="topbar-title">{title}</div>
          {subtitle && <div className="topbar-sub">{subtitle}</div>}
        </div>
      </div>
      <div className="topbar-actions">
        {children}
        <ThemeToggle />
        <div className="notif-btn">
          <button className="btn btn-ghost btn-sm" style={{ fontSize: 18, padding: '6px 8px' }}>🔔</button>
          <div className="notification-dot" />
        </div>
        <Avatar name={vendor.ownerName} />
      </div>
    </div>
  )
}

/* ── Dashboard ─────────────────────────────────────────── */
function Dashboard({ setPage, onMenu }) {
  const pending = bookings.filter(b => b.status === 'requested').length
  const today   = bookings.filter(b => b.date === '2026-06-09').length
  const revenue = bookings.filter(b => b.status === 'done').reduce((s, b) => s + b.price, 0)

  return (
    <>
      <Topbar title="Dashboard" subtitle={`Good morning, ${vendor.ownerName.split(' ')[0]} 👋`} onMenu={onMenu}>
        <button className="btn btn-primary btn-sm" onClick={() => setPage('calendar')}>+ Add Slot</button>
      </Topbar>
      <div className="content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Pending</div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>{pending}</div>
            <div className="stat-delta stat-neutral">Needs action</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Today&apos;s Jobs</div>
            <div className="stat-value">{today}</div>
            <div className="stat-delta">↑ 2 vs yesterday</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Revenue</div>
            <div className="stat-value">${revenue}</div>
            <div className="stat-delta">↑ 18% this week</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Rating</div>
            <div className="stat-value">⭐ {vendor.rating}</div>
            <div className="stat-delta">{vendor.reviewCount} reviews</div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          <div className="card">
            <div className="flex justify-between items-center mb-3">
              <div className="card-title">Recent Bookings</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage('bookings')}>View all →</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Customer</th><th>Service</th><th>Status</th></tr></thead>
                <tbody>
                  {bookings.slice(0, 4).map(b => (
                    <tr key={b.id}>
                      <td><div className="flex items-center gap-2"><Avatar name={b.customerName} /><span className="fw-600">{b.customerName}</span></div></td>
                      <td style={{ color: 'var(--text-2)' }}>{b.service}</td>
                      <td><Badge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-title mb-3">Today&apos;s Schedule</div>
            {slots.filter(s => s.date === '2026-06-09').map(s => {
              const bk = bookings.find(b => b.date === s.date && b.time === s.start)
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 52, fontSize: 12, fontWeight: 700, color: 'var(--accent)', fontFamily: 'monospace' }}>{s.start}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.status === 'booked' ? (bk?.service || 'Booked') : 'Open Slot'}</div>
                    {bk && <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{bk.customerName}</div>}
                  </div>
                  <span className={`badge badge-${s.status}`}>{s.status}</span>
                </div>
              )
            })}
            <button className="btn btn-secondary btn-sm mt-3" onClick={() => setPage('calendar')}>Manage Availability</button>
          </div>
        </div>

        <div className="card mt-3">
          <div className="flex items-center gap-3">
            <div style={{ fontSize: 28, lineHeight: 1 }}>✅</div>
            <div>
              <div className="card-title">Insurance Verified</div>
              <div className="card-sub">Your profile is live and visible to customers in Calgary NW.</div>
            </div>
            <span className="badge badge-verified" style={{ marginLeft: 'auto', flexShrink: 0 }}>Verified</span>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Bookings ────────────────────────────────────────────── */
function Bookings({ onMenu }) {
  const [bk, setBk] = useState(bookings)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? bk : bk.filter(b => b.status === filter)

  function accept(id)       { setBk(p => p.map(b => b.id === id ? { ...b, status: 'accepted'   } : b)); setSelected(s => s ? { ...s, status: 'accepted'   } : s) }
  function reject(id)       { setBk(p => p.map(b => b.id === id ? { ...b, status: 'rejected'   } : b)); setSelected(s => s ? { ...s, status: 'rejected'   } : s) }
  function advance(id, cur) {
    const next = cur === 'accepted' ? 'inProgress' : 'done'
    setBk(p => p.map(b => b.id === id ? { ...b, status: next } : b))
    setSelected(s => s ? { ...s, status: next } : s)
  }

  return (
    <>
      <Topbar title="Bookings" subtitle="Manage incoming and active jobs" onMenu={onMenu} />
      <div className="content">
        <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
          {['all','requested','accepted','inProgress','done'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : statusLabel[f]}
              {f !== 'all' && (
                <span style={{ marginLeft: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '0 5px', fontSize: 11 }}>
                  {bk.filter(b => b.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Customer</th><th>Service</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id} style={{ cursor: 'pointer', background: selected?.id === b.id ? 'var(--accent-dim)' : '' }}
                      onClick={() => setSelected(b)}>
                      <td><div className="flex items-center gap-2"><Avatar name={b.customerName} /><span className="fw-600">{b.customerName}</span></div></td>
                      <td style={{ color: 'var(--text-2)' }}>{b.service}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{b.date}<br />{b.time}</td>
                      <td><Badge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selected ? (
            <div className="card">
              <div className="flex justify-between items-center mb-3">
                <div className="card-title">Booking #{selected.id}</div>
                <Badge status={selected.status} />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={selected.customerName} />
                <div>
                  <div className="fw-600">{selected.customerName}</div>
                  <div className="text-muted">{selected.customerPhone}</div>
                </div>
              </div>
              <hr className="divider" />
              <div className="grid-2" style={{ gap: 12, fontSize: 14, marginBottom: 4 }}>
                {[['Service', selected.service], ['Price', `$${selected.price}`], ['Date & Time', `${selected.date} · ${selected.time}`], ['Vehicle', selected.vehicle]].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-muted" style={{ fontSize: 11, marginBottom: 3 }}>{k}</div>
                    <div className="fw-600">{v}</div>
                  </div>
                ))}
                <div>
                  <div className="text-muted" style={{ fontSize: 11, marginBottom: 3 }}>Mode</div>
                  <span className={`badge badge-${selected.mode}`}>{selected.mode}</span>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: 11, marginBottom: 3 }}>VIN</div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-2)' }}>{selected.vin}</div>
                </div>
              </div>
              {selected.notes && (
                <div className="mt-3" style={{ background: 'var(--accent-dim)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 8, padding: 12, fontSize: 13, color: 'var(--accent)' }}>
                  <strong>Note:</strong> {selected.notes}
                </div>
              )}
              <hr className="divider" />
              <div className="flex gap-2">
                {selected.status === 'requested' && <>
                  <button className="btn btn-success btn-sm" onClick={() => accept(selected.id)}>✓ Accept</button>
                  <button className="btn btn-danger btn-sm" onClick={() => reject(selected.id)}>✗ Reject</button>
                </>}
                {selected.status === 'accepted' && <button className="btn btn-primary btn-sm" onClick={() => advance(selected.id, 'accepted')}>▶ Mark In Progress</button>}
                {selected.status === 'inProgress' && <button className="btn btn-success btn-sm" onClick={() => advance(selected.id, 'inProgress')}>✓ Mark Complete</button>}
                {(selected.status === 'done' || selected.status === 'rejected') && <div className="text-muted">No further actions</div>}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="empty-state">
                <div className="icon">👆</div>
                <div>Select a booking to view details</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ── Calendar ────────────────────────────────────────────── */
function Calendar({ onMenu }) {
  const [slotList, setSlotList] = useState(slots)
  const [showAdd, setShowAdd] = useState(false)
  const [newSlot, setNewSlot] = useState({ date: '2026-06-09', start: '08:00', end: '08:30' })

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const monthDays = Array.from({ length: 35 }, (_, i) => (i - 1 >= 1 && i - 1 <= 30 ? i - 1 : null))

  return (
    <>
      <Topbar title="Availability" subtitle="Post and manage your open slots" onMenu={onMenu}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>+ Add Slot</button>
      </Topbar>
      <div className="content">
        {showAdd && (
          <div className="card mb-4">
            <div className="card-title mb-3">Add Open Slot</div>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={newSlot.date} onChange={e => setNewSlot(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Start</label>
                <input className="form-input" type="time" value={newSlot.start} onChange={e => setNewSlot(p => ({ ...p, start: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">End</label>
                <input className="form-input" type="time" value={newSlot.end} onChange={e => setNewSlot(p => ({ ...p, end: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary btn-sm" onClick={() => { setSlotList(p => [...p, { id: `sl${Date.now()}`, ...newSlot, status: 'open', serviceId: null }]); setShowAdd(false) }}>Save Slot</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="card mb-4">
          <div className="card-title mb-3">June 2026</div>
          <div className="cal-grid">
            {days.map(d => <div key={d} className="cal-day-header">{d}</div>)}
            {monthDays.map((d, i) => {
              const ds = d ? slotList.filter(s => parseInt(s.date.split('-')[2]) === d) : []
              return (
                <div key={i} className={`cal-day${d === 9 ? ' today' : ''}${!d ? ' other-month' : ''}`}>
                  {d && <>
                    <div className="cal-day-num">{d}</div>
                    {ds.map(s => <div key={s.id} className={`cal-slot ${s.status}`}>{s.start}</div>)}
                  </>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }} className="card-title">All Slots</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Start</th><th>End</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {slotList.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{s.date}</td>
                    <td>{s.start}</td><td>{s.end}</td>
                    <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                    <td>{s.status === 'open' && <button className="btn btn-danger btn-sm" onClick={() => setSlotList(p => p.filter(sl => sl.id !== s.id))}>Remove</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Services ────────────────────────────────────────────── */
function Services({ onMenu }) {
  const [svcList, setSvcList] = useState(services)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ category: '', price: '', mode: 'instore', durationMins: 30 })

  return (
    <>
      <Topbar title="Services" subtitle="Manage your offerings and pricing" onMenu={onMenu}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>+ Add Service</button>
      </Topbar>
      <div className="content">
        {showAdd && (
          <div className="card mb-4">
            <div className="card-title mb-3">New Service</div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Service Name</label>
                <input className="form-input" placeholder="e.g. Transmission Flush" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Price (CAD)</label>
                <input className="form-input" type="number" placeholder="120" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={form.mode} onChange={e => setForm(p => ({ ...p, mode: e.target.value }))}>
                  <option value="instore">In-Store</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration (min)</label>
                <input className="form-input" type="number" value={form.durationMins} onChange={e => setForm(p => ({ ...p, durationMins: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary btn-sm" onClick={() => { setSvcList(p => [...p, { id: `s${Date.now()}`, ...form, price: Number(form.price) }]); setShowAdd(false); setForm({ category: '', price: '', mode: 'instore', durationMins: 30 }) }}>Add</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Service</th><th>Price</th><th>Type</th><th>Duration</th><th></th></tr></thead>
              <tbody>
                {svcList.map(s => (
                  <tr key={s.id}>
                    <td className="fw-600">{s.category}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 700 }}>${s.price}</td>
                    <td><span className={`badge badge-${s.mode}`}>{s.mode === 'mobile' ? '🚗 Mobile' : '🏪 In-Store'}</span></td>
                    <td style={{ color: 'var(--text-2)' }}>{s.durationMins} min</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => setSvcList(p => p.filter(sv => sv.id !== s.id))}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Job Tracker ─────────────────────────────────────────── */
function JobTracker({ onMenu }) {
  const steps = ['requested','accepted','inProgress','done']
  const stepLabel = { requested: 'Requested', accepted: 'Accepted', inProgress: 'In Progress', done: 'Completed' }

  return (
    <>
      <Topbar title="Job Tracker" subtitle="Live status of all active jobs" onMenu={onMenu} />
      <div className="content">
        {bookings.filter(b => b.status !== 'rejected').map(b => {
          const idx = steps.indexOf(b.status)
          return (
            <div key={b.id} className="card mb-3">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <Avatar name={b.customerName} />
                  <div>
                    <div className="fw-600">{b.customerName}</div>
                    <div className="text-muted">{b.service} · {b.vehicle}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-2)' }}>
                  <div>{b.date} · {b.time}</div>
                  <div style={{ marginTop: 2 }}>${b.price} · <span className={`badge badge-${b.mode}`}>{b.mode}</span></div>
                </div>
              </div>
              <div className="tracker-steps">
                {steps.map((s, i) => (
                  <div key={s} className="tracker-step">
                    <div className={`step-circle${i < idx ? ' done' : i === idx ? ' active' : ''}`}>{i < idx ? '✓' : i + 1}</div>
                    <div className={`step-label${i === idx ? ' active' : ''}`}>{stepLabel[s]}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ── Profile ─────────────────────────────────────────────── */
function Profile({ onMenu }) {
  return (
    <>
      <Topbar title="Profile" subtitle="Business info and settings" onMenu={onMenu} />
      <div className="content">
        <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
          <div>
            <div className="card mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--accent-dim)', border: '1px solid rgba(249,115,22,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🏪</div>
                <div>
                  <div className="card-title">{vendor.businessName}</div>
                  <div className="card-sub">Member since {vendor.joinedDate}</div>
                </div>
                <span className="badge badge-verified" style={{ marginLeft: 'auto' }}>✓ Verified</span>
              </div>
              <hr className="divider" />
              {[['Owner', vendor.ownerName], ['Email', vendor.email], ['Phone', vendor.phone], ['Address', vendor.address], ['Service Area', vendor.serviceArea]].map(([label, val]) => (
                <div key={label} className="info-row">
                  <span className="info-label">{label}</span>
                  <span className="info-value">{val}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-title mb-3">Insurance Document</div>
              <div className="upload-zone uploaded">
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <div className="fw-600">Insurance Verified</div>
                <div className="text-muted mt-1">insurance-proof.pdf · March 2025</div>
                <button className="btn btn-secondary btn-sm mt-3">Replace Document</button>
              </div>
            </div>
          </div>
          <div>
            <div className="card mb-4">
              <div className="card-title mb-3">Performance</div>
              {[['Rating', `⭐ ${vendor.rating} / 5.0`], ['Reviews', vendor.reviewCount], ['Bookings This Month', 18], ['Completion Rate', '96%'], ['Avg Response', '< 2 hours']].map(([label, val]) => (
                <div key={label} className="info-row">
                  <span className="info-label">{label}</span>
                  <span className="info-value">{val}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-title mb-3">Edit Profile</div>
              <div className="form-group"><label className="form-label">Business Name</label><input className="form-input" defaultValue={vendor.businessName} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" defaultValue={vendor.phone} /></div>
              <div className="form-group"><label className="form-label">Service Area</label><input className="form-input" defaultValue={vendor.serviceArea} /></div>
              <button className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Login ───────────────────────────────────────────────── */
function Login({ onLogin }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">⚙️ MechFind</div>
        <div className="auth-sub">Vendor Portal — Sign in to your shop account</div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" defaultValue="mike@calgaryauto.ca" />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" defaultValue="••••••••" />
        </div>
        <button className="btn btn-primary btn-full" onClick={onLogin}>Sign In</button>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-2)' }}>
          New vendor?{' '}
          <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }} onClick={onLogin}>Request Access →</span>
        </div>
        <hr className="divider" />
        <div className="auth-demo">
          <strong>Demo:</strong> Click &ldquo;Sign In&rdquo; to enter the vendor dashboard
        </div>
      </div>
    </div>
  )
}

/* ── App Root ────────────────────────────────────────────── */
export default function App() {
  const [authed, setAuthed] = useState(false)
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('mf-vendor-theme') !== 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('mf-vendor-theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggle = () => setDark(d => !d)

  if (!authed) return (
    <ThemeCtx.Provider value={{ dark, toggle }}>
      <Login onLogin={() => setAuthed(true)} />
    </ThemeCtx.Provider>
  )

  const onMenu = () => setSidebarOpen(o => !o)
  const onClose = () => setSidebarOpen(false)

  const pages = {
    dashboard: <Dashboard setPage={setPage} onMenu={onMenu} />,
    bookings:  <Bookings onMenu={onMenu} />,
    calendar:  <Calendar onMenu={onMenu} />,
    services:  <Services onMenu={onMenu} />,
    tracker:   <JobTracker onMenu={onMenu} />,
    profile:   <Profile onMenu={onMenu} />,
  }

  return (
    <ThemeCtx.Provider value={{ dark, toggle }}>
      <div className="layout">
        <Sidebar page={page} setPage={setPage} open={sidebarOpen} onClose={onClose} />
        <main className="main">{pages[page]}</main>
        <BottomNav page={page} setPage={p => { setPage(p); onClose() }} />
      </div>
    </ThemeCtx.Provider>
  )
}
