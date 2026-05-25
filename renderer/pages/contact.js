import { useState } from 'react'
import Layout from '../components/Layout'

const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM']

const demoTypes = [
  { id: 'overview', label: '30-min Product Overview', desc: 'High-level walkthrough of the platform' },
  { id: 'deep', label: '60-min Deep Dive', desc: 'Technical demo tailored to your workflows' },
  { id: 'poc', label: 'POC Workshop', desc: 'Build a working prototype together' },
]

export default function Contact() {
  const [form, setForm] = useState({
    name: '', email: '', company: '', phone: '',
    demoType: 'overview', preferredDate: '', preferredTime: '',
    teamSize: '', currentTools: '', goals: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function submit(e) {
    e.preventDefault()
    // In production this POSTs to CRM or Java service
    console.log('Demo request:', form)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Layout title="Book a Demo">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="text-6xl mb-6">✓</div>
          <h1 className="text-2xl font-bold text-slate-100 mb-3">Demo Request Submitted!</h1>
          <p className="text-slate-400 mb-2">
            Thank you, <strong className="text-slate-200">{form.name}</strong>. We'll confirm your session within 1 business hour.
          </p>
          <p className="text-slate-500 text-sm mb-8">
            A calendar invite will be sent to <span className="text-brand-400">{form.email}</span>
          </p>
          <div className="card text-left mb-6">
            <h2 className="font-semibold text-slate-200 mb-3 text-sm">Your Request Summary</h2>
            <dl className="space-y-2 text-sm">
              {[
                ['Company', form.company],
                ['Demo Type', demoTypes.find(d => d.id === form.demoType)?.label],
                ['Preferred Date', form.preferredDate],
                ['Preferred Time', form.preferredTime],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <dt className="text-slate-500 w-32 shrink-0">{k}</dt>
                  <dd className="text-slate-200">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
          <button onClick={() => setSubmitted(false)} className="btn-secondary">
            Book Another Demo
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Book a Demo">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Book a Demo</h1>
          <p className="text-slate-400 mt-1">Schedule a product demo tailored to your team's needs</p>
        </div>

        <form onSubmit={submit} className="grid grid-cols-5 gap-6">
          <div className="col-span-3 space-y-5">
            {/* Contact info */}
            <div className="card">
              <h2 className="font-semibold text-slate-200 mb-4">Contact Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name *</label>
                  <input className="input" required placeholder="Jane Smith" value={form.name} onChange={set('name')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Work Email *</label>
                  <input className="input" required type="email" placeholder="jane@acme.com" value={form.email} onChange={set('email')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Company *</label>
                  <input className="input" required placeholder="Acme Corp" value={form.company} onChange={set('company')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone</label>
                  <input className="input" type="tel" placeholder="+1 555 000 0000" value={form.phone} onChange={set('phone')} />
                </div>
              </div>
            </div>

            {/* Demo type */}
            <div className="card">
              <h2 className="font-semibold text-slate-200 mb-4">Demo Format</h2>
              <div className="space-y-2">
                {demoTypes.map((dt) => (
                  <label
                    key={dt.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                      form.demoType === dt.id
                        ? 'border-brand-600/60 bg-brand-600/10'
                        : 'border-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="demoType"
                      value={dt.id}
                      checked={form.demoType === dt.id}
                      onChange={set('demoType')}
                      className="mt-1 accent-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-200">{dt.label}</p>
                      <p className="text-xs text-slate-500">{dt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Scheduling */}
            <div className="card">
              <h2 className="font-semibold text-slate-200 mb-4">Scheduling Preference</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Preferred Date</label>
                  <input className="input" type="date" value={form.preferredDate} onChange={set('preferredDate')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Preferred Time</label>
                  <select className="input" value={form.preferredTime} onChange={set('preferredTime')}>
                    <option value="">Select time…</option>
                    {timeSlots.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="col-span-2 space-y-5">
            <div className="card">
              <h2 className="font-semibold text-slate-200 mb-4">Tell Us About Your Team</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Team Size</label>
                  <select className="input" value={form.teamSize} onChange={set('teamSize')}>
                    <option value="">Select…</option>
                    <option>1–10</option>
                    <option>11–50</option>
                    <option>51–200</option>
                    <option>201–1000</option>
                    <option>1000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Current Tools</label>
                  <input className="input" placeholder="Zapier, Make, custom scripts…" value={form.currentTools} onChange={set('currentTools')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Main Goals</label>
                  <textarea
                    className="input resize-none"
                    rows={4}
                    placeholder="What are you hoping to automate or improve?"
                    value={form.goals}
                    onChange={set('goals')}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full btn-primary">
              Request Demo
            </button>

            <div className="card bg-dark-700/30 text-xs text-slate-500 leading-relaxed">
              We typically confirm demos within 1 business hour. Your information is never shared with third parties.
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}
