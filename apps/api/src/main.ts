import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

app.get('/health', (_: Request, res: Response) => res.json({ ok: true }));

app.get('/rfqs', async (_req: Request, res: Response) => {
  const rfqs = await prisma.rFQ.findMany({
    include: { items: { include: { part: true } } }
  });
  res.json(rfqs);
});

const quoteSchema = z.object({
  rfqId: z.string(),
  supplierId: z.string(),
  leadTimeDays: z.number().int(),
  items: z.array(z.object({
    partId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative()
  }))
});

app.post('/quotes', async (req: Request, res: Response) => {
  const parsed = quoteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const body = parsed.data;
  const totalPrice = body.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);

  const created = await prisma.quote.create({
    data: {
      supplierId: body.supplierId,
      rfqId: body.rfqId,
      leadTimeDays: body.leadTimeDays,
      totalPrice,
      items: {
        create: body.items.map(it => ({
          partId: it.partId,
          quantity: it.quantity,
          unitPrice: it.unitPrice
        }))
      },
      winProb: Math.max(0.05, 1 - (body.leadTimeDays / 60))
    },
    include: { items: true }
  });

  await prisma.auditLog.create({
    data: {
      actor: 'demo-user@dlc',
      entity: 'Quote',
      entityId: created.id,
      field: 'create',
      newValue: JSON.stringify(created)
    }
  });

  res.status(201).json(created);
});

const port = process.env.PORT || 4000;
app.get('/metrics/summary', async (_req, res) => {
  const [rfqs, quotes, avgLead] = await Promise.all([
    prisma.rFQ.count(),
    prisma.quote.count(),
    prisma.quote.aggregate({ _avg: { leadTimeDays: true } }),
  ]);
  res.json({ rfqs, quotes, avgLeadTimeDays: avgLead._avg.leadTimeDays ?? 0 });
});
app.listen(port, () => console.log(`API listening on ${port}`));
 
