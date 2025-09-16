import express from 'express';
import prisma from '../lib/prisma.js';
import { toPlain } from '../utils/transform.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const [clientsCount, invoicesCount, paymentsAgg, invoices] = await Promise.all([
    prisma.client.count(),
    prisma.invoice.count(),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.invoice.findMany({ include: { payments: true } }),
  ]);

  const totalCollected = Number(paymentsAgg._sum.amount || 0);
  let totalBilled = 0;
  let totalOutstanding = 0;
  let overdueCount = 0;
  const statusCounts = { DRAFT: 0, PENDING: 0, PAID: 0, OVERDUE: 0, CANCELED: 0 };

  const now = new Date();
  for (const inv of invoices) {
    statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1;
    totalBilled += Number(inv.amount);
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    const remaining = Math.max(0, Number(inv.amount) - paid);
    totalOutstanding += remaining;
    if (inv.status !== 'PAID' && new Date(inv.dueDate) < now) overdueCount += 1;
  }

  res.json(
    toPlain({
      clientsCount,
      invoicesCount,
      totalBilled,
      totalCollected,
      totalOutstanding,
      overdueCount,
      statusCounts,
    })
  );
});

export default router;
