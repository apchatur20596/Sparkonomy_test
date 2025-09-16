import express from 'express';
import prisma from '../lib/prisma.js';
import { z } from 'zod';
import { toPlain } from '../utils/transform.js';

const router = express.Router();

const baseInvoiceSchema = z.object({
  number: z.string().min(1),
  title: z.string().optional(),
  clientId: z.string().min(1),
  issueDate: z.coerce.date().optional(),
  dueDate: z.coerce.date(),
  amount: z.coerce.number().positive(),
  currency: z.string().default('USD'),
  status: z.enum(['DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELED']).optional(),
});

router.get('/', async (req, res) => {
  const { status, q, clientId, limit } = req.query;
  const where = {
    ...(status ? { status } : {}),
    ...(clientId ? { clientId } : {}),
    ...(q
      ? {
          OR: [
            { number: { contains: q, mode: 'insensitive' } },
            { title: { contains: q, mode: 'insensitive' } },
            { client: { is: { name: { contains: q, mode: 'insensitive' } } } },
          ],
        }
      : {}),
  };
  const take = Math.min(Math.max(parseInt(limit || '0', 10) || 0, 0), 50) || undefined;
  const invoices = await prisma.invoice.findMany({
    where,
    include: { client: true, payments: true },
    orderBy: { createdAt: 'desc' },
    ...(take ? { take } : {}),
  });
  res.json(toPlain(invoices));
});

router.get('/:id', async (req, res) => {
  const inv = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: { client: true, payments: true },
  });
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });
  res.json(toPlain(inv));
});

router.post('/', async (req, res) => {
  try {
    const data = baseInvoiceSchema.parse(req.body);
    const created = await prisma.invoice.create({ data });
    res.status(201).json(toPlain(created));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = baseInvoiceSchema.partial().parse(req.body);
    const updated = await prisma.invoice.update({ where: { id: req.params.id }, data });
    res.json(toPlain(updated));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/:id/mark-paid', async (req, res) => {
  const invoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data: { status: 'PAID' },
  });
  res.json(toPlain(invoice));
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
