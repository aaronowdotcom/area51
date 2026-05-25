import { useState } from 'react'
import Layout from '../components/Layout'

const defaultForm = {
  clientName: '',
  clientCompany: '',
  clientTitle: '',
  product: 'NexaFlow Business',
  seats: '10',
  term: '12',
  discount: '0',
  notes: '',
}

function calcTotal(form) {
  const basePrice = { 'NexaFlow Starter': 79, 'NexaFlow Business': 239, 'NexaFlow Enterprise': 0 }
  const price = basePrice[form.product] || 239
  const seats = parseInt(form.seats) || 1
  const term = parseInt(form.term) || 12
  const discount = parseFloat(form.discount) || 0
  const subtotal = price * seats * term
  const discountAmt = subtotal * (discount / 100)
  return { subtotal, discountAmt, total: subtotal - discountAmt, monthly: price * seats }
}

export default function Proposals() {
  const [form, setForm] = useState(defaultForm)
  const [status, setStatus] = useState(null) // null | 'generating' | 'done' | 'error'
  const [proposalHtml, setProposalHtml] = useState(null)

  const totals = calcTotal(form)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function generate() {
    setStatus('generating')
    try {
      // Try Java service first, fall back to local generation
      const port = typeof window !== 'undefined' && window.salesKit
        ? await window.salesKit.getJavaPort()
        : 7878

      const res = await fetch(`http://localhost:${port}/api/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...totals }),
      })

      if (res.ok) {
        const data = await res.json()
        setProposalHtml(data.html)
      } else {
        throw new Error('Service unavailable')
      }
    } catch {
      // Generate locally when Java service isn't running
      setProposalHtml(buildLocalHtml(form, totals))
    }
    setStatus('done')
  }

  function printProposal() {
    const win = window.open('', '_blank')
    win.document.write(proposalHtml)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <Layout title="Proposals">
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Proposal Generator</h1>
          <p className="text-slate-400 mt-1">Build a branded proposal in seconds — printed to PDF via Java service</p>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Form */}
          <div className="col-span-3 space-y-5">
            <div className="card">
              <h2 className="font-semibold text-slate-200 mb-4">Client Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Contact Name</label>
                  <input className="input" placeholder="Jane Smith" value={form.clientName} onChange={set('clientName')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Title</label>
                  <input className="input" placeholder="VP of Operations" value={form.clientTitle} onChange={set('clientTitle')} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Company Name</label>
                  <input className="input" placeholder="Acme Corporation" value={form.clientCompany} onChange={set('clientCompany')} />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold text-slate-200 mb-4">Deal Configuration</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Product</label>
                  <select className="input" value={form.product} onChange={set('product')}>
                    <option>NexaFlow Starter</option>
                    <option>NexaFlow Business</option>
                    <option>NexaFlow Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Number of Seats</label>
                  <input className="input" type="number" min="1" value={form.seats} onChange={set('seats')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Contract Term (months)</label>
                  <select className="input" value={form.term} onChange={set('term')}>
                    <option value="1">1 month</option>
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                    <option value="36">36 months</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Discount (%)</label>
                  <input className="input" type="number" min="0" max="50" value={form.discount} onChange={set('discount')} />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold text-slate-200 mb-3">Custom Notes</h2>
              <textarea
                className="input resize-none"
                rows={4}
                placeholder="Add custom notes, implementation scope, or special terms..."
                value={form.notes}
                onChange={set('notes')}
              />
            </div>
          </div>

          {/* Summary & actions */}
          <div className="col-span-2 space-y-5">
            <div className="card">
              <h2 className="font-semibold text-slate-200 mb-4">Deal Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Monthly value</span>
                  <span className="text-slate-200 font-medium">${totals.monthly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Contract length</span>
                  <span className="text-slate-200 font-medium">{form.term} months</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-slate-200 font-medium">${totals.subtotal.toLocaleString()}</span>
                </div>
                {totals.discountAmt > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({form.discount}%)</span>
                    <span>−${totals.discountAmt.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-slate-700 pt-3 flex justify-between font-bold text-base">
                  <span className="text-slate-100">Total Contract Value</span>
                  <span className="text-brand-400">${totals.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={!form.clientCompany || status === 'generating'}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'generating' ? 'Generating…' : 'Generate Proposal'}
            </button>

            {status === 'done' && (
              <div className="card border-emerald-600/30">
                <p className="text-emerald-400 text-sm font-medium mb-3">✓ Proposal ready</p>
                <div className="space-y-2">
                  <button onClick={printProposal} className="w-full btn-secondary text-sm">
                    Print / Save as PDF
                  </button>
                </div>
              </div>
            )}

            <div className="card bg-dark-700/30">
              <p className="text-xs text-slate-500 leading-relaxed">
                Proposals are generated by the bundled Java service running locally on your laptop. No data leaves your machine.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function buildLocalHtml(form, totals) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>NexaFlow Proposal — ${form.clientCompany}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; }
  .header { background: #1d4ed8; color: white; padding: 40px 48px; }
  .header h1 { font-size: 28px; font-weight: 800; }
  .header p { font-size: 14px; opacity: 0.8; margin-top: 4px; }
  .body { padding: 48px; }
  .section { margin-bottom: 36px; }
  .section h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 12px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .info-item label { font-size: 12px; color: #94a3b8; display: block; }
  .info-item span { font-size: 15px; font-weight: 600; color: #0f172a; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; border-bottom: 2px solid #e2e8f0; padding: 10px 12px; }
  td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
  .total-row td { font-weight: 700; font-size: 16px; color: #1d4ed8; border-top: 2px solid #e2e8f0; border-bottom: none; }
  .footer { margin-top: 60px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
  .notes { background: #f8fafc; border-left: 3px solid #2563eb; padding: 16px; border-radius: 0 8px 8px 0; font-size: 14px; color: #334155; }
</style>
</head>
<body>
<div class="header">
  <h1>Sales Proposal</h1>
  <p>Prepared for ${form.clientCompany} · ${date}</p>
</div>
<div class="body">
  <div class="section">
    <h2>Prepared For</h2>
    <div class="info-grid">
      <div class="info-item"><label>Contact</label><span>${form.clientName || '—'}</span></div>
      <div class="info-item"><label>Title</label><span>${form.clientTitle || '—'}</span></div>
      <div class="info-item"><label>Company</label><span>${form.clientCompany}</span></div>
      <div class="info-item"><label>Date</label><span>${date}</span></div>
    </div>
  </div>

  <div class="section">
    <h2>Proposed Solution</h2>
    <table>
      <tr><th>Product</th><th>Seats</th><th>Term</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Amount</th></tr>
      <tr>
        <td>${form.product}</td>
        <td>${form.seats}</td>
        <td>${form.term} months</td>
        <td style="text-align:right">$${totals.monthly.toLocaleString()}/mo</td>
        <td style="text-align:right">$${totals.subtotal.toLocaleString()}</td>
      </tr>
      ${totals.discountAmt > 0 ? `<tr><td colspan="4">Discount (${form.discount}%)</td><td style="text-align:right;color:#16a34a">−$${totals.discountAmt.toLocaleString()}</td></tr>` : ''}
      <tr class="total-row"><td colspan="4">Total Contract Value</td><td style="text-align:right">$${totals.total.toLocaleString()}</td></tr>
    </table>
  </div>

  ${form.notes ? `<div class="section"><h2>Notes & Scope</h2><div class="notes">${form.notes}</div></div>` : ''}

  <div class="footer">
    <p>This proposal is valid for 30 days from the date above. Prices are in USD.</p>
    <p style="margin-top:4px">NexaFlow Inc. · sales@nexaflow.io · nexaflow.io</p>
  </div>
</div>
</body>
</html>`
}
