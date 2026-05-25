import Layout from '../components/Layout'

export async function getServerSideProps() {
  const fs = require('fs')
  const path = require('path')
  const dir = process.env.CONTENT_DIR || path.join(process.cwd(), '..', 'content')
  try {
    const products = JSON.parse(fs.readFileSync(path.join(dir, 'products.json'), 'utf8'))
    return { props: { products } }
  } catch {
    return { props: { products: [] } }
  }
}

const useCases = [
  { title: 'Sales Ops',         desc: 'Auto-qualify leads, sync CRM, trigger proposals' },
  { title: 'HR & Onboarding',   desc: 'Provision accounts, assign training, notify managers' },
  { title: 'Finance',           desc: 'Approval workflows, invoice routing, reconciliation' },
  { title: 'IT Operations',     desc: 'Ticket routing, change management, alerts' },
  { title: 'Customer Success',  desc: 'Health scoring, QBR prep, renewal automation' },
  { title: 'Marketing',         desc: 'Campaign triggers, lead scoring, attribution reports' },
]

export default function Catalog({ products }) {
  return (
    <Layout title="Products">
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Product Catalog</h1>
          <p className="text-slate-400 mt-1">Three powerful products, one unified platform</p>
        </div>

        <div className="space-y-5 mb-10">
          {products.map((p) => (
            <div key={p.id} className={`card bg-gradient-to-r ${p.color} border-slate-700/50`}>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-dark-800/80 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-bold text-slate-100">{p.name}</h2>
                    <span className={p.badgeClass}>{p.badge}</span>
                  </div>
                  <p className="text-brand-400 text-sm font-medium mb-2">{p.tagline}</p>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{p.description}</p>
                  <ul className="grid grid-cols-2 gap-1.5">
                    {p.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="text-emerald-400 shrink-0">✓</span>{h}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="shrink-0 flex flex-col gap-2">
                  <a href="/pricing"   className="btn-primary text-sm">View Pricing</a>
                  <a href="/proposals" className="btn-secondary text-sm text-center">Add to Proposal</a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Common Use Cases</h2>
          <div className="grid grid-cols-3 gap-4">
            {useCases.map((u) => (
              <div key={u.title} className="bg-dark-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-200 text-sm">{u.title}</h3>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
