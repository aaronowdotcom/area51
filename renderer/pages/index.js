import Layout from '../components/Layout'

const stats = [
  { label: 'Pipeline Value',      value: '$2.4M', change: '+12%', up: true  },
  { label: 'Open Opportunities',  value: '34',    change: '+5',   up: true  },
  { label: 'Demos This Month',    value: '18',    change: '+3',   up: true  },
  { label: 'Win Rate',            value: '41%',   change: '-2%',  up: false },
]

const stageColor = {
  Discovery:   'badge-blue',
  Demo:        'badge-blue',
  Proposal:    'badge-orange',
  Negotiation: 'badge-orange',
  'Closed Won':'badge-green',
}

export async function getServerSideProps() {
  const fs = require('fs')
  const path = require('path')
  const dir = process.env.CONTENT_DIR || path.join(process.cwd(), '..', 'content')
  try {
    const pipeline = JSON.parse(fs.readFileSync(path.join(dir, 'pipeline.json'), 'utf8'))
    return { props: { pipeline } }
  } catch {
    return { props: { pipeline: [] } }
  }
}

export default function Dashboard({ pipeline }) {
  return (
    <Layout title="Dashboard">
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Sales Dashboard</h1>
          <p className="text-slate-400 mt-1">Your pipeline at a glance — May 2025</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="card">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-bold text-slate-100 mt-2">{s.value}</p>
              <p className={`text-sm mt-1 font-medium ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {s.up ? '↑' : '↓'} {s.change} vs last month
              </p>
            </div>
          ))}
        </div>

        <div className="card mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-slate-100">Active Pipeline</h2>
            <span className="badge-blue">My Deals</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-500 font-medium pb-3 pr-4">Company</th>
                <th className="text-left text-slate-500 font-medium pb-3 pr-4">Stage</th>
                <th className="text-right text-slate-500 font-medium pb-3 pr-4">Value</th>
                <th className="text-right text-slate-500 font-medium pb-3">Days in Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {pipeline.map((deal) => (
                <tr key={deal.company} className="hover:bg-dark-700/30 transition-colors">
                  <td className="py-3.5 pr-4 font-medium text-slate-200">{deal.company}</td>
                  <td className="py-3.5 pr-4">
                    <span className={stageColor[deal.stage]}>{deal.stage}</span>
                  </td>
                  <td className="py-3.5 pr-4 text-right font-mono text-slate-300">{deal.value}</td>
                  <td className="py-3.5 text-right text-slate-400">
                    {deal.days === 0 ? '—' : `${deal.days}d`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { title: 'Generate Proposal', desc: 'Create a branded PDF proposal in seconds', href: '/proposals' },
            { title: 'View Pricing',      desc: 'Compare plans and configure custom quotes', href: '/pricing'   },
            { title: 'Book a Demo',       desc: 'Schedule a product demo for your prospect',  href: '/contact'   },
          ].map((a) => (
            <a key={a.title} href={a.href} className="card hover:border-brand-600/50 transition-colors group">
              <h3 className="font-semibold text-slate-200 group-hover:text-brand-400 transition-colors">{a.title}</h3>
              <p className="text-slate-500 text-sm mt-1">{a.desc}</p>
              <p className="text-brand-400 text-sm font-medium mt-3">Open →</p>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  )
}
