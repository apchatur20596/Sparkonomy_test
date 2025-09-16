import { useEffect, useState } from 'react';
import api from '../lib/api';
import { format } from 'date-fns';
import { Users, FileText, DollarSign, AlertTriangle, PiggyBank, CircleDollarSign } from 'lucide-react';
import StatusPill from '../components/StatusPill.jsx';

const money = (n, currency = 'USD') => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n || 0);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [s, inv] = await Promise.all([
          api.get('/stats'),
          api.get('/invoices', { params: { limit: 5 } }).catch(() => ({ data: [] })),
        ]);
        setStats(s.data);
        setRecent(inv.data.slice(0, 5));
      } catch (e) {
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="container-responsive py-6">Loading...</div>;
  if (error) return <div className="container-responsive py-6 text-red-600">{error}</div>;

  const Stat = ({ icon: Icon, label, value }) => (
    <div className="stat">
      <div className="stat-body">
        <div className="stat-icon"><Icon size={20} /></div>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-responsive py-4 space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Overview</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat icon={Users} label="Clients" value={stats.clientsCount} />
        <Stat icon={FileText} label="Invoices" value={stats.invoicesCount} />
        <Stat icon={CircleDollarSign} label="Billed" value={money(stats.totalBilled)} />
        <Stat icon={DollarSign} label="Collected" value={money(stats.totalCollected)} />
        <Stat icon={PiggyBank} label="Outstanding" value={money(stats.totalOutstanding)} />
        <Stat icon={AlertTriangle} label="Overdue" value={stats.overdueCount} />
      </div>

      <section className="space-y-2">
        <h2 className="section-title">Recent invoices</h2>
        <div className="card overflow-hidden">
          <div className="divide-y">
            {recent.length === 0 && <div className="card-body text-gray-500">No invoices yet</div>}
            {recent.map((inv) => (
              <div key={inv.id} className="card-body py-3 flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{inv.number} {inv.title ? `· ${inv.title}` : ''}</div>
                  <div className="text-xs text-gray-500">Due {format(new Date(inv.dueDate), 'MMM d, yyyy')}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{money(inv.amount, inv.currency)}</div>
                  <StatusPill status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
