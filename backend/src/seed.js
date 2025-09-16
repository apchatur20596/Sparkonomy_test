import prisma from './lib/prisma.js';

async function main() {
  console.log('Seeding...');
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.client.deleteMany();

  const acme = await prisma.client.create({ data: { name: 'Acme Corp', email: 'ap@acme.com', company: 'Acme', phone: '+1 555-0100' } });
  const globex = await prisma.client.create({ data: { name: 'Globex', email: 'info@globex.com' } });

  const inv1 = await prisma.invoice.create({
    data: {
      number: 'INV-1001',
      title: 'Website redesign',
      clientId: acme.id,
      dueDate: new Date(Date.now() + 7*24*3600*1000),
      amount: 2500,
      currency: 'USD',
      status: 'PENDING',
    }
  });

  const inv2 = await prisma.invoice.create({
    data: {
      number: 'INV-1002',
      title: 'Mobile app MVP',
      clientId: globex.id,
      dueDate: new Date(Date.now() - 3*24*3600*1000),
      amount: 5000,
      currency: 'USD',
      status: 'OVERDUE',
    }
  });

  await prisma.payment.create({ data: { invoiceId: inv1.id, amount: 1000, method: 'CARD' } });

  console.log('Seeding complete');
}

main().finally(async () => {
  await prisma.$disconnect();
});
