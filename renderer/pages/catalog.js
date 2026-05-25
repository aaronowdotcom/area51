import Layout from '../components/Layout'

const products = [
  {
    id: 1,
    name: 'NexaFlow Core',
    tagline: 'Workflow Automation for Growing Teams',
    description:
      'Automate repetitive tasks, connect your existing tools, and free your team to focus on what matters. NexaFlow Core integrates with 200+ apps out of the box.',
    highlights: ['Visual drag-and-drop builder', '200+ pre-built integrations', 'Real-time execution logs', 'Role-based access control'],
    badge: 'Most Popular',
    badgeClass: 'badge-blue',
    icon: '⚡',
    color: 'from-blue-600/20 to-blue-900/10',
  },
  {
    id: 2,
    name: 'NexaFlow Analytics',
    tagline: 'Business Intelligence Built into Your Workflows',
    description:
      'Turn workflow data into actionable insights. Track KPIs, monitor SLAs, and generate executive reports automatically — no data team required.',
    highlights: ['30+ chart types & dashboards', 'Automated scheduled reports', 'SLA monitoring & alerts', 'Custom metrics builder'],
    badge: 'New',
    badgeClass: 'badge-green',
    icon: '◉',
    color: 'from-emerald-600/20 to-emerald-900/10',
  },
  {
    id: 3,
    name: 'NexaFlow Enterprise',
    tagline: 'The Full Platform for Complex Organizations',
    description:
      'Everything in Core and Analytics, plus enterprise-grade security, SSO, audit logs, and dedicated support. Built for regulated industries and global teams.',
    highlights: ['SSO / SAML 2.0 & SCIM', 'Full audit trail & compliance', 'Dedicated success manager', 'Custom SLA agreements'],
    badge: 'Enterprise',
    badgeClass: 'badge-orange',
    icon: '◈',
    color: 'from-purple-600/20 to-purple-900/10',
  },
]

const useCases = [
  { title: 'Sales Ops', desc: 'Auto-qualify leads, sync CRM, trigger proposals' },
  { title: 'HR & Onboarding', desc: 'Provision accounts, assign training, notify managers' },
  { title: 'Finance', desc: 'Approval workflows, invoice routing, reconciliation' },
  { title: 'IT Operations', desc: 'Ticket routing, change management, alerts' },
  { title: 'Customer Success', desc: 'Health scoring, QBR prep, renewal automation' },
  { title: 'Marketing', desc: 'Campaign triggers, lead scoring, attribution reports' },
]

export default function Catalog() {
  return (
    <Layout title="Products">
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Product Catalog</h1>
          <p className="text-slate-400 mt-1">Three powerful products, one unified platform</p>
        </div>

        {/* Products */}
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
                        <span className="text-emerald-400 shrink-0">✓</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="shrink-0 flex flex-col gap-2">
                  <a href="/pricing" className="btn-primary text-sm">View Pricing</a>
                  <a href="/proposals" className="btn-secondary text-sm text-center">Add to Proposal</a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Use cases */}
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
