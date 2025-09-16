import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/clients', { params: { q } });
      setClients(res.data);
    } catch (e) {
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => clients, [clients]);

  async function addClient(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await api.post('/clients', form);
      setClients([res.data, ...clients]);
      setForm({ name: '', email: '', company: '', phone: '' });
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-responsive py-4 space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Clients</h1>

      <div className="card">
        <form onSubmit={addClient} className="card-body grid grid-cols-1 sm:grid-cols-5 gap-2">
          <input className="input" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" />
          <input className="input" placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
          <input className="input" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <button disabled={saving} className="btn-primary">{saving ? 'Adding...' : 'Add client'}</button>
        </form>
      </div>

      <div className="card">
        <div className="card-body toolbar">
          <input className="input flex-1" placeholder="Search clients..." value={q} onChange={(e) => setQ(e.target.value)} />
          <button onClick={load} className="btn">Search</button>
        </div>
      </div>

      {loading ? (
        <div className="card"><div className="card-body">Loading...</div></div>
      ) : error ? (
        <div className="card"><div className="card-body text-red-600">{error}</div></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y">
            {filtered.length === 0 && <div className="card-body text-gray-500">No clients</div>}
            {filtered.map((c) => (
              <div key={c.id} className="card-body py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.email || '—'} {c.company ? `· ${c.company}` : ''}</div>
                </div>
                <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
