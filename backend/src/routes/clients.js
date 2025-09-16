import express from 'express';
import prisma from '../lib/prisma.js';
import { z } from 'zod';
import { toPlain } from '../utils/transform.js';

const router = express.Router();

const clientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('').transform(() => undefined)),
  company: z.string().optional(),
  phone: z.string().optional(),
});

router.get('/', async (req, res) => {
  const { q } = req.query;
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { company: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};
  const clients = await prisma.client.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json(toPlain(clients));
});

router.get('/:id', async (req, res) => {
  const client = await prisma.client.findUnique({ where: { id: req.params.id } });
  if (!client) return res.status(404).json({ error: 'Client not found' });
  res.json(toPlain(client));
});

router.post('/', async (req, res) => {
  try {
    const data = clientSchema.parse(req.body);
    const created = await prisma.client.create({ data });
    res.status(201).json(toPlain(created));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = clientSchema.partial().parse(req.body);
    const updated = await prisma.client.update({ where: { id: req.params.id }, data });
    res.json(toPlain(updated));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.client.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
