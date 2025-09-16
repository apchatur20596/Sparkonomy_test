import express from 'express';
import prisma from '../lib/prisma.js';
import { z } from 'zod';
import { toPlain } from '../utils/transform.js';

const router = express.Router();

const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().positive(),
  method: z.string().optional(),
  date: z.coerce.date().optional(),
});

async function refreshInvoiceStatus(invoiceId) {
  const inv = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });
  if (!inv) return;
  const totalPaid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  let status = inv.status;
  if (totalPaid >= Number(inv.amount)) status = 'PAID';
  else if (new Date(inv.dueDate) < new Date()) status = 'OVERDUE';
  else status = 'PENDING';
  if (status !== inv.status) {
    await prisma.invoice.update({ where: { id: invoiceId }, data: { status } });
  }
}

router.get('/', async (req, res) => {
  const { invoiceId } = req.query;
  const where = invoiceId ? { invoiceId } : {};
  const payments = await prisma.payment.findMany({ where, orderBy: { date: 'desc' } });
  res.json(toPlain(payments));
});

router.post('/', async (req, res) => {
  try {
    const data = paymentSchema.parse(req.body);
    const created = await prisma.payment.create({ data });
    await refreshInvoiceStatus(created.invoiceId);
    res.status(201).json(toPlain(created));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await prisma.payment.delete({ where: { id: req.params.id } });
    await refreshInvoiceStatus(deleted.invoiceId);
    res.status(204).end();
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
