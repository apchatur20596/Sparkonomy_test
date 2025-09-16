export default function StatusPill({ status }) {
  const map = {
    DRAFT: 'pill-gray',
    PENDING: 'pill-yellow',
    PAID: 'pill-green',
    OVERDUE: 'pill-red',
    CANCELED: 'pill-gray',
  };
  return <span className={map[status] || 'pill-gray'}>{status}</span>;
}
