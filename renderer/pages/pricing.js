import { useState } from 'react'
import Layout from '../components/Layout'

const plans = [
  {
    name: 'Starter',
    price: { monthly: 99, annual: 79 },
    unit: 'per seat/mo',
    desc: 'For small teams just getting started with automation.',
    features: [
      '5 active workflows',
      'Up to 10,000 runs/month',
      '50+ integrations',
      'Email support',
      '5 GB log retention',
    ],
    excluded: ['Analytics dashboard', 'SSO / SAML', 'Audit logs', 'Dedicated support'],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Business',
    price: { monthly: 299, annual: 239 },
    unit: 'per seat/mo',
    desc: 'For scaling teams that need power, visibility, and control.',
    features: [
      'Unlimited workflows',
      'Up to 500,000 runs/month',
      '200+ integrations',
      'Analytics dashboard',
      'Priority support (4h SLA)',
      '90-day log retention',
      'Team workspaces',
    ],
    excluded: ['SSO / SAML', 'Custom SLA'],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: null,
    unit: 'custom pricing',
    desc: 'For organizations that need compliance, security, and scale.',
    features: [
      'Unlimited everything',
      'SSO / SAML 2.0 & SCIM',
      'Full audit trail',
      'Custom SLA agreements',
      'Dedicated success manager',
      'On-premise deployment option',
      'Custom integrations',
    ],
    excluded: [],
    cta: 'Contact Sales',
    highlight: false,
  },
]

const addons = [
  { name: 'Extra Run Pack', price: '$49/mo', desc: '+ 250,000 runs/month' },
  { name: 'Advanced Analytics', price: '$79/mo', desc: 'BI-grade dashboards & exports' },
  { name: 'Compliance Pack', price: '$149/mo', desc: 'SOC 2, HIPAA, GDPR controls' },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(true)

  return (
    <Layout title="Pricing">
      <div className="max-w-6xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Pricing</h1>
            <p className="text-slate-400 mt-1">Transparent pricing that scales with your team</p>
          </div>
          <div className="flex items-center gap-3 bg-dark-700 rounded-lg p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${!annual ? 'bg-dark-900 text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${annual ? 'bg-dark-900 text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Annual <span className="text-emerald-400 text-xs ml-1">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card flex flex-col ${plan.highlight ? 'border-brand-600/60 ring-1 ring-brand-600/30' : ''}`}
            >
              {plan.highlight && (
                <div className="text-center mb-4">
                  <span className="badge-blue text-xs">Recommended</span>
                </div>
              )}
              <h2 className="text-xl font-bold text-slate-100">{plan.name}</h2>
              <div className="mt-3 mb-2">
                {plan.price ? (
                  <>
                    <span className="text-4xl font-extrabold text-slate-100">
                      ${annual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-slate-500 text-sm ml-1">{plan.unit}</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-slate-300">Custom</span>
                )}
              </div>
              <p className="text-slate-500 text-sm mb-5">{plan.desc}</p>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
                {plan.excluded.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="shrink-0 mt-0.5">✗</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="/contact"
                className={`text-center rounded-lg font-semibold py-2.5 text-sm transition-colors ${
                  plan.highlight ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Available Add-ons</h2>
          <div className="grid grid-cols-3 gap-4">
            {addons.map((a) => (
              <div key={a.name} className="bg-dark-700/50 rounded-lg p-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-200 text-sm">{a.name}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">{a.desc}</p>
                </div>
                <span className="text-brand-400 font-semibold text-sm shrink-0">{a.price}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-slate-600 text-sm mt-6">
          All plans include 14-day free trial · No credit card required · Cancel anytime
        </p>
      </div>
    </Layout>
  )
}
