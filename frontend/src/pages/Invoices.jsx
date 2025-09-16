import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { format } from 'date-fns';
import StatusPill from '../components/StatusPill.jsx';

const money = (n, currency = 'USD') => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n || 0);

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    number: '',
    title: '',
    clientId: '',
    dueDate: '',
    amount: '',
    currency: 'USD',
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [inv, cls] = await Promise.all([
        api.get('/invoices', { params: { q, status } }),
        api.get('/clients'),
      ]);
      setInvoices(inv.data);
      setClients(cls.data);
    } catch (e) {
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => invoices, [invoices]);

  async function addInvoice(e) {
    e.preventDefault();
    const payload = {
      number: form.number.trim(),
      title: form.title.trim() || undefined,
      clientId: form.clientId,
      dueDate: new Date(form.dueDate),
      amount: Number(form.amount),
      currency: form.currency || 'USD',
    };
    if (!payload.number || !payload.clientId || !payload.dueDate || !payload.amount) return;
    setSaving(true);
    try {
      const res = await api.post('/invoices', payload);
      setInvoices([res.data, ...invoices]);
      setForm({ number: '', title: '', clientId: '', dueDate: '', amount: '', currency: 'USD' });
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(id) {
    await api.post(`/invoices/${id}/mark-paid`);
    await load();
  }

  async function addPayment(id) {
    const raw = prompt('Enter payment amount');
    if (!raw) return;
    const amount = Number(raw);
    if (Number.isNaN(amount) || amount <= 0) return alert('Invalid amount');
    await api.post('/payments', { invoiceId: id, amount });
    await load();
  }

  return (
    <div className="container-responsive py-4 space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Invoices</h1>

      <div className="card">
        <form onSubmit={addInvoice} className="card-body grid grid-cols-1 sm:grid-cols-7 gap-2">
          <input className="input" placeholder="Number" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} required />
          <input className="input" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <select className="select" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} required>
            <option value="">Select client</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required />
          <input className="input" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
          <input className="input" placeholder="Currency" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
          <button disabled={saving} className="btn-primary">{saving ? 'Adding...' : 'Add invoice'}</button>
        </form>
      </div>

      <div className="card">
        <div className="card-body toolbar">
          <input className="input flex-1" placeholder="Search invoices..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELED">Canceled</option>
          </select>
          <button onClick={load} className="btn">Filter</button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y">
            {filtered.length === 0 && <div className="card-body text-gray-500">No invoices</div>}
            {filtered.map((inv) => (
              <div key={inv.id} className="card-body py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{inv.number} {inv.title ? `· ${inv.title}` : ''}</div>
                  <div className="text-xs text-gray-500">Due {format(new Date(inv.dueDate), 'MMM d, yyyy')}</div>
                  <div className="text-xs text-gray-500">{inv.client?.name || ''}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{money(inv.amount, inv.currency)}</div>
                  <StatusPill status={inv.status} />
                  <div className="flex gap-2 mt-2 justify-end">
                    {inv.status !== 'PAID' && <button className="btn" onClick={() => markPaid(inv.id)}>Mark paid</button>}
                    <button className="btn" onClick={() => addPayment(inv.id)}>Add payment</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
