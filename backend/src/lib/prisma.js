import { PrismaClient } from '../../generated/prisma/index.js';

let prisma;

if (!global.__prisma) {
  global.__prisma = new PrismaClient({
    log: ['warn', 'error']
  });
}
prisma = global.__prisma;

export default prisma;
